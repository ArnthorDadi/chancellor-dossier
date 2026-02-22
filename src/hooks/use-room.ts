import { useState, useCallback, useEffect, useRef } from "react";
import {
  generateUniqueRoomCode,
  createRoom,
  getRoom,
  addPlayerToRoom,
  removePlayer,
  updatePlayer,
  updateRoom,
  deleteRoom,
  resetRoom,
  storeInvestigation,
  subscribeToRoom,
  setupPlayerDisconnectHandler,
} from "@/lib/realtime-database";
import type { Room } from "@/types/game-types";
import {
  assignRoles as assignGameRoles,
  canStartGame,
  getPartyFromRole,
} from "@/lib/game-logic";
import { useAuth } from "./use-auth";

export interface UseRoomReturn {
  // Room creation and joining
  createNewRoom: (roomName?: string) => Promise<string>;
  joinRoom: (roomId: string, playerName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;

  // Room state
  room: Room | null;
  loading: boolean;
  error: string | null;
  isPlayerInRoom: boolean;

  // Admin functions
  startGame: () => Promise<void>;
  resetGame: (
    reason?: "GAME_OVER" | "ADMIN_REQUEST" | "CONSENSUS"
  ) => Promise<void>;
  removePlayerFromRoom: (playerId: string) => Promise<void>;
  transferAdmin: (playerId: string) => Promise<void>;
  setStartingPlayer: (playerId: string) => Promise<void>;

  // Player functions
  updatePlayerName: (name: string) => Promise<void>;

  // Investigation functions
  investigatePlayer: (targetId: string) => Promise<void>;

  // Cleanup
  cleanup: () => void;
}

export const useRoom = (roomId?: string): UseRoomReturn => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionsRef = useRef<(() => void)[]>([]);
  const shouldCleanupOnUnmount = useRef<boolean>(true);
  const currentRoomRef = useRef<Room | null>(null);
  const currentUserRef = useRef<typeof user>(null);

  // Keep refs in sync with state
  useEffect(() => {
    currentRoomRef.current = room;
  }, [room]);

  useEffect(() => {
    currentUserRef.current = user;
  }, [user]);

  const isPlayerInRoom =
    user && room && room.players ? user.uid in room.players : false;

  // Helper to check if user is admin (first player in the room)
  const isAdmin = useCallback((): boolean => {
    if (!room || !user) return false;
    const playerIds = Object.keys(room.players || {});
    return playerIds.length > 0 && playerIds[0] === user.uid;
  }, [room, user]);

  // Cleanup subscriptions
  const cleanup = useCallback(() => {
    subscriptionsRef.current.forEach((unsub) => unsub());
    subscriptionsRef.current = [];
  }, []);

  // Helper function to remove player and handle room deletion
  const removePlayerAndCleanup = useCallback(
    async (targetRoomId: string, playerId: string, roomData: Room) => {
      console.log("🗑️ Removing player from Firebase...");
      await removePlayer(targetRoomId, playerId);
      console.log("✅ Player removed from Firebase");

      // Check if this was the last player
      const remainingPlayers = Object.entries(roomData.players || {}).filter(
        ([id]) => id !== playerId
      );
      console.log(`📊 Remaining players: ${remainingPlayers.length}`);

      if (remainingPlayers.length === 0) {
        // Last player, delete the room
        console.log("🗑️ Last player leaving, deleting room...");
        await deleteRoom(targetRoomId);
        console.log("✅ Room deleted");
      }
    },
    []
  );

  // Subscribe to room updates
  const subscribeToRoomUpdates = useCallback((targetRoomId: string) => {
    if (!targetRoomId) return;

    console.log(`📡 Subscribing to room updates: ${targetRoomId}`);

    // Subscribe to full room data
    const roomUnsub = subscribeToRoom(targetRoomId, (snapshot) => {
      const roomData = snapshot.val();
      const playerCount = roomData?.players
        ? Object.keys(roomData.players).length
        : 0;
      console.log(`📡 Room update received for ${targetRoomId}:`, {
        playerCount,
        playerIds: roomData?.players ? Object.keys(roomData.players) : [],
      });
      // Add the room ID to the data since Firebase doesn't include it
      setRoom(roomData ? { ...roomData, id: targetRoomId } : null);
    });

    subscriptionsRef.current.push(roomUnsub);
  }, []);

