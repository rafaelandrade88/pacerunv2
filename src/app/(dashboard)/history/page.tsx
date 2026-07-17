import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { ActivityFilters } from '@/features/history/components/ActivityFilters'
import { ActivityList } from '@/features/history/components/ActivityList'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Histórico' }

function ListSkeleton() {
  return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[74px] rounded-2xl" />)}</div>
}

export default function HistoryPage() {
  return (
    <PageContainer>
      <PageHeader title="Histórico" subtitle="Todas as suas atividades registradas" />
      <div className="space-y-5">
        <Suspense><ActivityFilters /></Suspense>
        <Suspense fallback={<ListSkeleton />}><ActivityList /></Suspense>
      </div>
    </PageContainer>
  )
}
