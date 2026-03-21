import type { TicketContract as Ticket } from '@shared/contracts';

export interface OcrProvider {
  extractTicketFromImage(base64Image: string, mimeType: string): Promise<Ticket>;
}
