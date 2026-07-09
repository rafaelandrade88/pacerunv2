export type ActivityType = 'run' | 'walk' | 'trail' | 'treadmill'
export type ActivityStatus = 'in_progress' | 'completed' | 'discarded'

export interface GeoPoint {
  lat: number
  lng: number
  altitude?: number
  accuracy?: number
  timestamp: number
}

export interface ActivitySplit {
  kilometer: number
  duration: number
  pace: number
  elevationGain: number
}

export interface Activity {
  id: string
  userId: string
  type: ActivityType
  status: ActivityStatus
  title: string
  startedAt: Date
  finishedAt?: Date
  duration: number
  distance: number
  pace: number
  calories?: number
  elevationGain?: number
  elevationLoss?: number
  averageHeartRate?: number
  maxHeartRate?: number
  route: GeoPoint[]
  splits: ActivitySplit[]
  mapSnapshot?: string
  notes?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}
