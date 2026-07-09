import { doc, getDoc, query, collection, where, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

import { FIRESTORE_COLLECTIONS } from '@/constants/app'
import type { UserProfile } from '@/domain/entities/User'
import type { IUserRepository } from '@/domain/repositories/IUserRepository'
import { db } from '@/infrastructure/firebase/firestore'

export class UserRepository implements IUserRepository {
  private readonly collection = FIRESTORE_COLLECTIONS.USERS

  async findById(uid: string): Promise<UserProfile | null> {
    const ref = doc(db, this.collection, uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return this.toEntity(snap.id, snap.data())
  }

  async findByUsername(username: string): Promise<UserProfile | null> {
    // As regras do Firestore só permitem listar perfis com isPublic == true;
    // sem esse filtro a query inteira é rejeitada com "insufficient permissions".
    const q = query(
      collection(db, this.collection),
      where('username', '==', username),
      where('isPublic', '==', true)
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    const first = snap.docs[0]
    return this.toEntity(first.id, first.data())
  }

  async create(user: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const ref = doc(db, this.collection, user.uid)
    await setDoc(ref, { ...user, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    return { ...user, createdAt: new Date(), updatedAt: new Date() }
  }

  async update(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const ref = doc(db, this.collection, uid)
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
    const updated = await this.findById(uid)
    if (!updated) throw new Error(`Usuário ${uid} não encontrado após update`)
    return updated
  }

  private toEntity(id: string, data: Record<string, unknown>): UserProfile {
    return {
      uid: id,
      email: (data.email as string | null) ?? null,
      displayName: (data.displayName as string | null) ?? null,
      photoURL: (data.photoURL as string | null) ?? null,
      username: data.username as string,
      bio: data.bio as string | undefined,
      totalActivities: (data.totalActivities as number) ?? 0,
      totalDistance: (data.totalDistance as number) ?? 0,
      totalDuration: (data.totalDuration as number) ?? 0,
      following: (data.following as number) ?? 0,
      followers: (data.followers as number) ?? 0,
      isPublic: (data.isPublic as boolean) ?? true,
      createdAt: (data.createdAt as { toDate(): Date })?.toDate?.() ?? new Date(),
      updatedAt: (data.updatedAt as { toDate(): Date })?.toDate?.() ?? new Date(),
    }
  }
}
