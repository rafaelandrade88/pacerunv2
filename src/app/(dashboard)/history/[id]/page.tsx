'use client'
import { useParams } from 'next/navigation'

import { Skeleton } from '@/components/ui/skeleton'
import { ActivityDetail } from '@/features/history/components/ActivityDetail'
import { useActivity } from '@/features/history/hooks/useActivity'
import { PageContainer } from '@/shared/components/layout/PageContainer'

function ActivityDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <p className="text-4xl font-bold text-muted-foreground">404</p>
      <p className="text-muted-foreground">Atividade não encontrada.</p>
    </div>
  )
}

function ActivityDetailContent({ id }: { id: string }) {
  const { data: activity, isLoading, isError } = useActivity(id)

  if (isLoading || activity === undefined) return <ActivityDetailSkeleton />
  if (isError || activity === null) return <NotFound />

  return <ActivityDetail activity={activity} />
}

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>()
  return (
    <PageContainer>
      <ActivityDetailContent id={params.id} />
    </PageContainer>
  )
}
