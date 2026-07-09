'use client'
import { motion } from 'framer-motion'
import { Calendar, Clock, Gauge, MapPin } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import type { Activity } from '@/domain/entities/Activity'
import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import { formatDate } from '@/lib/utils'

interface ActivityCardProps { activity?: Activity; loading?: boolean; index?: number }

const ACTIVITY_EMOJI: Record<Activity['type'], string> = { run: '🏃', walk: '🚶', trail: '🏔️', treadmill: '🏋️' }
const ACTIVITY_LABELS: Record<Activity['type'], string> = { run: 'Corrida', walk: 'Caminhada', trail: 'Trail', treadmill: 'Esteira' }

export function ActivityCard({ activity, loading = false, index = 0 }: ActivityCardProps) {
  if (loading) return (
    <div className="rounded-2xl border border-border/40 bg-card p-4">
      <div className="flex items-start justify-between mb-3"><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div><Skeleton className="h-8 w-8 rounded-xl" /></div>
      <div className="grid grid-cols-3 gap-2"><Skeleton className="h-10 rounded-lg" /><Skeleton className="h-10 rounded-lg" /><Skeleton className="h-10 rounded-lg" /></div>
    </div>
  )
  if (!activity) return null
  const distance = Distance.fromMeters(activity.distance)
  const duration = Duration.fromSeconds(activity.duration)
  const pace = Pace.calculate(activity.distance, activity.duration)
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.06 }} className="rounded-2xl border border-border/40 bg-card p-4 hover:border-border/70 transition-colors duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold">{activity.title}</p>
          <div className="flex items-center gap-1.5 mt-1"><Calendar className="h-3 w-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">{formatDate(activity.startedAt)}</span></div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-base">{ACTIVITY_EMOJI[activity.type]}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{ icon: MapPin, label: 'Dist.', value: distance.format() }, { icon: Clock, label: 'Tempo', value: duration.format() }, { icon: Gauge, label: 'Pace', value: pace.format() }].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl bg-muted/50 p-2.5 space-y-0.5">
            <div className="flex items-center gap-1"><Icon className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span></div>
            <p className="text-sm font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3"><span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">{ACTIVITY_LABELS[activity.type]}</span></div>
    </motion.div>
  )
}
