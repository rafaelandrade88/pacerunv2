'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ActivityType } from '@/domain/entities/Activity'
import { generateActivityTitle } from '@/features/run/utils/geoUtils'

const summaryFormSchema = z.object({
  title: z.string().max(80, 'Máximo 80 caracteres').optional(),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type SummaryFormData = z.infer<typeof summaryFormSchema>

interface SummaryFormProps { activityType: ActivityType; onSave: (data: SummaryFormData) => Promise<void>; onDiscard: () => void; isSaving: boolean; saveError: string | null }

export function SummaryForm({ activityType, onSave, onDiscard, isSaving, saveError }: SummaryFormProps) {
  const form = useForm<SummaryFormData>({ resolver: zodResolver(summaryFormSchema), defaultValues: { title: generateActivityTitle(activityType), notes: '' } })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4" noValidate>
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Nome da atividade</FormLabel><FormControl><Input {...field} placeholder={generateActivityTitle(activityType)} disabled={isSaving} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Notas (opcional)</FormLabel><FormControl><Textarea {...field} placeholder="Como foi a corrida?" rows={3} disabled={isSaving} className="resize-none" /></FormControl><FormMessage /></FormItem>
        )} />
        {saveError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
            <p className="text-sm text-destructive">{saveError}</p>
            <p className="text-xs text-destructive/70 mt-1">Seus dados estão seguros. Tente salvar novamente.</p>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onDiscard} disabled={isSaving} className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5">Descartar</Button>
          <Button type="submit" disabled={isSaving} className="flex-1">
            {isSaving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Salvando...</span> : 'Salvar corrida'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
