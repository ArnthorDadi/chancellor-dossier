import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, afterEach } from 'vitest'
import App from './app'

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks()
  })

  it('should render the app title', () => {
    render(<App />)
    const titleElement = screen.getByText(/Chancellor Dossier/i)
    expect(titleElement).toBeInTheDocument()
  })

  it('should render success message', () => {
    render(<App />)
    const messageElement = screen.getByText(/Tailwind CSS and shadcn\/ui are successfully installed!/i)
    expect(messageElement).toBeInTheDocument()
  })


  it('should render the sign-in form when no username is present', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In as Guest/i })).toBeInTheDocument()
    // Ensure the original three buttons are still rendered along with the new ones
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('should render welcome message and sign out button when username is present', () => {
    // Mock localStorage to simulate a signed-in user
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('TestUser')
    render(<App />)
    // Use a custom matcher to handle text split across elements
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Welcome, TestUser!'
    })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument()
    // Ensure the original three buttons are still rendered
    expect(screen.getAllByRole('button')).toHaveLength(4)
    // Ensure sign-in form is not present
    expect(screen.queryByPlaceholderText('Enter your username')).not.toBeInTheDocument()
  })

  it('should sign in a guest user and persist the session', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    render(<App />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const signInButton = screen.getByRole('button', { name: /Sign In as Guest/i });

    await userEvent.type(usernameInput, 'NewGuest');
    await userEvent.click(signInButton);

    // Use custom matcher for split text
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Welcome, NewGuest!'
    })).toBeInTheDocument();
    expect(setItemSpy).toHaveBeenCalledWith('secret-hitler-username', 'NewGuest');
  });

  it('should sign out a user and clear the session', async () => {
    // Start with a signed-in user
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('ExistingUser');
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    render(<App />);

    // Use custom matcher for split text
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Welcome, ExistingUser!'
    })).toBeInTheDocument();
    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });

    await userEvent.click(signOutButton);

    expect(removeItemSpy).toHaveBeenCalledWith('secret-hitler-username');
    expect(screen.queryByText((content, element) => {
      return element?.textContent === 'Welcome, ExistingUser!'
    })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
  });

  // Original test for three buttons, adjusted for the new 'Sign In' button
  it('should render four buttons in total when not signed in', () => {
    render(<App />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4) // Original 3 + "Sign In as Guest"
  })

  it('should render buttons with correct text (original buttons)', () => {
    render(<App />)
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })
})
