# Acceptance Criteria (MVP) — ExpenseSplit OCR

## 1) Módulo de Ingesta y OCR (IA)

### AC 1.1 — Carga/Captura de imagen
**Given** que el usuario está en el portal,  
**When** selecciona una imagen JPG/PNG o usa la cámara en móvil,  
**Then** el sistema acepta el archivo y lo envía al backend para OCR.

**Métrica de aceptación:**
- Formatos soportados: `image/jpeg`, `image/png`.
- UX móvil: input tipo cámara habilitado (`capture` en browsers compatibles).

---

### AC 1.2 — Extracción de campos clave
**Given** una imagen legible de ticket,  
**When** el backend procesa con Gemini 1.5 Flash,  
**Then** retorna `merchant`, `date`, `currency`, `total` y al menos 80% de ítems detectables.

**Métrica de aceptación:**
- `merchant`, `total`, `currency` siempre presentes en respuesta válida.
- En dataset de prueba interno (N tickets), recall de ítems >= 80%.

---

### AC 1.3 — Error controlado para imagen inválida
**Given** una imagen ilegible/no-ticket,  
**When** el OCR no puede extraer datos confiables,  
**Then** el backend responde error controlado (validación + mensaje claro), sin crash.

**Métrica de aceptación:**
- HTTP 4xx con payload de error tipado.
- Cero caídas de proceso en este escenario.

## 2) Módulo de Validación (UI/UX)

### AC 2.1 — Formulario editable
**Given** una respuesta OCR válida,  
**When** el portal recibe los datos,  
**Then** muestra formulario editable con campos del ticket e ítems.

### AC 2.2 — Corrección manual
**Given** datos OCR precargados,  
**When** el usuario edita cualquier campo,  
**Then** los cambios se reflejan inmediatamente en el estado y cálculo.

### AC 2.3 — Validación de cierre
**Given** ticket con ítems,  
**When** la suma de ítems no coincide con `total`,  
**Then** el portal muestra advertencia visual y bloquea confirmación (o requiere override explícito).

**Métrica de aceptación:**
- Regla de cierre con tolerancia decimal configurable (ej. ±0.01).

## 3) Lógica de Reparto (Split Strategy)

### AC 3.1 — Gestión de participantes
**Given** ticket validado,  
**When** el usuario añade participantes,  
**Then** el sistema exige mínimo 2 para habilitar split.

### AC 3.2 — Split equitativo
**Given** N participantes (N>=2),  
**When** usuario elige modo equitativo,  
**Then** deuda individual = `total / N` con precisión a 2 decimales.

### AC 3.3 — Split por ítem (MVP opcional)
**Given** lista de ítems del ticket,  
**When** el usuario asigna ítems a uno o más participantes,  
**Then** el saldo por persona se recalcula en tiempo real y valida cierre.

## 4) Despliegue y Rendimiento (CubePath)

### AC 4.1 — Deploy completo en CubePath
**Given** rama principal lista,  
**When** se construyen contenedores Docker,  
**Then** API + Portal quedan operativos en CubePath.

### AC 4.2 — Tiempo de respuesta OCR
**Given** ticket legible estándar,  
**When** usuario sube imagen,  
**Then** datos editables aparecen en <= 7s (objetivo 5s).

### AC 4.3 — Responsive real
**Given** viewport desktop o móvil,  
**When** el usuario usa el flujo completo,  
**Then** UI mantiene funcionalidad completa en Chrome/Safari.

## 5) Calidad del Código (Clean Code)

### AC 5.1 — Estructura monorepo limpia
**Given** el repositorio,  
**When** se inspecciona arquitectura,  
**Then** existe separación clara por capas/librerías (`domain`, `ocr-engine`, `shared-types`, `apps`).

### AC 5.2 — Secretos fuera del código
**Given** configuración de entorno,  
**When** corre app local/prod,  
**Then** API keys se consumen por variables de entorno, no hardcodeadas.

### AC 5.3 — Contrato tipado compartido
**Given** integración portal↔api,  
**When** se intercambian datos de ticket,  
**Then** ambos lados usan el mismo schema Zod compartido.

---

## Bonus UX de demo (alto impacto)
- Botón: **Copiar resumen para WhatsApp**
- Salida ejemplo: `Total: 40€ | Juan paga 20€ | Ana paga 20€`
