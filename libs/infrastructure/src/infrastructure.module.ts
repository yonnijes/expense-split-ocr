import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaTicketsRepository, PrismaSessionRepository } from './prisma/prisma-tickets.repository';
import { TicketRepository, SessionRepository } from '@domain/ticket.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaTicketsRepository,
    PrismaSessionRepository,
    {
      provide: TicketRepository,
      useExisting: PrismaTicketsRepository,
    },
    {
      provide: SessionRepository,
      useExisting: PrismaSessionRepository,
    },
  ],
  exports: [
    PrismaTicketsRepository,
    PrismaSessionRepository,
    TicketRepository,
    SessionRepository,
  ],
})
export class InfrastructureModule {}
