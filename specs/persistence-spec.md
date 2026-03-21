# Persistencia: Sesiones Volátiles (48h)

## Principio de Diseño
- **Privacidad por defecto:** usuarios anónimos, sin cuentas.
- **Datos efímeros:** sesiones con TTL de 48 horas.
- **Purga automática:** cleanup de datos expirados.

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

-- Índice para cleanup
CREATE INDEX idx_sessions_expires ON anonymous_sessions(expires_at);

-- Purga automática (pg_cron o aplicación)
-- DELETE FROM anonymous_sessions WHERE expires_at < NOW();
```

## Ciclo de Vida

1. **Creación:** Al subir primer ticket → `INSERT` con `expires_at = NOW() + 48h`
2. **Actualización:** Al validar/split → `UPDATE` del `split_json`
3. **Expiración:** Después de 48h → fila elegible para purga
4. **Purga:** Job cron (cada 1h) o middleware al boot

## Repository Pattern

```typescript
interface SessionRepository {
  create(ticket: Ticket): Promise<AnonymousSession>;
  findById(id: string): Promise<AnonymousSession | null>;
  updateSplit(id: string, split: SplitData): Promise<void>;
  deleteExpired(): Promise<number>; // rows deleted
}
```

## Seguridad

- Sin PII (datos personales) almacenados
- IDs aleatorios (UUID v4)
- Sin relación a usuarios identificados
- TLS obligatorio en producción
