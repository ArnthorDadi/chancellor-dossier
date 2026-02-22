import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  onDisconnect,
} from "firebase/database";
import { initializeApp } from "firebase/app";

// Initialize Realtime Database
const app = initializeApp(
  {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
  "chancellor-dossier-database"
);

export const database = getDatabase(
  app,
  import.meta.env.VITE_FIREBASE_DATABASE_URL
);

/**
 * Generate a short room code (4-6 alphanumeric characters)
 */
export const generateRoomCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = Math.floor(Math.random() * 3) + 4; // 4-6 characters
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

/**
 * Check if a room code is already in use
 */
export const isRoomCodeTaken = async (code: string): Promise<boolean> => {
  const roomRef = ref(database, `rooms/${code}`);
  const snapshot = await get(roomRef);
  return snapshot.exists();
};

/**
 * Generate a unique room code
 */
export const generateUniqueRoomCode = async (): Promise<string> => {
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateRoomCode();
    attempts++;

    if (attempts > maxAttempts) {
      throw new Error(
        "Failed to generate unique room code after maximum attempts"
      );
    }
  } while (await isRoomCodeTaken(code || ""));

  return code!;
};

/**
 * Database path helpers
 */
export const dbPaths = {
  room: (roomId: string) => `rooms/${roomId}`,
  roomPlayers: (roomId: string) => `rooms/${roomId}/players`,
  roomInvestigations: (roomId: string) => `rooms/${roomId}/investigations`,
  player: (roomId: string, playerId: string) =>
    `rooms/${roomId}/players/${playerId}`,
  role: (roomId: string, playerId: string) =>
    `rooms/${roomId}/roles/${playerId}`,
  investigation: (roomId: string, targetId: string) =>
    `rooms/${roomId}/investigations/${targetId}`,
};

/**
 * Subscribe to room changes
 */
export const subscribeToRoom = (
  roomId: string,
  callback: (snapshot: any) => void
) => {
  const roomRef = ref(database, dbPaths.room(roomId));
  return onValue(roomRef, callback);
};

/**
 * Set data operations
 */
export const createRoom = async (
  roomId: string,
  roomData: Record<string, unknown>
): Promise<void> => {
  const roomRef = ref(database, dbPaths.room(roomId));
  await set(roomRef, roomData);
};

export const updateRoom = async (
  roomId: string,
  roomData: Record<string, unknown>
): Promise<void> => {
  const roomRef = ref(database, dbPaths.room(roomId));
  await update(roomRef, roomData);
};

export const updatePlayer = async (
  roomId: string,
  playerId: string,
  playerData: Record<string, unknown>
): Promise<void> => {
  const playerRef = ref(database, dbPaths.player(roomId, playerId));
  await update(playerRef, playerData);
};

export const addPlayerToRoom = async (
  roomId: string,
  playerId: string,
  playerData: Record<string, unknown>
): Promise<void> => {
  const playerRef = ref(database, dbPaths.player(roomId, playerId));
  await set(playerRef, playerData);
};

/**
 * Setup automatic player removal on disconnect
 * This ensures players are removed from rooms when they lose connection
 */
export const setupPlayerDisconnectHandler = async (
  roomId: string,
  playerId: string
): Promise<void> => {
  const playerRef = ref(database, dbPaths.player(roomId, playerId));
  await onDisconnect(playerRef).remove();
};

export const storeInvestigation = async (
  roomId: string,
  targetId: string,
  investigationData: Record<string, unknown>
): Promise<void> => {
  const investigationRef = ref(
    database,
    dbPaths.investigation(roomId, targetId)
  );
  await set(investigationRef, investigationData);
};

/**
 * Get data operations
 */
export const getRoom = async (roomId: string) => {
  const roomRef = ref(database, dbPaths.room(roomId));
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return null;

  const roomData = snapshot.val();
  // Add the room ID to the data since Firebase doesn't include it
  return { ...roomData, id: roomId };
};

export const getRoomPlayers = async (roomId: string) => {
  const playersRef = ref(database, dbPaths.roomPlayers(roomId));
  const snapshot = await get(playersRef);
  return snapshot.exists() ? snapshot.val() : {};
};

/**
 * Delete operations
 */
export const removePlayer = async (
  roomId: string,
  playerId: string
): Promise<void> => {
  const playerPath = dbPaths.player(roomId, playerId);
  console.log(`🗑️ removePlayer: Removing player at path: ${playerPath}`);
  const playerRef = ref(database, playerPath);
  console.log("test - removePlayer", {
    roomId,
    playerId,
    playerPath,
    playerRef,
  });

  await remove(playerRef);
  console.log(
    `✅ removePlayer: Player removed successfully from ${playerPath}`
  );
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  const roomRef = ref(database, dbPaths.room(roomId));
  await remove(roomRef);
};

/**
 * Initialize database schema for a new room
 */
export const initializeRoomSchema = async (roomId: string): Promise<void> => {
  const roomSchema = {
    status: "LOBBY",
    createdAt: Date.now(),
    players: {},
    investigations: {},
  };

  await createRoom(roomId, roomSchema);
};

/**
 * Validate that database schema is properly initialized
 */
