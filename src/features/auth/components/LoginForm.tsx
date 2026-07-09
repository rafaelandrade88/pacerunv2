'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AuthDivider } from '@/features/auth/components/AuthDivider'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { useAuthActions } from '@/features/auth/hooks/useAuthActions'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/authSchemas'

export function LoginForm() {
  const { loading, error, signInWithGoogle, signInWithEmail } = useAuthActions()
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  async function onSubmit(data: LoginFormData) { await signInWithEmail(data.email, data.password) }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full space-y-6">
      <GoogleSignInButton loading={loading} onClick={signInWithGoogle} />
      <AuthDivider />
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
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Senha</FormLabel>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">Esqueceu a senha?</Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input {...field} type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" className="pr-9" disabled={loading} />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl><FormMessage />
            </FormItem>
          )} />
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</motion.p>}
          <Button type="submit" disabled={loading} className="w-full h-11 font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">Não tem uma conta?{' '}
        <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">Criar conta</Link>
      </p>
    </motion.div>
  )
}
