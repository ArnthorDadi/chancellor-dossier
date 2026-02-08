import { getDatabase, ref, set, get, update, remove, onValue } from 'firebase/database'
import { initializeApp } from 'firebase/app'

// Initialize Realtime Database
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}, 'chancellor-dossier-database')

export const database = getDatabase(app)

/**
 * Generate a short room code (4-6 alphanumeric characters)
 */
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const length = Math.floor(Math.random() * 3) + 4 // 4-6 characters
  let code = ''
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

/**
 * Check if a room code is already in use
 */
export const isRoomCodeTaken = async (code: string): Promise<boolean> => {
  const roomRef = ref(database, `rooms/${code}`)
  const snapshot = await get(roomRef)
  return snapshot.exists()
}

/**
 * Generate a unique room code
 */
export const generateUniqueRoomCode = async (): Promise<string> => {
  let code: string
  let attempts = 0
  const maxAttempts = 10

  do {
    code = generateRoomCode()
    attempts++
    
    if (attempts > maxAttempts) {
      throw new Error('Failed to generate unique room code after maximum attempts')
    }
  } while (await isRoomCodeTaken(code || ''))

  return code!
}

/**
 * Database path helpers
 */
export const dbPaths = {
  room: (roomId: string) => `rooms/${roomId}`,
  roomMetadata: (roomId: string) => `rooms/${roomId}/metadata`,
  roomPlayers: (roomId: string) => `rooms/${roomId}/players`,
  roomRoles: (roomId: string) => `rooms/${roomId}/roles`,
  roomInvestigations: (roomId: string) => `rooms/${roomId}/investigations`,
  player: (roomId: string, playerId: string) => `rooms/${roomId}/players/${playerId}`,
  role: (roomId: string, playerId: string) => `rooms/${roomId}/roles/${playerId}`,
  investigation: (roomId: string, targetId: string) => `rooms/${roomId}/investigations/${targetId}`
}

/**
 * Subscribe to room changes
 */
export const subscribeToRoom = (
  roomId: string, 
  callback: (snapshot: any) => void
) => {
  const roomRef = ref(database, dbPaths.room(roomId))
  return onValue(roomRef, callback)
}

/**
 * Subscribe to specific room data
 */
export const subscribeToRoomMetadata = (
  roomId: string, 
  callback: (metadata: any) => void
) => {
  const metadataRef = ref(database, dbPaths.roomMetadata(roomId))
  return onValue(metadataRef, (snapshot) => {
    callback(snapshot.val())
  })
}

export const subscribeToRoomPlayers = (
  roomId: string, 
  callback: (players: any) => void
) => {
  const playersRef = ref(database, dbPaths.roomPlayers(roomId))
  return onValue(playersRef, (snapshot) => {
    callback(snapshot.val())
  })
}

export const subscribeToRoomRoles = (
  roomId: string, 
  callback: (roles: any) => void
) => {
  const rolesRef = ref(database, dbPaths.roomRoles(roomId))
  return onValue(rolesRef, (snapshot) => {
    callback(snapshot.val())
  })
}

/**
 * Set data operations
 */
export const createRoom = async (roomId: string, roomData: any): Promise<void> => {
  const roomRef = ref(database, dbPaths.room(roomId))
  await set(roomRef, roomData)
}

export const updateRoomMetadata = async (
  roomId: string, 
  metadata: any
): Promise<void> => {
  const metadataRef = ref(database, dbPaths.roomMetadata(roomId))
  await update(metadataRef, metadata)
}

export const updatePlayer = async (
  roomId: string, 
  playerId: string, 
  playerData: any
): Promise<void> => {
  const playerRef = ref(database, dbPaths.player(roomId, playerId))
  await update(playerRef, playerData)
}

export const addPlayerToRoom = async (
  roomId: string, 
  playerId: string, 
  playerData: any
): Promise<void> => {
  const playerRef = ref(database, dbPaths.player(roomId, playerId))
  await set(playerRef, playerData)
}

