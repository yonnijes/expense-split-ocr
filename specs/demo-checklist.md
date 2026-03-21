# Demo Checklist - ExpenseSplit OCR (Hackatón CubePath 2026)

## Objetivo de la demo (60-120s)
Mostrar el flujo completo: **Subir ticket → OCR → Corregir → Split → Compartir resumen**.

## Pre-demo (T-15 min)
- [x] Variables de entorno cargadas (`GEMINI_API_KEY`, `DATABASE_URL`, `PORT`, `FRONTEND_URL`).
- [ ] API y Portal levantados en CubePath.
- [x] Endpoint `GET /health` responde OK.
- [ ] Dataset de 2-3 tickets de prueba listo (uno legible, uno difícil, uno inválido).
- [ ] Participantes predefinidos para demo: Juan, Ana, Luis.

## Script recomendado de presentación
1. **Problema (10s):** "Dividir tickets en grupo consume tiempo y genera errores."
2. **Carga/OCR (20s):** subir foto y mostrar extracción automática.
3. **Validación (20s):** corregir un precio manualmente para mostrar control humano.
4. **Split (20s):** ejecutar modo equitativo y (si entra) por ítem.
5. **Cierre (10s):** mostrar resumen final + botón "Copiar para WhatsApp".

## Checklist funcional en vivo
- [x] Upload desde desktop funciona (JPG/PNG).
- [x] (Opcional) Capture en móvil habilitado por input `capture`.
- [x] OCR devuelve `merchant`, `total`, `currency`, `items`.
- [x] Formulario editable operativo.
- [x] Advertencia visual cuando suma de ítems ≠ total.
- [x] Split equitativo correcto a 2 decimales.
- [x] Split por ítem recalcula en tiempo real.
- [ ] Botón "Copiar resumen para WhatsApp" genera texto útil.

## KPI de demo
- [ ] Tiempo upload→datos editables <= 7s (medición formal pendiente).
- [x] Sin errores no controlados en UI/API (flujo principal validado).
- [x] UI usable en móvil y desktop.

## Plan B (si falla IA durante demo)
- [ ] Fallback a JSON mock pregrabado (mismo contrato Zod).
- [x] Continuar con validación + split para no romper narrativa.
- [x] Explicar: "El sistema está desacoplado por adaptador OCR (DIP/SOLID)."

## Persistencia (actualizado)
- [x] Spec definida: sesiones volátiles 48h con purga automática
- [x] Entidades de dominio creadas (`AnonymousSession`, `SESSION_TTL_HOURS`)
- [x] Repository pattern implementado (in-memory fallback)
- [ ] Implementación PostgreSQL + pg_cron para purga
