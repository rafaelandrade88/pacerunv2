export const APP_CONFIG = {
  name: 'PaceRun',
  version: '2.1.0',
  description: 'Rastreie suas corridas. Supere seus limites.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://pacerunv2.vercel.app',
} as const

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  ACTIVITIES: 'activities',
  ACHIEVEMENTS: 'achievements',
  FOLLOWING: 'following',
  FOLLOWERS: 'followers',
} as const

export const ACTIVITY_LIMITS = {
  MAX_ROUTE_POINTS: 50_000,
  GPS_INTERVAL_MS: 3_000,
  MIN_ACCURACY_METERS: 30,
  MIN_DISTANCE_TO_SAVE_METERS: 100,
} as const

export const PAGINATION = {
  ACTIVITIES_PER_PAGE: 20,
} as const
