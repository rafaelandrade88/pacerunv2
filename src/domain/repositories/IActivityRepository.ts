import type { Activity, ActivityStatus, ActivityType } from '@/domain/entities/Activity'

export interface ActivityFilters {
  type?: ActivityType
  status?: ActivityStatus
  fromDate?: Date
  toDate?: Date
}

export interface PaginatedResult<T> {
  data: T[]
  hasMore: boolean
  lastCursor?: string
}

export interface IActivityRepository {
  findById(userId: string, activityId: string): Promise<Activity | null>
  findByUser(userId: string, filters?: ActivityFilters, limit?: number, cursor?: string): Promise<PaginatedResult<Activity>>
  create(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity>
  update(activityId: string, data: Partial<Activity>): Promise<Activity>
  delete(activityId: string): Promise<void>
}
