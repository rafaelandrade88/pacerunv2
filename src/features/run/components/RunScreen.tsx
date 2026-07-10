'use client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { RunControls } from '@/features/run/components/RunControls'
import { RunMetricsDisplay } from '@/features/run/components/RunMetricsDisplay'
import { SplitsList } from '@/features/run/components/SplitsList'
import { useWakeLock } from '@/features/run/hooks/useWakeLock'
import { GpsService } from '@/features/run/services/GpsService'
import { useRunStore } from '@/features/run/store/runStore'

const LiveMap = dynamic(() => import('@/features/run/components/LiveMap').then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[40vh] min-h-[280px] w-full rounded-2xl" />,
})

const gpsService = new GpsService()

// Sem ponto GPS válido por este tempo durante a corrida = parado (semáforo,
// descanso). Pontos a menos de 5m são descartados pelo filtro, então "sem
// pontos" é um bom sinal de imobilidade.
const AUTO_PAUSE_AFTER_MS = 20_000

export function RunScreen() {
  const router = useRouter()
  const { status, route, gpsReady, gpsError, isAutoPaused, setGpsReady, setGpsError, addGpsPoint, pauseRun, resumeRun } = useRunStore()

  // Corrida finalizada mas ainda não salva (persistida em sessionStorage):
  // volta ao resumo para salvar/descartar, em vez de mostrar dados residuais aqui.
  // Reativo ao status (não getState no mount) porque a reidratação do persist
  // pode acontecer depois do primeiro render num reload completo da página.
  useEffect(() => {
    if (status === 'finished') router.replace('/run/summary')
  }, [status, router])

  // Auto-pause: sem movimento por AUTO_PAUSE_AFTER_MS enquanto corre → pausa.
  // A retomada acontece no onPoint, quando um novo ponto válido chega.
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useRunStore.getState()
      if (state.status !== 'running' || state.route.length === 0) return
      const lastPoint = state.route[state.route.length - 1]
      if (Date.now() - lastPoint.timestamp > AUTO_PAUSE_AFTER_MS) pauseRun(true)
    }, 5000)
    return () => clearInterval(interval)
  }, [pauseRun])

  useEffect(() => {
    gpsService.start({
      onPoint: (point) => {
        setGpsReady(true)
        setGpsError(null)
        const state = useRunStore.getState()
        if (state.status === 'paused' && state.isAutoPaused) resumeRun()
        addGpsPoint(point)
      },
      onError: (error) => {
        setGpsReady(false)
        const messages: Record<number, string> = { 1: 'Permissão de localização negada.', 2: 'Sinal GPS indisponível.', 3: 'Tempo limite de GPS excedido.' }
        setGpsError(messages[error.code] ?? 'Erro de GPS desconhecido.')
      },
    })
    return () => { gpsService.stop() }
  }, [setGpsReady, setGpsError, addGpsPoint, resumeRun])

  const isActive = status === 'running' || status === 'paused'
  useWakeLock(isActive)

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
      {isAutoPaused && (
        <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3" role="status">
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Pausa automática — retomamos quando você voltar a se mover</span>
        </div>
      )}
      <LiveMap route={route} />
      <RunMetricsDisplay />
      <div className="flex justify-center py-2"><RunControls /></div>
      {isActive && <SplitsList />}
    </div>
  )
}
