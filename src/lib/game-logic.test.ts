import { describe, it, expect } from "vitest";
import {
  assignRoles,
  getPartyFromRole,
  createGamePlayers,
  validateRoleAssignment,
  canStartGame,
  getVisibleInformation,
} from "@/lib/game-logic";
import type { Player, GamePlayer, Role } from "@/types/game-types";

describe("Game Logic - Role Dealing", () => {
  const createMockPlayers = (count: number): Player[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `player-${i}`,
      name: `Player ${i + 1}`,
      isReady: false,
      joinedAt: Date.now() + i,
    }));
  };

  describe("assignRoles", () => {
    it("should assign correct roles for 5 players", () => {
      const players = createMockPlayers(5);
      const roles = assignRoles(players);

      expect(Object.keys(roles)).toHaveLength(5);

      const roleCounts = Object.values(roles).reduce(
        (acc, role) => {
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        },
        {} as Record<Role, number>
      );

      expect(roleCounts.LIBERAL).toBe(3);
      expect(roleCounts.FASCIST).toBe(1);
      expect(roleCounts.HITLER).toBe(1);
    });

    it("should assign correct roles for 6 players", () => {
      const players = createMockPlayers(6);
      const roles = assignRoles(players);

      const roleCounts = Object.values(roles).reduce(
        (acc, role) => {
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        },
        {} as Record<Role, number>
      );

      expect(roleCounts.LIBERAL).toBe(4);
      expect(roleCounts.FASCIST).toBe(1);
      expect(roleCounts.HITLER).toBe(1);
    });

    it("should assign correct roles for 7 players", () => {
      const players = createMockPlayers(7);
      const roles = assignRoles(players);

      const roleCounts = Object.values(roles).reduce(
        (acc, role) => {
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        },
        {} as Record<Role, number>
      );

      expect(roleCounts.LIBERAL).toBe(4);
      expect(roleCounts.FASCIST).toBe(2);
      expect(roleCounts.HITLER).toBe(1);
    });

    it("should assign correct roles for 8 players", () => {
      const players = createMockPlayers(8);
      const roles = assignRoles(players);

      const roleCounts = Object.values(roles).reduce(
        (acc, role) => {
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        },
        {} as Record<Role, number>
      );

      expect(roleCounts.LIBERAL).toBe(5);
      expect(roleCounts.FASCIST).toBe(2);
      expect(roleCounts.HITLER).toBe(1);
    });

    it("should assign correct roles for 9 players", () => {
      const players = createMockPlayers(9);
      const roles = assignRoles(players);

      const roleCounts = Object.values(roles).reduce(
        (acc, role) => {
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        },
        {} as Record<Role, number>
      );

      expect(roleCounts.LIBERAL).toBe(5);
      expect(roleCounts.FASCIST).toBe(3);
      expect(roleCounts.HITLER).toBe(1);
    });

    it("should assign correct roles for 10 players", () => {
      const players = createMockPlayers(10);
      const roles = assignRoles(players);

      const roleCounts = Object.values(roles).reduce(
        (acc, role) => {
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        },
        {} as Record<Role, number>
      );

      expect(roleCounts.LIBERAL).toBe(6);
      expect(roleCounts.FASCIST).toBe(3);
      expect(roleCounts.HITLER).toBe(1);
    });

    it("should throw error for invalid player count", () => {
      const players = createMockPlayers(4);

      expect(() => assignRoles(players)).toThrow(
        "Invalid player count: 4. Must be 5-10 players."
      );
    });

    it("should assign exactly one Hitler", () => {
      for (let count = 5; count <= 10; count++) {
        const players = createMockPlayers(count);
        const roles = assignRoles(players);

        const hitlerCount = Object.values(roles).filter(
          (role) => role === "HITLER"
        ).length;
        expect(hitlerCount).toBe(1);
      }
    });

    it("should produce different role assignments on multiple runs", () => {
      const players = createMockPlayers(7);
      const assignments = [];

      for (let i = 0; i < 10; i++) {
        const roles = assignRoles(players);
        assignments.push(JSON.stringify(roles));
      }

      const uniqueAssignments = new Set(assignments);
      expect(uniqueAssignments.size).toBeGreaterThan(1);
    });
  });

  describe("getPartyFromRole", () => {
    it("should return LIBERAL for LIBERAL role", () => {
      expect(getPartyFromRole("LIBERAL")).toBe("LIBERAL");
    });

    it("should return FASCIST for FASCIST role", () => {
      expect(getPartyFromRole("FASCIST")).toBe("FASCIST");
    });

    it("should return FASCIST for HITLER role", () => {
      expect(getPartyFromRole("HITLER")).toBe("FASCIST");
    });
  });

  describe("createGamePlayers", () => {
    it("should convert players to game players with roles", () => {
      const players = createMockPlayers(5);
      const roles = assignRoles(players);

      const gamePlayers = createGamePlayers(players, roles);

      expect(gamePlayers).toHaveLength(5);

      gamePlayers.forEach((player) => {
        expect(player.role).toBeDefined();
        expect(player.party).toBeDefined();
        expect(player.isAlive).toBe(true);

        // Verify party matches role
        if (player.role === "LIBERAL") {
          expect(player.party).toBe("LIBERAL");
        } else {
          expect(player.party).toBe("FASCIST");
        }
      });
    });
  });

  describe("validateRoleAssignment", () => {
    it("should validate correct role assignment for 5 players", () => {
      const players = createMockPlayers(5);
      const roles = assignRoles(players);

      const validation = validateRoleAssignment(roles, 5);
      expect(validation.valid).toBe(true);
    });

    it("should reject invalid role assignment", () => {
      const invalidRoles: Record<string, Role> = {
        "player-0": "LIBERAL",
        "player-1": "LIBERAL",
        "player-2": "LIBERAL",
        "player-3": "LIBERAL",
        "player-4": "LIBERAL",
      };

      const validation = validateRoleAssignment(invalidRoles, 5);
      expect(validation.valid).toBe(false);
      expect(validation.error).toMatch(
        /Expected (3 liberals|1 fascist|1 Hitler), got (5|0|0)/
      );
    });

    it("should reject assignment for wrong player count", () => {
      const players = createMockPlayers(5);
      const roles = assignRoles(players);

      const validation = validateRoleAssignment(roles, 6);
      expect(validation.valid).toBe(false);
    });
  });

  describe("canStartGame", () => {
    it("should allow game start for valid player counts", () => {
      for (let count = 5; count <= 10; count++) {
        const result = canStartGame(count);
        expect(result.canStart).toBe(true);
      }
    });

    it("should reject game start for too few players", () => {
      const result = canStartGame(4);
      expect(result.canStart).toBe(false);
      expect(result.reason).toBe("Need at least 5 players to start");
    });

    it("should reject game start for too many players", () => {
      const result = canStartGame(11);
      expect(result.canStart).toBe(false);
      expect(result.reason).toBe("Maximum 10 players allowed");
    });
  });

  describe("getVisibleInformation (Asymmetric Knowledge)", () => {
    const createGamePlayersWithRoles = (count: number): GamePlayer[] => {
      const players = createMockPlayers(count);
      const roles = assignRoles(players);
      return createGamePlayers(players, roles);
    };

    it("should show Hitler sees Fascists in 5-player game", () => {
      const gamePlayers = createGamePlayersWithRoles(5);
      const hitler = gamePlayers.find((p) => p.role === "HITLER")!;

      const { visibleRoles, visibleParties } = getVisibleInformation(
        hitler.id,
        hitler.role!,
        gamePlayers,
        5
      );

      // Hitler should see themselves and all Fascists
      expect(Object.keys(visibleRoles)).toHaveLength(2); // Hitler + 1 Fascist
      expect(visibleRoles[hitler.id]).toBe("HITLER");

      const fascists = gamePlayers.filter((p) => p.role === "FASCIST");
      fascists.forEach((fascist) => {
        expect(visibleRoles[fascist.id]).toBe("FASCIST");
        expect(visibleParties[fascist.id]).toBe("FASCIST");
      });
    });

    it("should show Hitler does NOT see Fascists in 7-player game", () => {
      const gamePlayers = createGamePlayersWithRoles(7);
      const hitler = gamePlayers.find((p) => p.role === "HITLER")!;

      const { visibleRoles } = getVisibleInformation(
        hitler.id,
        hitler.role!,
        gamePlayers,
        7
      );

      // Hitler should only see themselves in 7+ player games
      expect(Object.keys(visibleRoles)).toHaveLength(1);
      expect(visibleRoles[hitler.id]).toBe("HITLER");
    });

    it("should show Fascists see each other and Hitler", () => {
      const gamePlayers = createGamePlayersWithRoles(7);
      const fascist = gamePlayers.find((p) => p.role === "FASCIST")!;

      const { visibleRoles, visibleParties } = getVisibleInformation(
        fascist.id,
        fascist.role!,
        gamePlayers,
        7
      );

      // Fascist should see themselves, other Fascists, and Hitler
      const expectedVisibleCount = gamePlayers.filter(
        (p) => p.role === "FASCIST" || p.role === "HITLER"
      ).length;

      expect(Object.keys(visibleRoles)).toHaveLength(expectedVisibleCount);

      gamePlayers.forEach((player) => {
        if (player.role === "FASCIST" || player.role === "HITLER") {
          expect(visibleRoles[player.id]).toBe(player.role);
          expect(visibleParties[player.id]).toBe(player.party);
        }
      });
    });

    it("should show Liberals only see themselves", () => {
      const gamePlayers = createGamePlayersWithRoles(7);
      const liberal = gamePlayers.find((p) => p.role === "LIBERAL")!;

      const { visibleRoles } = getVisibleInformation(
        liberal.id,
        liberal.role!,
        gamePlayers,
        7
      );

      // Liberals should only see themselves
      expect(Object.keys(visibleRoles)).toHaveLength(1);
      expect(visibleRoles[liberal.id]).toBe("LIBERAL");
    });

    it("should always show party membership correctly", () => {
      const gamePlayers = createGamePlayersWithRoles(8);

      gamePlayers.forEach((player) => {
        const { visibleParties } = getVisibleInformation(
          player.id,
          player.role!,
          gamePlayers,
          8
        );

        // Party should match role
        if (player.role === "LIBERAL") {
          expect(visibleParties[player.id]).toBe("LIBERAL");
        } else {
          expect(visibleParties[player.id]).toBe("FASCIST");
        }
      });
    });
  });
});
