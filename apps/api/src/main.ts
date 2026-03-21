import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const allowedOrigin = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  app.enableCors({ origin: [allowedOrigin], credentials: true });

  const port = config.get<number>('PORT', 8000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
