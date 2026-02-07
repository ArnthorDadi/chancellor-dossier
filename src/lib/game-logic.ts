import type { Role, Party, Player, GamePlayer } from '@/types/game-types'
import { ROLE_DISTRIBUTION } from '@/types/game-types'

/**
 * Assigns roles to players based on player count
 * Follows Secret Hitler role distribution rules
 */
export const assignRoles = (players: Player[]): Record<string, Role> => {
  const playerCount = players.length
  const distribution = ROLE_DISTRIBUTION[playerCount]
  
  if (!distribution) {
    throw new Error(`Invalid player count: ${playerCount}. Must be 5-10 players.`)
  }

  // Create role array based on distribution
  const roles: Role[] = []
  
  // Add Liberals
  for (let i = 0; i < distribution.liberals; i++) {
    roles.push('LIBERAL')
  }
  
  // Add Fascists
  for (let i = 0; i < distribution.fascists; i++) {
    roles.push('FASCIST')
  }
  
  // Add Hitler
  roles.push('HITLER')

  // Shuffle roles using Fisher-Yates algorithm
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[roles[i], roles[j]] = [roles[j], roles[i]]
  }

  // Assign roles to players
  const roleAssignment: Record<string, Role> = {}
  players.forEach((player, index) => {
    roleAssignment[player.id] = roles[index]
  })

  return roleAssignment
}

/**
 * Gets party membership for a role
 */
export const getPartyFromRole = (role: Role): Party => {
  return role === 'LIBERAL' ? 'LIBERAL' : 'FASCIST'
}

/**
 * Converts players to game players with roles
 */
export const createGamePlayers = (
  players: Player[], 
  roles: Record<string, Role>
): GamePlayer[] => {
  return players.map(player => ({
    ...player,
    role: roles[player.id],
    party: getPartyFromRole(roles[player.id]),
    isAlive: true
  }))
}

/**
 * Validates that role assignment follows game rules
 */
export const validateRoleAssignment = (
  roles: Record<string, Role>, 
  playerCount: number
): { valid: boolean; error?: string } => {
  const distribution = ROLE_DISTRIBUTION[playerCount]
  
  if (!distribution) {
    return { valid: false, error: `Invalid player count: ${playerCount}` }
  }

  const roleCounts = Object.values(roles).reduce((acc, role) => {
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {} as Record<Role, number>)

  if (roleCounts.LIBERAL !== distribution.liberals) {
    return { 
      valid: false, 
      error: `Expected ${distribution.liberals} liberals, got ${roleCounts.LIBERAL || 0}` 
    }
  }

  if (roleCounts.FASCIST !== distribution.fascists) {
    return { 
      valid: false, 
      error: `Expected ${distribution.fascists} fascists, got ${roleCounts.FASCIST || 0}` 
    }
  }

  if (roleCounts.HITLER !== distribution.hitler) {
    return { 
      valid: false, 
      error: `Expected ${distribution.hitler} Hitler, got ${roleCounts.HITLER || 0}` 
    }
  }

  return { valid: true }
}

/**
 * Checks if game can start with given player count
 */
export const canStartGame = (playerCount: number): { canStart: boolean; reason?: string } => {
  if (playerCount < 5) {
    return { canStart: false, reason: 'Need at least 5 players to start' }
  }
  
  if (playerCount > 10) {
    return { canStart: false, reason: 'Maximum 10 players allowed' }
  }

  return { canStart: true }
}

/**
 * Gets next president based on current president and player order
 */
export const getNextPresident = (
  currentPresidentId: string, 
  players: Player[]
): string => {
  const currentIndex = players.findIndex(p => p.id === currentPresidentId)
  const nextIndex = (currentIndex + 1) % players.length
  return players[nextIndex].id
}

/**
 * Validates game state transitions
 */
export const isValidStateTransition = (
  fromState: string, 
  toState: string
): boolean => {
  const validTransitions: Record<string, string[]> = {
    'LOBBY': ['ROLE_REVEAL'],
    'ROLE_REVEAL': ['VOTING'],
    'VOTING': ['LEGISLATIVE', 'VOTING'], // Can stay in voting if election fails
    'LEGISLATIVE': ['EXECUTIVE_ACTION', 'VOTING'],
    'EXECUTIVE_ACTION': ['VOTING', 'GAME_OVER'],
    'GAME_OVER': ['LOBBY'] // Reset to lobby for new game
  }

  return validTransitions[fromState]?.includes(toState) || false
}

/**
 * Determines which players a player can see information about
 * based on asymmetric information rules
 */
export const getVisibleInformation = (
  playerId: string,
  playerRole: Role,
  allPlayers: GamePlayer[],
  playerCount: number
): {
  visibleRoles: Record<string, Role>
  visibleParties: Record<string, Party>
} => {
  const visibleRoles: Record<string, Role> = {}
  const visibleParties: Record<string, Party> = {}

  // Players always see their own role and party
  visibleRoles[playerId] = playerRole
  visibleParties[playerId] = getPartyFromRole(playerRole)

  // Fascists see each other and Hitler
  if (playerRole === 'FASCIST') {
    allPlayers.forEach(player => {
      if (player.role === 'FASCIST' || player.role === 'HITLER') {
        visibleRoles[player.id] = player.role!
        visibleParties[player.id] = player.party
      }
    })
  }

  // Hitler sees Fascists if player count < 7
  if (playerRole === 'HITLER' && playerCount < 7) {
    allPlayers.forEach(player => {
      if (player.role === 'FASCIST') {
        visibleRoles[player.id] = player.role!
        visibleParties[player.id] = player.party
      }
    })
  }

  return { visibleRoles, visibleParties }
}