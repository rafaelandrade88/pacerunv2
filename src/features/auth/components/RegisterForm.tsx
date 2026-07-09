'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AuthDivider } from '@/features/auth/components/AuthDivider'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { useAuthActions } from '@/features/auth/hooks/useAuthActions'
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/authSchemas'

export function RegisterForm() {
  const { loading, error, signInWithGoogle, register } = useAuthActions()
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const form = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema), defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' } })

  async function onSubmit(data: RegisterFormData) { await register(data.email, data.password, data.displayName) }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full space-y-6">
      <GoogleSignInButton loading={loading} onClick={signInWithGoogle} />
      <AuthDivider />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField control={form.control} name="displayName" render={({ field }) => (
            <FormItem><FormLabel>Nome</FormLabel><FormControl>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input {...field} type="text" placeholder="Seu nome" className="pl-9" disabled={loading} />
              </div>
            </FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>E-mail</FormLabel><FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input {...field} type="email" placeholder="seu@email.com" className="pl-9" disabled={loading} />
              </div>
            </FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Senha</FormLabel><FormControl>
              <div className="relative">
                <Input {...field} type={showPwd ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" className="pr-9" disabled={loading} />
                <button type="button" onClick={() => setShowPwd((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem><FormLabel>Confirmar senha</FormLabel><FormControl>
              <div className="relative">
                <Input {...field} type={showConfirm ? 'text' : 'password'} placeholder="Repita a senha" className="pr-9" disabled={loading} />
                <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl><FormMessage /></FormItem>
          )} />
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</motion.p>}
          <Button type="submit" disabled={loading} className="w-full h-11 font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">Já tem uma conta?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">Entrar</Link>
      </p>
    </motion.div>
  )
}
