import type { Metadata } from 'next'

import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Redefinir senha' }

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Redefinir senha</h1>
        <p className="text-muted-foreground text-sm">Informe seu e-mail e enviaremos um link para criar uma nova senha</p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
