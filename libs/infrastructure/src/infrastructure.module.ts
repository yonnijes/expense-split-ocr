import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaTicketsRepository, PrismaSessionRepository } from './prisma/prisma-tickets.repository';
import { PrismaHealthService } from './prisma/prisma-health.service';
import { TicketRepository, SessionRepository } from '@domain/ticket.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaTicketsRepository,
    PrismaSessionRepository,
    PrismaHealthService,
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
    PrismaHealthService,
    TicketRepository,
    SessionRepository,
  ],
})
export class InfrastructureModule {}
