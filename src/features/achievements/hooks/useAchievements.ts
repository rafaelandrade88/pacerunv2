'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Achievement } from '@/domain/entities/Achievement'
import { AchievementRepository } from '@/infrastructure/firebase/repositories/AchievementRepository'
import { useAuth } from '@/providers/AuthProvider'

const repo = new AchievementRepository()
export const ACHIEVEMENTS_QUERY_KEY = 'achievements'

export function useAchievements() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [ACHIEVEMENTS_QUERY_KEY, user?.uid],
    queryFn: () => repo.findByUser(user!.uid),
    enabled: Boolean(user?.uid),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAchievementMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [ACHIEVEMENTS_QUERY_KEY, user?.uid] })

  const addAchievement = useMutation({
    mutationFn: (data: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>) => repo.create(data),
    onSuccess: invalidate,
  })

  const updateAchievement = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Achievement, 'id' | 'userId' | 'createdAt'>> }) =>
      repo.update(id, data),
    onSuccess: invalidate,
  })

  const deleteAchievement = useMutation({
    mutationFn: (id: string) => repo.delete(id),
    onSuccess: invalidate,
  })

  return { addAchievement, updateAchievement, deleteAchievement }
}
