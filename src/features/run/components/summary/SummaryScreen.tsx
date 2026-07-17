'use client'
import { motion } from 'framer-motion'
import { CheckCircle2, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getBrokenRecords, usePersonalRecords } from '@/features/profile/hooks/usePersonalRecords'
import { SplitsList } from '@/features/run/components/SplitsList'
import { DiscardDialog } from '@/features/run/components/summary/DiscardDialog'
import { SummaryForm } from '@/features/run/components/summary/SummaryForm'
import type { SummaryFormData } from '@/features/run/components/summary/SummaryForm'
import { SummaryMetrics } from '@/features/run/components/summary/SummaryMetrics'
import { useSaveActivity } from '@/features/run/hooks/useSaveActivity'
import { useRunStore } from '@/features/run/store/runStore'

export function SummaryScreen() {
  const router = useRouter()
  const runStore = useRunStore()
  const { saveActivity, isSaving, saveError, isSuccess, savedActivityId } = useSaveActivity()
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [brokenRecords, setBrokenRecords] = useState<string[]>([])
  const { data: previousRecords } = usePersonalRecords()

  // Não redireciona quando o save acabou de resetar o estado (isSuccess):
  // a tela de sucesso cuida da navegação para o detalhe da atividade.
  useEffect(() => { if (runStore.status !== 'finished' && !isSuccess) router.replace('/run') }, [runStore.status, isSuccess, router])

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true)
      // Mais tempo na tela quando há recorde para ler a celebração
      const delay = brokenRecords.length > 0 ? 3500 : 2000
      const timer = setTimeout(() => { runStore.resetRun(); router.push(savedActivityId ? `/history/${savedActivityId}` : '/dashboard') }, delay)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, savedActivityId, router])

  async function handleSave(data: SummaryFormData) {
    // Compara com os recordes ANTES de salvar (o save invalida o cache)
    if (previousRecords) {
      setBrokenRecords(getBrokenRecords(previousRecords, {
        distanceMeters: runStore.distanceMeters,
        durationSeconds: runStore.durationSeconds,
        paceSecondsPerKm: runStore.averagePaceSecondsPerKm,
      }))
    }
    await saveActivity({ title: data.title, notes: data.notes })
  }
  function handleDiscard() { runStore.resetRun(); router.replace('/dashboard') }

  // showSuccess vem antes: após salvar, resetRun() zera o status mas a tela
  // de sucesso ainda precisa aparecer durante os 2s antes da navegação.
  if (!showSuccess && runStore.status !== 'finished') return null

  if (showSuccess) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </motion.div>
        <div className="space-y-2">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-bold">Corrida salva!</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm text-muted-foreground">Abrindo detalhes da atividade...</motion.p>
        </div>
        {brokenRecords.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Novos recordes pessoais</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {brokenRecords.map((label) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  <Trophy className="h-3.5 w-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1 py-4">
        <h1 className="text-2xl font-bold">Corrida concluída!</h1>
        <p className="text-sm text-muted-foreground">Revise os dados e salve sua atividade</p>
      </motion.div>
      <SummaryMetrics runState={runStore} />
      <SplitsList />
      <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Finalizar atividade</h3>
        <SummaryForm activityType={runStore.activityType} onSave={handleSave} onDiscard={() => setShowDiscardDialog(true)} isSaving={isSaving} saveError={saveError} />
      </div>
      <DiscardDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog} onConfirm={handleDiscard} />
    </div>
  )
}
