import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key obrigatória'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url('URL da aplicação inválida'),
  NEXT_PUBLIC_APP_NAME: z.string().default('PaceRun'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('2.1.0'),
  NEXT_PUBLIC_USE_FIREBASE_EMULATOR: z.string().optional().transform((v) => v === 'true'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().optional().transform((v) => v === 'true'),
  NEXT_PUBLIC_ENABLE_AVATAR_UPLOAD: z.string().optional().transform((v) => v === 'true'),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_USE_FIREBASE_EMULATOR: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_ENABLE_AVATAR_UPLOAD: process.env.NEXT_PUBLIC_ENABLE_AVATAR_UPLOAD,
})

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors
  const missing = Object.entries(errors).map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`).join('\n')
  throw new Error(`\n❌ Variáveis de ambiente inválidas:\n${missing}\n\nVerifique .env.local\n`)
}

export const env = parsed.data
export type Env = typeof env
