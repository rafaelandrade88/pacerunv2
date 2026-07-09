'use client'
import dynamic from 'next/dynamic'

import { Skeleton } from '@/components/ui/skeleton'
import type { GeoPoint } from '@/domain/entities/Activity'

const RouteMapInner = dynamic(() => import('./RouteMapInner').then((m) => m.RouteMapInner), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
})

interface RouteMapPreviewProps { route: GeoPoint[]; className?: string }

export function RouteMapPreview({ route, className }: RouteMapPreviewProps) {
  if (route.length < 2) return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-border/40 bg-muted">
      <p className="text-xs text-muted-foreground">Rota sem dados suficientes</p>
    </div>
  )
  return <RouteMapInner route={route} className={className} />
}
