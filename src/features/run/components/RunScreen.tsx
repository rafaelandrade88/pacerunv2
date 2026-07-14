'use client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

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
  //
  // CRÍTICO: auto-pause só vale para "parado com o app visível" (semáforo).
  // Quando o sistema suspende o app (tela bloqueada), o corredor continua
  // correndo — pausar aqui excluiria esse tempo do cronômetro. Detectamos
  // suspensão de duas formas: página não-visível, e "congelamento" (o
  // intervalo de 5s que demora >15s para disparar). Após acordar, damos
  // 30s de carência para o GPS se restabelecer antes de considerar pausa.
  const lastIntervalRef = useRef(Date.now())
  const lastWakeRef = useRef(0)
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'visible') lastWakeRef.current = Date.now()
    }
    document.addEventListener('visibilitychange', onVisibility)
    const interval = setInterval(() => {
      const now = Date.now()
      const wasFrozen = now - lastIntervalRef.current > 15_000
      lastIntervalRef.current = now
      if (wasFrozen) { lastWakeRef.current = now; return }
      if (document.visibilityState !== 'visible') return
      if (now - lastWakeRef.current < 30_000) return
      const state = useRunStore.getState()
      if (state.status !== 'running' || state.route.length === 0) return
      const lastPoint = state.route[state.route.length - 1]
      if (now - lastPoint.timestamp > AUTO_PAUSE_AFTER_MS) pauseRun(true)
    }, 5000)
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisibility) }
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
  const wakeLockStatus = useWakeLock(isActive)
  const wakeLockFailed = isActive && (wakeLockStatus === 'denied' || wakeLockStatus === 'unavailable')

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
      {wakeLockFailed && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3" role="alert">
          <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
            Não foi possível manter a tela ligada — o tempo é recuperado se a tela bloquear, mas a distância do trecho se perde.
            {wakeLockStatus === 'denied' ? ' Desative o Modo de Baixa Energia e toque na tela de vez em quando.' : ' Mantenha a tela ativa durante a corrida.'}
          </p>
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
