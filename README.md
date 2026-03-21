# ExpenseSplit OCR (MVP)

Monorepo para extracción OCR de tickets y split de gastos.

## Estructura actual
- `apps/web-portal`: Frontend (Next.js 15, App Router)
- `apps/api`: Backend (NestJS)
- `libs/domain`: Lógica de negocio de split
- `libs/ocr-engine`: Adaptador OCR (Gemini + Sharp)
- `libs/shared/contracts`: Contratos Zod compartidos (ticket + env)
- `specs/`: Documentos funcionales/técnicos

## Estado actual
- OCR backend funcional: `POST /tickets/ocr`, `GET /health`
- Validación de entorno con `@nestjs/config` + `envSchema`
- Upload en memoria (sin disco), preprocesado con `sharp`, retry OCR
- Frontend MVP funcional con flujo completo:
  - upload → processing → editing → splitting
- Store de estado con Zustand (`useTicketStore`)
- Editor con React Hook Form + Zod compartido
- Split equitativo y por ítem en UI

## Scripts
- `npm run dev:api` → API NestJS en watch
- `npm run build:api` → build API (tsc + tsc-alias)
- `npm run dev:web` → Next.js en `http://localhost:3000`
- `npm run build:web` → build de producción del portal

## Diagramas
Los diagramas son **mayormente acordes** a lo implementado. Ajustes pendientes frente a diagramas:
- No hay auth/sesión (no aplica `401` por sesión todavía).
- Persistencia: spec definida (sesiones volátiles 48h), implementación in-memory como fallback.

### 1) Sequence Flow
![Sequence Flow](docs/diagrams/sequence-flow.jpg)

### 2) Nx Architecture
![Nx Architecture](docs/diagrams/nx-architecture.jpg)

### 3) User & Data Flow
![User & Data Flow](docs/diagrams/user-data-flow.jpg)

## Próximos pasos (MVP cerrado)
1. ~~Persistencia real~~ ✅ Spec definida (sesiones volátiles 48h, purga automática)
2. ~~Endpoint de resumen exportable~~ ✅ WhatsApp + Copiar implementados
3. ~~Docker final~~ ✅ Dockerfiles + docker-compose listos

## Deploy (CubePath / Dokploy)

### Local (Docker Compose)
```bash
docker-compose up -d
# API: http://localhost:8000
# Web: http://localhost:3000
```

### Producción (Dokploy)
Ver `specs/deployment-cubepath.md` para configuración completa:
- PostgreSQL interno (red Dokploy)
- API + Web Portal containers
- Cloudflare R2 para imágenes
- Cleanup cron automático (48h TTL)
