'use client'
import { parseAsString, useQueryState } from 'nuqs'
import { useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ActivityType } from '@/domain/entities/Activity'
import { cn } from '@/lib/utils'
import { ACTIVITY_TYPE_META, ALL_ACTIVITIES_ICON } from '@/shared/constants/activityTypes'

const TYPE_OPTIONS: { value: ActivityType | 'all'; label: string; icon: typeof ALL_ACTIVITIES_ICON }[] = [
  { value: 'all', label: 'Todas', icon: ALL_ACTIVITIES_ICON },
  ...(Object.entries(ACTIVITY_TYPE_META) as [ActivityType, (typeof ACTIVITY_TYPE_META)[ActivityType]][]).map(
    ([value, meta]) => ({ value, label: meta.label, icon: meta.icon })
  ),
]

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todo período' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 3 meses' },
  { value: '365d', label: 'Este ano' },
]

export function ActivityFilters() {
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useQueryState('type', parseAsString.withDefault('all'))
  const [period, setPeriod] = useQueryState('period', parseAsString.withDefault('all'))

  const handleTypeChange = (value: string) => startTransition(() => { setType(value === 'all' ? null : value) })
  const handlePeriodChange = (value: string | null) => startTransition(() => { setPeriod(!value || value === 'all' ? null : value) })
  const clearFilters = () => startTransition(() => { setType(null); setPeriod(null) })
  const hasFilters = type !== 'all' || period !== 'all'

  return (
    <div className={cn('flex flex-wrap items-center gap-2', isPending && 'opacity-60 pointer-events-none')}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {TYPE_OPTIONS.map((opt) => {
          const isActive = (type ?? 'all') === opt.value
          return (
            <button key={opt.value} onClick={() => handleTypeChange(opt.value)} className={cn('flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-all duration-200 border', isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/40 hover:border-border hover:text-foreground')}>
              <opt.icon className="h-3.5 w-3.5" />{opt.label}
            </button>
          )
        })}
      </div>
      <div className="h-6 w-px bg-border/40 hidden sm:block" />
      <Select items={PERIOD_OPTIONS} value={period ?? 'all'} onValueChange={handlePeriodChange}>
        <SelectTrigger className="h-8 w-auto gap-2 rounded-full border-border/40 bg-card text-xs font-medium"><SelectValue /></SelectTrigger>
        <SelectContent>{PERIOD_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>)}</SelectContent>
      </Select>
      {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground">Limpar</Button>}
    </div>
  )
}
