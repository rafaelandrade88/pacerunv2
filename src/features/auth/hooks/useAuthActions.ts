'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AuthService, type AuthError } from '@/features/auth/services/AuthService'

interface AuthActionState { loading: boolean; error: string | null }

export function useAuthActions() {
  const router = useRouter()
  const [state, setState] = useState<AuthActionState>({ loading: false, error: null })

  const setLoading = () => setState({ loading: true, error: null })
  const setError = (error: AuthError) => setState({ loading: false, error: error.message })
  const setSuccess = () => setState({ loading: false, error: null })

  async function signInWithGoogle() {
    setLoading()
    try { await AuthService.signInWithGoogle(); setSuccess(); router.push('/dashboard') }
    catch (err) { setError(err as AuthError) }
  }
  async function signInWithEmail(email: string, password: string) {
    setLoading()
    try { await AuthService.signInWithEmail(email, password); setSuccess(); router.push('/dashboard') }
    catch (err) { setError(err as AuthError) }
  }
  async function register(email: string, password: string, displayName: string) {
    setLoading()
    try { await AuthService.register(email, password, displayName); setSuccess(); router.push('/dashboard') }
    catch (err) { setError(err as AuthError) }
  }
  async function signOut() {
    setLoading()
    try {
      await AuthService.signOut()
      // Clear the session cookie synchronously so the middleware doesn't
      // see it and redirect /login back to /dashboard before onAuthStateChanged fires.
      document.cookie = '__session=; path=/; max-age=0; SameSite=Lax'
      setSuccess()
      router.push('/login')
    }
    catch (err) { setError(err as AuthError) }
  }

  return { ...state, signInWithGoogle, signInWithEmail, register, signOut }
}
