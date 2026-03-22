import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TicketRepository, SessionRepository, CreateTicketInput, ExpiredTicketImage } from '@domain/ticket.repository';
import { TicketEntity, SessionEntity } from '@domain/ticket.entity';

@Injectable()
export class PrismaTicketsRepository implements TicketRepository, OnModuleInit {
  private readonly prisma: PrismaClient;
  private readonly logger = new Logger(PrismaTicketsRepository.name);

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
    this.logger.log('Prisma client connected');
  }

  async create(sessionId: string, input: CreateTicketInput): Promise<TicketEntity> {
    const ticket = await this.prisma.ticket.create({
      data: {
        sessionId,
        merchant: input.merchant,
        total: input.total,
        currency: input.currency,
        items: input.items as any,
        imageUrl: input.imageUrl,
        imageKey: input.imageKey,
        expiresAt: input.expiresAt,
      },
    });

    return this.mapToEntity(ticket);
  }

  async findById(id: string): Promise<TicketEntity | null> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    return ticket ? this.mapToEntity(ticket) : null;
  }

  async findBySessionId(sessionId: string): Promise<TicketEntity[]> {
    const tickets = await this.prisma.ticket.findMany({ where: { sessionId } });
    return tickets.map((t: any) => this.mapToEntity(t));
  }

  async update(id: string, updates: Partial<TicketEntity>): Promise<TicketEntity> {
    const { id: _, sessionId, createdAt, ...data } = updates;
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...data,
        items: data.items as any,
      },
    });
    return this.mapToEntity(ticket);
  }

  async deleteExpired(): Promise<number> {
    const { count } = await this.prisma.ticket.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return count;
  }

  async findExpiredWithImages(): Promise<ExpiredTicketImage[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        expiresAt: { lt: new Date() },
        imageKey: { not: null },
      },
      select: { id: true, imageKey: true },
    });

    return tickets
      .filter((t) => !!t.imageKey)
      .map((t) => ({ id: t.id, imageKey: t.imageKey as string }));
  }

  private mapToEntity(ticket: any): TicketEntity {
    return {
      id: ticket.id,
      sessionId: ticket.sessionId,
      merchant: ticket.merchant,
      total: Number(ticket.total),
      currency: ticket.currency,
      items: ticket.items as any,
      imageUrl: ticket.imageUrl,
      imageKey: ticket.imageKey,
      expiresAt: ticket.expiresAt,
      createdAt: ticket.createdAt,
    };
  }
}

@Injectable()
export class PrismaSessionRepository implements SessionRepository, OnModuleInit {
  private readonly prisma: PrismaClient;
  private readonly logger = new Logger(PrismaSessionRepository.name);

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
    this.logger.log('Prisma session client connected');
  }

  async create(): Promise<SessionEntity> {
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const session = await this.prisma.session.create({
      data: { expiresAt },
    });
    return {
      id: session.id,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    };
  }

  async findById(id: string): Promise<SessionEntity | null> {
    const session = await this.prisma.session.findUnique({ where: { id } });
    return session
      ? { id: session.id, expiresAt: session.expiresAt, createdAt: session.createdAt }
      : null;
  }

  async deleteExpired(): Promise<number> {
    const { count } = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return count;
  }
}
