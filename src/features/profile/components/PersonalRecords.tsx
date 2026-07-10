'use client'
import { motion } from 'framer-motion'
import { Gauge, Route, Timer, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'

import { Skeleton } from '@/components/ui/skeleton'
import type { Activity } from '@/domain/entities/Activity'
import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import { usePersonalRecords } from '@/features/profile/hooks/usePersonalRecords'
import { formatDate } from '@/lib/utils'

interface RecordCardProps {
  icon: typeof Route
  label: string
  value: string
  activity: Activity
  index: number
}

function RecordCard({ icon: Icon, label, value, activity, index }: RecordCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
      <Link
        href={`/history/${activity.id}`}
        className="flex flex-col gap-1.5 rounded-2xl border border-border/40 bg-card p-4 transition-colors hover:border-border/70"
      >
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{activity.title} · {formatDate(activity.startedAt)}</p>
      </Link>
    </motion.div>
  )
}

export function PersonalRecords() {
  const { data: records, isLoading } = usePersonalRecords()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      </div>
    )
  }

  const cards = [
    records?.longestDistance && {
      icon: Route, label: 'Maior distância',
      value: Distance.fromMeters(records.longestDistance.distance).format(),
      activity: records.longestDistance,
    },
    records?.bestPace && {
      icon: Gauge, label: 'Melhor pace',
      value: Pace.fromSecondsPerKm(records.bestPace.pace).format(),
      activity: records.bestPace,
    },
    records?.longestDuration && {
      icon: Timer, label: 'Corrida mais longa',
      value: Duration.fromSeconds(records.longestDuration.duration).format(),
      activity: records.longestDuration,
    },
    records?.fastest1k && {
      icon: Zap, label: '1km mais rápido',
      value: Duration.fromSeconds(records.fastest1k.seconds).format(),
      activity: records.fastest1k.activity,
    },
    records?.fastest5k && {
      icon: Zap, label: '5km mais rápidos',
      value: Duration.fromSeconds(records.fastest5k.seconds).format(),
      activity: records.fastest5k.activity,
    },
    records?.fastest10k && {
      icon: Zap, label: '10km mais rápidos',
      value: Duration.fromSeconds(records.fastest10k.seconds).format(),
      activity: records.fastest10k.activity,
    },
  ].filter(Boolean) as RecordCardProps[]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Trophy className="h-4 w-4 text-muted-foreground" />
        Recordes pessoais
      </h3>
      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">Complete sua primeira corrida para registrar recordes.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {cards.map((card, i) => <RecordCard key={card.label} {...card} index={i} />)}
        </div>
      )}
    </div>
  )
}
