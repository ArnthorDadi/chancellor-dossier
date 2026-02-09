import { useState, useCallback } from 'react'
import { 
  generateUniqueRoomCode, 
  createRoom, 
  getRoom, 
  addPlayerToRoom,
  removePlayer,
  updatePlayer,
  updateRoomMetadata,
  deleteRoom,
  resetRoom,
  assignRoles,
  storeInvestigation,
  subscribeToRoom
} from '@/lib/realtime-database'
import type { Room } from '@/types/game-types'
import { assignRoles as assignGameRoles, canStartGame, getPartyFromRole } from '@/lib/game-logic'
import { useAuth } from './use-auth'

export interface UseRoomReturn {
  // Room creation and joining
  createNewRoom: (roomName?: string) => Promise<string>
  joinRoom: (roomId: string, playerName: string) => Promise<void>
  leaveRoom: () => Promise<void>
   
  // Room state
  room: Room | null
  loading: boolean
  error: string | null
  isPlayerInRoom: boolean
   
  // Admin functions
  startGame: () => Promise<void>
  resetGame: (reason?: 'GAME_OVER' | 'ADMIN_REQUEST' | 'CONSENSUS') => Promise<void>
  removePlayerFromRoom: (playerId: string) => Promise<void>
  transferAdmin: (playerId: string) => Promise<void>
   
  // Player functions
  setPlayerReady: (ready: boolean) => Promise<void>
  updatePlayerName: (name: string) => Promise<void>
   
  // Investigation functions
  investigatePlayer: (targetId: string) => Promise<void>
   
  // Cleanup
  cleanup: () => void
}

