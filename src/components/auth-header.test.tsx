import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthHeader } from '@/components/auth-header'

// Mock the useAuth hook
const mockUseAuth = vi.fn()
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth()
}))

describe('AuthHeader', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      username: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn(),
      updateUsername: vi.fn()
    })
  })

  it('renders login button when user is not authenticated', () => {
    render(
      <MemoryRouter>
        <AuthHeader />
      </MemoryRouter>
    )
    
    expect(screen.getByText('LOGIN')).toBeInTheDocument()
    expect(screen.getByText('AUTHENTICATION REQUIRED')).toBeInTheDocument()
  })

  it('renders logout button when user is authenticated', () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { uid: 'test123456789', isAnonymous: true },
      loading: false,
      username: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn(),
      updateUsername: vi.fn()
    })

    render(
      <MemoryRouter>
        <AuthHeader />
      </MemoryRouter>
    )
    
    expect(screen.getByText('LOGOUT')).toBeInTheDocument()
    expect(screen.getAllByText('Agent 456789')).toHaveLength(2) // Desktop and mobile versions
  })

  it('shows loading state during authentication', () => {
    // Mock loading state
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      username: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn(),
      updateUsername: vi.fn()
    })

    render(
      <MemoryRouter>
        <AuthHeader />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})