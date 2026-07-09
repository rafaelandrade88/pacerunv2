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
}

export interface RunActions {
  setActivityType: (type: ActivityType) => void
  setGpsReady: (ready: boolean) => void
  setGpsError: (error: string | null) => void
  startRun: () => void
  pauseRun: () => void
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
  gpsError: null, gpsReady: false,
}

export const useRunStore = create<RunState & RunActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      setActivityType: (type) => set({ activityType: type }),
      setGpsReady: (ready) => set((state) => ({ gpsReady: ready, status: ready && state.status === 'idle' ? 'ready' : state.status })),
      setGpsError: (error) => set({ gpsError: error }),
      startRun: () => set({ status: 'running', startedAt: new Date(), lastResumedAt: performance.now(), accumulatedSeconds: 0 }),
      pauseRun: () => {
        const { lastResumedAt, accumulatedSeconds } = get()
        const elapsed = lastResumedAt ? (performance.now() - lastResumedAt) / 1000 : 0
        set({ status: 'paused', accumulatedSeconds: accumulatedSeconds + elapsed, lastResumedAt: null })
      },
      resumeRun: () => set({ status: 'running', lastResumedAt: performance.now() }),
      finishRun: () => {
        const { lastResumedAt, accumulatedSeconds, status } = get()
        let finalSeconds = accumulatedSeconds
        if (status === 'running' && lastResumedAt) finalSeconds += (performance.now() - lastResumedAt) / 1000
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
        const elapsed = lastResumedAt ? accumulatedSeconds + (performance.now() - lastResumedAt) / 1000 : accumulatedSeconds
        const avgPace = Pace.calculate(newDistanceMeters, elapsed).toSecondsPerKm()
        const newSplits = [...splits]
        let newNextSplitAt = nextSplitAtMeters
        while (newDistanceMeters >= newNextSplitAt) {
          const splitNumber = newSplits.length + 1
          const totalElapsed = Math.floor(elapsed)
          const splitStartTime = splits.length > 0 ? splits[splits.length - 1].duration : 0
          const splitDuration = totalElapsed - splitStartTime
          const splitPace = Pace.calculate(1000, splitDuration).toSecondsPerKm()
          newSplits.push({ kilometer: splitNumber, duration: totalElapsed, pace: splitPace, elevationGain: 0 })
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
      }),
    }
  )
)
