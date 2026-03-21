# System Architecture: ExpenseSplit OCR

## Stack Tecnológico
- Monorepo: Nx (Build System)
- Language: TypeScript (Strict Mode)
- Backend: NestJS (Clean Architecture / SOLID)
- Frontend: Next.js 15 (App Router + Tailwind + Shadcn/UI)
- IA Engine: Gemini 1.5 Flash (Multimodal OCR)
- Validation: Zod (Shared Schemas)
- State Management: Zustand (Frontend)

## Principios de Diseño
1. SOLID: Inversión de dependencias para los proveedores de IA.
2. Hexagonal-ish: Separación clara entre Dominio, Aplicación e Infraestructura.
3. Single Source of Truth: Los esquemas de Zod en libs/shared/schemas mandan sobre los DTOs y tipos del Front.

## Estructura de Carpetas (Nx)
- apps/portal: Frontend Next.js.
- apps/api: Backend NestJS.
- libs/domain: Interfaces y entidades puras.
- libs/ocr-engine: Adaptadores de IA (Gemini).
- libs/shared-types: Validaciones Zod compartidas.
