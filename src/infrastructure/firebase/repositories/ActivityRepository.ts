import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, startAfter, updateDoc, where } from 'firebase/firestore'

import { FIRESTORE_COLLECTIONS, PAGINATION } from '@/constants/app'
import type { Activity, ActivityStatus, ActivityType } from '@/domain/entities/Activity'
import type { ActivityFilters, IActivityRepository, PaginatedResult } from '@/domain/repositories/IActivityRepository'
import { db } from '@/infrastructure/firebase/firestore'

export class ActivityRepository implements IActivityRepository {
  private readonly collection = FIRESTORE_COLLECTIONS.ACTIVITIES

  async findById(userId: string, activityId: string): Promise<Activity | null> {
    const ref = doc(db, this.collection, activityId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const data = snap.data()
    if (data.userId !== userId) return null
    return this.toEntity(snap.id, data)
  }

  async findByUser(userId: string, filters?: ActivityFilters, pageLimit: number = PAGINATION.ACTIVITIES_PER_PAGE, cursor?: string): Promise<PaginatedResult<Activity>> {
    const constraints: Parameters<typeof query>[1][] = [
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('startedAt', 'desc'),
    ]
    if (filters?.type) constraints.splice(1, 0, where('type', '==', filters.type))
    if (filters?.fromDate) constraints.push(where('startedAt', '>=', filters.fromDate))
    if (filters?.toDate) constraints.push(where('startedAt', '<=', filters.toDate))
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, this.collection, cursor))
      if (cursorDoc.exists()) constraints.push(startAfter(cursorDoc))
    }
    constraints.push(limit(pageLimit + 1))
    const q = query(collection(db, this.collection), ...constraints)
    const snap = await getDocs(q)
    const docs = snap.docs
    const hasMore = docs.length > pageLimit
    const data = docs.slice(0, pageLimit).map((d) => this.toEntity(d.id, d.data()))
    return { data, hasMore, lastCursor: hasMore ? docs[pageLimit - 1].id : undefined }
  }

  async findByUserInRange(userId: string, fromDate: Date, toDate: Date): Promise<Activity[]> {
    const q = query(
      collection(db, this.collection),
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      where('startedAt', '>=', fromDate),
      where('startedAt', '<=', toDate),
      orderBy('startedAt', 'asc')
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => this.toEntity(d.id, d.data()))
  }

  async create(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
    const ref = await addDoc(collection(db, this.collection), { ...activity, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    return { ...activity, id: ref.id, createdAt: new Date(), updatedAt: new Date() }
  }

  async update(activityId: string, data: Partial<Activity>): Promise<Activity> {
    const ref = doc(db, this.collection, activityId)
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
    const updated = await getDoc(ref)
    if (!updated.exists()) throw new Error(`Atividade ${activityId} não encontrada`)
    return this.toEntity(updated.id, updated.data())
  }

  async delete(activityId: string): Promise<void> {
    await deleteDoc(doc(db, this.collection, activityId))
  }

  private toEntity(id: string, data: Record<string, unknown>): Activity {
    return {
      id,
      userId: data.userId as string,
      type: data.type as ActivityType,
      status: data.status as ActivityStatus,
      title: data.title as string,
      startedAt: (data.startedAt as { toDate(): Date })?.toDate?.() ?? new Date(),
      finishedAt: (data.finishedAt as { toDate(): Date } | undefined)?.toDate?.(),
      duration: (data.duration as number) ?? 0,
      distance: (data.distance as number) ?? 0,
      pace: (data.pace as number) ?? 0,
      calories: data.calories as number | undefined,
      elevationGain: data.elevationGain as number | undefined,
      elevationLoss: data.elevationLoss as number | undefined,
      averageHeartRate: data.averageHeartRate as number | undefined,
      maxHeartRate: data.maxHeartRate as number | undefined,
      route: (data.route as Activity['route']) ?? [],
      splits: (data.splits as Activity['splits']) ?? [],
      mapSnapshot: data.mapSnapshot as string | undefined,
      notes: data.notes as string | undefined,
      isPublic: (data.isPublic as boolean) ?? true,
      createdAt: (data.createdAt as { toDate(): Date })?.toDate?.() ?? new Date(),
      updatedAt: (data.updatedAt as { toDate(): Date })?.toDate?.() ?? new Date(),
    }
  }
}
