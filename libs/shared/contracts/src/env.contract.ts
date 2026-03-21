import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  FRONTEND_URL: z.string().url(),

  GEMINI_API_KEY: z.string().min(1, 'La API Key de Gemini es obligatoria'),
  GEMINI_MODEL: z.string().min(1).default('gemini-1.5-flash'),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),

  MAX_FILE_SIZE: z.coerce.number().int().positive().default(5242880),
});

export type EnvConfig = z.infer<typeof envSchema>;
