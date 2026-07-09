'use client'
import { useQuery } from '@tanstack/react-query'

import { ActivityRepository } from '@/infrastructure/firebase/repositories/ActivityRepository'
import { useAuth } from '@/providers/AuthProvider'

const activityRepository = new ActivityRepository()

export function useRecentActivities(limit = 5) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['recent-activities', user?.uid, limit],
    queryFn: () => activityRepository.findByUser(user!.uid, undefined, limit),
    enabled: Boolean(user?.uid),
    staleTime: 1000 * 60 * 2,
  })
}
