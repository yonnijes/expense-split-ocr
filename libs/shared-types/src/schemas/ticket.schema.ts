import { z } from 'zod';

export const TicketItemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive().default(1),
  price: z.number(),
});

export const TicketSchema = z.object({
  merchant: z.string(),
  date: z.string().datetime().optional(),
  total: z.number().positive(),
  currency: z.string().default('EUR'),
  items: z.array(TicketItemSchema),
});

export type Ticket = z.infer<typeof TicketSchema>;
