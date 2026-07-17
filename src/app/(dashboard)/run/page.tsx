import type { Metadata } from 'next'

import { RunScreen } from '@/features/run/components/RunScreen'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Iniciar Corrida' }

export default function RunPage() {
  return (
    <PageContainer className="pb-32 lg:pb-8">
      <PageHeader title="Nova corrida" subtitle="Mantenha o telefone desbloqueado durante a corrida" />
      <RunScreen />
    </PageContainer>
  )
}
