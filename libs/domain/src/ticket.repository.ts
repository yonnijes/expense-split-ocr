import { TicketEntity, SessionEntity } from './ticket.entity';

/**
 * Repository interface para Tickets y Sesiones.
 * Definido en domain, implementado en infrastructure.
 */
export interface TicketRepository {
  create(sessionId: string, ticket: CreateTicketInput): Promise<TicketEntity>;
  findById(id: string): Promise<TicketEntity | null>;
  findBySessionId(sessionId: string): Promise<TicketEntity[]>;
  update(id: string, updates: Partial<TicketEntity>): Promise<TicketEntity>;
  deleteExpired(): Promise<number>;
  findExpiredWithImages(): Promise<ExpiredTicketImage[]>;
}

export interface SessionRepository {
  create(): Promise<SessionEntity>;
  findById(id: string): Promise<SessionEntity | null>;
  deleteExpired(): Promise<number>;
}

export interface CreateTicketInput {
  merchant: string | null;
  total: number;
  currency: string;
  items: Array<{ description: string; price: number; quantity?: number }>;
  imageUrl: string | null;
  imageKey: string | null;
  expiresAt: Date;
}

export interface ExpiredTicketImage {
  id: string;
  imageKey: string;
}