export const validateRoomSchema = async (roomId: string): Promise<boolean> => {
  const room = await getRoom(roomId);
  if (!room) return false;

  const { players, investigations } = room;

  // Check required fields
  const requiredFields = ["status", "createdAt"];
  const hasValidFields = requiredFields.every(
    (field) => room[field] !== undefined && room[field] !== null
  );

  // Check that all required sections exist
  return (
    hasValidFields &&
    typeof players === "object" &&
    typeof investigations === "object"
  );
};

/**
 * Reset room for new game
 */
export const resetRoom = async (
  roomId: string,
  resetBy: string,
  reason: "GAME_OVER" | "ADMIN_REQUEST" | "CONSENSUS" = "ADMIN_REQUEST"
): Promise<void> => {
  const updates: Record<string, unknown> = {};

  // Update room fields
  updates["status"] = "LOBBY";
  updates["startedAt"] = null;
  updates["endedAt"] = null;
  updates["currentChancellorId"] = null;
  updates["lastActivityAt"] = Date.now();

  // Reset enacted policies
  updates["enactedPolicies"] = { liberal: 0, fascist: 0 };

  // Clear investigations
  updates["investigations"] = null;

  // Clear roles node (secret role data)
  updates["roles"] = null;

  // Reset player game states (clear roles)
  const players = await getRoomPlayers(roomId);
  Object.keys(players || {}).forEach((playerId) => {
    updates[`players/${playerId}/role`] = null;
  });

  // Record reset action in history
  const resetRecord = {
    resetBy,
    resetAt: Date.now(),
    reason,
  };

  const roomRef = ref(database, dbPaths.room(roomId));
  await update(roomRef, updates);

  // Add reset record to history (push to array)
  const historyRef = ref(database, `${dbPaths.room(roomId)}/resetHistory`);
  const snapshot = await get(historyRef);
  const existingHistory: unknown[] = snapshot.exists()
    ? Object.values(snapshot.val())
    : [];
  const newHistory = [...existingHistory, resetRecord];
  await set(historyRef, newHistory);
};

/**
 * Validate room settings before creation
 */
export interface RoomSettingsValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRoomSettings = (
  settings: Partial<{
    roomName: string;
    maxPlayers: number;
    autoDeleteAfterHours: number;
  }>
): RoomSettingsValidationResult => {
  const errors: string[] = [];

  // Validate room name
  if (settings.roomName !== undefined) {
    if (typeof settings.roomName !== "string") {
      errors.push("Room name must be a string");
    } else if (settings.roomName.length > 30) {
      errors.push("Room name must be 30 characters or less");
    } else if (
      settings.roomName.length > 0 &&
      !/^[a-zA-Z0-9\s\-_]+$/.test(settings.roomName)
    ) {
      errors.push(
        "Room name can only contain letters, numbers, spaces, hyphens, and underscores"
      );
    }
  }

  // Validate max players
  if (settings.maxPlayers !== undefined) {
    if (typeof settings.maxPlayers !== "number") {
      errors.push("Max players must be a number");
    } else if (settings.maxPlayers < 5 || settings.maxPlayers > 10) {
      errors.push("Max players must be between 5 and 10");
    }
  }

  // Validate auto-delete hours
  if (settings.autoDeleteAfterHours !== undefined) {
    if (typeof settings.autoDeleteAfterHours !== "number") {
      errors.push("Auto-delete hours must be a number");
    } else if (
      settings.autoDeleteAfterHours < 1 ||
      settings.autoDeleteAfterHours > 168
    ) {
      errors.push("Auto-delete hours must be between 1 and 168 (7 days)");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Update last activity timestamp for a room
 */
export const updateRoomActivity = async (roomId: string): Promise<void> => {
  const roomRef = ref(database, dbPaths.room(roomId));
  await update(roomRef, { lastActivityAt: Date.now() });
};

/**
 * Get all rooms for cleanup (admin function)
 */
export const getAllRooms = async (): Promise<Record<string, unknown>> => {
  const roomsRef = ref(database, "rooms");
  const snapshot = await get(roomsRef);
  return snapshot.exists() ? snapshot.val() : {};
};

/**
 * Delete rooms that have been inactive beyond the auto-delete threshold
 * Returns number of deleted rooms
 */
export const cleanupInactiveRooms = async (
  autoDeleteAfterHours: number = 24
): Promise<number> => {
  const rooms = await getAllRooms();
  const now = Date.now();
  const thresholdMs = autoDeleteAfterHours * 60 * 60 * 1000;
  let deletedCount = 0;

  for (const [roomId, roomData] of Object.entries(rooms)) {
    const room = roomData as Record<string, unknown>;
    const lastActivity =
      (room.lastActivityAt as number | undefined) || (room.createdAt as number);
    const lastPlayerActivity = room.players
      ? Math.max(
          ...Object.values(
            room.players as Record<string, { joinedAt?: number }>
          ).map((p) => p.joinedAt || 0)
        )
      : 0;

    const roomLastActivity = Math.max(lastActivity, lastPlayerActivity);

    if (now - roomLastActivity > thresholdMs) {
      await deleteRoom(roomId);
      deletedCount++;
      console.log(`🗑️ Auto-deleted inactive room: ${roomId}`);
    }
  }

  return deletedCount;
};
