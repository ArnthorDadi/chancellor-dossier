import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateRoomCode,
  generateUniqueRoomCode,
  isRoomCodeTaken,
  dbPaths,
  subscribeToRoom,
  createRoom,
  getRoom,
  addPlayerToRoom,
  removePlayer,
  updateRoom,
  initializeRoomSchema,
  validateRoomSchema,
  validateRoomSettings,
  updateRoomActivity,
  cleanupInactiveRooms,
} from "@/lib/realtime-database";

// Mock Firebase
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn((_, path) => ({ ref: path })),
  set: vi.fn(() => Promise.resolve()),
  get: vi.fn(() => Promise.resolve({ exists: () => false })),
  update: vi.fn(() => Promise.resolve()),
  remove: vi.fn(() => Promise.resolve()),
  onValue: vi.fn(() => vi.fn()),
}));

describe("Realtime Database", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateRoomCode", () => {
    it("should generate a code between 4-6 characters", () => {
      const code = generateRoomCode();
      expect(code).toMatch(/^[A-Z0-9]{4,6}$/);
      expect(code.length).toBeGreaterThanOrEqual(4);
      expect(code.length).toBeLessThanOrEqual(6);
    });

    it("should generate different codes on multiple calls", () => {
      const codes = Array.from({ length: 10 }, () => generateRoomCode());
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBeGreaterThan(1);
    });
  });

  describe("isRoomCodeTaken", () => {
    it("should return false for non-existent room", async () => {
      const { get } = await import("firebase/database");
      vi.mocked(get).mockResolvedValue({ exists: () => false } as any);

      const result = await isRoomCodeTaken("TEST1");
      expect(result).toBe(false);
    });

    it("should return true for existing room", async () => {
      const { get } = await import("firebase/database");
      vi.mocked(get).mockResolvedValue({ exists: () => true } as any);

      const result = await isRoomCodeTaken("TEST1");
      expect(result).toBe(true);
    });
  });

  describe("generateUniqueRoomCode", () => {
    it("should generate unique room code", async () => {
      const { get } = await import("firebase/database");
      vi.mocked(get).mockResolvedValue({ exists: () => false } as any);

      const code = await generateUniqueRoomCode();
      expect(code).toMatch(/^[A-Z0-9]{4,6}$/);
    });

    it("should retry if code is taken", async () => {
      const { get } = await import("firebase/database");
      vi.mocked(get)
        .mockResolvedValueOnce({ exists: () => true } as any)
        .mockResolvedValueOnce({ exists: () => false } as any);

      const code = await generateUniqueRoomCode();
      expect(code).toMatch(/^[A-Z0-9]{4,6}$/);
    });

    it("should throw error after max attempts", async () => {
      const { get } = await import("firebase/database");
      vi.mocked(get).mockResolvedValue({ exists: () => true } as any);

      await expect(generateUniqueRoomCode()).rejects.toThrow(
        "Failed to generate unique room code"
      );
    });
  });

  describe("dbPaths", () => {
    it("should generate correct paths", () => {
      expect(dbPaths.room("TEST1")).toBe("rooms/TEST1");
      expect(dbPaths.roomPlayers("TEST1")).toBe("rooms/TEST1/players");
      expect(dbPaths.roomInvestigations("TEST1")).toBe(
        "rooms/TEST1/investigations"
      );
      expect(dbPaths.player("TEST1", "user123")).toBe(
        "rooms/TEST1/players/user123"
      );
      expect(dbPaths.role("TEST1", "user123")).toBe(
        "rooms/TEST1/roles/user123"
      );
      expect(dbPaths.investigation("TEST1", "user123")).toBe(
        "rooms/TEST1/investigations/user123"
      );
    });
  });

  describe("subscribeToRoom", () => {
    it("should subscribe to room changes", async () => {
      const { onValue } = await import("firebase/database");
      const mockCallback = vi.fn();
      const unsubscribe = subscribeToRoom("TEST1", mockCallback);

      expect(onValue).toHaveBeenCalledWith(
        { ref: "rooms/TEST1" },
        mockCallback
      );
      expect(typeof unsubscribe).toBe("function");
    });
  });

  describe("room operations", () => {
    it("should create room", async () => {
      const { set } = await import("firebase/database");
      const roomData = { id: "TEST1", metadata: { status: "LOBBY" } };

      await createRoom("TEST1", roomData);

      expect(set).toHaveBeenCalledWith({ ref: "rooms/TEST1" }, roomData);
    });

    it("should get room", async () => {
      const { get } = await import("firebase/database");
      const mockRoom = { id: "TEST1", metadata: { status: "LOBBY" } };
      vi.mocked(get).mockResolvedValue({
        exists: () => true,
        val: () => mockRoom,
      } as any);

      const result = await getRoom("TEST1");

      expect(get).toHaveBeenCalledWith({ ref: "rooms/TEST1" });
      expect(result).toEqual(mockRoom);
    });

    it("should return null for non-existent room", async () => {
      const { get } = await import("firebase/database");
      vi.mocked(get).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getRoom("TEST1");

      expect(result).toBeNull();
    });

    it("should add player to room", async () => {
      const { set } = await import("firebase/database");
      const playerData = { id: "user123", name: "Test User" };

      await addPlayerToRoom("TEST1", "user123", playerData);

      expect(set).toHaveBeenCalledWith(
        { ref: "rooms/TEST1/players/user123" },
        playerData
      );
    });

    it("should remove player from room", async () => {
      const { remove } = await import("firebase/database");

      await removePlayer("TEST1", "user123");

      expect(remove).toHaveBeenCalledWith({
        ref: "rooms/TEST1/players/user123",
      });
    });

    it("should update room data", async () => {
      const { update } = await import("firebase/database");
      const roomData = { status: "ROLE_REVEAL" };

      await updateRoom("TEST1", roomData);

      expect(update).toHaveBeenCalledWith({ ref: "rooms/TEST1" }, roomData);
    });
  });

  describe("initializeRoomSchema", () => {
    it("should initialize room with default schema", async () => {
      const { set } = await import("firebase/database");

      await initializeRoomSchema("TEST1");

      expect(set).toHaveBeenCalledWith(
        { ref: "rooms/TEST1" },
        expect.objectContaining({
          status: "LOBBY",
          createdAt: expect.any(Number),
          players: {},
          investigations: {},
        })
      );
    });

    it("should initialize room schema", async () => {
      const { set } = await import("firebase/database");

      await initializeRoomSchema("TEST1");

      expect(set).toHaveBeenCalledWith(
        { ref: "rooms/TEST1" },
        expect.objectContaining({
          status: "LOBBY",
        })
      );
    });
  });

  describe("validateRoomSchema", () => {
    it("should return true for valid room schema", async () => {
      const { get } = await import("firebase/database");
      const mockRoom = {
        metadata: {
          status: "LOBBY",
          adminId: "admin123",
          createdAt: "2023-01-01T00:00:00.000Z",
          roomName: "Test Room",
        },
        players: {},
        roles: {},
        investigations: {},
      };
      vi.mocked(get).mockResolvedValue({
        exists: () => true,
        val: () => mockRoom,
      } as any);

      const result = await validateRoomSchema("TEST1");

      expect(result).toBe(true);
    });

    it("should return false for non-existent room", async () => {
      const { get } = await import("firebase/database");
      vi.mocked(get).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await validateRoomSchema("TEST1");

      expect(result).toBe(false);
    });

    it("should return false for invalid metadata", async () => {
      const { get } = await import("firebase/database");
      const mockRoom = {
        status: "LOBBY",
        // Missing createdAt
        players: {},
        investigations: {},
      };
      vi.mocked(get).mockResolvedValue({
        exists: () => true,
        val: () => mockRoom,
      } as any);

      const result = await validateRoomSchema("TEST1");

      expect(result).toBe(false);
    });

    it("should return false if required sections are missing", async () => {
      const { get } = await import("firebase/database");
      const mockRoom = {
        metadata: {
          status: "LOBBY",
          adminId: "admin123",
          createdAt: "2023-01-01T00:00:00.000Z",
          roomName: "Test Room",
        },
        // Missing players, roles, investigations
      };
      vi.mocked(get).mockResolvedValue({
        exists: () => true,
        val: () => mockRoom,
      } as any);

      const result = await validateRoomSchema("TEST1");

      expect(result).toBe(false);
    });
  });

  describe("validateRoomSettings", () => {
    it("should return valid for empty settings", () => {
      const result = validateRoomSettings({});
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid for valid room name", () => {
      const result = validateRoomSettings({ roomName: "Test Room" });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject room name over 30 characters", () => {
      const result = validateRoomSettings({
        roomName: "a".repeat(31),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Room name must be 30 characters or less"
      );
    });

    it("should reject invalid room name characters", () => {
      const result = validateRoomSettings({ roomName: "Test@Room!" });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Room name can only contain letters, numbers, spaces, hyphens, and underscores"
      );
    });

    it("should reject max players below 5", () => {
      const result = validateRoomSettings({ maxPlayers: 4 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Max players must be between 5 and 10");
    });

    it("should reject max players above 10", () => {
      const result = validateRoomSettings({ maxPlayers: 11 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Max players must be between 5 and 10");
    });

    it("should accept valid max players", () => {
      const result = validateRoomSettings({ maxPlayers: 8 });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject auto-delete hours below 1", () => {
      const result = validateRoomSettings({ autoDeleteAfterHours: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Auto-delete hours must be between 1 and 168 (7 days)"
      );
    });

    it("should reject auto-delete hours above 168", () => {
      const result = validateRoomSettings({ autoDeleteAfterHours: 169 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Auto-delete hours must be between 1 and 168 (7 days)"
      );
    });

    it("should accept valid auto-delete hours", () => {
      const result = validateRoomSettings({ autoDeleteAfterHours: 24 });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return multiple errors for invalid settings", () => {
      const result = validateRoomSettings({
        roomName: "a".repeat(31),
        maxPlayers: 20,
        autoDeleteAfterHours: -1,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);
    });
  });

  describe("updateRoomActivity", () => {
    it("should update lastActivityAt timestamp", async () => {
      const { update } = await import("firebase/database");

      await updateRoomActivity("TEST1");

      expect(update).toHaveBeenCalledWith(
        { ref: "rooms/TEST1" },
        { lastActivityAt: expect.any(Number) }
      );
    });
  });

  describe("cleanupInactiveRooms", () => {
    it("should return 0 for empty rooms", async () => {
      const { get } = await import("firebase/database");
      vi.mocked(get).mockResolvedValue({ exists: () => false } as any);

      const result = await cleanupInactiveRooms(24);
      expect(result).toBe(0);
    });

    it("should not delete rooms within threshold", async () => {
      const { get, remove } = await import("firebase/database");
      const now = Date.now();
      const recentRoom = {
        TEST1: {
          createdAt: now - 60 * 60 * 1000, // 1 hour ago
          lastActivityAt: now - 60 * 60 * 1000,
          players: {},
        },
      };
      vi.mocked(get).mockResolvedValue({
        exists: () => true,
        val: () => recentRoom,
      } as any);

      const result = await cleanupInactiveRooms(24);
      expect(result).toBe(0);
      expect(remove).not.toHaveBeenCalled();
    });

    it("should delete rooms beyond threshold", async () => {
      const { get, remove } = await import("firebase/database");
      const now = Date.now();
      const oldRoom = {
        TEST1: {
          createdAt: now - 48 * 60 * 60 * 1000, // 48 hours ago
          lastActivityAt: now - 48 * 60 * 60 * 1000,
          players: {},
        },
      };
      vi.mocked(get).mockResolvedValue({
        exists: () => true,
        val: () => oldRoom,
      } as any);
      vi.mocked(remove).mockResolvedValue();

      const result = await cleanupInactiveRooms(24);
      expect(result).toBe(1);
      expect(remove).toHaveBeenCalledWith({ ref: "rooms/TEST1" });
    });

    it("should delete rooms with no recent player activity", async () => {
      const { get, remove } = await import("firebase/database");
      const now = Date.now();
      const oldRoom = {
        TEST1: {
          createdAt: now - 50 * 60 * 60 * 1000, // 50 hours ago
          players: {
            player1: { joinedAt: now - 50 * 60 * 60 * 1000 },
          },
        },
      };
      vi.mocked(get).mockResolvedValue({
        exists: () => true,
        val: () => oldRoom,
      } as any);
      vi.mocked(remove).mockResolvedValue();

      const result = await cleanupInactiveRooms(24);
      expect(result).toBe(1);
      expect(remove).toHaveBeenCalledWith({ ref: "rooms/TEST1" });
    });
  });
});
