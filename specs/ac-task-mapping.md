# AC → Task Mapping (MVP Execution Table)

| AC | Entrega técnica | Capa/Modulo | Archivo(s) objetivo | Definición de terminado |
|---|---|---|---|---|
| AC 1.1 | Upload JPG/PNG + capture móvil | Portal (Next.js) | `apps/portal/app/*` | Usuario puede seleccionar imagen/cámara y enviar al API |
| AC 1.2 | OCR con Gemini + parseo/validación Zod | Infrastructure + Shared | `libs/ocr-engine/src/gemini-ocr.service.ts`, `libs/shared-types/src/schemas/ticket.schema.ts` | Respuesta válida contiene `merchant,total,currency,items`; benchmark >=80% ítems |
| AC 1.3 | Manejo de errores controlados OCR | API Interface/Application | `apps/api/src/*`, `libs/ocr-engine/src/*` | HTTP 4xx tipado, sin crash |
| AC 2.1 | Render de formulario editable | Portal UI | `apps/portal/app/*` | Datos OCR visibles y editables |
| AC 2.2 | Edición manual de campos e ítems | Portal State/UI | `apps/portal/app/*`, store Zustand | Cambios reflejan estado/cálculos en vivo |
| AC 2.3 | Validación de cierre (sum(items) vs total) | Domain + Portal | `libs/domain/src/expense-split.ts`, `apps/portal/app/*` | Advertencia visible y bloqueo/override controlado |
| AC 3.1 | Alta de participantes (min 2) | Portal + Domain | `apps/portal/app/*`, `libs/domain/src/*` | Split no se habilita con <2 participantes |
| AC 3.2 | Estrategia split equitativo | Domain | `libs/domain/src/expense-split.ts` | Deuda individual correcta a 2 decimales |
| AC 3.3 | Estrategia split por ítem | Domain + Portal | `libs/domain/src/expense-split.ts`, `apps/portal/app/*` | Asignación por ítem recalcula saldos en tiempo real |
| AC 4.1 | Deploy API + Portal en CubePath | Infra/DevOps | `specs/deployment-cubepath.md`, `Dockerfile*` | Ambos servicios disponibles en entorno |
| AC 4.2 | Performance end-to-end OCR | API + Portal | métricas/logs | p95 upload→editable <=7s |
| AC 4.3 | Responsive Chrome/Safari | Portal UI | `apps/portal/app/*` | Flujo completo usable en desktop + móvil |
| AC 5.1 | Organización Nx por responsabilidades | Repo Architecture | `apps/*`, `libs/*`, `specs/*` | Estructura limpia y consistente con Clean Architecture |
| AC 5.2 | Secretos por env vars | Seguridad/Config | `.env*`, runtime config | Sin hardcode de keys en repo |
| AC 5.3 | Contrato compartido tipado Zod | Shared Types | `libs/shared-types/src/schemas/ticket.schema.ts` | Portal/API consumen mismo schema |
| Bonus | Copiar resumen para WhatsApp | Portal UX | `apps/portal/app/*` | Botón copia texto tipo: `Total: 40€ \| Juan 20€ \| Ana 20€` |

## Orden sugerido de ejecución (rápido para hackatón)
1. AC 5.3 → 1.2 → 1.3 (contrato y robustez OCR)
2. AC 2.1 → 2.2 → 2.3 (flujo de validación)
3. AC 3.1 → 3.2 (split demo-ready)
4. AC 4.1 + 4.3 (deploy y UX cross-device)
5. AC 3.3 + Bonus + 4.2 (diferenciadores para jueces)
