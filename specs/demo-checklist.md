# Demo Checklist — ExpenseSplit OCR (Hackatón CubePath 2026)

## Objetivo de la demo (60–120s)
Mostrar el flujo completo: **Subir ticket → OCR → Corregir → Split → Compartir resumen**.

---

## Pre-demo (T-15 min)
- [x] Variables de entorno cargadas (`GEMINI_API_KEY`, `DATABASE_URL`, `PORT`, `FRONTEND_URL`).
- [ ] API y Portal levantados en CubePath (Dokploy).
- [x] Endpoint `GET /health` responde OK.
- [ ] Dataset de 2–3 tickets de prueba listo (uno legible, uno difícil, uno inválido).
- [ ] Participantes predefinidos para demo: Juan, Ana, Luis.

---

## Script recomendado de presentación

| Tiempo | Sección | Qué decir |
|--------|---------|-----------|
| 10s | Problema | "Dividir tickets en grupo consume tiempo y genera errores." |
| 20s | Carga/OCR | Subir foto y mostrar extracción automática con Gemini 1.5 Flash. |
| 20s | Validación | Corregir un precio manualmente para mostrar control humano. |
| 20s | Split | Ejecutar modo equitativo y (si entra) por ítem. |
| 10s | Cierre | Mostrar resumen final + botón "Copiar para WhatsApp". |

---

## Checklist funcional en vivo

- [x] Upload desde desktop funciona (JPG/PNG).
- [x] (Opcional) Capture en móvil habilitado por input `capture`.
- [x] OCR devuelve `merchant`, `total`, `currency`, `items`.
- [x] Formulario editable operativo.
- [x] Advertencia visual cuando suma de ítems ≠ total.
- [x] Split equitativo correcto a 2 decimales.
- [x] Split por ítem recalcula en tiempo real.
- [x] Botón "Copiar resumen para WhatsApp" genera texto útil.

---

## KPI de demo

- [ ] Tiempo upload→datos editables <= 7s (medición formal pendiente).
- [x] Sin errores no controlados en UI/API (flujo principal validado).
- [x] UI usable en móvil y desktop.

---

## Plan B (si falla IA durante demo)

- [ ] Fallback a JSON mock pregrabado (mismo contrato Zod).
- [x] Continuar con validación + split para no romper narrativa.
- [x] Explicar: "El sistema está desacoplado por adaptador OCR (DIP/SOLID)."

---

## Persistencia (PostgreSQL Auto-Gestionado)

### Estado Actual
- [x] Spec definida: PostgreSQL en Dokploy (red interna)
- [x] Schema definido: `anonymous_sessions`, `tickets`, `splits`
- [x] Entidades de dominio creadas (`AnonymousSession`, `SESSION_TTL_HOURS`)
- [x] Repository pattern implementado
- [x] Cleanup cron automático (cada 30 min)
- [ ] PostgreSQL creado en Dokploy
- [ ] Migraciones ejecutadas
- [ ] Deploy en CubePath verificado

### Variables Requeridas
```bash
DATABASE_URL=postgresql://user:pass@postgres:5432/expense_split
```

---

## Infraestructura (CubePath + Dokploy)

### Estado Actual
- [x] Spec `infrastructure-spec.md` creada (arquitectura auto-gestionada)
- [x] Spec `deployment-cubepath.md` actualizada
- [x] Dockerfiles multi-stage (api + portal)
- [x] docker-compose para testing local
- [ ] PostgreSQL service creado en Dokploy
- [ ] API service configurado (GitHub → Dokploy)
- [ ] Web Portal configurado
- [ ] Variables de entorno cargadas en Dokploy
- [ ] Health checks verificados
- [ ] Storage externo (R2/S3) configurado para imágenes

### Servicios Requeridos
| Servicio | Tipo | Puerto | Estado |
|----------|------|--------|--------|
| PostgreSQL | Database | 5432 (internal) | ⏳ Pendiente |
| NestJS API | Application | 8000 | ⏳ Pendiente |
| Next.js Portal | Application | 3000 | ⏳ Pendiente |
| Cloudflare R2 | Storage | N/A | ⏳ Pendiente |

---

## Checklist Final de Deploy

### Fase 1: Infraestructura Base
- [ ] Crear PostgreSQL en Dokploy (sin puerto público)
- [ ] Configurar red interna Docker
- [ ] Crear bucket R2/S3 para imágenes

### Fase 2: Aplicaciones
- [ ] Deploy API (GitHub → Dokploy)
- [ ] Deploy Portal (GitHub → Dokploy)
- [ ] Cargar variables de entorno
- [ ] Ejecutar migraciones DB

### Fase 3: Verificación
- [ ] `GET /health` responde OK
- [ ] `GET /health/db` conecta a PostgreSQL
- [ ] Upload de ticket funciona end-to-end
- [ ] OCR procesa imágenes
- [ ] Split genera datos correctos
- [ ] Botón WhatsApp genera mensaje

### Fase 4: Demo Ready
- [ ] 3 tickets de prueba cargados
- [ ] Performance medida (<7s upload→datos)
- [ ] Rollback plan documentado
- [ ] Backup automático configurado

---

## Notas de Arquitectura (para jurado)

### Diferenciadores Técnicos
1. **Infraestructura auto-gestionada** — PostgreSQL en red interna (no BaaS externo)
2. **Clean Architecture** — Domain, Application, Infrastructure separados
3. **Contratos Zod** — Single Source of Truth entre front/back
4. **TTL automático** — Purga de datos a las 48h (privacidad por diseño)
5. **Storage híbrido** — DB local + imágenes en S3 (escalabilidad)

### SOLID Aplicado
- **S**ingle Responsibility: Servicios separados (OCR, Split, Cleanup)
- **O**pen/Closed: Adapter pattern para proveedores OCR (Gemini hoy, otros mañana)
- **L**iskov Substitution: `OcrProvider` interfaz intercambiable
- **I**nterface Segregation: Contratos mínimos por caso de uso
- **D**ependency Inversion: Repositorios inyectados, no hardcodeados
