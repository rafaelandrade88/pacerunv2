'use client'
import { useQuery } from '@tanstack/react-query'

import { DashboardService } from '@/features/dashboard/services/DashboardService'
import { useAuth } from '@/providers/AuthProvider'

export const DASHBOARD_QUERY_KEY = 'dashboard'

export function useDashboardData() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, user?.uid],
    queryFn: () => DashboardService.getDashboardData(user!.uid),
    enabled: Boolean(user?.uid),
    staleTime: 1000 * 60 * 5,
  })
}
