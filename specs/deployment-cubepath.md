# Deployment Spec: CubePath

## Docker Strategy (Multi-stage)
El monorepo Nx produce **dos imágenes**:

1. **Build Stage (root monorepo)**
   - Instalar dependencias en la raíz.
2. **Compile Stage**
   - Ejecutar `npx nx build api` y `npx nx build portal`.
3. **Runtime Stage API**
   - Imagen ligera `node:20-alpine` para NestJS.
4. **Runtime Stage Web**
   - Imagen ligera `node:20-alpine` para Next.js.

## Variables de Entorno Requeridas
- `GOOGLE_GEMINI_API_KEY`: Para el motor de OCR.
- `DATABASE_URL`: Conexión a Supabase/PostgreSQL.
- `PORT`: Puerto asignado por CubePath.

## Topología de servicios
- **api**: servicio HTTP interno/externo para endpoints REST.
- **portal**: frontend Next.js, consume `api` por service discovery de CubePath.

## Health Checks
- Backend debe exponer `GET /health`.
- CubePath valida el estado del contenedor API contra ese endpoint.