  // Create a new room
  const createNewRoom = useCallback(
    async (roomName?: string): Promise<string> => {
      if (!user) {
        throw new Error("Must be authenticated to create a room");
      }

      try {
        setLoading(true);
        setError(null);

        const newRoomId = await generateUniqueRoomCode();
        const now = Date.now();

        const newRoom: Room = {
          id: newRoomId,
          status: "LOBBY",
          createdAt: now,
          lastActivityAt: now,
          maxPlayers: 10,
          autoDeleteAfterHours: 24,
          players: {
            [user.uid]: {
              id: user.uid,
              name: roomName || `Player ${user.uid.slice(-4)}`,
              joinedAt: now,
            },
          },
        };

        await createRoom(
          newRoomId,
          newRoom as unknown as Record<string, unknown>
        );

        // Setup automatic disconnect handler for the creator
        await setupPlayerDisconnectHandler(newRoomId, user.uid);

        // Store current room ID for logout cleanup
        localStorage.setItem(`currentRoom_${user.uid}`, newRoomId);

        // Clean up old subscriptions before subscribing to new room
        cleanup();
        subscribeToRoomUpdates(newRoomId);

        return newRoomId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create room";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, subscribeToRoomUpdates, cleanup]
  );

  // Join an existing room
  const joinRoom = useCallback(
    async (targetRoomId: string, playerName: string): Promise<void> => {
      if (!user) {
        throw new Error("Must be authenticated to join a room");
      }

      try {
        setLoading(true);
        setError(null);

        // Check if room exists
        const existingRoom = await getRoom(targetRoomId);
        if (!existingRoom) {
          throw new Error("Room not found");
        }

        // Check if room is full or game in progress
        if (existingRoom.status !== "LOBBY") {
          throw new Error("Cannot join a game in progress");
        }

        const playerCount = Object.keys(existingRoom.players || {}).length;
        if (playerCount >= 10) {
          throw new Error("Room is full");
        }

        // Add player to room
        const now = Date.now();
        await addPlayerToRoom(targetRoomId, user.uid, {
          id: user.uid,
          name: playerName,
          joinedAt: now,
        });

        // Setup automatic disconnect handler
        await setupPlayerDisconnectHandler(targetRoomId, user.uid);

        // Store current room ID for logout cleanup
        localStorage.setItem(`currentRoom_${user.uid}`, targetRoomId);

        // Clean up old subscriptions before subscribing to new room
        cleanup();
        subscribeToRoomUpdates(targetRoomId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to join room";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, subscribeToRoomUpdates, cleanup]
  );

  // Leave current room
  const leaveRoom = useCallback(async (): Promise<void> => {
    console.log("🚪 leaveRoom called", { roomId: room?.id, userId: user?.uid });
    if (!room || !user) {
      console.log("❌ leaveRoom: No room or user");
      return;
    }

    try {
      // Prevent automatic cleanup since we're explicitly leaving
      shouldCleanupOnUnmount.current = false;
      console.log("test - leaveRoom", { user, room });
      await removePlayerAndCleanup(room.id, user.uid, room);

      // Clear current room ID from localStorage
      localStorage.removeItem(`currentRoom_${user.uid}`);
      console.log("✅ leaveRoom completed successfully");
    } catch (err) {
      console.error("❌ Error in leaveRoom:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to leave room";
      setError(errorMessage);
      throw err;
    }
  }, [room, user, removePlayerAndCleanup]);

  // Start the game (admin only)
  const startGame = useCallback(async (): Promise<void> => {
    if (!room || !user) {
      throw new Error("No room or user");
    }

    if (!isAdmin()) {
      throw new Error("Only admin can start the game");
    }

    const players = Object.values(room.players || {});
    const canStart = canStartGame(players.length);

    if (!canStart.canStart) {
      throw new Error(canStart.reason || "Cannot start game");
    }

    try {
      // Assign roles
      const roleAssignment = assignGameRoles(players);

      // Update each player with their assigned role
      const playerUpdates: Promise<void>[] = [];
      for (const player of players) {
        const role = roleAssignment[player.id];
        playerUpdates.push(updatePlayer(room.id, player.id, { role }));
      }
      await Promise.all(playerUpdates);

      // Update room status
      const now = Date.now();
      await updateRoom(room.id, {
        status: "ROLE_REVEAL",
        startedAt: now,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start game";
      setError(errorMessage);
      throw err;
    }
  }, [room, user]);

  // Reset the game
  const resetGame = useCallback(
    async (
      _reason: "GAME_OVER" | "ADMIN_REQUEST" | "CONSENSUS" = "GAME_OVER"
    ): Promise<void> => {
      if (!room || !user) {
        throw new Error("No room or user");
      }

      // Only admin can reset, or if game is over anyone can reset
      if (!isAdmin() && room.status !== "GAME_OVER") {
        throw new Error("Only admin can reset the game");
      }

      try {
        await resetRoom(room.id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reset game";
        setError(errorMessage);
        throw err;
      }
    },
    [room, user]
  );

  // Remove player from room (admin only)
  const removePlayerFromRoom = useCallback(
    async (playerId: string): Promise<void> => {
      if (!room || !user) {
        throw new Error("No room or user");
      }

      if (!isAdmin()) {
        throw new Error("Only admin can remove players");
      }

      if (playerId === user.uid) {
        throw new Error("Admin cannot remove themselves");
      }

      try {
        await removePlayer(room.id, playerId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove player";
        setError(errorMessage);
        throw err;
      }
    },
    [room, user, isAdmin]
  );

  // Transfer admin to another player (no-op now since admin is determined by player order)
  const transferAdmin = useCallback(
    async (_playerId: string): Promise<void> => {
      // Admin is now determined by player order (first player is admin)
      // This function is kept for backwards compatibility but does nothing
      console.log(
        "Admin transfer not needed - admin is determined by player order"
      );
    },
    []
  );

  // Update player name
  const updatePlayerName = useCallback(
    async (name: string): Promise<void> => {
      if (!room || !user) return;

      try {
        await updatePlayer(room.id, user.uid, { name });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update name";
        setError(errorMessage);
        throw err;
      }
    },
    [room, user]
  );

  // Set starting player (admin only) - no-op now
  const setStartingPlayer = useCallback(
    async (_playerId: string): Promise<void> => {
      // Starting player logic removed
      console.log("Starting player setting not needed");
    },
    []
  );

  // Investigate player (President only)
  const investigatePlayer = useCallback(
    async (targetId: string): Promise<void> => {
      if (!room || !user) {
        throw new Error("No room or user");
      }

      // President validation removed - any player can investigate now
      // TODO: Add proper president tracking if needed

      // Check if investigation power is available (President can only investigate once per game)
      const existingInvestigations = room.investigations || {};
      const hasInvestigated = Object.keys(existingInvestigations).length > 0;
      if (hasInvestigated) {
        throw new Error("Investigation power already used in this game");
      }

      // Validate target exists and is not self
      if (!room.players[targetId]) {
        throw new Error("Target player not found");
      }

      if (targetId === user.uid) {
        throw new Error("Cannot investigate yourself");
      }

      // Check if target was already investigated
      if (room.investigations?.[targetId]) {
        throw new Error("Player already investigated");
      }

      // Get target's party membership from player role
      const targetPlayer = room.players[targetId];
      const targetRole = targetPlayer?.role;
      if (!targetRole) {
        throw new Error("Target role not found - game may not be started");
      }

      const targetParty = getPartyFromRole(targetRole);

      try {
        // Store investigation result scoped to President's user ID
        const investigationData = {
          investigationId: `${user.uid}_${Date.now()}`,
          result: targetParty,
          investigatedBy: user.uid,
          investigatedAt: Date.now(),
          targetId,
        };

        await storeInvestigation(room.id, targetId, investigationData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to store investigation";
        setError(errorMessage);
        throw err;
      }
    },
    [room, user]
  );

  // Auto-subscribe if roomId is provided
  useEffect(() => {
    if (!roomId) return;

    // Subscribe to room updates
    subscribeToRoomUpdates(roomId);

    // Cleanup on unmount or when roomId changes
    return () => {
      cleanup();
    };
  }, [roomId, subscribeToRoomUpdates, cleanup]);

  return {
    createNewRoom,
    joinRoom,
    leaveRoom,
    room,
    loading,
    error,
    isPlayerInRoom,
    startGame,
    resetGame,
    removePlayerFromRoom,
    transferAdmin,
    setStartingPlayer,
    updatePlayerName,
    investigatePlayer,
    cleanup,
  };
};
