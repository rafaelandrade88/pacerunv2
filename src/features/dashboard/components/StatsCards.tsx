'use client'
import { Clock, Flame, Gauge, Route } from 'lucide-react'

import { StatsCardItem } from '@/features/dashboard/components/StatsCardItem'
import type { UserStats } from '@/features/dashboard/services/DashboardService'
import { useProfile } from '@/features/profile/hooks/useProfile'

interface StatsCardsProps { stats?: UserStats; loading?: boolean }

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const { data: profile } = useProfile()
  const goalKm = profile?.weeklyGoalKm ?? null
  const weekKm = stats ? stats.thisWeekDistance.toKilometers() : 0
  const cards = [
    goalKm
      ? { icon: Route, label: 'Meta semanal', value: stats ? stats.thisWeekDistance.format() : '—', sub: `de ${goalKm} km`, accent: true, progress: stats ? weekKm / goalKm : 0 }
      : { icon: Route, label: 'Esta semana', value: stats ? stats.thisWeekDistance.format() : '—', sub: `${stats?.thisWeekActivities ?? 0} ${(stats?.thisWeekActivities ?? 0) === 1 ? 'atividade' : 'atividades'}`, accent: true },
    { icon: Clock, label: 'Tempo total', value: stats ? stats.totalDuration.format() : '—', sub: 'esta semana' },
    { icon: Gauge, label: 'Pace médio', value: stats ? stats.averagePace.format() : '—', sub: 'minutos por km' },
    { icon: Flame, label: 'Sequência', value: stats ? String(stats.weekStreak) : '—', sub: (stats?.weekStreak ?? 0) === 1 ? 'semana seguida correndo' : 'semanas seguidas correndo' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => <StatsCardItem key={card.label} {...card} loading={loading} />)}
    </div>
  )
}
