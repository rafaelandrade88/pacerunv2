'use client'
import { motion } from 'framer-motion'
import { Activity, Clock, Route } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import type { UserProfile } from '@/domain/entities/User'
import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'

interface ProfileStatsProps { profile?: UserProfile | null; loading?: boolean }

export function ProfileStats({ profile, loading = false }: ProfileStatsProps) {
  if (loading) return <div className="grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
  if (!profile) return null
  const stats = [
    { icon: Activity, label: 'Atividades', value: String(profile.totalActivities) },
    { icon: Route, label: 'Total', value: Distance.fromMeters(profile.totalDistance).format() },
    { icon: Clock, label: 'Tempo', value: Duration.fromSeconds(profile.totalDuration).format() },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ icon: Icon, label, value }, i) => (
        <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-2xl border border-border/40 bg-card p-4 flex flex-col items-center gap-1.5 text-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <p className="text-xl font-bold tabular-nums">{value}</p>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        </motion.div>
      ))}
    </div>
  )
}
