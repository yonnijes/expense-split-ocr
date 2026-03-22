/**
 * Entidad de dominio para Ticket.
 * Independiente de infraestructura.
 */
export interface TicketEntity {
  id: string;
  sessionId: string;
  merchant: string | null;
  total: number;
  currency: string;
  items: TicketItem[];
  imageUrl: string | null;
  imageKey: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface TicketItem {
  description: string;
  price: number;
  quantity?: number;
}

export interface SessionEntity {
  id: string;
  expiresAt: Date;
  createdAt: Date;
}

export const SESSION_TTL_HOURS = 48;

export function createSession(): SessionEntity {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000),
  };
}

export function isSessionExpired(session: SessionEntity): boolean {
  return new Date() > session.expiresAt;
}
