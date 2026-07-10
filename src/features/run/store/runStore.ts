import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { ActivitySplit, ActivityType, GeoPoint } from '@/domain/entities/Activity'
import { Pace } from '@/domain/value-objects/Pace'
import { calculateInstantPace, haversineDistance, smoothPace } from '@/features/run/utils/geoUtils'

export type RunStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished'

export interface RunState {
  status: RunStatus
  activityType: ActivityType
  distanceMeters: number
  durationSeconds: number
  currentPaceSecondsPerKm: number
  averagePaceSecondsPerKm: number
  currentSpeedMs: number
  route: GeoPoint[]
  splits: ActivitySplit[]
  nextSplitAtMeters: number
  paceHistory: number[]
  startedAt: Date | null
  lastResumedAt: number | null
  accumulatedSeconds: number
  gpsError: string | null
  gpsReady: boolean
  /** Pausa disparada automaticamente por falta de movimento (semáforo etc). */
  isAutoPaused: boolean
}

export interface RunActions {
  setActivityType: (type: ActivityType) => void
  setGpsReady: (ready: boolean) => void
  setGpsError: (error: string | null) => void
  startRun: () => void
  pauseRun: (auto?: boolean) => void
  resumeRun: () => void
  finishRun: () => void
  resetRun: () => void
  addGpsPoint: (point: GeoPoint) => void
  tick: (nowMs: number) => void
}

const INITIAL_STATE: RunState = {
  status: 'idle', activityType: 'run', distanceMeters: 0, durationSeconds: 0,
  currentPaceSecondsPerKm: 0, averagePaceSecondsPerKm: 0, currentSpeedMs: 0,
  route: [], splits: [], nextSplitAtMeters: 1000, paceHistory: [],
  startedAt: null, lastResumedAt: null, accumulatedSeconds: 0,
  gpsError: null, gpsReady: false, isAutoPaused: false,
}

export const useRunStore = create<RunState & RunActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      setActivityType: (type) => set({ activityType: type }),
      setGpsReady: (ready) => set((state) => ({ gpsReady: ready, status: ready && state.status === 'idle' ? 'ready' : state.status })),
      setGpsError: (error) => set({ gpsError: error }),
      // Date.now() (relógio real) em vez de performance.now(): em navegadores móveis,
      // performance.now() congela enquanto a aba está suspensa (tela bloqueada/app em
      // segundo plano), fazendo o cronômetro parar. Date.now() continua correto.
      startRun: () => set({ status: 'running', startedAt: new Date(), lastResumedAt: Date.now(), accumulatedSeconds: 0 }),
      pauseRun: (auto = false) => {
        const { lastResumedAt, accumulatedSeconds } = get()
        const elapsed = lastResumedAt ? (Date.now() - lastResumedAt) / 1000 : 0
        set({ status: 'paused', accumulatedSeconds: accumulatedSeconds + elapsed, lastResumedAt: null, isAutoPaused: auto })
      },
      resumeRun: () => set({ status: 'running', lastResumedAt: Date.now(), isAutoPaused: false }),
      finishRun: () => {
        const { lastResumedAt, accumulatedSeconds, status } = get()
        let finalSeconds = accumulatedSeconds
        if (status === 'running' && lastResumedAt) finalSeconds += (Date.now() - lastResumedAt) / 1000
        set({ status: 'finished', durationSeconds: Math.floor(finalSeconds), lastResumedAt: null })
      },
      resetRun: () => set(INITIAL_STATE),
      addGpsPoint: (point) => {
        const state = get()
        if (state.status !== 'running') return
        const { route, distanceMeters, nextSplitAtMeters, splits, paceHistory, accumulatedSeconds, lastResumedAt } = state
        const lastPoint = route.length > 0 ? route[route.length - 1] : null
        let deltaMeters = 0
        let instantPace = 0
        if (lastPoint) { deltaMeters = haversineDistance(lastPoint, point); instantPace = calculateInstantPace(lastPoint, point) }
        const newDistanceMeters = distanceMeters + deltaMeters
        const newRoute = [...route, point]
        const newPaceHistory = instantPace > 0 ? [...paceHistory, instantPace].slice(-20) : paceHistory
        const smoothedPace = smoothPace(newPaceHistory)
        const elapsed = lastResumedAt ? accumulatedSeconds + (Date.now() - lastResumedAt) / 1000 : accumulatedSeconds
        const avgPace = Pace.calculate(newDistanceMeters, elapsed).toSecondsPerKm()
        // duration de cada split = segundos gastos NAQUELE km (não acumulado).
        // Quando vários splits fecham num mesmo ponto GPS (ex: retomada após
        // suspensão), interpola o instante de cada cruzamento pela distância.
        const deltaSeconds = lastPoint ? Math.max(0, (point.timestamp - lastPoint.timestamp) / 1000) : 0
        const elapsedBefore = Math.max(0, elapsed - deltaSeconds)
        let cumulativeSplitSeconds = splits.reduce((sum, s) => sum + s.duration, 0)
        const newSplits = [...splits]
        let newNextSplitAt = nextSplitAtMeters
        while (newDistanceMeters >= newNextSplitAt) {
          const fraction = deltaMeters > 0 ? Math.min(1, Math.max(0, (newNextSplitAt - distanceMeters) / deltaMeters)) : 1
          const elapsedAtCrossing = elapsedBefore + fraction * deltaSeconds
          const splitDuration = Math.max(0, Math.round(elapsedAtCrossing - cumulativeSplitSeconds))
          const splitPace = Pace.calculate(1000, splitDuration).toSecondsPerKm()
          newSplits.push({ kilometer: newSplits.length + 1, duration: splitDuration, pace: splitPace, elevationGain: 0 })
          cumulativeSplitSeconds += splitDuration
          newNextSplitAt += 1000
        }
        set({ route: newRoute, distanceMeters: newDistanceMeters, currentPaceSecondsPerKm: smoothedPace, averagePaceSecondsPerKm: avgPace, currentSpeedMs: instantPace > 0 ? 1000 / instantPace : 0, splits: newSplits, nextSplitAtMeters: newNextSplitAt, paceHistory: newPaceHistory })
      },
      tick: (nowMs) => {
        const { status, lastResumedAt, accumulatedSeconds } = get()
        if (status !== 'running' || !lastResumedAt) return
        const elapsed = accumulatedSeconds + (nowMs - lastResumedAt) / 1000
        set({ durationSeconds: Math.floor(elapsed) })
      },
    }),
    {
      name: 'pacerun-active-run',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        status: state.status, activityType: state.activityType, distanceMeters: state.distanceMeters,
        durationSeconds: state.durationSeconds, route: state.route, splits: state.splits,
        startedAt: state.startedAt, accumulatedSeconds: state.accumulatedSeconds, nextSplitAtMeters: state.nextSplitAtMeters,
        // Persistir lastResumedAt (agora epoch ms via Date.now) permite que o
        // cronômetro continue correto mesmo após reload da página durante a corrida.
        lastResumedAt: state.lastResumedAt,
        isAutoPaused: state.isAutoPaused,
      }),
    }
  )
)
