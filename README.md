# ExpenseSplit OCR

Monorepo para extracción OCR de tickets y división de gastos mediante IA multimodal.

**Hackatón CubePath 2026** — Arquitectura profesional, MVP funcional.

---

## 🚀 Quick Start

### Local Development

```bash
# Instalar dependencias
npm install

# Levantar API (NestJS) + Web (Next.js)
npm run dev:api   # http://localhost:8000
npm run dev:web   # http://localhost:3000

# Build de producción
npm run build:api
npm run build:web
```

### Docker (Testing Local)

```bash
docker-compose up -d
# API: http://localhost:8000/health
# Web: http://localhost:3000
```

---

## 🏗️ Arquitectura

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Monorepo** | Nx Build System |
| **Backend** | NestJS (Clean Architecture + SOLID) |
| **Frontend** | Next.js 15 (App Router) + Tailwind + shadcn/ui |
| **IA Engine** | Gemini 1.5 Flash (Multimodal OCR) |
| **Validación** | Zod (Shared Contracts) |
| **Estado** | Zustand (Frontend) |
| **Database** | PostgreSQL 16 (Dokploy internal) |
| **Storage** | Cloudflare R2 / S3 (imágenes) |

### Estructura del Monorepo

```
expense-split-ocr/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── ocr.controller.ts
│   │   │   ├── health.controller.ts
│   │   │   └── main.ts
│   │   └── Dockerfile
│   └── web-portal/       # Next.js frontend
│       ├── app/
│       │   ├── components/
│       │   ├── stores/
│       │   └── page.tsx
│       └── Dockerfile
├── libs/
│   ├── domain/           # Lógica de negocio pura
│   │   ├── expense-split.ts
│   │   ├── session.entity.ts
│   │   └── whatsapp-formatter.ts
│   ├── ocr-engine/       # Adaptador IA (Gemini)
│   │   ├── gemini-ocr.service.ts
│   │   └── ocr-provider.ts
│   └── shared/contracts  # Zod schemas compartidos
│       ├── ticket.contract.ts
│       └── env.contract.ts
├── specs/                # Documentación técnica
│   ├── infrastructure-spec.md
│   ├── persistence-spec.md
│   ├── deployment-cubepath.md
│   ├── acceptance-criteria-mvp.md
│   └── demo-checklist.md
└── docs/
    └── diagrams/
```

---

## ✅ Estado Actual

### Backend (NestJS)
- [x] `GET /health` — Health check endpoint
- [x] `POST /tickets/ocr` — OCR de tickets con Gemini 1.5 Flash
- [x] Preprocesado con `sharp` (resize + compresión)
- [x] Upload en memoria (sin disco)
- [x] Retry automático (2 intentos)
- [x] Error handling graceful (JSON tipado)
- [x] Validación de entorno al boot (`envSchema`)
- [x] CORS configurable

### Frontend (Next.js)
- [x] Upload de imágenes (JPG/PNG + cámara móvil)
- [x] Skeleton de procesamiento
- [x] Formulario editable (React Hook Form + Zod)
- [x] Advertencia si `sum(items) ≠ total`
- [x] Split equitativo (2 decimales)
- [x] Split por ítem (asignación individual)
- [x] Botón "Copiar resumen para WhatsApp"
- [x] UI responsive (mobile-first)

### Dominio
- [x] Lógica de split (equitativo + por ítem)
- [x] Sesiones anónimas (TTL 48h)
- [x] Repository pattern
- [x] Formatter WhatsApp (domain service)

### Contratos
- [x] `TicketSchema` — Contrato OCR (merchant, total, items, quantity)
- [x] `EnvSchema` — Validación de entorno
- [x] `OcrFailureSchema` — Errores tipados

---

## 📋 Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Health check básico |
| `GET` | `/health/db` | Health check + DB connection |
| `POST` | `/tickets/ocr` | Upload imagen → OCR → JSON |
| `POST` | `/admin/purge-expired` | Purga de tickets expirados (48h) |

