import { AnonymousSession, SplitData } from './session.entity';

export interface SessionRepository {
  create(ticketJson: unknown): Promise<AnonymousSession>;
  findById(id: string): Promise<AnonymousSession | null>;
  updateSplit(id: string, split: SplitData): Promise<void>;
  deleteExpired(): Promise<number>;
}

export class InMemorySessionRepository implements SessionRepository {
  private store = new Map<string, AnonymousSession>();

  async create(ticketJson: unknown): Promise<AnonymousSession> {
    const { createSession } = await import('./session.entity');
    const session = createSession();
    (session as any)._ticketJson = ticketJson;
    this.store.set(session.id, session);
    return session;
  }

  async findById(id: string): Promise<AnonymousSession | null> {
    return this.store.get(id) ?? null;
  }

  async updateSplit(id: string, split: SplitData): Promise<void> {
    const session = this.store.get(id);
    if (!session) throw new Error('Session not found');
    session.splitData = split;
  }

  async deleteExpired(): Promise<number> {
    const now = Date.now();
    let count = 0;
    for (const [id, session] of this.store.entries()) {
      if (session.expiresAt.getTime() < now) {
        this.store.delete(id);
        count++;
      }
    }
    return count;
  }
}
