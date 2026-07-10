import { z } from 'zod'

export const profileEditSchema = z.object({
  displayName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  username: z.string().min(3, 'Mínimo 3 caracteres').max(30, 'Máximo 30 caracteres').regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e _'),
  bio: z.string().max(160, 'Máximo 160 caracteres').optional(),
  isPublic: z.boolean(),
  weeklyGoalKm: z
    .string()
    .optional()
    .refine((v) => {
      if (!v || v.trim() === '') return true
      const n = parseFloat(v.replace(',', '.'))
      return Number.isFinite(n) && n >= 1 && n <= 300
    }, 'Meta entre 1 e 300 km'),
})

export type ProfileEditFormData = z.infer<typeof profileEditSchema>
