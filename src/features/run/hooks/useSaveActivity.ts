'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { DASHBOARD_QUERY_KEY } from '@/features/dashboard/hooks/useUserStats'
import { PROFILE_QUERY_KEY } from '@/features/profile/hooks/useProfile'
import { ActivitySaveService } from '@/features/run/services/ActivitySaveService'
import { useRunStore } from '@/features/run/store/runStore'
import { useAuth } from '@/providers/AuthProvider'

export function useSaveActivity() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const runState = useRunStore()

  const mutation = useMutation({
    mutationFn: async ({ title, notes }: { title?: string; notes?: string }) =>
      ActivitySaveService.saveActivity({ userId: user!.uid, runState, title, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] })
      // resetRun NÃO acontece aqui: o zustand notifica de forma síncrona antes
      // de isSuccess virar true, e o SummaryScreen redirecionaria para /run no
      // meio do fluxo. O reset acontece no SummaryScreen, junto da navegação.
    },
  })

  return {
    saveActivity: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error?.message ?? null,
    isSuccess: mutation.isSuccess,
    savedActivityId: mutation.data?.activityId,
  }
}
