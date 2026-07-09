import type { UserProfile } from '@/domain/entities/User'

export interface IUserRepository {
  findById(uid: string): Promise<UserProfile | null>
  findByUsername(username: string): Promise<UserProfile | null>
  create(user: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile>
  update(uid: string, data: Partial<UserProfile>): Promise<UserProfile>
}
