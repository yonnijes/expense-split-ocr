# Technical Specification: ExpenseSplit OCR

**Proyecto:** Sistema de gestión y división de gastos mediante IA multimodal.

**Stack:** Nx, NestJS, Next.js, Gemini 1.5 Flash.

**Arquitectura:** Clean Architecture + SOLID + Monorepo.

## 1. Visión General
Portal web responsive desplegado en CubePath para cargar tickets, extraer información con visión artificial y dividir gastos entre múltiples usuarios de forma equitativa o granular.

## 2. Arquitectura del Sistema (Clean Architecture)
Monorepo con Nx, separando responsabilidades por capas.

### Capas Backend (NestJS)
- **Domain Layer (Core):** entidades e interfaces puras (`Ticket`, `User`, `Expense`).
- **Application Layer (Use Cases):** casos de uso (`ProcessTicketUseCase`, `SplitExpenseUseCase`).
- **Infrastructure Layer (Adapters):** Gemini, persistencia, servicios externos.
- **Interface Layer (Controllers):** API REST pública.

## 3. Patrones de Diseño & SOLID
- **Single Responsibility:** servicios especializados (OCR, persistencia, split).
- **Open/Closed:** métodos de split extensibles sin modificar código existente.
- **Dependency Inversion:** casos de uso dependen de interfaces (`OcrProvider`).
- **Strategy Pattern:** selección dinámica de algoritmo de split.
- **Repository Pattern:** desacople de acceso a datos.
- **DTO + Zod:** contrato tipado y validado entre Portal/API.

## 4. Stack Tecnológico
- **Monorepo:** Nx
- **Frontend:** Next.js 15 (App Router)
- **Backend:** NestJS
- **IA / OCR:** Gemini 1.5 Flash
- **Validación:** Zod
- **Estado:** Zustand
- **UI:** Tailwind + Shadcn/UI

## 5. Contrato de OCR IA
El modelo `gemini-1.5-flash` debe responder JSON puro:

```json
{
  "merchant": "string",
  "date": "ISO-8601",
  "total": 0,
  "currency": "EUR",
  "items": [
    { "description": "string", "quantity": 1, "price": 0 }
  ]
}
```

## 6. Infraestructura & Despliegue (CubePath)
Despliegue con Docker multi-stage y dos servicios:
- **API container:** NestJS en Node 20-alpine.
- **Web container:** Next.js optimizado para producción.
- **Network:** service discovery interno de CubePath.

## 7. Roadmap MVP (48h)
- **H0-H8:** setup de workspace Nx + schemas Zod.
- **H8-H20:** adaptador Gemini + extracción OCR en NestJS.
- **H20-H36:** portal Next.js + validación de tickets.
- **H36-H48:** integración, despliegue CubePath y demo.