export const useRoom = (roomId?: string): UseRoomReturn => {
  const { user } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<(() => void)[]>([])

  const isPlayerInRoom = user && room && room.players ? user.uid in room.players : false

  // Subscribe to room updates
  const subscribeToRoomUpdates = useCallback((targetRoomId: string) => {
    if (!targetRoomId) return

    const unsubscribers: (() => void)[] = []

    // Subscribe to full room data
    const roomUnsub = subscribeToRoom(targetRoomId, (snapshot) => {
      const roomData = snapshot.val()
      setRoom(roomData)
    })
    unsubscribers.push(roomUnsub)

    setSubscriptions(prev => [...prev, ...unsubscribers])
  }, [])

  // Create a new room
  const createNewRoom = useCallback(async (roomName?: string): Promise<string> => {
    if (!user) {
      throw new Error('Must be authenticated to create a room')
    }

    try {
      setLoading(true)
      setError(null)

      const newRoomId = await generateUniqueRoomCode()
      const now = Date.now()

      const newRoom: Room = {
        id: newRoomId,
        metadata: {
          status: 'LOBBY',
          adminId: user.uid,
          createdAt: now,
          enactedLiberalPolicies: 0,
          enactedFascistPolicies: 0,
          electionTracker: 0
        },
        players: {
          [user.uid]: {
            id: user.uid,
            name: roomName || `Player ${user.uid.slice(-4)}`,
            isReady: false,
            joinedAt: now
          }
        }
      }

      await createRoom(newRoomId, newRoom)
      
      // Store current room ID for logout cleanup
      localStorage.setItem(`currentRoom_${user.uid}`, newRoomId)
      
      subscribeToRoomUpdates(newRoomId)
      
      return newRoomId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, subscribeToRoomUpdates])

  // Join an existing room
  const joinRoom = useCallback(async (targetRoomId: string, playerName: string): Promise<void> => {
    if (!user) {
      throw new Error('Must be authenticated to join a room')
    }

    try {
      setLoading(true)
      setError(null)

      // Check if room exists
      const existingRoom = await getRoom(targetRoomId)
      if (!existingRoom) {
        throw new Error('Room not found')
      }

      // Check if room is full or game in progress
      if (existingRoom.metadata.status !== 'LOBBY') {
        throw new Error('Cannot join a game in progress')
      }

      const playerCount = Object.keys(existingRoom.players || {}).length
      if (playerCount >= 10) {
        throw new Error('Room is full')
      }

      // Add player to room
      const now = Date.now()
      await addPlayerToRoom(targetRoomId, user.uid, {
        id: user.uid,
        name: playerName,
        isReady: false,
        joinedAt: now
      })

      // Store current room ID for logout cleanup
      localStorage.setItem(`currentRoom_${user.uid}`, targetRoomId)

      subscribeToRoomUpdates(targetRoomId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join room'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, subscribeToRoomUpdates])

  // Leave current room
  const leaveRoom = useCallback(async (): Promise<void> => {
    if (!room || !user) return

    try {
      await removePlayer(room.id, user.uid)

      // If admin leaves and there are other players, transfer admin
      if (room.metadata.adminId === user.uid) {
        const remainingPlayers = Object.entries(room.players || {})
          .filter(([id]) => id !== user.uid)
        
        if (remainingPlayers.length > 0) {
          const newAdminId = remainingPlayers[0][0]
          await updateRoomMetadata(room.id, { adminId: newAdminId })
        } else {
          // Last player, delete the room
          await deleteRoom(room.id)
        }
      }

      // Clear current room ID from localStorage
      localStorage.removeItem(`currentRoom_${user.uid}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave room'
      setError(errorMessage)
      throw err
    }
  }, [room, user])

  // Start the game (admin only)
  const startGame = useCallback(async (): Promise<void> => {
    if (!room || !user) {
      throw new Error('No room or user')
    }

    if (room.metadata.adminId !== user.uid) {
      throw new Error('Only admin can start the game')
    }

    const players = Object.values(room.players || {})
    const canStart = canStartGame(players.length)
    
    if (!canStart.canStart) {
      throw new Error(canStart.reason || 'Cannot start game')
    }

    try {
      // Assign roles
      const roleAssignment = assignGameRoles(players)
      await assignRoles(room.id, roleAssignment)

      // Update room status
      const now = Date.now()
      await updateRoomMetadata(room.id, {
        status: 'ROLE_REVEAL',
        startedAt: now,
        startingPlayerId: players[0].id, // First player as starting president
        currentPresidentId: players[0].id
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start game'
      setError(errorMessage)
      throw err
    }
  }, [room, user])

  // Reset the game
  const resetGame = useCallback(async (
    _reason: 'GAME_OVER' | 'ADMIN_REQUEST' | 'CONSENSUS' = 'GAME_OVER'
  ): Promise<void> => {
    if (!room || !user) {
      throw new Error('No room or user')
    }

    // Only admin can reset, or if game is over anyone can reset
    if (room.metadata.adminId !== user.uid && room.metadata.status !== 'GAME_OVER') {
      throw new Error('Only admin can reset the game')
    }

    try {
      await resetRoom(room.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset game'
      setError(errorMessage)
      throw err
    }
  }, [room, user])

  // Remove player from room (admin only)
  const removePlayerFromRoom = useCallback(async (playerId: string): Promise<void> => {
    if (!room || !user) {
      throw new Error('No room or user')
    }

    if (room.metadata.adminId !== user.uid) {
      throw new Error('Only admin can remove players')
    }

    if (playerId === user.uid) {
      throw new Error('Admin cannot remove themselves')
    }

    try {
      await removePlayer(room.id, playerId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove player'
      setError(errorMessage)
      throw err
    }
  }, [room, user])

  // Transfer admin to another player
  const transferAdmin = useCallback(async (playerId: string): Promise<void> => {
    if (!room || !user) {
      throw new Error('No room or user')
    }

    if (room.metadata.adminId !== user.uid) {
      throw new Error('Only admin can transfer admin rights')
    }

    if (!room.players[playerId]) {
      throw new Error('Player not found in room')
    }

    try {
      await updateRoomMetadata(room.id, { adminId: playerId })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer admin'
      setError(errorMessage)
      throw err
    }
  }, [room, user])

  // Set player ready status
  const setPlayerReady = useCallback(async (ready: boolean): Promise<void> => {
    if (!room || !user) return

    try {
      await updatePlayer(room.id, user.uid, { isReady: ready })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ready status'
      setError(errorMessage)
      throw err
    }
  }, [room, user])

  // Update player name
  const updatePlayerName = useCallback(async (name: string): Promise<void> => {
    if (!room || !user) return

    try {
      await updatePlayer(room.id, user.uid, { name })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update name'
      setError(errorMessage)
      throw err
    }
  }, [room, user])

  // Investigate player (President only)
  const investigatePlayer = useCallback(async (targetId: string): Promise<void> => {
    if (!room || !user) {
      throw new Error('No room or user')
    }

    // Validate current player is President
    if (room.metadata.currentPresidentId !== user.uid) {
      throw new Error('Only President can investigate players')
    }

    // Validate target exists and is not self
    if (!room.players[targetId]) {
      throw new Error('Target player not found')
    }

    if (targetId === user.uid) {
      throw new Error('Cannot investigate yourself')
    }

    // Check if target was already investigated
    if (room.investigations?.[targetId]) {
      throw new Error('Player already investigated')
    }

    // Get target's party membership from roles
    const targetRole = room.roles?.[targetId]
    if (!targetRole) {
      throw new Error('Target role not found - game may not be started')
    }

    const targetParty = getPartyFromRole(targetRole)

    try {
      // Store investigation result scoped to President's user ID
      const investigationData = {
        investigationId: `${user.uid}_${Date.now()}`,
        result: targetParty,
        investigatedBy: user.uid,
        investigatedAt: Date.now(),
        targetId
      }

      await storeInvestigation(room.id, targetId, investigationData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to store investigation'
      setError(errorMessage)
      throw err
    }
  }, [room, user])

  // Cleanup subscriptions
  const cleanup = useCallback(() => {
    subscriptions.forEach(unsub => unsub())
    setSubscriptions([])
  }, [subscriptions])

  // Auto-subscribe if roomId is provided
  if (roomId && !subscriptions.length) {
    subscribeToRoomUpdates(roomId)
  }

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
    setPlayerReady,
    updatePlayerName,
    investigatePlayer,
    cleanup
  }
}