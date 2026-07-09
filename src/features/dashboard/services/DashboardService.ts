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
    const [weeklyActivities, recentResult] = await Promise.all([
      activityRepository.findByUserInRange(userId, from, to),
      activityRepository.findByUser(userId, undefined, 5),
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
    }
    return { stats, weeklyVolume, recentActivities: recentResult.data }
  },
}
