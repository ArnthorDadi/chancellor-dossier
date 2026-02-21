import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRoom } from "@/hooks/use-room";
import { useAuth } from "@/hooks/use-auth";
import * as realtimeDb from "@/lib/realtime-database";
import * as gameLogic from "@/lib/game-logic";
import type { Room } from "@/types/game-types";

// Mock dependencies
vi.mock("@/hooks/use-auth");
vi.mock("@/lib/realtime-database");
vi.mock("@/lib/game-logic");

const mockUseAuth = vi.mocked(useAuth);
const mockRealtimeDb = vi.mocked(realtimeDb);
const mockGameLogic = vi.mocked(gameLogic);

describe("useRoom Hook", () => {
  const mockUser = { uid: "user123" };
  const mockRoom: Room = {
    id: "TEST1",
    status: "LOBBY" as const,
    createdAt: Date.now(),
    players: {
      user123: {
        id: "user123",
        name: "Test User",
        isReady: false,
        joinedAt: Date.now(),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    mockRealtimeDb.subscribeToRoom.mockImplementation(() => vi.fn());
    mockRealtimeDb.generateUniqueRoomCode.mockResolvedValue("TEST1");
    mockRealtimeDb.createRoom.mockResolvedValue();
    mockRealtimeDb.getRoom.mockResolvedValue(mockRoom);
    mockRealtimeDb.addPlayerToRoom.mockResolvedValue();
    mockRealtimeDb.removePlayer.mockResolvedValue();
    mockRealtimeDb.updateRoom.mockResolvedValue();
    mockRealtimeDb.deleteRoom.mockResolvedValue();
    mockRealtimeDb.resetRoom.mockResolvedValue();
    mockRealtimeDb.assignRoles.mockResolvedValue();
    mockRealtimeDb.updatePlayer.mockResolvedValue();

    mockGameLogic.canStartGame.mockReturnValue({ canStart: true, reason: "" });
    mockGameLogic.assignRoles.mockReturnValue({
      user123: { role: "LIBERAL", party: "LIBERAL" },
    } as any);
  });

  describe("initial state", () => {
    it("should return initial state", () => {
      const { result } = renderHook(() => useRoom());

      expect(result.current.room).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isPlayerInRoom).toBe(false);
    });
  });

  describe("createNewRoom", () => {
    it("should create a new room successfully", async () => {
      const { result } = renderHook(() => useRoom());

      await expect(result.current.createNewRoom("Test Room")).resolves.toBe(
        "TEST1"
      );

      expect(mockRealtimeDb.generateUniqueRoomCode).toHaveBeenCalled();
      expect(mockRealtimeDb.createRoom).toHaveBeenCalledWith(
        "TEST1",
        expect.objectContaining({
          id: "TEST1",
          metadata: expect.objectContaining({
            status: "LOBBY",
            adminId: "user123",
          }),
        })
      );
    });

    it("should throw error if user is not authenticated", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signOut: vi.fn(),
      } as any);

      const { result } = renderHook(() => useRoom());

      await expect(result.current.createNewRoom()).rejects.toThrow(
        "Must be authenticated to create a room"
      );
    });

    it("should handle room creation errors", async () => {
      mockRealtimeDb.createRoom.mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useRoom());

      await expect(result.current.createNewRoom()).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("joinRoom", () => {
    it("should join an existing room successfully", async () => {
      const { result } = renderHook(() => useRoom());

      await expect(
        result.current.joinRoom("TEST1", "New Player")
      ).resolves.toBeUndefined();

      expect(mockRealtimeDb.getRoom).toHaveBeenCalledWith("TEST1");
      expect(mockRealtimeDb.addPlayerToRoom).toHaveBeenCalledWith(
        "TEST1",
        "user123",
        expect.objectContaining({
          id: "user123",
          name: "New Player",
        })
      );
    });

    it("should throw error if room does not exist", async () => {
      mockRealtimeDb.getRoom.mockResolvedValue(null);

      const { result } = renderHook(() => useRoom());

      await expect(result.current.joinRoom("INVALID", "Test")).rejects.toThrow(
        "Room not found"
      );
    });

    it("should throw error if game is in progress", async () => {
      mockRealtimeDb.getRoom.mockResolvedValue({
        ...mockRoom,
        status: "VOTING" as const,
      });

      const { result } = renderHook(() => useRoom());

      await expect(result.current.joinRoom("TEST1", "Test")).rejects.toThrow(
        "Cannot join a game in progress"
      );
    });

    it("should throw error if room is full", async () => {
      const fullRoom = {
        ...mockRoom,
        players: Array.from({ length: 10 }, (_, i) => ({
          id: `user${i}`,
          name: `Player ${i}`,
          isReady: false,
          joinedAt: Date.now(),
        })).reduce((acc, player) => ({ ...acc, [player.id]: player }), {}),
      };
      mockRealtimeDb.getRoom.mockResolvedValue(fullRoom);

      const { result } = renderHook(() => useRoom());

      await expect(result.current.joinRoom("TEST1", "Test")).rejects.toThrow(
        "Room is full"
      );
    });
  });

  describe("startGame", () => {
    it("should start game successfully when user is admin", async () => {
      // Mock the room state before creating hook
      mockRealtimeDb.subscribeToRoom.mockImplementation((roomId, callback) => {
        if (roomId === "TEST1") {
          callback({ val: () => mockRoom });
        }
        return vi.fn();
      });

      const { result } = renderHook(() => useRoom("TEST1"));

      await result.current.startGame();

      expect(mockGameLogic.canStartGame).toHaveBeenCalled();
      expect(mockGameLogic.assignRoles).toHaveBeenCalled();
      expect(mockRealtimeDb.assignRoles).toHaveBeenCalled();
      expect(mockRealtimeDb.updateRoom).toHaveBeenCalledWith(
        "TEST1",
        expect.objectContaining({
          status: "ROLE_REVEAL",
          startingPlayerId: "user123",
          currentPresidentId: "user123",
        })
      );
    });

    it("should throw error if user is not admin", async () => {
      const nonAdminRoom = {
        ...mockRoom,
        players: {
          "other-user": {
            id: "other-user",
            name: "Other User",
            isReady: false,
            joinedAt: Date.now(),
          },
          user123: mockRoom.players.user123,
        },
      };
      mockRealtimeDb.subscribeToRoom.mockImplementation((roomId, callback) => {
        if (roomId === "TEST1") {
          callback({ val: () => nonAdminRoom });
        }
        return vi.fn();
      });

      const { result } = renderHook(() => useRoom("TEST1"));

      await expect(result.current.startGame()).rejects.toThrow(
        "Only admin can start the game"
      );
    });

    it("should throw error if game cannot be started", async () => {
      mockRealtimeDb.subscribeToRoom.mockImplementation((roomId, callback) => {
        if (roomId === "TEST1") {
          callback({ val: () => mockRoom });
        }
        return vi.fn();
      });

      mockGameLogic.canStartGame.mockReturnValue({
        canStart: false,
        reason: "Not enough players",
      });

      const { result } = renderHook(() => useRoom("TEST1"));

      await expect(result.current.startGame()).rejects.toThrow(
        "Not enough players"
      );
    });
  });

  describe("setPlayerReady", () => {
    it("should update player ready status", async () => {
      mockRealtimeDb.subscribeToRoom.mockImplementation((roomId, callback) => {
        if (roomId === "TEST1") {
          callback({ val: () => mockRoom });
        }
        return vi.fn();
      });

      const { result } = renderHook(() => useRoom("TEST1"));

      await result.current.setPlayerReady(true);

      expect(mockRealtimeDb.updatePlayer).toHaveBeenCalledWith(
        "TEST1",
        "user123",
        { isReady: true }
      );
    });
  });

  describe("cleanup", () => {
    it("should call cleanup on unmount", () => {
      const mockUnsubscribe = vi.fn();
      mockRealtimeDb.subscribeToRoom.mockReturnValue(mockUnsubscribe);

      const { result } = renderHook(() => useRoom("TEST1"));

      result.current.cleanup();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
