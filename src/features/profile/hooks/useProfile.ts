'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { DASHBOARD_QUERY_KEY } from '@/features/dashboard/hooks/useUserStats'
import type { ProfileEditFormData } from '@/features/profile/schemas/profileSchemas'
import { ProfileService } from '@/features/profile/services/ProfileService'
import { UserRepository } from '@/infrastructure/firebase/repositories/UserRepository'
import { useAuth } from '@/providers/AuthProvider'

const userRepository = new UserRepository()
export const PROFILE_QUERY_KEY = 'profile'

export function useProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, user?.uid],
    queryFn: () => userRepository.findById(user!.uid),
    enabled: Boolean(user?.uid),
    staleTime: 1000 * 60 * 5,
  })
}

export function useProfileMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, user?.uid] }); queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY] }) }

  const updateProfile = useMutation({
    mutationFn: (data: ProfileEditFormData) => ProfileService.updateProfile(user!.uid, data),
    onSuccess: invalidate,
  })

  const updateAvatar = useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (p: number) => void }) => ProfileService.updateAvatar(user!.uid, file, onProgress),
    onSuccess: invalidate,
  })

  return { updateProfile, updateAvatar }
}
