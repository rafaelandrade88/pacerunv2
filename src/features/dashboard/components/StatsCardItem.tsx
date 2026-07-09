'use client'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatsCardItemProps { icon: LucideIcon; label: string; value: string; sub?: string; loading?: boolean; accent?: boolean; index?: number }

export function StatsCardItem({ icon: Icon, label, value, sub, loading = false, accent = false, index = 0 }: StatsCardItemProps) {
  if (loading) return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-4 rounded-md" /><Skeleton className="h-7 w-24" /><Skeleton className="h-3 w-16" />
    </div>
  )
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.07 }}
      className={cn('rounded-2xl border p-5 space-y-3', accent ? 'border-primary/20 bg-primary/5' : 'border-border/40 bg-card hover:border-border/70')}>
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', accent ? 'bg-primary/15' : 'bg-muted')}>
        <Icon className={cn('h-4 w-4', accent ? 'text-primary' : 'text-muted-foreground')} />
      </div>
      <div>
        <p className={cn('text-2xl font-bold tracking-tight', accent && 'text-primary')}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    </motion.div>
  )
}
