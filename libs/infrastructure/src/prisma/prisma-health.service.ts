import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaHealthService implements OnModuleInit {
  private readonly prisma = new PrismaClient();
  private readonly logger = new Logger(PrismaHealthService.name);

  async onModuleInit() {
    await this.prisma.$connect();
    this.logger.log('Prisma health client connected');
  }

  async ping(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error(`DB ping failed: ${error?.message ?? error}`);
      return false;
    }
  }
}
