'use client'
import { motion } from 'framer-motion'
import { Clock, Gauge, MapPin, TrendingUp } from 'lucide-react'

import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import type { RunState } from '@/features/run/store/runStore'
import { cn } from '@/lib/utils'

interface SummaryMetricsProps { runState: RunState }

function MetricCard({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-4 space-y-2', accent ? 'border-primary/20 bg-primary/5' : 'border-border/40 bg-card')}>
      <div className="flex items-center gap-1.5"><Icon className={cn('h-3.5 w-3.5', accent ? 'text-primary' : 'text-muted-foreground')} /><span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span></div>
      <p className={cn('text-2xl font-bold tabular-nums', accent ? 'text-primary' : 'text-foreground')}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="grid grid-cols-2 gap-3">
      {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
    </motion.div>
  )
}
