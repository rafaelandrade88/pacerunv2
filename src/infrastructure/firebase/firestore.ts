import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

import { firebaseApp } from './index'

export const db = getFirestore(firebaseApp)

if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
}
