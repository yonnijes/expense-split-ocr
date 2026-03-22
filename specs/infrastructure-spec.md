# Infrastructure Specification: CubePath + Dokploy

## Visión General
Migración de arquitectura **BaaS (Supabase)** → **Infraestructura Auto-Gestionada** en CubePath mediante Dokploy.

---

## 1. Cambio de Paradigma de Infraestructura

### Antes (Supabase)
- PostgreSQL como servicio externo accesible por URL pública
- Comunicación vía internet (latencia mayor)
- Dependencia de proveedor tercero

### Ahora (Dokploy en CubePath)
- PostgreSQL en **contenedor hermano** a la API NestJS
- Comunicación por **red interna de Docker** (baja latencia)
- Control total sobre datos y configuración
- Centralización en un solo VPS

```
┌─────────────────────────────────────────────────────┐
│                  CubePath VPS                       │
│  ┌───────────────────────────────────────────────┐  │
│  │           Docker Network (interna)            │  │
│  │                                               │  │
│  │  ┌─────────────┐    ┌─────────────┐          │  │
│  │  │   NestJS    │───▶│  PostgreSQL │          │  │
│  │  │    API      │◀───│   (Dokploy) │          │  │
│  │  │  (puerto    │    │  (puerto    │          │  │
│  │  │   público)  │    │   interno)  │          │  │
│  │  └─────────────┘    └─────────────┘          │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │         Next.js Portal (estático)             │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                     ▲
                     │ HTTPS
                     ▼
                  Usuario
```

---

## 2. Gestión de Persistencia y Almacenamiento

### Estrategia Híbrida

| Tipo de Dato | Almacenamiento | Justificación |
|--------------|----------------|---------------|
| Tickets (texto) | PostgreSQL (Dokploy) | Datos estructurados, queries, relaciones |
| Sessions | PostgreSQL (Dokploy) | TTL, purga programada |
| Splits | PostgreSQL (Dokploy) | Integridad relacional |
| **Imágenes de tickets** | **Supabase Storage** | TTL coordinado con DB, CDN opcional |

### Variables de Entorno Requeridas

```bash
# Database (red interna)
DATABASE_URL=postgresql://user:pass@postgres:5432/expense_split

# Storage externo (imágenes)
STORAGE_PROVIDER=s3
STORAGE_ENDPOINT=https://s3.provider.com
STORAGE_BUCKET=expense-split-tickets
STORAGE_ACCESS_KEY=xxx
STORAGE_SECRET_KEY=xxx
```

---

## 3. Ciclo de Vida de Datos (TTL)

### Responsabilidad: Backend NestJS

Al ser infraestructura propia, **no hay extensiones automáticas** como en Supabase. La API debe gestionar:

#### 3.1. Expiración al Crear
```typescript
// Cada ticket nace con expiresAt
const ticket = {
  id: uuid(),
  merchant: '...',
  total: 47.80,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
};
```

#### 3.2. Purga Programada
- **Cron job interno** (cada 15-30 min)
- Endpoint administrativo protegido: `POST /admin/purge-expired`
- Log de purgas para auditoría

#### 3.3. Endpoint de Limpieza
```typescript
@Post('admin/purge-expired')
async purgeExpiredTickets(): Promise<{ deleted: number }> {
  const result = await this.ticketRepository.deleteExpired();
  return { deleted: result.count };
}
```

---

## 4. Seguridad y Aislamiento de Red

### Modelo de Seguridad

| Aspecto | Supabase | Dokploy (CubePath) |
|---------|----------|-------------------|
| Exposición DB | URL pública + API Key | **Solo red interna** |
| Autenticación | JWT + Anon Key | JWT interno |
| Superficie de ataque | Mayor (internet) | **Mínima (isolated network)** |
| Acceso directo a DB | Posible con credenciales | **Imposible desde fuera** |

### Configuración Dokploy Recomendada
- PostgreSQL: **sin puerto público** (solo internal network)
- NestJS API: puerto público (ej. 8000)
- Next.js: estático (CDN o mismo VPS)

---

## 5. Consistencia de Datos (Zod Contracts)

### Contratos Inalterados
Los schemas Zod en `libs/shared/contracts` permanecen como **Single Source of Truth**:

- `TicketSchema` — valida antes de insertar en PostgreSQL
- `EnvSchema` — valida configuración al boot
- `OcrFailureSchema` — errores tipados

### Validación en Capas
```
Request → Controller (Zod) → Service → Repository → PostgreSQL
                ↓
         Rechaza si no cumple contrato
```

### Prevención de Inyección Masiva
- Límite de tamaño por ticket (`MAX_FILE_SIZE`)
- Límite de ítems por ticket (ej. 50 ítems máx)
- Rate limiting por IP/sesión

---

## 6. Docker Compose (Dokploy)

### Estructura de Servicios

```yaml
services:
  api:
    image: expense-split-api:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/expense_split
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    networks:
      - expense-net
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=expense_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=expense_split
    networks:
      - expense-net
    # Sin puertos expuestos (solo internal)

  web:
    image: expense-split-web:latest
    ports:
      - "3000:3000"
    networks:
      - expense-net

networks:
  expense-net:
    driver: bridge

volumes:
  pgdata:
```

---

## 7. Migración desde Supabase

### Pasos de Migración
1. **Exportar datos** de Supabase (si existen tickets activos)
2. **Crear schema** en PostgreSQL nuevo (mismo contrato Zod)
3. **Importar datos** (scripts de migración)
4. **Actualizar `DATABASE_URL`** en variables de entorno
5. **Verificar conectividad** desde NestJS
6. **Desactivar acceso** a Supabase

### Rollback Plan
- Mantener Supabase activo 48h paralelamente
- Si hay issues, revertir `DATABASE_URL` rápidamente

---

## 8. Monitoreo y Health Checks

### Endpoints de Salud
```bash
GET /health          # API viva
GET /health/db       # API + PostgreSQL conectado
GET /health/storage  # API + Storage externo OK
```

### Métricas a Monitorear
- Latencia DB (interno, debería ser <10ms)
- Espacio en disco (pgdata volume)
- Cantidad de tickets por purgar
- Tasa de errores OCR

---

## 9. Backup y Recovery

### Backup Automático
- **pg_dump** diario (vía cron en VPS)
- Almacenar en Supabase Storage (mismo provider de imágenes)
- Retención: 7 días

### Recovery
- Script de restore documentado
- Test de recovery trimestral

---

## 10. Checklist de Implementación

- [ ] Crear servicio PostgreSQL en Dokploy
- [ ] Configurar red interna (sin puerto público)
- [ ] Actualizar `DATABASE_URL` en CubePath
- [ ] Implementar `TicketRepository` con PostgreSQL
- [ ] Implementar purga de expirados (cron interno)
- [ ] Configurar storage externo para imágenes
- [ ] Actualizar Dockerfiles (multi-stage)
- [ ] Endpoints `/health/db` y `/health/storage`
- [ ] Script de backup automático
- [ ] Documentar rollback procedure
