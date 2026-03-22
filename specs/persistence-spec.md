# Persistencia: PostgreSQL Auto-Gestionado (Dokploy/CubePath)

## Principio de Diseño
- **Privacidad por defecto:** usuarios anónimos, sin cuentas.
- **Datos efímeros:** sesiones con TTL de 48 horas.
- **Purga automática:** gestionada por la API (cron interno).
- **Infraestructura propia:** PostgreSQL en contenedor hermano (red interna).

---

## Cambio de Paradigma

### Antes (Supabase)
- PostgreSQL como servicio externo (URL pública)
- Comunicación vía internet (mayor latencia)
- Dependencia de proveedor tercero

### Ahora (Dokploy en CubePath)
- PostgreSQL en **contenedor hermano** (Docker network interna)
- Comunicación por **red interna** (baja latencia, <10ms)
- Control total sobre datos y configuración

---

## Schema PostgreSQL

```sql
-- Sesiones anónimas (TTL 48h)
CREATE TABLE anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ticket_json JSONB NOT NULL,
  split_json JSONB,
  CONSTRAINT check_expires CHECK (expires_at > created_at)
);

-- Tickets individuales (para queries más eficientes)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES anonymous_sessions(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  image_url TEXT, -- Storage externo (S3)
  CONSTRAINT check_expires CHECK (expires_at > created_at)
);

-- Splits de gastos
CREATE TABLE splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  items_assigned JSONB, -- ítems asignados (split por ítem)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance y cleanup
CREATE INDEX idx_sessions_expires ON anonymous_sessions(expires_at);
CREATE INDEX idx_tickets_session ON tickets(session_id);
CREATE INDEX idx_tickets_expires ON tickets(expires_at);
CREATE INDEX idx_splits_ticket ON splits(ticket_id);
```

---

## Ciclo de Vida

1. **Creación:** Al subir primer ticket → `INSERT` en `anonymous_sessions` + `tickets` con `expires_at = NOW() + 48h`
2. **Actualización:** Al validar/split → `UPDATE` del `split_json` + `INSERT` en `splits`
3. **Expiración:** Después de 48h → filas elegibles para purga
4. **Purga:** Cron interno en NestJS (cada 30 min) → `DELETE` de expirados

---

## Repository Pattern

```typescript
interface SessionRepository {
  create(ticket: Ticket): Promise<AnonymousSession>;
  findById(id: string): Promise<AnonymousSession | null>;
  updateSplit(id: string, split: SplitData): Promise<void>;
  deleteExpired(): Promise<number>; // rows deleted
}

interface TicketRepository {
  create(sessionId: string, ticket: Ticket): Promise<Ticket>;
  findBySession(sessionId: string): Promise<Ticket[]>;
  deleteExpired(): Promise<number>;
}
```

---

## Estrategia de Almacenamiento Híbrida

| Tipo de Dato | Almacenamiento | Justificación |
|--------------|----------------|---------------|
| Tickets (texto) | PostgreSQL (Dokploy) | Datos estructurados, queries |
| Sessions | PostgreSQL (Dokploy) | TTL, purga programada |
| Splits | PostgreSQL (Dokploy) | Integridad relacional |
| **Imágenes** | **Storage externo (S3)** | No saturar disco VPS |

### Variables de Entorno

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

## Purga Automática (Cron Interno)

### Implementación en NestJS

```typescript
// ocr-cleanup.service.ts
@Injectable()
export class OcrCleanupService {
  constructor(private ticketRepo: TicketRepository) {}

  @Cron('*/30 * * * *') // Cada 30 minutos
  async handleCron(): Promise<void> {
    const deleted = await this.ticketRepo.deleteExpired();
    console.log(`Purged ${deleted} expired tickets`);
  }
}
```

### Endpoint Administrativo

```typescript
@Post('admin/purge-expired')
@UseGuards(AdminGuard)
async purgeExpiredTickets(): Promise<{ deleted: number }> {
  const result = await this.ticketRepository.deleteExpired();
  return { deleted: result.count };
}
```

---

## Seguridad

### Aislamiento de Red
- PostgreSQL **sin puerto público** (solo internal network)
- Solo NestJS puede hablar con la DB
- Superficie de ataque mínima

### Datos
- Sin PII (datos personales) almacenados
- IDs aleatorios (UUID v4)
- Sin relación a usuarios identificados
- TLS obligatorio en producción

### Validación
- Zod schemas validan antes de insertar
- Límite de tamaño por ticket
- Límite de ítems (ej. 50 máx)
- Rate limiting por IP/sesión

---

## Backup y Recovery

### Backup Automático
- `pg_dump` diario (vía cron en VPS)
- Almacenar en S3 externo
- Retención: 7 días

### Recovery
- Script de restore documentado
- Test de recovery trimestral

---

## Migración desde Supabase

1. Exportar datos de Supabase (si existen tickets activos)
2. Crear schema en PostgreSQL nuevo (mismo contrato Zod)
3. Importar datos (scripts de migración)
4. Actualizar `DATABASE_URL` en variables de entorno
5. Verificar conectividad desde NestJS
6. Desactivar acceso a Supabase

### Rollback Plan
- Mantener Supabase activo 48h paralelamente
- Si hay issues, revertir `DATABASE_URL` rápidamente

---

## Checklist de Implementación

- [ ] Crear servicio PostgreSQL en Dokploy
- [ ] Configurar red interna (sin puerto público)
- [ ] Actualizar `DATABASE_URL` en CubePath
- [ ] Implementar `TicketRepository` con PostgreSQL
- [ ] Implementar `SessionRepository` con PostgreSQL
- [ ] Implementar purga de expirados (cron interno)
- [ ] Configurar storage externo para imágenes
- [ ] Endpoints `/health/db` y `/health/storage`
- [ ] Script de backup automático
