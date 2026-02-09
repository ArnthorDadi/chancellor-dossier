import { useState, useCallback } from 'react'
import { generateUniqueRoomCode, isRoomCodeTaken } from '@/lib/realtime-database'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'

export interface UseRoomCodeReturn {
  generateCode: () => Promise<string>
  validateCode: (code: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export const useRoomCode = (): UseRoomCodeReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCode = useCallback(async (): Promise<string> => {
    setLoading(true)
    setError(null)
    
    try {
      const code = await generateUniqueRoomCode()
      return code
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate room code'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const validateCode = useCallback(async (code: string): Promise<boolean> => {
    if (!code || code.trim().length === 0) {
      return false
    }

    setLoading(true)
    setError(null)
    
    try {
      // Normalize code to uppercase
      const normalizedCode = code.trim().toUpperCase()
      const isTaken = await isRoomCodeTaken(normalizedCode)
      return !isTaken // Return true if code is available (not taken)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate room code'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    generateCode,
    validateCode,
    loading,
    error
  }
}

export interface UseCreateRoomReturn {
  createRoom: () => Promise<{ roomId: string; roomCode: string }>
  loading: boolean
  error: string | null
}

export const useCreateRoom = (): UseCreateRoomReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { generateCode } = useRoomCode()

  const createRoom = useCallback(async (): Promise<{ roomId: string; roomCode: string }> => {
    if (!user) {
      throw new Error('User must be authenticated to create a room')
    }

    setLoading(true)
    setError(null)
    
    try {
      // Generate unique room code
      const roomCode = await generateCode()
      
      // Create room with existing database schema
      const { initializeRoomSchema } = await import('@/lib/realtime-database')
      await initializeRoomSchema(roomCode, user.uid)
      
      // Navigate to the room lobby
      navigate(`/room/${roomCode}`)
      
      return { roomId: roomCode, roomCode }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, generateCode, navigate])

  return {
    createRoom,
    loading,
    error
  }
}

export interface UseJoinRoomReturn {
  joinRoom: (roomCode: string) => Promise<void>
  loading: boolean
  error: string | null
}

export const useJoinRoom = (): UseJoinRoomReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const joinRoom = useCallback(async (roomCode: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to join a room')
    }

    if (!roomCode || roomCode.trim().length === 0) {
      throw new Error('Room code is required')
    }

    setLoading(true)
    setError(null)
    
    try {
      // Normalize room code
      const normalizedCode = roomCode.trim().toUpperCase()
      
      // Check if room exists
      const { getRoom, addPlayerToRoom } = await import('@/lib/realtime-database')
      const room = await getRoom(normalizedCode)
      
      if (!room) {
        throw new Error('Room not found. Please check the room code and try again.')
      }

      // Check if room is in lobby status
      if (room.metadata?.status !== 'LOBBY') {
        throw new Error('Cannot join room. Game has already started.')
      }

      // Check if player is already in the room
      if (room.players?.[user.uid]) {
        // Player is already in the room, just navigate
        navigate(`/room/${normalizedCode}`)
        return
      }

      // Add player to room
      const playerData = {
        id: user.uid,
        name: 'Anonymous Player',
        isReady: false,
        joinedAt: new Date().toISOString()
      }
      
      await addPlayerToRoom(normalizedCode, user.uid, playerData)
      
      // Navigate to the room lobby
      navigate(`/room/${normalizedCode}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join room'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, navigate])

  return {
    joinRoom,
    loading,
    error
  }
}