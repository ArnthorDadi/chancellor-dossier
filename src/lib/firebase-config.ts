import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, signOut, type User } from 'firebase/auth'

// Firebase configuration - replace with actual config in production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "missing apiKey",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "missing authDomain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "missing projectId",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "missing storageBucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "missing messagingSenderId",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "missing appId"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export interface AuthUser {
  uid: string
  isAnonymous: boolean
}

export const signInAnonymouslyUser = async (): Promise<AuthUser> => {
  try {
    const userCredential = await signInAnonymously(auth)
    const user = userCredential.user

    return {
      uid: user.uid,
      isAnonymous: user.isAnonymous
    }
  } catch (error) {
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const getCurrentUser = (): AuthUser | null => {
  const user = auth.currentUser
  if (!user) return null

  return {
    uid: user.uid,
    isAnonymous: user.isAnonymous
  }
}

export const getUserToken = async (): Promise<string | null> => {
  const user = auth.currentUser
  if (!user) return null

  try {
    return await user.getIdToken()
  } catch (error) {
    console.error('Failed to get user token:', error)
    return null
  }
}

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export type { User }
