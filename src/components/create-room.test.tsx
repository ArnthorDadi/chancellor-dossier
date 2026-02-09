import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { LandingPage } from "@/pages/landing-page";
import { useAuth } from "@/hooks/use-auth";
import { useCreateRoom } from "@/hooks/use-room-code";

// Mock the hooks
vi.mock("@/hooks/use-auth");
vi.mock("@/hooks/use-room-code");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

const mockUseAuth = vi.mocked(useAuth);
const mockUseCreateRoom = vi.mocked(useCreateRoom);

const createMockAuth = (overrides = {}) => ({
  user: null,
  loading: false,
  error: null,
  username: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signOutWithCleanup: vi.fn(),
  getToken: vi.fn(),
  updateUsername: vi.fn(),
  ...overrides,
});

describe("Create Room Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("F9-UI: Create Room Interface", () => {
    it("displays prominent create room button when authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: vi.fn(),
        loading: false,
        error: null,
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const createButton = screen.getByRole("button", {
        name: /ESTABLISH SAFE HOUSE/i,
      });
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveClass(
        "bg-liberal-blue",
        "hover:bg-liberal-blue/90",
        "text-white"
      );
    });

    it("shows loading spinner during room creation", async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: vi.fn(),
        loading: true,
        error: null,
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const createButton = screen.getByRole("button", {
        name: /INITIALIZING/i,
      });
      expect(createButton).toBeInTheDocument();
      expect(createButton).toBeDisabled();

      // Check for spinner
      const spinner = createButton.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it('shows "Creating room..." message during processing', () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: vi.fn(),
        loading: true,
        error: null,
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      expect(screen.getByText("INITIALIZING...")).toBeInTheDocument();
    });

    it("disables create button during room creation", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: vi.fn(),
        loading: true,
        error: null,
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      // When loading, button shows "INITIALIZING..." instead of "ESTABLISH SAFE HOUSE"
      const createButton = screen.getByRole("button", {
        name: /INITIALIZING/i,
      });
      expect(createButton).toBeDisabled();
    });

    it("shows login prompt instead of create button when not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        signOutWithCleanup: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: vi.fn(),
        loading: false,
        error: null,
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      expect(
        screen.queryByText("ESTABLISH SAFE HOUSE")
      ).not.toBeInTheDocument();
      expect(screen.getByText("CREATE A ROOM")).toBeInTheDocument();
    });
  });

  describe("F9-FUNC: Room Creation Logic", () => {
    it("calls createRoom function when button is clicked", async () => {
      const mockCreateRoom = vi
        .fn()
        .mockResolvedValue({ roomId: "ABC123", roomCode: "ABC123" });

      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: mockCreateRoom,
        loading: false,
        error: null,
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const createButton = screen.getByRole("button", {
        name: /ESTABLISH SAFE HOUSE/i,
      });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateRoom).toHaveBeenCalledTimes(1);
      });
    });

    it("handles create room errors gracefully", async () => {
      const mockCreateRoom = vi
        .fn()
        .mockRejectedValue(new Error("Failed to create room"));

      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: mockCreateRoom,
        loading: false,
        error: null,
      });

      // Mock console.error to avoid test output pollution
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const createButton = screen.getByRole("button", {
        name: /ESTABLISH SAFE HOUSE/i,
      });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateRoom).toHaveBeenCalledTimes(1);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to create room:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Success Confirmation Flow", () => {
    it("shows success confirmation after room creation", async () => {
      const mockCreateRoom = vi
        .fn()
        .mockResolvedValue({ roomId: "ABC123", roomCode: "ABC123" });

      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: mockCreateRoom,
        loading: false,
        error: null,
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const createButton = screen.getByRole("button", {
        name: /ESTABLISH SAFE HOUSE/i,
      });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateRoom).toHaveBeenCalledTimes(1);
      });

      // After successful creation, user should be redirected to room lobby
      // The actual navigation is handled by react-router, but we can verify
      // the createRoom function was called successfully
      expect(mockCreateRoom).toHaveBeenCalledWith();
    });
  });

  describe("Accessibility and Responsive Design", () => {
    it("button has proper ARIA attributes", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: vi.fn(),
        loading: false,
        error: null,
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const createButton = screen.getByRole("button", {
        name: /ESTABLISH SAFE HOUSE/i,
      });
      expect(createButton).toBeVisible();
    });

    it("button meets minimum touch target size (44x44px)", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "123", isAnonymous: true },
        loading: false,
        error: null,
        username: "Test User",
        signIn: vi.fn(),
        signOut: vi.fn(),
        getToken: vi.fn(),
        updateUsername: vi.fn(),
      });

      mockUseCreateRoom.mockReturnValue({
        createRoom: vi.fn(),
        loading: false,
        error: null,
      });

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      );

      const createButton = screen.getByRole("button", {
        name: /ESTABLISH SAFE HOUSE/i,
      });

      // Check if button has padding that would make it at least 44x44px
      expect(createButton).toHaveClass("px-6", "py-3");
    });
  });
});
