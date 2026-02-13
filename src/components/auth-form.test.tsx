import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/components/auth-form";

// Mock the useAuth hook
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/use-auth";

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      username: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      signOutWithCleanup: mockSignOut,
      getToken: vi.fn(),
      updateUsername: vi.fn(),
    });
  });

  it("should render the authentication form", () => {
    render(<AuthForm />);

    expect(screen.getByText("SECRET DOSSIER ACCESS")).toBeInTheDocument();
    expect(screen.getByLabelText("ENTER YOUR NAME:")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ACCESS FILES" })
    ).toBeInTheDocument();
  });

  it("should show loading state during authentication", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      error: null,
      username: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      signOutWithCleanup: mockSignOut,
      getToken: vi.fn(),
      updateUsername: vi.fn(),
    });

    render(<AuthForm />);

    expect(screen.getByText("Authenticating...")).toBeInTheDocument();
  });

  it("should show success state when user is authenticated", () => {
    const mockUser = {
      uid: "test-user-123",
      isAnonymous: true,
    };

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      username: "TestAgent",
      signIn: mockSignIn,
      signOut: mockSignOut,
      signOutWithCleanup: mockSignOut,
      getToken: vi.fn(),
      updateUsername: vi.fn(),
    });

    render(<AuthForm />);

    expect(screen.getByText("AUTHENTICATION SUCCESSFUL")).toBeInTheDocument();
    expect(screen.getByText("User ID:")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign Out" })
    ).toBeInTheDocument();
  });

  it("should display error message when provided", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: "Authentication failed",
      username: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      signOutWithCleanup: mockSignOut,
      getToken: vi.fn(),
      updateUsername: vi.fn(),
    });

    render(<AuthForm />);

    expect(
      screen.getByText(/ERROR: Authentication failed/i)
    ).toBeInTheDocument();
  });

  it("should handle sign out", async () => {
    const mockUser = {
      uid: "test-user-123",
      isAnonymous: true,
    };

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      username: "TestAgent",
      signIn: mockSignIn,
      signOut: mockSignOut,
      signOutWithCleanup: mockSignOut,
      getToken: vi.fn(),
      updateUsername: vi.fn(),
    });

    const user = userEvent.setup();
    render(<AuthForm />);

    const signOutButton = screen.getByRole("button", { name: "Sign Out" });
    await user.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("should call signIn with username when form is submitted", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);

    const usernameInput = screen.getByLabelText("ENTER YOUR NAME:");
    const submitButton = screen.getByRole("button", { name: "ACCESS FILES" });

    await user.type(usernameInput, "TestUser");
    await user.click(submitButton);

    expect(mockSignIn).toHaveBeenCalledWith("TestUser");
  });

  it("should not call signIn if username is empty", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);

    const submitButton = screen.getByRole("button", { name: "ACCESS FILES" });

    await user.click(submitButton);

    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
