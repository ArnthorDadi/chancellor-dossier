import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthForm } from '@/components/auth-form'

// Mock the useAuth hook
const mockSignIn = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn()
}))

import { useAuth } from '@/hooks/use-auth'

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      getToken: vi.fn()
    })
  })

  it('should render the authentication form', () => {
    render(<AuthForm />)
    
    expect(screen.getByText('SECRET DOSSIER ACCESS')).toBeInTheDocument()
    expect(screen.getByLabelText(/ENTER YOUR NAME:/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ACCESS FILES' })).toBeInTheDocument()
  })

  it('should show loading state', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      getToken: vi.fn()
    })

    render(<AuthForm />)
    
    expect(screen.getByText('Authenticating...')).toBeInTheDocument()
    // Button is not present during loading state
    expect(screen.queryByRole('button', { name: 'ACCESS FILES' })).not.toBeInTheDocument()
  })

  it('should show user information when authenticated', () => {
    const mockUser = {
      uid: 'test-user-123',
      isAnonymous: true
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      getToken: vi.fn()
    })

    render(<AuthForm />)
    
    expect(screen.getByText('AUTHENTICATION SUCCESSFUL')).toBeInTheDocument()
    expect(screen.getByText('test-user-123')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
  })

  it('should handle form submission', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)
    
    const input = screen.getByLabelText(/ENTER YOUR NAME:/i)
    const button = screen.getByRole('button', { name: 'ACCESS FILES' })

    // Initially disabled
    expect(button).toBeDisabled()

    // Type in username
    await user.type(input, 'Test User')
    
    // Now enabled
    expect(button).toBeEnabled()

    // Submit form
    await user.click(button)

    expect(mockSignIn).toHaveBeenCalledTimes(1)
  })

  it('should display error message when provided', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: 'Authentication failed',
      signIn: mockSignIn,
      signOut: mockSignOut,
      getToken: vi.fn()
    })

    render(<AuthForm />)
    
    expect(screen.getByText(/ERROR: Authentication failed/i)).toBeInTheDocument()
  })

  it('should handle sign out', async () => {
    const mockUser = {
      uid: 'test-user-123',
      isAnonymous: true
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      getToken: vi.fn()
    })

    const user = userEvent.setup()
    render(<AuthForm />)
    
    const signOutButton = screen.getByRole('button', { name: 'Sign Out' })
    await user.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})