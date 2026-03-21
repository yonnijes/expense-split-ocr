import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TicketRepository, SessionRepository } from '@domain/ticket.repository';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly sessionRepo: SessionRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    try {
      const ticketsDeleted = await this.ticketRepo.deleteExpired();
      const sessionsDeleted = await this.sessionRepo.deleteExpired();

      if (ticketsDeleted > 0 || sessionsDeleted > 0) {
        this.logger.log(`Cleanup: ${ticketsDeleted} tickets, ${sessionsDeleted} sessions purged`);
      }
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`);
    }
  }
}
