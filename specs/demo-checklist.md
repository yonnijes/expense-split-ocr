# Demo Checklist — ExpenseSplit OCR (Hackatón CubePath 2026)

## Objetivo de la demo (60–120s)
Mostrar el flujo completo: **Subir ticket → OCR → Corregir → Split → Compartir resumen**.

## Pre-demo (T-15 min)
- [ ] Variables de entorno cargadas (`GOOGLE_GEMINI_API_KEY`, `DATABASE_URL`, `PORT`).
- [ ] API y Portal levantados en CubePath.
- [ ] Endpoint `GET /health` responde OK.
- [ ] Dataset de 2–3 tickets de prueba listo (uno legible, uno difícil, uno inválido).
- [ ] Participantes predefinidos para demo: Juan, Ana, Luis.

## Script recomendado de presentación
1. **Problema (10s):** “Dividir tickets en grupo consume tiempo y genera errores.”
2. **Carga/OCR (20s):** subir foto y mostrar extracción automática.
3. **Validación (20s):** corregir un precio manualmente para mostrar control humano.
4. **Split (20s):** ejecutar modo equitativo y (si entra) por ítem.
5. **Cierre (10s):** mostrar resumen final + botón “Copiar para WhatsApp”.

## Checklist funcional en vivo
- [ ] Upload desde desktop funciona (JPG/PNG).
- [ ] (Opcional) Capture en móvil funciona.
- [ ] OCR devuelve `merchant`, `total`, `currency`, `items`.
- [ ] Formulario editable operativo.
- [ ] Advertencia visual cuando suma de ítems ≠ total.
- [ ] Split equitativo correcto a 2 decimales.
- [ ] Split por ítem (si está habilitado) recalcula en tiempo real.
- [ ] Botón “Copiar resumen para WhatsApp” genera texto útil.

## KPI de demo
- [ ] Tiempo upload→datos editables <= 7s.
- [ ] Sin errores no controlados en UI/API.
- [ ] UI usable en móvil y desktop.

## Plan B (si falla IA durante demo)
- [ ] Fallback a JSON mock pregrabado (mismo contrato Zod).
- [ ] Continuar con validación + split para no romper narrativa.
- [ ] Explicar: “El sistema está desacoplado por adaptador OCR (DIP/SOLID).”
