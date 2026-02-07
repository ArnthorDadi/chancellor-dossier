import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './use-auth'
import { useRoom } from './use-room'
import { getVisibleInformation } from '@/lib/game-logic'
import type { Room, GamePlayer, Role, Party, GameStatus } from '@/types/game-types'

export interface UseGameStateReturn {
  // Game state
  room: Room | null
  gameStatus: GameStatus | null
  currentPhase: string
  
  // Player information
  currentPlayer: GamePlayer | null
  currentPlayerRole: Role | undefined
  currentPlayerParty: Party | undefined
  isPresident: boolean
  isChancellor: boolean
  isAdmin: boolean
  
  // Game information
  allPlayers: GamePlayer[]
  visibleRoles: Record<string, Role>
  visibleParties: Record<string, Party>
  enactedPolicies: { liberal: number; fascist: number }
  
  // Game actions
  resetGame: (reason?: 'GAME_OVER' | 'ADMIN_REQUEST' | 'CONSENSUS') => Promise<void>
  
  // States
  loading: boolean
  error: string | null
}

export const useGameState = (roomId?: string): UseGameStateReturn => {
  const { user } = useAuth()
  const roomHook = useRoom(roomId)
  
  const [visibleRoles, setVisibleRoles] = useState<Record<string, Role>>({})
  const [visibleParties, setVisibleParties] = useState<Record<string, Party>>({})
  const [allPlayers, setAllPlayers] = useState<GamePlayer[]>([])

  // Extract game state from room
  const room = roomHook.room
  const gameStatus = room?.metadata?.status || null
  const loading = roomHook.loading
  const error = roomHook.error

  // Current player information
  const currentPlayer = room && user ? {
    ...room.players[user.uid],
    role: room.roles?.[user.uid],
    party: (room.roles?.[user.uid] === 'LIBERAL' ? 'LIBERAL' : 'FASCIST') as Party,
    isAlive: true
  } as GamePlayer : null

  const currentPlayerRole = currentPlayer?.role
  const currentPlayerParty = currentPlayer?.party
  const isPresident = room?.metadata?.currentPresidentId === user?.uid
  const isChancellor = room?.metadata?.currentChancellorId === user?.uid
  const isAdmin = room?.metadata?.adminId === user?.uid

  // Enacted policies
  const enactedPolicies = {
    liberal: room?.metadata?.enactedLiberalPolicies || 0,
    fascist: room?.metadata?.enactedFascistPolicies || 0
  }

  // Update visible information when room or player data changes
  useEffect(() => {
    if (!room || !currentPlayerRole || !user) {
      setVisibleRoles({})
      setVisibleParties({})
      setAllPlayers([])
      return
    }

    const players = Object.values(room.players)
    const gamePlayers = players.map(player => ({
      ...player,
      role: room.roles?.[player.id],
      party: (room.roles?.[player.id] === 'LIBERAL' ? 'LIBERAL' : 'FASCIST') as Party,
      isAlive: true
    }))

    setAllPlayers(gamePlayers)

    const visible = getVisibleInformation(
      user.uid,
      currentPlayerRole,
      gamePlayers,
      players.length
    )

    setVisibleRoles(visible.visibleRoles)
    setVisibleParties(visible.visibleParties)
  }, [room, currentPlayerRole, user])

  // Determine current phase for UI
  const getCurrentPhase = useCallback((): string => {
    if (!gameStatus) return 'LOBBY'
    
    switch (gameStatus) {
      case 'LOBBY':
        return 'Waiting for players'
      case 'ROLE_REVEAL':
        return 'Reveal your secret role'
      case 'VOTING':
        return isPresident ? 'Choose your Chancellor' : 'Vote for the government'
      case 'LEGISLATIVE':
        return isPresident ? 'Choose a policy' : 'Chancellor is choosing...'
      case 'EXECUTIVE_ACTION':
        return isPresident ? 'Execute your power' : 'President is acting...'
      case 'GAME_OVER':
        return 'Game Over'
      default:
        return gameStatus
    }
  }, [gameStatus, isPresident])

  const currentPhase = getCurrentPhase()

  // Reset game function
  const resetGame = useCallback(async (
    reason: 'GAME_OVER' | 'ADMIN_REQUEST' | 'CONSENSUS' = 'GAME_OVER'
  ): Promise<void> => {
    await roomHook.resetGame(reason)
  }, [roomHook])

  return {
    // Game state
    room,
    gameStatus,
    currentPhase,
    
    // Player information
    currentPlayer,
    currentPlayerRole,
    currentPlayerParty,
    isPresident,
    isChancellor,
    isAdmin,
    
    // Game information
    allPlayers,
    visibleRoles,
    visibleParties,
    enactedPolicies,
    
    // Game actions
    resetGame,
    
    // States
    loading,
    error
  }
}