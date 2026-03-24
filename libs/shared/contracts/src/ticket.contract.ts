import { z } from 'zod';

export const TicketItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive().default(1),
  price: z.number().nonnegative(),
});

export const TicketSchema = z.object({
  merchant: z.string().min(1),
  date: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }, z.string().datetime()).optional(),
  total: z.number().positive(),
  currency: z.string().default('EUR'),
  items: z.array(TicketItemSchema).default([]),
});

export const OcrFailureSchema = z.object({
  code: z.enum(['OCR_PARSE_ERROR', 'OCR_UNREADABLE_IMAGE', 'OCR_UPSTREAM_ERROR']),
  message: z.string(),
  hint: z.string().optional(),
});

export type TicketContract = z.infer<typeof TicketSchema>;
export type OcrFailure = z.infer<typeof OcrFailureSchema>;
