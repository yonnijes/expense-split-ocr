/**
 * Sesión volátil para usuario anónimo.
 * Ciclo de vida: 48 horas desde creación.
 * Después se purga automáticamente (privacidad).
 */
export interface AnonymousSession {
  id: string;
  createdAt: Date;
  expiresAt: Date; // createdAt + 48h
  ticketId?: string;
  splitData?: SplitData;
}

export interface SplitData {
  participants: { id: string; name: string }[];
  allocations: Record<number, string[]>;
  mode: 'equal' | 'by-item';
  totals: Record<string, number>;
}

export const SESSION_TTL_HOURS = 48;

export function createSession(): AnonymousSession {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000),
  };
}

export function isSessionExpired(session: AnonymousSession): boolean {
  return new Date() > session.expiresAt;
}
