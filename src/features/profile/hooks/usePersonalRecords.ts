'use client'
import { useQuery } from '@tanstack/react-query'

import type { Activity } from '@/domain/entities/Activity'
import { ActivityRepository } from '@/infrastructure/firebase/repositories/ActivityRepository'
import { useAuth } from '@/providers/AuthProvider'

const activityRepository = new ActivityRepository()

export const PERSONAL_RECORDS_QUERY_KEY = 'personal-records'

/** Tempo estimado para cobrir uma distância-alvo, assumindo o pace médio da atividade. */
export interface DistanceRecord { activity: Activity; seconds: number }

export interface PersonalRecords {
  longestDistance: Activity | null
  longestDuration: Activity | null
  /** Melhor pace entre atividades com pelo menos 1km (pace de trechos curtos não é representativo). */
  bestPace: Activity | null
  fastest1k: DistanceRecord | null
  fastest5k: DistanceRecord | null
  fastest10k: DistanceRecord | null
}

function estimatedTimeFor(activity: Activity, targetMeters: number): number | null {
  if (activity.distance < targetMeters || activity.duration <= 0) return null
  return Math.round((activity.duration / activity.distance) * targetMeters)
}

export function computeRecords(activities: Activity[]): PersonalRecords {
  const records: PersonalRecords = {
    longestDistance: null, longestDuration: null, bestPace: null,
    fastest1k: null, fastest5k: null, fastest10k: null,
  }
  const distanceTargets = [
    ['fastest1k', 1000],
    ['fastest5k', 5000],
    ['fastest10k', 10_000],
  ] as const
  for (const a of activities) {
    if (!records.longestDistance || a.distance > records.longestDistance.distance) records.longestDistance = a
    if (!records.longestDuration || a.duration > records.longestDuration.duration) records.longestDuration = a
    if (a.distance >= 1000 && a.pace > 0 && (!records.bestPace || a.pace < records.bestPace.pace)) records.bestPace = a
    for (const [key, target] of distanceTargets) {
      const seconds = estimatedTimeFor(a, target)
      const current = records[key]
      if (seconds !== null && (!current || seconds < current.seconds)) {
        records[key] = { activity: a, seconds }
      }
    }
  }
  return records
}

export interface RunCandidate { distanceMeters: number; durationSeconds: number; paceSecondsPerKm: number }

/**
 * Compara uma corrida recém-finalizada com os recordes ANTERIORES e devolve
 * os títulos dos recordes quebrados (vazio se nenhum, ou se não havia recorde
 * anterior para comparar — primeira corrida não gera celebração).
 */
export function getBrokenRecords(records: PersonalRecords, run: RunCandidate): string[] {
  const broken: string[] = []
  const { distanceMeters: dist, durationSeconds: dur, paceSecondsPerKm: pace } = run
  if (records.longestDistance && dist > records.longestDistance.distance) broken.push('Maior distância')
  if (records.longestDuration && dur > records.longestDuration.duration) broken.push('Corrida mais longa')
  if (records.bestPace && dist >= 1000 && pace > 0 && pace < records.bestPace.pace) broken.push('Melhor pace')
  const targets: [DistanceRecord | null, number, string][] = [
    [records.fastest1k, 1000, '1km mais rápido'],
    [records.fastest5k, 5000, '5km mais rápidos'],
    [records.fastest10k, 10_000, '10km mais rápidos'],
  ]
  for (const [record, target, label] of targets) {
    if (!record || dist < target || dur <= 0) continue
    const estimated = Math.round((dur / dist) * target)
    if (estimated < record.seconds) broken.push(label)
  }
  return broken
}

export function usePersonalRecords() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [PERSONAL_RECORDS_QUERY_KEY, user?.uid],
    queryFn: async () => {
      const result = await activityRepository.findByUser(user!.uid, undefined, 100)
      return computeRecords(result.data)
    },
    enabled: Boolean(user?.uid),
    staleTime: 1000 * 60 * 5,
  })
}
