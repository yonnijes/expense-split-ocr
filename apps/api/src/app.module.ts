import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { ScheduleModule } from '@nestjs/schedule';
import { winstonConfig } from './common/logger/winston.config';
import { HealthController } from './health.controller';
import { OcrController } from './ocr.controller';
import { GeminiOcrService, OCR_PROVIDER_TOKEN } from '@ocr-engine';
import { envSchema } from '@shared/contracts';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { CleanupModule } from './cleanup/cleanup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => envSchema.parse(config),
    }),
    WinstonModule.forRoot(winstonConfig),
    ScheduleModule.forRoot(),
    InfrastructureModule,
    CleanupModule,
  ],
  controllers: [HealthController, OcrController],
  providers: [
    GeminiOcrService,
    {
      provide: OCR_PROVIDER_TOKEN,
      useExisting: GeminiOcrService,
    },
  ],
})
export class AppModule {}
