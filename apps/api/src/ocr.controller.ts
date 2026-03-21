import {
  BadRequestException,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { GeminiOcrService } from '@ocr-engine';

@Controller('tickets')
export class OcrController {
  constructor(private readonly ocr: GeminiOcrService) {}

  @Post('ocr')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: Number(process.env.MAX_FILE_SIZE ?? 8 * 1024 * 1024) },
      fileFilter: (_, file, cb) => {
        const ok = ['image/jpeg', 'image/png'].includes(file.mimetype);
        cb(ok ? null : new BadRequestException('Formato inválido. Usa JPG/PNG.'), ok);
      },
    })
  )
  async processTicket(@UploadedFile() file?: any) {
    if (!file) throw new BadRequestException('Archivo requerido en campo file');

    try {
      const data = await this.ocr.extractTicketFromImage(file.buffer.toString('base64'), file.mimetype);
      return { status: 'ok', data };
    } catch (error: any) {
      const details = error?.details;
      if (details) throw new BadRequestException(details);
      throw new InternalServerErrorException({
        code: 'OCR_UPSTREAM_ERROR',
        message: 'No se pudo procesar el ticket en este momento.',
      });
    }
  }
}
