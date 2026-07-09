import type { Metadata } from 'next'

import { RegisterForm } from '@/features/auth/components/RegisterForm'

export const metadata: Metadata = { title: 'Criar conta' }

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Criar sua conta</h1>
        <p className="text-muted-foreground text-sm">Comece a registrar suas corridas gratuitamente</p>
      </div>
      <RegisterForm />
    </div>
  )
}
