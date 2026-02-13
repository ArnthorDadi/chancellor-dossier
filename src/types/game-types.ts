export type GameStatus =
  | "LOBBY"
  | "ROLE_REVEAL"
  | "VOTING"
  | "LEGISLATIVE"
  | "EXECUTIVE_ACTION"
  | "GAME_OVER";

export type Role = "LIBERAL" | "FASCIST" | "HITLER";
export type Party = "LIBERAL" | "FASCIST";

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isReady: boolean;
  joinedAt: number;
}

export interface GamePlayer extends Player {
  role?: Role;
  party: Party;
  isAlive: boolean;
}

export interface RoomMetadata {
  status: GameStatus;
  adminId: string;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  startingPlayerId?: string;
  currentPresidentId?: string;
  currentChancellorId?: string;
  enactedLiberalPolicies: number;
  enactedFascistPolicies: number;
  electionTracker: number;
}

export interface Room {
  id: string;
  metadata: RoomMetadata;
  players: Record<string, Player>;
  roles?: Record<string, Role>; // Secret data, only accessible to specific players
  investigations?: Record<string, InvestigationResultData>; // President-only access
}

export interface InvestigationResultData {
  investigationId: string;
  result: Party;
  investigatedBy: string;
  investigatedAt: number;
  targetId: string;
}

export interface RoleDistribution {
  liberals: number;
  fascists: number;
  hitler: number;
}

export interface GameReset {
  resetBy: string;
  resetAt: number;
  reason: "GAME_OVER" | "ADMIN_REQUEST" | "CONSENSUS";
}

export interface RoomState {
  room: Room | null;
  loading: boolean;
  error: string | null;
  isPlayerInRoom: boolean;
  currentPlayerRole?: Role;
  currentPlayerParty?: Party;
}

// Game rules based on player count
export const ROLE_DISTRIBUTION: Record<number, RoleDistribution> = {
  5: { liberals: 3, fascists: 1, hitler: 1 },
  6: { liberals: 4, fascists: 1, hitler: 1 },
  7: { liberals: 4, fascists: 2, hitler: 1 },
  8: { liberals: 5, fascists: 2, hitler: 1 },
  9: { liberals: 5, fascists: 3, hitler: 1 },
  10: { liberals: 6, fascists: 3, hitler: 1 },
};

// Knowledge rules for asymmetric information
export interface KnowledgeRules {
  hitlerKnowsFascists: boolean; // True for < 7 players, false for >= 7 players
  fascistsKnowHitler: boolean;
  fascistsKnowEachOther: boolean;
}

export const getKnowledgeRules = (playerCount: number): KnowledgeRules => ({
  hitlerKnowsFascists: playerCount < 7,
  fascistsKnowHitler: true,
  fascistsKnowEachOther: true,
});

// Win conditions
export interface WinCondition {
  type:
    | "LIBERAL_POLICY"
    | "FASCIST_POLICY"
    | "HITLER_ELECTED"
    | "HITLER_KILLED";
  winner: "LIBERAL" | "FASCIST";
  description: string;
}

export const LIBERAL_POLICY_WIN = 5;
export const FASCIST_POLICY_WIN = 6;
