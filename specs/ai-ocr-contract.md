# AI OCR Contract & Prompt Engineering

## Target JSON Schema (Zod)

```typescript
const TicketSchema = z.object({
  merchant: z.string(),
  date: z.string().datetime().optional(),
  total: z.number().positive(),
  currency: z.string().default('EUR'),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive().default(1),
      price: z.number(),
    })
  ),
});
```

## Notas de contrato
- `merchant` reemplaza a `store` como campo canónico.
- `quantity` se acepta con default `1` para tolerar OCR incompleto.
- Respuesta del modelo debe ser JSON puro (sin markdown).
