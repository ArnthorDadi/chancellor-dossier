import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminControlPanel } from "@/components/admin-control-panel";
import type { Room } from "@/types/game-types";

const mockRemovePlayerFromRoom = vi.fn();
const mockTransferAdmin = vi.fn();
const mockStartGame = vi.fn();
const mockSetStartingPlayer = vi.fn();

vi.mock("@/hooks/use-room", () => ({
  useRoom: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

import { useRoom } from "@/hooks/use-room";
import { useAuth } from "@/hooks/use-auth";

const createMockRoom = (overrides: Partial<Room> = {}): Room => ({
  id: "room123",
  status: "LOBBY",
  createdAt: Date.now(),
  startedAt: undefined,
  endedAt: undefined,
  currentChancellorId: undefined,
  maxPlayers: 10,
  autoDeleteAfterHours: 24,
  ...overrides,
  players: {
    "admin-user-id": {
      id: "admin-user-id",
      name: "Admin User",
      avatar: "A",
      isReady: false,
      joinedAt: Date.now(),
    },
    "player-2": {
      id: "player-2",
      name: "Player Two",
      avatar: "P",
      isReady: false,
      joinedAt: Date.now(),
    },
    "player-3": {
      id: "player-3",
      name: "Player Three",
      avatar: "P",
      isReady: false,
      joinedAt: Date.now(),
    },
    "player-4": {
      id: "player-4",
      name: "Player Four",
      avatar: "P",
      isReady: false,
      joinedAt: Date.now(),
    },
    "player-5": {
      id: "player-5",
      name: "Player Five",
      avatar: "P",
      isReady: false,
      joinedAt: Date.now(),
    },
  },
  roles: {},
  investigations: {},
  ...overrides,
});

describe("AdminControlPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: "admin-user-id" },
    } as ReturnType<typeof useAuth>);
    vi.mocked(useRoom).mockReturnValue({
      removePlayerFromRoom: mockRemovePlayerFromRoom,
      transferAdmin: mockTransferAdmin,
      startGame: mockStartGame,
      setStartingPlayer: mockSetStartingPlayer,
      room: null,
      loading: false,
      error: null,
      isPlayerInRoom: false,
      createNewRoom: vi.fn(),
      joinRoom: vi.fn(),
      leaveRoom: vi.fn(),
      resetGame: vi.fn(),
      setPlayerReady: vi.fn(),
      updatePlayerName: vi.fn(),
      investigatePlayer: vi.fn(),
      cleanup: vi.fn(),
    } as unknown as ReturnType<typeof useRoom>);
  });

  describe("when user is admin", () => {
    it("should render admin control panel", () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      expect(screen.getByText("ADMIN CONTROL PANEL")).toBeInTheDocument();
    });

    it("should display player count", () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      expect(screen.getByText(/Players:/)).toBeInTheDocument();
      expect(screen.getByText("5/10")).toBeInTheDocument();
    });

    it("should display game status", () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
      expect(screen.getByText("LOBBY")).toBeInTheDocument();
    });

    it("should show Start Game button when 5+ players", () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      expect(
        screen.getByRole("button", { name: "START GAME" })
      ).toBeInTheDocument();
    });

    it("should show insufficient players message when less than 5 players", () => {
      const room = createMockRoom({
        players: {
          "admin-user-id": {
            id: "admin-user-id",
            name: "Admin User",
            avatar: "A",
            isReady: false,
            joinedAt: Date.now(),
          },
          "player-2": {
            id: "player-2",
            name: "Player Two",
            avatar: "P",
            isReady: false,
            joinedAt: Date.now(),
          },
        },
      });
      render(<AdminControlPanel room={room} />);
      expect(screen.getByText("INSUFFICIENT PLAYERS")).toBeInTheDocument();
    });

    it("should show player management section", () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      expect(screen.getByText("PLAYER MANAGEMENT")).toBeInTheDocument();
    });

    it("should display all players with remove and admin buttons", () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      expect(screen.getByText("Admin User")).toBeInTheDocument();
      expect(screen.getByText("Player Two")).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: "REMOVE" })).toHaveLength(4);
      expect(screen.getAllByRole("button", { name: "ADMIN" })).toHaveLength(4);
      expect(screen.getAllByRole("button", { name: "START" })).toHaveLength(4);
    });

    it("should not show remove/admin buttons for self", () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      const adminUserRow = screen.getByText("Admin User").closest("div");
      expect(adminUserRow).toBeInTheDocument();
      const buttons = adminUserRow?.querySelectorAll("button");
      expect(buttons?.length).toBe(0);
    });

    it("should show confirmation dialog when clicking start game", async () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      await userEvent.click(screen.getByRole("button", { name: "START GAME" }));
      expect(screen.getByText("CONFIRM GAME START")).toBeInTheDocument();
    });

    it("should close confirmation dialog when clicking cancel", async () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      await userEvent.click(screen.getByRole("button", { name: "START GAME" }));
      expect(screen.getByText("CONFIRM GAME START")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "CANCEL" }));
      expect(screen.queryByText("CONFIRM GAME START")).not.toBeInTheDocument();
    });

    it("should disable buttons when game is in progress", () => {
      const room = createMockRoom({
        status: "ROLE_REVEAL",
        startedAt: Date.now(),
        currentChancellorId: undefined,
      });
      render(<AdminControlPanel room={room} />);
      expect(screen.getByText("GAME IN PROGRESS")).toBeInTheDocument();
    });
  });

  describe("when user is not admin", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: "regular-user-id" },
      } as ReturnType<typeof useAuth>);
    });

    it("should show waiting message for non-admin", () => {
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      expect(screen.getByText("WAITING FOR ADMIN")).toBeInTheDocument();
    });

    it("should still show insufficient players message when applicable", () => {
      const room = createMockRoom({
        players: {
          "admin-user-id": {
            id: "admin-user-id",
            name: "Admin User",
            avatar: "A",
            isReady: false,
            joinedAt: Date.now(),
          },
          "regular-user-id": {
            id: "regular-user-id",
            name: "Regular User",
            avatar: "R",
            isReady: false,
            joinedAt: Date.now(),
          },
        },
      });
      render(<AdminControlPanel room={room} />);
      expect(screen.getByText(/Need at least 5 players/i)).toBeInTheDocument();
    });
  });

  describe("callbacks", () => {
    it("should call setStartingPlayer when clicking START button", async () => {
      mockSetStartingPlayer.mockResolvedValue(undefined);
      const room = createMockRoom();
      render(<AdminControlPanel room={room} />);
      const startButtons = screen.getAllByRole("button", { name: "START" });
      await userEvent.click(startButtons[0]);
      expect(mockSetStartingPlayer).toHaveBeenCalledWith("player-2");
    });

    it("should call onSetStartingPlayer callback when setting starting player", async () => {
      const onSetStartingPlayer = vi.fn();
      mockSetStartingPlayer.mockResolvedValue(undefined);
      const room = createMockRoom();
      render(
        <AdminControlPanel
          room={room}
          onSetStartingPlayer={onSetStartingPlayer}
        />
      );
      const startButtons = screen.getAllByRole("button", { name: "START" });
      await userEvent.click(startButtons[0]);
      expect(onSetStartingPlayer).toHaveBeenCalledWith("player-2");
    });
  });
});
