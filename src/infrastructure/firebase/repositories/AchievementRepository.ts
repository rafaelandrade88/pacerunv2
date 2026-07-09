import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore'

import { FIRESTORE_COLLECTIONS } from '@/constants/app'
import type { Achievement } from '@/domain/entities/Achievement'
import { db } from '@/infrastructure/firebase/firestore'

export class AchievementRepository {
  private readonly col = FIRESTORE_COLLECTIONS.ACHIEVEMENTS

  async findByUser(userId: string): Promise<Achievement[]> {
    const q = query(
      collection(db, this.col),
      where('userId', '==', userId),
      orderBy('eventDate', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => this.toEntity(d.id, d.data()))
  }

  async create(data: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Achievement> {
    const { serverTimestamp } = await import('firebase/firestore')
    const ref = await addDoc(collection(db, this.col), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { ...data, id: ref.id, createdAt: new Date(), updatedAt: new Date() }
  }

  async update(id: string, data: Partial<Omit<Achievement, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    const { serverTimestamp } = await import('firebase/firestore')
    await updateDoc(doc(db, this.col, id), { ...data, updatedAt: serverTimestamp() })
  }

  async delete(achievementId: string): Promise<void> {
    await deleteDoc(doc(db, this.col, achievementId))
  }

  private toEntity(id: string, data: Record<string, unknown>): Achievement {
    return {
      id,
      userId: data.userId as string,
      eventName: data.eventName as string,
      eventDate: data.eventDate as string,
      location: data.location as string | undefined,
      distance: data.distance as string | undefined,
      category: data.category as string | undefined,
      overallPosition: data.overallPosition as string | undefined,
      categoryPosition: data.categoryPosition as string | undefined,
      grossTime: data.grossTime as string | undefined,
      netTime: data.netTime as string | undefined,
      thumbnailBase64: data.thumbnailBase64 as string | undefined,
      createdAt: (data.createdAt as { toDate(): Date })?.toDate?.() ?? new Date(),
      updatedAt: (data.updatedAt as { toDate(): Date })?.toDate?.() ?? new Date(),
    }
  }
}
