'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/schemas/authSchemas'
import { AuthService, type AuthError } from '@/features/auth/services/AuthService'

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const form = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true)
    setError(null)
    try {
      await AuthService.sendPasswordReset(data.email)
      setSentTo(data.email)
    } catch (err) {
      setError((err as AuthError).message)
    } finally {
      setLoading(false)
    }
  }

  if (sentTo) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full space-y-6">
        <div className="rounded-xl border border-border/40 bg-card p-6 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
          <p className="text-sm font-medium">E-mail enviado</p>
          <p className="text-sm text-muted-foreground">Se existir uma conta para <span className="font-medium text-foreground">{sentTo}</span>, você receberá um link para redefinir a senha. Verifique também a caixa de spam.</p>
        </div>
        <Button
          variant="outline"
          className="w-full gap-2"
          nativeButton={false}
          render={<Link href="/login"><ArrowLeft className="h-4 w-4" />Voltar para o login</Link>}
        />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>E-mail</FormLabel><FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input {...field} type="email" placeholder="seu@email.com" autoComplete="email" className="pl-9" disabled={loading} />
              </div>
            </FormControl><FormMessage /></FormItem>
          )} />
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</motion.p>}
          <Button type="submit" disabled={loading} className="w-full h-11 font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar link de redefinição'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">Lembrou a senha?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">Entrar</Link>
      </p>
    </motion.div>
  )
}
