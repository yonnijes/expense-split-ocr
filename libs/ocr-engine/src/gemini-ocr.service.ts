import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { TicketSchema, type TicketContract as Ticket, type OcrFailure } from '@shared/contracts';
import { OcrProvider } from './ocr-provider';

const OCR_MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';

const OCR_PROMPT = `
Extract this receipt into STRICT JSON only:
{
  "merchant": string,
  "date": ISO-8601 datetime string (optional),
  "total": number,
  "currency": string,
  "items": [{ "description": string, "quantity": number, "price": number }]
}
Rules:
- No markdown. No extra keys.
- If unreadable, return best effort JSON with empty items.
`.trim();

@Injectable()
export class GeminiOcrService implements OcrProvider {
  private readonly client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
    this.client = new GoogleGenAI({ apiKey });
  }

  async extractTicketFromImage(base64Image: string, mimeType: string): Promise<Ticket> {
    const optimized = await this.optimizeImage(base64Image, mimeType);

    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await this.client.models.generateContent({
          model: OCR_MODEL,
          contents: [{ role: 'user', parts: [{ text: OCR_PROMPT }, { inlineData: optimized }] }],
          config: { responseMimeType: 'application/json' },
        });

        const raw = response.text ?? '{}';
        const parsed = JSON.parse(extractJson(raw));
        return TicketSchema.parse(parsed);
      } catch (error) {
        lastError = error;
      }
    }

    const failure: OcrFailure = {
      code: 'OCR_PARSE_ERROR',
      message: 'No pudimos leer los productos con suficiente confianza.',
      hint: 'Por favor, revisa la imagen o ingresa los productos manualmente.',
    };

    throw Object.assign(new Error(failure.message), { cause: lastError, details: failure });
  }

  private async optimizeImage(base64Image: string, mimeType: string): Promise<{ data: string; mimeType: string }> {
    const input = Buffer.from(base64Image, 'base64');

    const out = await sharp(input)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();

    return { data: out.toString('base64'), mimeType: 'image/jpeg' };
  }
}

function extractJson(raw: string): string {
  const t = raw.trim();
  if (t.startsWith('{') || t.startsWith('[')) return t;
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1];
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last > first) return t.slice(first, last + 1);
  return t;
}
