import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória').min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  displayName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(50),
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').regex(/[A-Z]/, 'Deve conter letra maiúscula').regex(/[0-9]/, 'Deve conter número'),
  confirmPassword: z.string().min(1, 'Confirmação obrigatória'),
}).refine((data) => data.password === data.confirmPassword, { message: 'Senhas não conferem', path: ['confirmPassword'] })

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
