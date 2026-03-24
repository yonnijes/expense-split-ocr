import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  TicketRepository,
  SessionRepository,
  TICKET_REPO_TOKEN,
  SESSION_REPO_TOKEN,
} from '@domain/ticket.repository';
import { SupabaseStorageService } from '@infrastructure';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @Inject(TICKET_REPO_TOKEN) private readonly ticketRepo: TicketRepository,
    @Inject(SESSION_REPO_TOKEN) private readonly sessionRepo: SessionRepository,
    private readonly storage: SupabaseStorageService,
  ) { }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    try {
      const expiredWithImages = await this.ticketRepo.findExpiredWithImages();
      if (expiredWithImages.length) {
        await this.storage.deleteImages(expiredWithImages.map((t) => t.imageKey));
      }

      const ticketsDeleted = await this.ticketRepo.deleteExpired();
      const sessionsDeleted = await this.sessionRepo.deleteExpired();

      if (ticketsDeleted > 0 || sessionsDeleted > 0) {
        this.logger.log(`Cleanup: ${ticketsDeleted} tickets, ${sessionsDeleted} sessions purged`);
      }
    } catch (error: any) {
      this.logger.error(`Cleanup failed: ${error?.message ?? error}`);
    }
  }
}
