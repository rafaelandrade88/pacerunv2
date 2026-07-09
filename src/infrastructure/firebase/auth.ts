import { GoogleAuthProvider, connectAuthEmulator, getAuth } from 'firebase/auth'

import { firebaseApp } from './index'

export const auth = getAuth(firebaseApp)
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
}
