import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, signInAnonymouslyUser, getUserToken, signOutUser, type AuthUser } from '@/lib/firebase-config'

export interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  username: string | null
  signIn: (username?: string) => Promise<void>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
  updateUsername: (username: string) => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous
        })
        
        // Load saved username from localStorage
        const savedUsername = localStorage.getItem(`username_${firebaseUser.uid}`)
        if (savedUsername) {
          setUsername(savedUsername)
        } else {
          // Generate a default username if none exists
          const defaultUsername = `Agent${firebaseUser.uid.slice(-6)}`
          setUsername(defaultUsername)
          localStorage.setItem(`username_${firebaseUser.uid}`, defaultUsername)
        }
      } else {
        setUser(null)
        setUsername(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (inputUsername?: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const userCredential = await signInAnonymouslyUser()
      
      // Set username if provided, otherwise generate a default one
      if (inputUsername) {
        const trimmedUsername = inputUsername.trim()
        setUsername(trimmedUsername)
        localStorage.setItem(`username_${userCredential.uid}`, trimmedUsername)
      } else {
        // Generate a default username based on timestamp
        const defaultUsername = `Agent${Date.now().toString().slice(-6)}`
        setUsername(defaultUsername)
        localStorage.setItem(`username_${userCredential.uid}`, defaultUsername)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      setLoading(false)
    }
  }

  const updateUsername = async (newUsername: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to update username')
    }
    
    try {
      setUsername(newUsername.trim())
      // In a real implementation, you might save this to Firebase or localStorage
      localStorage.setItem(`username_${user.uid}`, newUsername.trim())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update username'
      setError(errorMessage)
    }
  }

  const signOutHandler = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear all username keys from localStorage for complete cleanup
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith('username_')) {
          localStorage.removeItem(key)
        }
      }
      
      await signOutUser()
      setUsername(null) // Clear username on sign out
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
    username,
    signIn,
    signOut: signOutHandler,
    getToken,
    updateUsername
  }
}