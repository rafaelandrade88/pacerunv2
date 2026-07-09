'use client'
import { useEffect, useRef } from 'react'

import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import { useRunStore } from '@/features/run/store/runStore'
import { cn } from '@/lib/utils'

interface MetricProps { label: string; value: string; sub?: string; large?: boolean; accent?: boolean }

function Metric({ label, value, sub, large, accent }: MetricProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn('font-bold tabular-nums tracking-tight leading-none', large ? 'text-5xl sm:text-6xl' : 'text-2xl sm:text-3xl', accent && 'text-primary')}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground font-medium">{sub}</span>}
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{label}</span>
    </div>
  )
}

export function RunMetricsDisplay() {
  const { durationSeconds, distanceMeters, currentPaceSecondsPerKm, averagePaceSecondsPerKm, status, tick } = useRunStore()
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (status !== 'running') { if (rafRef.current) cancelAnimationFrame(rafRef.current); return }
    function loop() { tick(Date.now()); rafRef.current = requestAnimationFrame(loop) }
    rafRef.current = requestAnimationFrame(loop)
    // rAF não roda com a aba suspensa; ao voltar do background, atualiza o cronômetro na hora
    function onVisible() { if (document.visibilityState === 'visible') tick(Date.now()) }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [status, tick])

  const distance = Distance.fromMeters(distanceMeters)
  const duration = Duration.fromSeconds(durationSeconds)
  const currentPace = Pace.fromSecondsPerKm(currentPaceSecondsPerKm)
  const avgPace = Pace.fromSecondsPerKm(averagePaceSecondsPerKm)

  return (
    <div className="rounded-2xl border border-border/40 bg-card px-6 py-8 space-y-6">
      <div className="flex justify-center"><Metric label="Distância" value={distance.format()} large accent /></div>
      <div className="h-px bg-border/40" />
      <div className="grid grid-cols-3 gap-4">
        <Metric label="Tempo" value={duration.format()} />
        <Metric label="Pace atual" value={currentPaceSecondsPerKm > 0 ? currentPace.format() : '--:--'} sub="/km" />
        <Metric label="Pace médio" value={averagePaceSecondsPerKm > 0 ? avgPace.format() : '--:--'} sub="/km" />
      </div>
    </div>
  )
}
