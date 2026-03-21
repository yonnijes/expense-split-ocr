import type { Ticket } from '../../shared-types/src/schemas/ticket.schema';

export interface OcrProvider {
  extractTicketFromImage(base64Image: string, mimeType: string): Promise<Ticket>;
}
