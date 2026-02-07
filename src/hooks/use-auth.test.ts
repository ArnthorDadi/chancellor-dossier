import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock Firebase at the top level before imports
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn()
}))

vi.mock('@/lib/firebase-config', () => ({
  auth: {
    currentUser: null
  },
  signInAnonymouslyUser: vi.fn(),
  getUserToken: vi.fn(),
  signOutUser: vi.fn()
}))

import { useAuth } from '@/hooks/use-auth'
import { onAuthStateChanged } from 'firebase/auth'
import { signInAnonymouslyUser, getUserToken, signOutUser } from '@/lib/firebase-config'

describe('useAuth', () => {
  const mockUser = {
    uid: 'test-user-123',
    isAnonymous: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with loading state', () => {
    vi.mocked(onAuthStateChanged).mockImplementation(() => vi.fn())

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should set user when authenticated', () => {
    let authCallback: ((user: { uid: string; isAnonymous: boolean }) => void) | null = null
    
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      authCallback = callback as (user: { uid: string; isAnonymous: boolean }) => void
      return vi.fn()
    })

    const { result } = renderHook(() => useAuth())

    // Simulate Firebase auth state change
    act(() => {
      authCallback!({
        uid: 'test-user-123',
        isAnonymous: true
      })
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.loading).toBe(false)
  })

  it('should handle sign in successfully', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation(() => vi.fn())
    vi.mocked(signInAnonymouslyUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signIn()
    })

    expect(signInAnonymouslyUser).toHaveBeenCalledTimes(1)
  })

  it('should handle sign in error', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation(() => vi.fn())
    vi.mocked(signInAnonymouslyUser).mockRejectedValue(new Error('Auth failed'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signIn()
    })

    expect(result.current.error).toBe('Auth failed')
    expect(result.current.loading).toBe(false)
  })

  it('should handle sign out successfully', async () => {
    let authCallback: ((user: { uid: string; isAnonymous: boolean }) => void) | null = null
    
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      authCallback = callback as (user: { uid: string; isAnonymous: boolean }) => void
      return vi.fn()
    })
    vi.mocked(signOutUser).mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())

    // First set user as authenticated
    act(() => {
      authCallback!({
        uid: 'test-user-123',
        isAnonymous: true
      })
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(signOutUser).toHaveBeenCalledTimes(1)
  })

  it('should get user token', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation(() => vi.fn())
    vi.mocked(getUserToken).mockResolvedValue('test-token')

    const { result } = renderHook(() => useAuth())

    const token = await act(async () => {
      return await result.current.getToken()
    })

    expect(getUserToken).toHaveBeenCalledTimes(1)
    expect(token).toBe('test-token')
  })
})