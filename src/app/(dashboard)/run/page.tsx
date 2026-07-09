import type { Metadata } from 'next'

import { RunScreen } from '@/features/run/components/RunScreen'
import { PageContainer } from '@/shared/components/layout/PageContainer'

export const metadata: Metadata = { title: 'Iniciar Corrida' }

export default function RunPage() {
  return (
    <PageContainer className="pb-32 lg:pb-8">
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Nova corrida</h2>
        <p className="text-sm text-muted-foreground">Mantenha o telefone desbloqueado durante a corrida</p>
      </div>
      <RunScreen />
    </PageContainer>
  )
}
