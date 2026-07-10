'use client'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatsCardItemProps {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  loading?: boolean
  accent?: boolean
  index?: number
  /** 0–1: substitui o ícone por um anel de progresso (meta semanal). */
  progress?: number
}

function ProgressRing({ progress }: { progress: number }) {
  const clamped = Math.min(Math.max(progress, 0), 1)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative h-11 w-11" role="img" aria-label={`${Math.round(clamped * 100)}% da meta semanal`}>
      <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
        <circle cx="22" cy="22" r={radius} stroke="var(--muted)" strokeWidth="4" fill="none" />
        <circle
          cx="22" cy="22" r={radius}
          stroke="var(--primary)" strokeWidth="4" fill="none" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={(1 - clamped) * circumference}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary tabular-nums">
        {Math.round(clamped * 100)}%
      </span>
    </div>
  )
}

export function StatsCardItem({ icon: Icon, label, value, sub, loading = false, accent = false, index = 0, progress }: StatsCardItemProps) {
  if (loading) return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-4 rounded-md" /><Skeleton className="h-7 w-24" /><Skeleton className="h-3 w-16" />
    </div>
  )
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.07 }}
      className={cn('rounded-2xl border p-5 space-y-3', accent ? 'border-primary/20 bg-primary/5' : 'border-border/40 bg-card hover:border-border/70')}>
      {typeof progress === 'number' ? (
        <ProgressRing progress={progress} />
      ) : (
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', accent ? 'bg-primary/15' : 'bg-muted')}>
          <Icon className={cn('h-4 w-4', accent ? 'text-primary' : 'text-muted-foreground')} />
        </div>
      )}
      <div>
        <p className={cn('text-2xl font-bold tracking-tight', accent && 'text-primary')}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    </motion.div>
  )
}
