import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaTicketsRepository, PrismaSessionRepository } from './prisma/prisma-tickets.repository';
import { PrismaHealthService } from './prisma/prisma-health.service';
import { SupabaseStorageService } from './storage/supabase-storage.service';
import {
  TicketRepository,
  SessionRepository,
  TICKET_REPO_TOKEN,
  SESSION_REPO_TOKEN,
} from '@domain/ticket.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaTicketsRepository,
    PrismaSessionRepository,
    PrismaHealthService,
    SupabaseStorageService,
    {
      provide: TICKET_REPO_TOKEN,
      useExisting: PrismaTicketsRepository,
    },
    {
      provide: SESSION_REPO_TOKEN,
      useExisting: PrismaSessionRepository,
    },
  ],
  exports: [
    PrismaTicketsRepository,
    PrismaSessionRepository,
    PrismaHealthService,
    SupabaseStorageService,
    TICKET_REPO_TOKEN,
    SESSION_REPO_TOKEN,
  ],
})
export class InfrastructureModule {}
