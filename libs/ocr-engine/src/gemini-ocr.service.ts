import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { TicketSchema, type Ticket } from '../../shared-types/src/schemas/ticket.schema';
import { OcrProvider } from './ocr-provider';

const OCR_MODEL = 'gemini-1.5-flash';

const OCR_PROMPT = `
You are an OCR parser for purchase receipts.
Extract the receipt into strict JSON with this shape:
{
  "merchant": string,
  "date": ISO-8601 datetime string (optional),
  "total": number (positive),
  "currency": string (default "EUR"),
  "items": [{ "description": string, "quantity": number, "price": number }]
}

Rules:
- Return ONLY valid JSON. No markdown, no explanations.
- If a value is missing, infer conservatively.
- Numbers must be numbers, not strings.
- Keep item descriptions concise and readable.
`.trim();

@Injectable()
export class GeminiOcrService implements OcrProvider {
  private readonly client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GOOGLE_GEMINI_API_KEY');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async extractTicketFromImage(base64Image: string, mimeType: string): Promise<Ticket> {
    const response = await this.client.models.generateContent({
      model: OCR_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: OCR_PROMPT },
            {
              inlineData: {
                data: base64Image,
                mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text ?? '{}';
    const json = extractJson(raw);
    const parsed = JSON.parse(json);

    return TicketSchema.parse(parsed);
  }
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1];

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return trimmed;
}
