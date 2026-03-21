# Deployment en CubePath (Dokploy + PostgreSQL Auto-gestionado)

## Arquitectura de Infraestructura

```
┌─────────────────────────────────────────────────────────────┐
│                    CubePath VPS (Dokploy)                   │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐    │
│  │   PostgreSQL    │◄───│         NestJS API          │    │
│  │   (container)   │    │      (container)            │    │
│  │   Port: 5432    │    │   Port: 8000 (internal)     │    │
│  │   Internal only │    │   Port: 8000 (external)     │    │
│  └─────────────────┘    └─────────────────────────────┘    │
│           │                              │                  │
│           │         Red Interna          │                  │
│           │      (docker network)        │                  │
│           └──────────────────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js Web Portal                     │   │
│  │            (container)                              │   │
│  │         Port: 3000 (external)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
                    ┌─────────────────┐
                    │  Cloudflare R2  │
                    │  (imágenes)     │
                    └─────────────────┘
```

## Servicios Requeridos

### 1. PostgreSQL (Dokploy Database)

**Configuración:**
- **Service Type:** Database (PostgreSQL)
- **Version:** 15.x o superior
- **Port:** 5432 (internal only)
- **Network:** Same Dokploy network as API
- **Persistence:** Volume mount `/var/lib/postgresql/data`
- **Environment:**
  ```
  POSTGRES_USER=expense_user
  POSTGRES_PASSWORD=<secure-random>
  POSTGRES_DB=expenses_db
  ```

**Connection String (para API):**
```
DATABASE_URL=postgresql://expense_user:password@postgres:5432/expenses_db?schema=public
```
> Nota: El host es `postgres` (nombre del servicio Dokploy), no `localhost`

### 2. NestJS API

**Configuración:**
- **Service Type:** Application
- **Build:** Dockerfile multi-stage
- **Port:** 8000
- **Network:** Same as PostgreSQL
- **Environment:**
  ```
  NODE_ENV=production
  PORT=8000
  FRONTEND_URL=https://split.tudominio.com
  DATABASE_URL=postgresql://expense_user:password@postgres:5432/expenses_db?schema=public
  GEMINI_API_KEY=<tu-key>
  JWT_SECRET=<secure-random-32-chars>
  JWT_EXPIRES_IN=48h
  MAX_FILE_SIZE=5242880
  R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
  R2_BUCKET=ticket-images
  R2_ACCESS_KEY=<access-key>
  R2_SECRET_KEY=<secret-key>
  ```

**Health Check:**
- **Endpoint:** `/health`
- **Interval:** 30s
- **Timeout:** 10s
- **Retries:** 3

### 3. Next.js Web Portal

**Configuración:**
- **Service Type:** Application
- **Build:** Dockerfile multi-stage
- **Port:** 3000
- **Environment:**
  ```
  NEXT_PUBLIC_API_URL=https://api.tudominio.com
  ```

### 4. Cloudflare R2 (Storage Externo)

**Por qué R2 y no local:**
- Imágenes no saturan disco del VPS
- CDN incluido (menor latencia)
- Backup automático
- Escalabilidad sin tocar Dokploy

**Configuración:**
- **Bucket:** `ticket-images`
- **Public Access:** Habilitado (para lectura de imágenes)
- **Upload:** Desde API con signed URLs o directo con service credentials

---

## Ciclo de Vida de Datos (TTL 48h)

### Cleanup Automático

La API ejecuta un **cron job interno** cada hora:

```typescript
// apps/api/src/cleanup/cleanup.service.ts
@Injectable()
export class CleanupService {
  constructor(
    private ticketRepo: TicketRepository,
    private sessionRepo: SessionRepository,
  ) {}

  @Cron('0 * * * *') // Cada hora
  async handleCron() {
    const ticketsDeleted = await this.ticketRepo.deleteExpired();
    const sessionsDeleted = await this.sessionRepo.deleteExpired();
    this.logger.log(`Cleanup: ${ticketsDeleted} tickets, ${sessionsDeleted} sessions purged`);
  }
}
```

### Flujo de Expiración

1. **Creación:** Ticket + Session nacen con `expiresAt = NOW() + 48h`
2. **Vida útil:** Datos accesibles vía API
3. **Expiración:** `expiresAt < NOW()` → elegible para purga
4. **Cleanup:** Cron job elimina registros expirados
5. **Imágenes:** Opcionalmente eliminar de R2 (lazy cleanup)

---

## Pasos de Deploy en Dokploy

### 1. Crear Database (PostgreSQL)

```bash
# Dokploy Dashboard → Databases → Create
Name: postgres
Version: 15
User: expense_user
Password: <generar-aleatorio>
Database: expenses_db
```

### 2. Crear API Service

```bash
# Dokploy Dashboard → Applications → Create
Name: expense-api
Source: GitHub
Repository: yonnijes/expense-split-ocr
Branch: main
Build Type: Dockerfile
Dockerfile: apps/api/Dockerfile
Port: 8000
```

### 3. Crear Web Portal Service

```bash
# Dokploy Dashboard → Applications → Create
Name: expense-portal
Source: GitHub
Repository: yonnijes/expense-split-ocr
Branch: main
Build Type: Dockerfile
Dockerfile: apps/web-portal/Dockerfile
Port: 3000
```

### 4. Configurar Variables de Entorno

Copiar desde `.env.example` y ajustar valores de producción.

### 5. Ejecutar Migraciones

```bash
# En el contenedor de la API (post-deploy)
npx prisma migrate deploy --schema libs/infrastructure/src/prisma/schema.prisma
```

---

## Seguridad

### Network Isolation

- PostgreSQL **NO expuesto** a internet
- Solo API puede conectar (docker network interno)
- Web Portal habla con API vía HTTPS externo

### Secrets Management

- Todos los secrets via environment variables
- Nada hardcodeado en repo
- `.env` en `.gitignore`

### Rate Limiting (Recomendado)

```typescript
// apps/api/src/main.ts
app.use('/tickets/ocr', rateLimit({ windowMs: 60000, max: 10 }));
```

---

## Monitoreo

### Health Checks

- `GET /health` → API status
- Dokploy auto-restart si health check falla 3x

### Logs

- Dokploy Dashboard → Logs en tiempo real
- Streaming disponible via CLI

### Métricas Clave

- OCR response time (meta: <7s)
- Cleanup job execution count
- Active sessions count

---

## Rollback Plan

1. **GitHub:** Tags por release (`v0.1.0`, `v0.2.0`)
2. **Dokploy:** Rollback a imagen anterior desde Dashboard
3. **DB:** Backup automático diario (configurar en Dokploy)

---

## Costos Estimados (CubePath VPS)

| Recurso | Costo |
|---------|-------|
| VPS (2GB RAM, 1 CPU) | ~$10-15/mes |
| Cloudflare R2 (1GB) | ~$0.15/mes |
| Dominio (opcional) | ~$10/año |
| **Total** | **~$15-25/mes** |

---

## Checklist de Deploy

- [ ] PostgreSQL creado en Dokploy
- [ ] API service configurado
- [ ] Web Portal configurado
- [ ] Variables de entorno cargadas
- [ ] Migraciones Prisma ejecutadas
- [ ] Health checks verificados
- [ ] R2 bucket configurado
- [ ] Cleanup cron verificado
- [ ] HTTPS/SSL configurado (Cloudflare o Let's Encrypt)
