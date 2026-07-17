'use client'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, Clock, Gauge, MapPin } from 'lucide-react'
import Link from 'next/link'

import { Skeleton } from '@/components/ui/skeleton'
import type { Activity } from '@/domain/entities/Activity'
import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import { cn, formatDate } from '@/lib/utils'
import { ACTIVITY_TYPE_META } from '@/shared/constants/activityTypes'

interface ActivityListItemProps { activity?: Activity; loading?: boolean }

export function ActivityListItem({ activity, loading = false }: ActivityListItemProps) {
  if (loading) return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4">
      <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div>
      <Skeleton className="h-4 w-4 rounded" />
    </div>
  )
  if (!activity) return null
  const distance = Distance.fromMeters(activity.distance)
  const duration = Duration.fromSeconds(activity.duration)
  const pace = Pace.calculate(activity.distance, activity.duration)
  const { icon: TypeIcon, colorClass } = ACTIVITY_TYPE_META[activity.type]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <Link href={`/history/${activity.id}`} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 hover:border-border/70 hover:shadow-sm transition-all duration-200 group">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted shrink-0">
          <TypeIcon className={cn('h-5 w-5', colorClass)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{activity.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5"><Calendar className="h-3 w-3 text-muted-foreground shrink-0" /><span className="text-xs text-muted-foreground">{formatDate(activity.startedAt)}</span></div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          {[{ icon: MapPin, value: distance.format() }, { icon: Clock, value: duration.format() }, { icon: Gauge, value: pace.format() }].map(({ icon: Icon, value }) => (
            <div key={value} className="flex flex-col items-center gap-0.5 min-w-[52px]">
              <Icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-bold">{value}</span>
            </div>
          ))}
        </div>
        <div className="sm:hidden flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-sm font-bold">{distance.format()}</span>
          <span className="text-xs text-muted-foreground">{pace.format()}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </Link>
    </motion.div>
  )
}
