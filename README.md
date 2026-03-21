# ExpenseSplit OCR (MVP)

Monorepo base para extracción OCR de tickets y split de gastos.

## Estructura
- `apps/portal`: Frontend (Next.js 15, App Router)
- `apps/api`: Backend (NestJS)
- `libs/domain`: Lógica de negocio de split
- `libs/ocr-engine`: Adaptador OCR (Gemini)
- `libs/shared-types`: Schemas Zod compartidos
- `specs/`: Documentos funcionales/técnicos

## Estado actual
- Scaffold inicial listo
- Contrato OCR (Zod) compartido en `libs/shared/contracts`
- OCR service con Gemini + preprocesado de imagen (`sharp`) + retry
- Endpoint API `POST /tickets/ocr` con upload en memoria y `GET /health`
- Reglas de dominio de split implementadas en `libs/domain`

## Próximos pasos
1. Generar apps Nx completas (`@nx/next` y `@nx/nest`) cuando el entorno de paquetes esté estable.
2. Implementar endpoint `POST /tickets/ocr` en `apps/api`.
3. Validar respuesta IA con `TicketSchema`.
4. Conectar flujo en frontend: upload → validar → split.
