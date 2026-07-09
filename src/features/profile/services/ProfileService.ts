import { updateProfile as updateFirebaseProfile } from 'firebase/auth'

import type { UserProfile } from '@/domain/entities/User'
import type { ProfileEditFormData } from '@/features/profile/schemas/profileSchemas'
import { auth } from '@/infrastructure/firebase/auth'
import { UserRepository } from '@/infrastructure/firebase/repositories/UserRepository'

const userRepository = new UserRepository()

export type UploadProgressCallback = (progress: number) => void

// Compresses to 128×128 JPEG and returns a base64 data URI stored in Firestore.
// Firebase Storage is not available on the free Spark plan.
async function compressToDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 128
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      const ar = img.width / img.height
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (ar > 1) { sx = (img.width - img.height) / 2; sw = img.height }
      else { sy = (img.height - img.width) / 2; sh = img.width }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Falha ao carregar imagem')) }
    img.src = url
  })
}

export const ProfileService = {
  async updateProfile(uid: string, data: ProfileEditFormData): Promise<UserProfile> {
    const existing = await userRepository.findByUsername(data.username)
    if (existing && existing.uid !== uid) throw new Error('Este nome de usuário já está em uso.')
    const currentUser = auth.currentUser
    if (currentUser) await updateFirebaseProfile(currentUser, { displayName: data.displayName })
    return userRepository.update(uid, {
      displayName: data.displayName,
      username: data.username,
      bio: data.bio,
      isPublic: data.isPublic,
    })
  },

  async updateAvatar(uid: string, file: File, onProgress?: UploadProgressCallback): Promise<UserProfile> {
    const photoURL = await compressToDataURI(file)
    onProgress?.(100)
    return userRepository.update(uid, { photoURL })
  },

  async deleteAvatar(uid: string): Promise<UserProfile> {
    const currentUser = auth.currentUser
    if (currentUser) await updateFirebaseProfile(currentUser, { photoURL: null })
    return userRepository.update(uid, { photoURL: null })
  },
}
