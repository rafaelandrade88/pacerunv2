import { doc, writeBatch, increment, serverTimestamp, collection } from 'firebase/firestore'

import { FIRESTORE_COLLECTIONS } from '@/constants/app'
import type { Activity } from '@/domain/entities/Activity'
import type { RunState } from '@/features/run/store/runStore'
import { generateActivityTitle } from '@/features/run/utils/geoUtils'
import { db } from '@/infrastructure/firebase/firestore'

export interface SaveActivityInput { userId: string; runState: RunState; title?: string; notes?: string }
export interface SaveActivityResult { activityId: string; activity: Activity }

export const ActivitySaveService = {
  async saveActivity(input: SaveActivityInput): Promise<SaveActivityResult> {
    const { userId, runState, title, notes } = input
    const activityRef = doc(collection(db, FIRESTORE_COLLECTIONS.ACTIVITIES))
    const activityId = activityRef.id
    const activityTitle = title?.trim() || generateActivityTitle(runState.activityType)
    const now = new Date()
    // runState vem do zustand persist: após reload, startedAt é string JSON,
    // e o Firestore gravaria string em vez de Timestamp (quebrando queries por data).
    const startedAt = runState.startedAt ? new Date(runState.startedAt) : now

    const activityData = {
      userId, type: runState.activityType, status: 'completed' as const,
      title: activityTitle, startedAt, finishedAt: now,
      duration: runState.durationSeconds, distance: runState.distanceMeters,
      pace: runState.averagePaceSecondsPerKm, route: runState.route, splits: runState.splits,
      isPublic: true, ...(notes?.trim() ? { notes: notes.trim() } : {}),
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    }

    const batch = writeBatch(db)
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId)
    batch.set(activityRef, activityData)
    batch.update(userRef, {
      totalActivities: increment(1),
      totalDistance: increment(runState.distanceMeters),
      totalDuration: increment(runState.durationSeconds),
      updatedAt: serverTimestamp(),
    })
    await batch.commit()

    const activity: Activity = { id: activityId, ...activityData, startedAt, finishedAt: now, createdAt: now, updatedAt: now }
    return { activityId, activity }
  },
}
