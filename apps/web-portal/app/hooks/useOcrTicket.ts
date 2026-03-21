'use client';

import { TicketSchema, type TicketContract } from '@shared/contracts';

export async function requestOcr(file: File): Promise<TicketContract> {
  const form = new FormData();
  form.append('file', file);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const res = await fetch(`${baseUrl}/tickets/ocr`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'No se pudo procesar el ticket');
  }

  const payload = await res.json();
  return TicketSchema.parse(payload.data);
}
