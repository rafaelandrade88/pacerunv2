import { type User as FirebaseUser, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth'

import { auth, googleProvider } from '@/infrastructure/firebase/auth'
import { UserRepository } from '@/infrastructure/firebase/repositories/UserRepository'

export type AuthErrorCode = 'auth/user-not-found' | 'auth/wrong-password' | 'auth/email-already-in-use' | 'auth/invalid-credential' | 'auth/too-many-requests' | 'auth/network-request-failed' | 'auth/popup-closed-by-user' | 'auth/unknown'

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

const FIREBASE_ERROR_MAP: Record<string, AuthErrorCode> = {
  'auth/user-not-found': 'auth/user-not-found',
  'auth/wrong-password': 'auth/wrong-password',
  'auth/invalid-credential': 'auth/invalid-credential',
  'auth/email-already-in-use': 'auth/email-already-in-use',
  'auth/too-many-requests': 'auth/too-many-requests',
  'auth/network-request-failed': 'auth/network-request-failed',
  'auth/popup-closed-by-user': 'auth/popup-closed-by-user',
}

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  'auth/popup-closed-by-user': 'Login cancelado.',
  'auth/unknown': 'Erro inesperado. Tente novamente.',
}

function mapFirebaseError(error: unknown): AuthError {
  const code = (error as { code?: string })?.code ?? ''
  const mappedCode: AuthErrorCode = FIREBASE_ERROR_MAP[code] ?? 'auth/unknown'
  return new AuthError(mappedCode, AUTH_ERROR_MESSAGES[mappedCode])
}

const userRepository = new UserRepository()

function generateUsername(base: string): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)
  const suffix = Math.floor(Math.random() * 9000) + 1000
  return `${clean}${suffix}`
}

async function ensureUserProfile(firebaseUser: FirebaseUser): Promise<void> {
  const existing = await userRepository.findById(firebaseUser.uid)
  if (existing) return
  await userRepository.create({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    username: generateUsername(firebaseUser.displayName ?? firebaseUser.email ?? 'runner'),
    totalActivities: 0,
    totalDistance: 0,
    totalDuration: 0,
    following: 0,
    followers: 0,
    isPublic: true,
  })
}

export const AuthService = {
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await ensureUserProfile(result.user)
      return result.user
    } catch (error) { throw mapFirebaseError(error) }
  },
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await ensureUserProfile(result.user)
      return result.user
    } catch (error) { throw mapFirebaseError(error) }
  },
  async register(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
      await ensureUserProfile({ ...result.user, displayName })
      return result.user
    } catch (error) { throw mapFirebaseError(error) }
  },
  async sendPasswordReset(email: string): Promise<void> {
    try { await sendPasswordResetEmail(auth, email) } catch (error) { throw mapFirebaseError(error) }
  },
  async signOut(): Promise<void> {
    try { await signOut(auth) } catch (error) { throw mapFirebaseError(error) }
  },
}
