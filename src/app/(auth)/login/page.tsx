import type { Metadata } from 'next'

import { LoginForm } from '@/features/auth/components/LoginForm'

export const metadata: Metadata = { title: 'Entrar' }

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="text-muted-foreground text-sm">Entre na sua conta para continuar treinando</p>
      </div>
      <LoginForm />
    </div>
  )
}
