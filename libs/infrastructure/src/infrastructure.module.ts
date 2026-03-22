import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaTicketsRepository, PrismaSessionRepository } from './prisma/prisma-tickets.repository';
import { PrismaHealthService } from './prisma/prisma-health.service';
import { SupabaseStorageService } from './storage/supabase-storage.service';
import { TicketRepository, SessionRepository } from '@domain/ticket.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaTicketsRepository,
    PrismaSessionRepository,
    PrismaHealthService,
    SupabaseStorageService,
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
    SupabaseStorageService,
    TicketRepository,
    SessionRepository,
  ],
})
export class InfrastructureModule {}
