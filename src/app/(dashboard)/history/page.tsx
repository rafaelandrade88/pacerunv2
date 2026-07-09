import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { ActivityFilters } from '@/features/history/components/ActivityFilters'
import { ActivityList } from '@/features/history/components/ActivityList'
import { PageContainer } from '@/shared/components/layout/PageContainer'

export const metadata: Metadata = { title: 'Histórico' }

function ListSkeleton() {
  return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[74px] rounded-2xl" />)}</div>
}

export default function HistoryPage() {
  return (
    <PageContainer>
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Histórico</h2>
        <p className="text-sm text-muted-foreground">Todas as suas atividades registradas</p>
      </div>
      <div className="space-y-5">
        <Suspense><ActivityFilters /></Suspense>
        <Suspense fallback={<ListSkeleton />}><ActivityList /></Suspense>
      </div>
    </PageContainer>
  )
}
