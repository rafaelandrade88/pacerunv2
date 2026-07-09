'use client'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Gauge, Layers, MapPin, TrendingUp, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { Activity } from '@/domain/entities/Activity'
import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import { RouteMapPreview } from '@/features/history/components/RouteMapPreview'
import { ActivityRepository } from '@/infrastructure/firebase/repositories/ActivityRepository'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/providers/AuthProvider'

const activityRepository = new ActivityRepository()

interface ActivityDetailProps { activity: Activity }

const ACTIVITY_LABELS: Record<Activity['type'], string> = { run: 'Corrida', walk: 'Caminhada', trail: 'Trail', treadmill: 'Esteira' }

export function ActivityDetail({ activity }: ActivityDetailProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const distance = Distance.fromMeters(activity.distance)
  const duration = Duration.fromSeconds(activity.duration)
  const pace = Pace.calculate(activity.distance, activity.duration)

  async function handleDelete() {
    if (!user || isDeleting) return
    setIsDeleting(true)
    try { await activityRepository.delete(activity.id); router.push('/history'); router.refresh() }
    catch (e) { console.error('Erro ao deletar:', e); setIsDeleting(false) }
  }

  const metrics = [
    { icon: MapPin, label: 'Distância', value: distance.format() },
    { icon: Clock, label: 'Duração', value: duration.format() },
    { icon: Gauge, label: 'Pace médio', value: pace.format() },
    { icon: TrendingUp, label: 'Splits', value: `${activity.splits.length} km` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl shrink-0"
          nativeButton={false}
          render={<Link href="/history"><ArrowLeft className="h-4 w-4" /></Link>}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{activity.title}</h2>
          <div className="flex items-center gap-1.5 mt-0.5"><Calendar className="h-3 w-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">{formatDate(activity.startedAt)}</span><span className="text-muted-foreground text-xs mx-1">·</span><span className="text-xs text-muted-foreground">{ACTIVITY_LABELS[activity.type]}</span></div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowDeleteDialog(true)} className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive shrink-0" aria-label="Excluir atividade"><Trash2 className="h-4 w-4" /></Button>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
        {metrics.map(({ icon: Icon, label, value }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-2xl border border-border/40 bg-card p-4 space-y-2">
            <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span></div>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </motion.div>
        ))}
      </motion.div>
      {activity.route.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Rota</h3>
          <RouteMapPreview route={activity.route} />
        </div>
      )}
      {activity.splits.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-muted-foreground" />Splits</h3>
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
            <div className="grid grid-cols-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 border-b border-border/40 bg-muted/30"><span>Km</span><span className="text-center">Tempo</span><span className="text-right">Pace</span></div>
            {activity.splits.map((split) => {
              const splitPace = Pace.fromSecondsPerKm(split.pace)
              const splitDuration = Duration.fromSeconds(split.duration)
              return (
                <div key={split.kilometer} className="grid grid-cols-3 text-sm px-5 py-3 border-b border-border/20 last:border-0">
                  <span className="font-semibold">{split.kilometer}</span>
                  <span className="text-center text-muted-foreground">{splitDuration.format()}</span>
                  <span className="text-right font-bold text-primary">{splitPace.format()}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {activity.notes && (
        <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-2">
          <h3 className="text-sm font-semibold">Notas</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{activity.notes}</p>
        </div>
      )}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir atividade?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. A atividade será excluída permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? 'Excluindo...' : 'Excluir'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
