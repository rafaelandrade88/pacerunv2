import type { Activity } from '@/domain/entities/Activity'
import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import { ActivityRepository } from '@/infrastructure/firebase/repositories/ActivityRepository'

export interface UserStats {
  totalActivities: number
  totalDistance: Distance
  totalDuration: Duration
  averagePace: Pace
  thisWeekDistance: Distance
  thisWeekActivities: number
  /** Semanas consecutivas com pelo menos uma atividade (incluindo a atual). */
  weekStreak: number
}

export interface DailyVolume { day: string; date: string; km: number; activities: number }

export interface DashboardData { stats: UserStats; weeklyVolume: DailyVolume[]; recentActivities: Activity[] }

const activityRepository = new ActivityRepository()

function getWeekRange(): { from: Date; to: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
  const from = new Date(now)
  from.setDate(now.getDate() - dayOfWeek)
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(from.getDate() + 6)
  to.setHours(23, 59, 59, 999)
  return { from, to }
}

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

/** Segunda-feira 00:00 da semana da data. */
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - dayOfWeek)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Semanas consecutivas com atividade, contando para trás a partir da semana
 * atual. A semana corrente ainda sem corrida não quebra a sequência (ela só
 * quebra quando uma semana termina vazia).
 */
function calculateWeekStreak(activities: Activity[]): number {
  if (activities.length === 0) return 0
  const activeWeeks = new Set(activities.map((a) => startOfWeek(a.startedAt).getTime()))
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000
  let cursor = startOfWeek(new Date()).getTime()
  let streak = 0
  if (!activeWeeks.has(cursor)) cursor -= WEEK_MS // semana atual ainda vazia: começa na anterior
  while (activeWeeks.has(cursor)) {
    streak += 1
    cursor -= WEEK_MS
  }
  return streak
}

function buildWeeklyVolume(activities: Activity[], weekStart: Date): DailyVolume[] {
  return WEEKDAY_LABELS.map((day, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    const dateISO = date.toISOString().split('T')[0]
    const dayActivities = activities.filter((a) => a.startedAt.toISOString().split('T')[0] === dateISO)
    const totalMeters = dayActivities.reduce((sum, a) => sum + a.distance, 0)
    return { day, date: dateISO, km: parseFloat((totalMeters / 1000).toFixed(2)), activities: dayActivities.length }
  })
}

export const DashboardService = {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const { from, to } = getWeekRange()
    // 100 atividades recentes cobrem ~2 anos de streak para um corredor regular
    const [weeklyActivities, recentResult] = await Promise.all([
      activityRepository.findByUserInRange(userId, from, to),
      activityRepository.findByUser(userId, undefined, 100),
    ])
    const weeklyVolume = buildWeeklyVolume(weeklyActivities, from)
    const totalWeekMeters = weeklyActivities.reduce((sum, a) => sum + a.distance, 0)
    const totalWeekDuration = weeklyActivities.reduce((sum, a) => sum + a.duration, 0)
    const stats: UserStats = {
      totalActivities: recentResult.data.length,
      totalDistance: Distance.fromMeters(totalWeekMeters),
      totalDuration: Duration.fromSeconds(totalWeekDuration),
      averagePace: Pace.calculate(totalWeekMeters, totalWeekDuration),
      thisWeekDistance: Distance.fromMeters(totalWeekMeters),
      thisWeekActivities: weeklyActivities.length,
      weekStreak: calculateWeekStreak(recentResult.data),
    }
    return { stats, weeklyVolume, recentActivities: recentResult.data.slice(0, 5) }
  },
}
