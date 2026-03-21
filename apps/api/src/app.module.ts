import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { OcrController } from './ocr.controller';
import { GeminiOcrService } from '@ocr-engine';
import { envSchema } from '@shared/contracts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => envSchema.parse(config),
    }),
  ],
  controllers: [HealthController, OcrController],
  providers: [GeminiOcrService],
})
export class AppModule {}