export const assignRoles = async (
  roomId: string, 
  roles: Record<string, any>
): Promise<void> => {
  const rolesRef = ref(database, dbPaths.roomRoles(roomId))
  await set(rolesRef, roles)
}

export const storeInvestigation = async (
  roomId: string,
  targetId: string,
  investigationData: any
): Promise<void> => {
  const investigationRef = ref(database, dbPaths.investigation(roomId, targetId))
  await set(investigationRef, investigationData)
}

/**
 * Get data operations
 */
export const getRoom = async (roomId: string) => {
  const roomRef = ref(database, dbPaths.room(roomId))
  const snapshot = await get(roomRef)
  return snapshot.exists() ? snapshot.val() : null
}

export const getRoomMetadata = async (roomId: string) => {
  const metadataRef = ref(database, dbPaths.roomMetadata(roomId))
  const snapshot = await get(metadataRef)
  return snapshot.exists() ? snapshot.val() : null
}

export const getRoomPlayers = async (roomId: string) => {
  const playersRef = ref(database, dbPaths.roomPlayers(roomId))
  const snapshot = await get(playersRef)
  return snapshot.exists() ? snapshot.val() : {}
}

export const getRoomRoles = async (roomId: string) => {
  const rolesRef = ref(database, dbPaths.roomRoles(roomId))
  const snapshot = await get(rolesRef)
  return snapshot.exists() ? snapshot.val() : {}
}

/**
 * Delete operations
 */
export const removePlayer = async (roomId: string, playerId: string): Promise<void> => {
  const playerRef = ref(database, dbPaths.player(roomId, playerId))
  await remove(playerRef)
}

export const deleteRoom = async (roomId: string): Promise<void> => {
  const roomRef = ref(database, dbPaths.room(roomId))
  await remove(roomRef)
}

/**
 * Initialize database schema for a new room
 */
export const initializeRoomSchema = async (
  roomId: string,
  adminId: string,
  roomName?: string
): Promise<void> => {
  const roomSchema = {
    metadata: {
      status: 'LOBBY',
      adminId,
      createdAt: new Date().toISOString(),
      roomName: roomName || `Room ${roomId}`,
      enactedLiberalPolicies: 0,
      enactedFascistPolicies: 0,
      electionTracker: 0,
      startingPlayerId: null
    },
    players: {},
    roles: {},
    investigations: {}
  }

  await createRoom(roomId, roomSchema)
}

/**
 * Validate that database schema is properly initialized
 */
export const validateRoomSchema = async (roomId: string): Promise<boolean> => {
  const room = await getRoom(roomId)
  if (!room) return false

  const { metadata, players, roles, investigations } = room
  
  // Check required metadata fields
  const requiredMetadataFields = ['status', 'adminId', 'createdAt', 'roomName']
  const hasValidMetadata = metadata && requiredMetadataFields.every(field => 
    metadata[field] !== undefined && metadata[field] !== null
  )

  // Check that all required sections exist
  return hasValidMetadata && 
         typeof players === 'object' && 
         typeof roles === 'object' && 
         typeof investigations === 'object'
}

/**
 * Reset room for new game
 */
export const resetRoom = async (roomId: string): Promise<void> => {
  const updates: any = {
    [dbPaths.roomMetadata(roomId)]: {
      status: 'LOBBY',
      enactedLiberalPolicies: 0,
      enactedFascistPolicies: 0,
      electionTracker: 0
    }
  }

  // Clear roles and investigations
  updates[dbPaths.roomRoles(roomId)] = null
  updates[dbPaths.roomInvestigations(roomId)] = null

  // Reset player game states
  const players = await getRoomPlayers(roomId)
  Object.keys(players).forEach(playerId => {
    updates[dbPaths.player(roomId, playerId)] = {
      ...players[playerId],
      isReady: false
    }
  })

  const roomRef = ref(database, dbPaths.room(roomId))
  await update(roomRef, updates)
}