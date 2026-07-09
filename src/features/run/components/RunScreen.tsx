'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { RunControls } from '@/features/run/components/RunControls'
import { RunMetricsDisplay } from '@/features/run/components/RunMetricsDisplay'
import { SplitsList } from '@/features/run/components/SplitsList'
import { GpsService } from '@/features/run/services/GpsService'
import { useRunStore } from '@/features/run/store/runStore'

const LiveMap = dynamic(() => import('@/features/run/components/LiveMap').then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[40vh] min-h-[280px] w-full rounded-2xl" />,
})

const gpsService = new GpsService()

export function RunScreen() {
  const { status, route, gpsReady, gpsError, setGpsReady, setGpsError, addGpsPoint } = useRunStore()

  useEffect(() => {
    gpsService.start({
      onPoint: (point) => { setGpsReady(true); setGpsError(null); addGpsPoint(point) },
      onError: (error) => {
        setGpsReady(false)
        const messages: Record<number, string> = { 1: 'Permissão de localização negada.', 2: 'Sinal GPS indisponível.', 3: 'Tempo limite de GPS excedido.' }
        setGpsError(messages[error.code] ?? 'Erro de GPS desconhecido.')
      },
    })
    return () => { gpsService.stop() }
  }, [setGpsReady, setGpsError, addGpsPoint])

  const isActive = status === 'running' || status === 'paused'

  return (
    <div className="space-y-4">
      {!gpsReady && !gpsError && (
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Aguardando sinal GPS...</span>
        </div>
      )}
      {gpsReady && !isActive && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-primary font-medium">GPS pronto. Pode iniciar!</span>
        </div>
      )}
      {gpsError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-xs text-destructive">{gpsError}</p>
        </div>
      )}
      <LiveMap route={route} />
      <RunMetricsDisplay />
      <div className="flex justify-center py-2"><RunControls /></div>
      {isActive && <SplitsList />}
    </div>
  )
}