---

## 🔒 Seguridad y Privacidad

- **Sin autenticación** — Sesiones anónimas con UUID
- **TTL 48h** — Purga automática de datos
- **Red interna** — PostgreSQL no expuesto a internet
- **Validación Zod** — Todos los inputs validados antes de procesar
- **Rate limiting** — Proteger endpoint OCR

---

## 🚀 Deploy en CubePath (Dokploy)

### Servicios Requeridos

| Servicio | Tipo | Puerto | Notas |
|----------|------|--------|-------|
| PostgreSQL | Database | 5432 (internal) | Sin puerto público |
| NestJS API | Application | 8000 | Health check `/health` |
| Next.js Portal | Application | 3000 | Estático o SSR |
| Cloudflare R2 | Storage | N/A | Imágenes de tickets |

### Variables de Entorno

```bash
# Database (red interna Dokploy)
DATABASE_URL=postgresql://user:pass@postgres:5432/expense_split

# IA
GEMINI_API_KEY=xxx
GEMINI_MODEL=gemini-1.5-flash

# App
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://split.tudominio.com

# Storage (imágenes)
STORAGE_PROVIDER=s3
STORAGE_ENDPOINT=https://s3.provider.com
STORAGE_BUCKET=expense-split-tickets
STORAGE_ACCESS_KEY=xxx
STORAGE_SECRET_KEY=xxx
```

Ver `specs/deployment-cubepath.md` para configuración completa.

---

## 📊 Diagramas

### 1) Sequence Flow
![Sequence Flow](docs/diagrams/sequence-flow.jpg)

### 2) Nx Architecture
![Nx Architecture](docs/diagrams/nx-architecture.jpg)

### 3) User & Data Flow
![User & Data Flow](docs/diagrams/user-data-flow.jpg)

---

## 📈 Próximos Pasos

### Crítico (Deploy)
- [ ] Crear PostgreSQL en Dokploy
- [ ] Deploy API + Portal en CubePath
- [ ] Configurar R2/S3 para imágenes
- [ ] Ejecutar migraciones DB

### Importante (Demo)
- [ ] Fallback mock OCR (si IA falla en demo)
- [ ] Medición de performance (<7s upload→datos)
- [ ] Test con 3 tickets reales

### Nice-to-have
- [ ] Exportar resumen a PDF
- [ ] Historial local (localStorage)
- [ ] Animaciones de progreso detalladas

---

## 🏆 Diferenciadores Técnicos (para Jurado)

1. **Infraestructura auto-gestionada** — PostgreSQL en red interna (no BaaS externo)
2. **Clean Architecture** — Domain, Application, Infrastructure separados
3. **Contratos Zod** — Single Source of Truth entre front/back
4. **TTL automático** — Purga de datos a las 48h (privacidad por diseño)
5. **Storage híbrido** — DB local + imágenes en S3 (escalabilidad)

### SOLID Aplicado

| Principio | Implementación |
|-----------|----------------|
| **S**RP | Servicios separados (OCR, Split, Cleanup) |
| **O**CP | Adapter pattern para proveedores OCR |
| **L**SP | `OcrProvider` interfaz intercambiable |
| **I**SP | Contratos mínimos por caso de uso |
| **D**IP | Repositorios inyectados, no hardcodeados |

---

## 📄 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| `specs/infrastructure-spec.md` | Arquitectura auto-gestionada (Dokploy + PostgreSQL) |
| `specs/persistence-spec.md` | Schema DB, TTL, purga, repository pattern |
| `specs/deployment-cubepath.md` | Guía de deploy paso a paso |
| `specs/acceptance-criteria-mvp.md` | Criterios de aceptación por módulo |
| `specs/demo-checklist.md` | Checklist para demo en vivo |
| `specs/technical-spec.md` | Spec técnica formal (hackatón) |

---

**Licencia:** MIT  
**Autor:** Yonni  
**Hackatón:** CubePath 2026
