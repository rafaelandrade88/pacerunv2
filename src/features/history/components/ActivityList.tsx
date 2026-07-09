'use client'
import { motion } from 'framer-motion'
import { Footprints, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import type { ActivityType } from '@/domain/entities/Activity'
import { ActivityListItem } from '@/features/history/components/ActivityListItem'
import { useActivities } from '@/features/history/hooks/useActivities'

interface ActivityListProps { typeFilter?: ActivityType }

export function ActivityList({ typeFilter }: ActivityListProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, isError } = useActivities(typeFilter ? { type: typeFilter } : undefined)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage()
    }, { rootMargin: '200px' })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const activities = data?.pages.flatMap((p) => p.data) ?? []
  const isEmpty = !isLoading && activities.length === 0

  if (isError) return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <p className="text-sm text-destructive">Erro ao carregar atividades.</p>
    </div>
  )

  if (isEmpty) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted"><Footprints className="h-8 w-8 text-muted-foreground" /></div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Nenhuma atividade encontrada</p>
        <p className="text-xs text-muted-foreground">Tente outros filtros ou inicie uma corrida</p>
      </div>
      <Button size="sm" nativeButton={false} render={<Link href="/run">Iniciar corrida</Link>} />
    </motion.div>
  )

  return (
    <div className="space-y-3">
      {isLoading ? Array.from({ length: 6 }).map((_, i) => <ActivityListItem key={i} loading />) : (
        <>
          {activities.map((activity, index) => <ActivityListItem key={activity.id} activity={activity} index={index} />)}
          <div ref={sentinelRef} className="h-4 flex items-center justify-center">
            {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
        </>
      )}
    </div>
  )
}
