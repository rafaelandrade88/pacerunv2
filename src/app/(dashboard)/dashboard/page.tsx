'use client'
import { motion } from 'framer-motion'

import { RecentActivities } from '@/features/dashboard/components/RecentActivities'
import { StatsCards } from '@/features/dashboard/components/StatsCards'
import { WeeklyChart } from '@/features/dashboard/components/WeeklyChart'
import { useDashboardData } from '@/features/dashboard/hooks/useUserStats'
import { useAuth } from '@/providers/AuthProvider'
import { PageContainer } from '@/shared/components/layout/PageContainer'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useDashboardData()

  return (
    <PageContainer>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6 space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, <span className="text-primary">{user?.displayName?.split(' ')[0] ?? 'corredor'}</span> 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          {isLoading || !data ? 'Carregando seus dados...' : data.stats.thisWeekActivities === 0 ? 'Pronto para a sua primeira corrida da semana?' : `${data.stats.thisWeekActivities} ${data.stats.thisWeekActivities === 1 ? 'atividade' : 'atividades'} esta semana. Continue assim!`}
        </p>
      </motion.div>
      {isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-2">
          <p className="text-sm text-destructive font-medium">Erro ao carregar dados. Tente recarregar a página.</p>
          {error instanceof Error && (
            <p className="text-xs text-destructive/70 font-mono break-all">{error.message}</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <StatsCards stats={data?.stats} loading={isLoading} />
          <WeeklyChart data={data?.weeklyVolume} loading={isLoading} />
          <RecentActivities activities={data?.recentActivities} loading={isLoading} />
        </div>
      )}
    </PageContainer>
  )
}
