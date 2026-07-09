'use client'
import { type User, onAuthStateChanged } from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'

import { auth } from '@/infrastructure/firebase/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

const SESSION_COOKIE = '__session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14

// O middleware decide autenticado/não-autenticado pela presença deste cookie;
// o Firebase SDK guarda a sessão real no IndexedDB, então espelhamos aqui.
function syncSessionCookie(user: User | null) {
  if (user) {
    document.cookie = `${SESSION_COOKIE}=${user.uid}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`
  } else {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      syncSessionCookie(firebaseUser)
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
