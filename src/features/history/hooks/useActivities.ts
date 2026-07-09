'use client'
import { useInfiniteQuery } from '@tanstack/react-query'

import type { ActivityFilters } from '@/domain/repositories/IActivityRepository'
import { ActivityRepository } from '@/infrastructure/firebase/repositories/ActivityRepository'
import { useAuth } from '@/providers/AuthProvider'

const activityRepository = new ActivityRepository()
const PAGE_SIZE = 15

export function useActivities(filters?: ActivityFilters) {
  const { user } = useAuth()
  return useInfiniteQuery({
    queryKey: ['activities', user?.uid, filters],
    queryFn: async ({ pageParam }) => activityRepository.findByUser(user!.uid, filters, PAGE_SIZE, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? undefined,
    enabled: Boolean(user?.uid),
    staleTime: 1000 * 60 * 2,
  })
}
