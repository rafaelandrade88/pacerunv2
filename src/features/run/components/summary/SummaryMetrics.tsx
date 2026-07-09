'use client'
import { motion } from 'framer-motion'
import { Clock, Gauge, MapPin, TrendingUp } from 'lucide-react'

import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import type { RunState } from '@/features/run/store/runStore'
import { cn } from '@/lib/utils'

interface SummaryMetricsProps { runState: RunState }

function MetricCard({ icon: Icon, label, value, sub, accent, index }: { icon: React.ElementType; label: string; value: string; sub?: string; accent?: boolean; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.07 }} className={cn('rounded-2xl border p-4 space-y-2', accent ? 'border-primary/20 bg-primary/5' : 'border-border/40 bg-card')}>
      <div className="flex items-center gap-1.5"><Icon className={cn('h-3.5 w-3.5', accent ? 'text-primary' : 'text-muted-foreground')} /><span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span></div>
      <p className={cn('text-2xl font-bold tabular-nums', accent ? 'text-primary' : 'text-foreground')}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </motion.div>
  )
}

export function SummaryMetrics({ runState }: SummaryMetricsProps) {
  const distance = Distance.fromMeters(runState.distanceMeters)
  const duration = Duration.fromSeconds(runState.durationSeconds)
  const avgPace = Pace.fromSecondsPerKm(runState.averagePaceSecondsPerKm)
  const metrics = [
    { icon: MapPin, label: 'Distância', value: distance.format(), accent: true },
    { icon: Clock, label: 'Duração', value: duration.format() },
    { icon: Gauge, label: 'Pace médio', value: avgPace.format(), sub: 'min/km' },
    { icon: TrendingUp, label: 'Splits', value: String(runState.splits.length), sub: `${runState.splits.length} km completo(s)` },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((m, i) => <MetricCard key={m.label} {...m} index={i} />)}
    </div>
  )
}
