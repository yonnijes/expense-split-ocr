import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { OCR_PROVIDER_TOKEN, type OcrProvider } from '@ocr-engine';
import { TicketRepository, SessionRepository, CreateTicketInput } from '@domain/ticket.repository';
import { SupabaseStorageService } from '@infrastructure';

@Controller('tickets')
export class OcrController {
  constructor(
    @Inject(OCR_PROVIDER_TOKEN) private readonly ocr: OcrProvider,
    private readonly ticketRepo: TicketRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly storage: SupabaseStorageService,
  ) {}

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
  async processTicket(
    @UploadedFile() file?: Express.Multer.File,
    @Body('sessionId') sessionId?: string,
  ) {
    if (!file) throw new BadRequestException('Archivo requerido en campo file');

    try {
      const data = await this.ocr.extractTicketFromImage(
        file.buffer.toString('base64'),
        file.mimetype,
      );

      let session = sessionId ? await this.sessionRepo.findById(sessionId) : null;
      if (!session) {
        session = await this.sessionRepo.create();
      }

      const objectKey = `tickets/${session.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${
        file.mimetype === 'image/png' ? 'png' : 'jpg'
      }`;
      const upload = await this.storage.uploadImage(objectKey, file.buffer, file.mimetype);

      const ticketInput: CreateTicketInput = {
        merchant: data.merchant ?? null,
        total: data.total,
        currency: data.currency ?? 'EUR',
        items: data.items ?? [],
        imageUrl: upload.publicUrl,
        imageKey: upload.objectKey,
        expiresAt: session.expiresAt,
      };

      const ticket = await this.ticketRepo.create(session.id, ticketInput);

      return {
        status: 'ok',
        sessionId: session.id,
        ticketId: ticket.id,
        data,
      };
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
