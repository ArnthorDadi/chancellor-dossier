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
  updateRoomMetadata,
  initializeRoomSchema,
  validateRoomSchema,
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
      expect(dbPaths.roomMetadata("TEST1")).toBe("rooms/TEST1/metadata");
      expect(dbPaths.roomPlayers("TEST1")).toBe("rooms/TEST1/players");
      expect(dbPaths.roomRoles("TEST1")).toBe("rooms/TEST1/roles");
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

    it("should update room metadata", async () => {
      const { update } = await import("firebase/database");
      const metadata = { status: "ROLE_REVEAL" };

      await updateRoomMetadata("TEST1", metadata);

      expect(update).toHaveBeenCalledWith(
        { ref: "rooms/TEST1/metadata" },
        metadata
      );
    });
  });

  describe("initializeRoomSchema", () => {
    it("should initialize room with default schema", async () => {
      const { set } = await import("firebase/database");
      const adminId = "admin123";

      await initializeRoomSchema("TEST1", adminId);

      expect(set).toHaveBeenCalledWith(
        { ref: "rooms/TEST1" },
        expect.objectContaining({
          metadata: expect.objectContaining({
            status: "LOBBY",
            adminId,
            createdAt: expect.any(String),
            roomName: "Room TEST1",
            enactedLiberalPolicies: 0,
            enactedFascistPolicies: 0,
            electionTracker: 0,
            startingPlayerId: null,
          }),
          players: {},
          roles: {},
          investigations: {},
        })
      );
    });

    it("should initialize room with custom name", async () => {
      const { set } = await import("firebase/database");
      const adminId = "admin123";
      const roomName = "Custom Room Name";

      await initializeRoomSchema("TEST1", adminId, roomName);

      expect(set).toHaveBeenCalledWith(
        { ref: "rooms/TEST1" },
        expect.objectContaining({
          metadata: expect.objectContaining({
            roomName,
          }),
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
        metadata: {
          status: "LOBBY",
          adminId: "admin123",
          // Missing createdAt and roomName
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
});
