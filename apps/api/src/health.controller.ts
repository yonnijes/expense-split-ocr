import { Controller, Get } from '@nestjs/common';
import { PrismaHealthService } from '@infrastructure';

@Controller('health')
export class HealthController {
  constructor(private readonly dbHealth: PrismaHealthService) { }

  @Get()
  health() {
    return { status: 'ok', service: 'expense-split-api' };
  }

  @Get('db')
  async healthDb() {
    const ok = await this.dbHealth.ping();
    return { status: ok ? 'ok' : 'error', db: ok ? 'connected' : 'unavailable' };
  }
}
