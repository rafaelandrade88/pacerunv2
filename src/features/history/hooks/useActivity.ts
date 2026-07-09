'use client'
import { useQuery } from '@tanstack/react-query'

import { ActivityRepository } from '@/infrastructure/firebase/repositories/ActivityRepository'
import { useAuth } from '@/providers/AuthProvider'

const activityRepository = new ActivityRepository()

export function useActivity(id: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['activity', id, user?.uid],
    queryFn: () => activityRepository.findById(user!.uid, id),
    enabled: Boolean(user?.uid) && Boolean(id),
    staleTime: 1000 * 60 * 5,
  })
}
