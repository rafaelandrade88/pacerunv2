'use client'
import { Activity, Clock, Gauge, Route } from 'lucide-react'

import { StatsCardItem } from '@/features/dashboard/components/StatsCardItem'
import type { UserStats } from '@/features/dashboard/services/DashboardService'

interface StatsCardsProps { stats?: UserStats; loading?: boolean }

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const cards = [
    { icon: Route, label: 'Esta semana', value: stats ? stats.thisWeekDistance.format() : '—', sub: `${stats?.thisWeekActivities ?? 0} atividade(s)`, accent: true },
    { icon: Clock, label: 'Tempo total', value: stats ? stats.totalDuration.format() : '—', sub: 'esta semana' },
    { icon: Gauge, label: 'Pace médio', value: stats ? stats.averagePace.format() : '—', sub: 'minutos por km' },
    { icon: Activity, label: 'Atividades', value: stats ? String(stats.totalActivities) : '—', sub: 'registradas' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card, index) => <StatsCardItem key={card.label} {...card} loading={loading} index={index} />)}
    </div>
  )
}
