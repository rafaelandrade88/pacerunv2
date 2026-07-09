import { connectStorageEmulator, getStorage } from 'firebase/storage'

import { firebaseApp } from './index'

export const storage = getStorage(firebaseApp)

if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectStorageEmulator(storage, 'localhost', 9199)
}
