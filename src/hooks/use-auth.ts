import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, signInAnonymouslyUser, getUserToken, signOutUser, type AuthUser } from '@/lib/firebase-config'

export interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await signInAnonymouslyUser()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      setLoading(false)
    }
  }

  const signOutHandler = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await signOutUser()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
      setError(errorMessage)
      setLoading(false)
    }
  }

  const getToken = async (): Promise<string | null> => {
    try {
      return await getUserToken()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get token'
      setError(errorMessage)
      return null
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signOut: signOutHandler,
    getToken
  }
}