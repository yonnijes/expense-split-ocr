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
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { OCR_PROVIDER_TOKEN, type OcrProvider } from '@ocr-engine';
import {
  TicketRepository,
  SessionRepository,
  CreateTicketInput,
  TICKET_REPO_TOKEN,
  SESSION_REPO_TOKEN,
} from '@domain/ticket.repository';
import { SupabaseStorageService } from '@infrastructure/storage/supabase-storage.service';

@Controller('tickets')
export class OcrController {
  private readonly logger = new Logger(OcrController.name);

  constructor(
    @Inject(OCR_PROVIDER_TOKEN) private readonly ocr: OcrProvider,
    @Inject(TICKET_REPO_TOKEN) private readonly ticketRepo: TicketRepository,
    @Inject(SESSION_REPO_TOKEN) private readonly sessionRepo: SessionRepository,
    @Inject(SupabaseStorageService) private readonly storage: SupabaseStorageService,
  ) { }

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
    this.logger.log('Processing ticket OCR request');

    if (!file) {
      this.logger.warn('OCR request received without file');
      throw new BadRequestException('Archivo requerido en campo file');
    }

    try {
      this.logger.log('Extracting data from image using OCR provider');
      const data = await this.ocr.extractTicketFromImage(
        file.buffer.toString('base64'),
        file.mimetype,
      );
      this.logger.log(`OCR extraction completed: ${data.merchant || 'Unknown Merchant'}`);

      this.logger.log(`Retrieving or creating session: ${sessionId || 'New'}`);
      let session = sessionId ? await this.sessionRepo.findById(sessionId) : null;
      if (!session) {
        session = await this.sessionRepo.create();
        this.logger.log(`New session created with ID: ${session.id}`);
      }

      const objectKey = `tickets/${session.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.mimetype === 'image/png' ? 'png' : 'jpg'}`;
      this.logger.log(`Uploading image to storage: ${objectKey}`);
      const upload = await this.storage.uploadImage(objectKey, file.buffer, file.mimetype);
      this.logger.log(`Image uploaded successfully: ${upload.publicUrl}`);

      const ticketInput: CreateTicketInput = {
        merchant: data.merchant ?? null,
        total: data.total,
        currency: data.currency ?? 'EUR',
        items: data.items ?? [],
        imageUrl: upload.publicUrl,
        imageKey: upload.objectKey,
        expiresAt: session.expiresAt,
      };

      this.logger.log(`Creating ticket in repository for session: ${session.id}`);
      const ticket = await this.ticketRepo.create(session.id, ticketInput);
      this.logger.log(`Ticket created successfully with ID: ${ticket.id}`);

      return {
        status: 'ok',
        sessionId: session.id,
        ticketId: ticket.id,
        data,
      };
    } catch (error: any) {
      this.logger.error(`Error processing ticket: ${error.message}`, error.stack);
      const details = error?.details;
      if (details) throw new BadRequestException(details);
      throw new InternalServerErrorException({
        code: 'OCR_UPSTREAM_ERROR',
        message: 'No se pudo procesar el ticket en este momento.',
      });
    }
  }
}
