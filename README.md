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
- Persistencia en Supabase/PostgreSQL está definida en contrato/env, pero no implementada aún.

### 1) Sequence Flow
![Sequence Flow](docs/diagrams/sequence-flow.jpg)

### 2) Nx Architecture
![Nx Architecture](docs/diagrams/nx-architecture.jpg)

### 3) User & Data Flow
![User & Data Flow](docs/diagrams/user-data-flow.jpg)

## Próximos pasos (MVP cerrado)
1. Persistencia real (tickets/splits) en DB.
2. Endpoint de resumen exportable (WhatsApp/copy-ready).
3. Guardas/autenticación opcional (si se requiere multiusuario real).
4. Docker final para `api` + `web-portal` en CubePath.
