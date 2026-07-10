'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { UserProfile } from '@/domain/entities/User'
import { useProfileMutations } from '@/features/profile/hooks/useProfile'
import { profileEditSchema, type ProfileEditFormData } from '@/features/profile/schemas/profileSchemas'

interface ProfileEditFormProps { profile: UserProfile }

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter()
  const { updateProfile } = useProfileMutations()

  const defaults = {
    displayName: profile.displayName ?? '',
    username: profile.username,
    bio: profile.bio ?? '',
    isPublic: profile.isPublic,
    weeklyGoalKm: profile.weeklyGoalKm ? String(profile.weeklyGoalKm) : '',
  }

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: defaults,
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { form.reset(defaults) }, [profile, form])

  async function onSubmit(data: ProfileEditFormData) {
    try { await updateProfile.mutateAsync(data); router.push('/profile'); router.refresh() }
    catch (err) { form.setError('username', { message: (err as Error).message }) }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField control={form.control} name="displayName" render={({ field }) => (
          <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} placeholder="Seu nome" disabled={updateProfile.isPending} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem><FormLabel>Nome de usuário</FormLabel><FormControl><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span><Input {...field} placeholder="seu_usuario" className="pl-7" disabled={updateProfile.isPending} /></div></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="bio" render={({ field }) => (
          <FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} placeholder="Conte um pouco sobre você e suas corridas..." rows={3} className="resize-none" disabled={updateProfile.isPending} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="weeklyGoalKm" render={({ field }) => (
          <FormItem>
            <FormLabel>Meta semanal (km)</FormLabel>
            <FormControl><Input {...field} type="number" inputMode="decimal" min={1} max={300} placeholder="Ex: 20" disabled={updateProfile.isPending} /></FormControl>
            <FormDescription className="text-xs text-muted-foreground">Deixe vazio para não ter meta. O dashboard mostra seu progresso da semana.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="isPublic" render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-4">
              <div><FormLabel className="text-sm font-medium">Perfil público</FormLabel><FormDescription className="text-xs text-muted-foreground mt-0.5">Outros usuários podem ver seu perfil e atividades</FormDescription></div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={updateProfile.isPending} /></FormControl>
            </div>
          </FormItem>
        )} />
        {updateProfile.isError && <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3"><p className="text-sm text-destructive">{updateProfile.error.message}</p></div>}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={updateProfile.isPending} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={updateProfile.isPending} className="flex-1">{updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  )
}
