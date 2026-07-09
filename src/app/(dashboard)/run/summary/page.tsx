import type { Metadata } from 'next'

import { SummaryScreen } from '@/features/run/components/summary/SummaryScreen'
import { PageContainer } from '@/shared/components/layout/PageContainer'

export const metadata: Metadata = { title: 'Resumo da Corrida' }

export default function SummaryPage() {
  return <PageContainer className="pb-12"><SummaryScreen /></PageContainer>
}
