import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PlayerList } from "@/components/player-list";
import { useRoom } from "@/hooks/use-room";
import { useAuth } from "@/hooks/use-auth";
import type { Room, Player } from "@/types/game-types";

// Mock the hooks
vi.mock("@/hooks/use-room");
vi.mock("@/hooks/use-auth");

// Mock data
const mockUser = {
  uid: "user123",
  displayName: "TestUser",
};

const mockPlayers: Record<string, Player> = {
  user123: {
    id: "user123",
    name: "TestUser",
    isReady: true,
    joinedAt: Date.now() - 10000,
  },
  user456: {
    id: "user456",
    name: "OtherUser",
    isReady: false,
    joinedAt: Date.now() - 5000,
  },
  user789: {
    id: "user789",
    name: "ThirdUser",
    isReady: true,
    joinedAt: Date.now() - 2000,
  },
};

const mockRoom: Room = {
  id: "TEST123",
  status: "LOBBY",
  createdAt: Date.now() - 15000,
  lastActivityAt: Date.now() - 15000,
  maxPlayers: 10,
  autoDeleteAfterHours: 24,
  players: mockPlayers,
};

describe("PlayerList", () => {
  const mockUseRoom = vi.mocked(useRoom);
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loading state correctly", () => {
    mockUseRoom.mockReturnValue({
      room: null,
      loading: true,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    expect(screen.getByText("PLAYERS")).toBeInTheDocument();
    // Should show skeleton loaders
    const skeletons = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("animate-pulse"));
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state correctly", () => {
    mockUseRoom.mockReturnValue({
      room: null,
      loading: false,
      error: "Failed to load room",
    } as any);

    render(<PlayerList roomId="TEST123" />);

    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.getByText("Failed to load room")).toBeInTheDocument();
  });

  it("renders no room state correctly", () => {
    mockUseRoom.mockReturnValue({
      room: null,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    expect(screen.getByText("PLAYERS")).toBeInTheDocument();
    expect(screen.getByText("No room data available")).toBeInTheDocument();
  });

  it("renders empty player list correctly", () => {
    const emptyRoom: Room = {
      ...mockRoom,
      players: {},
    };

    mockUseRoom.mockReturnValue({
      room: emptyRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    expect(screen.getByText("PLAYERS")).toBeInTheDocument();
    expect(screen.getByText("0/10")).toBeInTheDocument();
    expect(screen.getByText("No players in room yet")).toBeInTheDocument();
    expect(screen.getByText("Be the first to join!")).toBeInTheDocument();
  });

  it("renders player list correctly in lobby", () => {
    mockUseRoom.mockReturnValue({
      room: mockRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    expect(screen.getByText("PLAYERS")).toBeInTheDocument();
    expect(screen.getByText("3/10")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();

    // Check player names
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("OtherUser")).toBeInTheDocument();
    expect(screen.getByText("ThirdUser")).toBeInTheDocument();

    // Check ready status
    expect(screen.getAllByText("READY")).toHaveLength(2);
    expect(screen.getByText("WAITING")).toBeInTheDocument();

    // Check current user indicator
    expect(screen.getByText("(You)")).toBeInTheDocument();
  });

  it("renders player list correctly in game", () => {
    const gameRoom: Room = {
      ...mockRoom,
      status: "ROLE_REVEAL",
    };

    mockUseRoom.mockReturnValue({
      room: gameRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    expect(screen.getByText("PLAYERS")).toBeInTheDocument();
    expect(screen.getByText("3/10")).toBeInTheDocument();

    // Should show IN GAME status instead of ready/waiting
    expect(screen.queryByText("READY")).not.toBeInTheDocument();
    expect(screen.queryByText("WAITING")).not.toBeInTheDocument();
    expect(screen.getAllByText("IN GAME")).toHaveLength(3);
  });

  it("highlights current user correctly", () => {
    mockUseRoom.mockReturnValue({
      room: mockRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    const testUserElement = screen.getByText("TestUser").closest("div")
      ?.parentElement?.parentElement;
    expect(testUserElement).toHaveClass(
      "bg-liberal-blue/10",
      "border-liberal-blue"
    );
    expect(screen.getByText("(You)")).toBeInTheDocument();
  });

  it("highlights admin correctly", () => {
    mockUseRoom.mockReturnValue({
      room: mockRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    // Admin badge should be visible
    expect(screen.getByText("ADMIN")).toBeInTheDocument();

    // Admin player should have special styling (but not current user styling)
    const testUserElement = screen.getByText("TestUser").closest("div")
      ?.parentElement?.parentElement;
    expect(testUserElement).toHaveClass(
      "bg-liberal-blue/10",
      "border-liberal-blue"
    );
  });

  it("shows non-admin players with correct styling", () => {
    mockUseRoom.mockReturnValue({
      room: mockRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    const otherUserElement = screen.getByText("OtherUser").closest("div")
      ?.parentElement?.parentElement;
    expect(otherUserElement).toHaveClass(
      "bg-vintage-cream",
      "border-noir-black"
    );
  });

  it("shows correct player count and start message", () => {
    mockUseRoom.mockReturnValue({
      room: mockRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    expect(screen.getByText("3/10")).toBeInTheDocument();
    expect(
      screen.getByText("Need 2 more players to start")
    ).toBeInTheDocument();
  });

  it('shows "need more players" message when less than 5 players', () => {
    const smallRoom: Room = {
      ...mockRoom,
      players: {
        user123: mockPlayers["user123"],
        user456: mockPlayers["user456"],
      },
    };

    mockUseRoom.mockReturnValue({
      room: smallRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    expect(screen.getByText("2/10")).toBeInTheDocument();
    expect(
      screen.getByText("Need 3 more players to start")
    ).toBeInTheDocument();
  });

  it("hides admin badge for non-admin users", () => {
    const nonAdminRoom: Room = {
      ...mockRoom,
      players: {
        user456: {
          id: "user456",
          name: "Non Admin User",
          avatar: "N",
          joinedAt: Date.now(),
        },
        user123: {
          id: "user123",
          name: "Admin User",
          avatar: "A",
          joinedAt: Date.now(),
        },
      },
    };

    mockUseRoom.mockReturnValue({
      room: nonAdminRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    // Current user should not see admin badge
    expect(screen.queryByText("ADMIN")).not.toBeInTheDocument();

    // But other user (admin) should have admin styling
    const otherUserElement = screen.getByText("OtherUser").closest("div")
      ?.parentElement?.parentElement;
    expect(otherUserElement).toHaveClass(
      "bg-fascist-red/10",
      "border-fascist-red"
    );
  });

  it("applies custom className correctly", () => {
    mockUseRoom.mockReturnValue({
      room: mockRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" className="custom-class" />);

    const container = screen.getByText("PLAYERS").closest("div")?.parentElement;
    expect(container).toHaveClass("custom-class");
  });

  it("renders without roomId prop", () => {
    mockUseRoom.mockReturnValue({
      room: mockRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList />);

    expect(screen.getByText("PLAYERS")).toBeInTheDocument();
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("shows player avatars with correct initials", () => {
    mockUseRoom.mockReturnValue({
      room: mockRoom,
      loading: false,
      error: null,
    } as any);

    render(<PlayerList roomId="TEST123" />);

    // Check that avatars show first letter of names
    const avatars = screen.getAllByText("T"); // TestUser and ThirdUser
    expect(avatars.length).toBeGreaterThanOrEqual(2);

    const oAvatar = screen.getByText("O"); // OtherUser
    expect(oAvatar).toBeInTheDocument();
  });

  it("handles real-time updates correctly", async () => {
    let currentRoom = mockRoom;

    mockUseRoom.mockReturnValue({
      room: currentRoom,
      loading: false,
      error: null,
    } as any);

    const { rerender } = render(<PlayerList roomId="TEST123" />);

    // Initial state
    expect(screen.getByText("3/10")).toBeInTheDocument();
    expect(screen.queryByText("NewUser")).not.toBeInTheDocument();

    // Simulate real-time update with new player
    const updatedRoom: Room = {
      ...currentRoom,
      players: {
        ...currentRoom.players,
        newuser: {
          id: "newuser",
          name: "NewUser",
          isReady: false,
          joinedAt: Date.now(),
        },
      },
    };

    currentRoom = updatedRoom;
    mockUseRoom.mockReturnValue({
      room: currentRoom,
      loading: false,
      error: null,
    } as any);

    rerender(<PlayerList roomId="TEST123" />);

    await waitFor(() => {
      expect(screen.getByText("4/10")).toBeInTheDocument();
      expect(screen.getByText("NewUser")).toBeInTheDocument();
    });
  });
});
