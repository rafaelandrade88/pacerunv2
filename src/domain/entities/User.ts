export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  username: string
  bio?: string
  totalActivities: number
  totalDistance: number
  totalDuration: number
  following: number
  followers: number
  isPublic: boolean
  /** Meta semanal em km definida pelo usuário; null = sem meta. */
  weeklyGoalKm?: number | null
}
