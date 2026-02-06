import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { auth, database } from '@/lib/firebase'
import { signInAnonymously, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { ref, set, update, get } from 'firebase/database'
import { useRoom } from '@/hooks/useRoom'
import { dealRoles } from '@/lib/roles'
import { DigitalEnvelope } from '@/components/DigitalEnvelope'
import { RoomCreationModal } from '@/components/RoomCreationModal'
import { generateUniqueRoomCode } from '@/lib/roomCodes'

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [joinRoomInput, setJoinRoomInput] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false)
  const USERNAME_KEY = 'secret-hitler-username'

  const { room } = useRoom(roomId)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomIdFromUrl = urlParams.get('room')
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const storedUsername = localStorage.getItem(USERNAME_KEY)
        if (storedUsername) {
          setUsername(storedUsername)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (username && user) {
      localStorage.setItem(USERNAME_KEY, username)
    } else {
      localStorage.removeItem(USERNAME_KEY)
    }
  }, [username, user])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('username') as HTMLInputElement;
    if (input.value.trim()) {
      try {
        await signInAnonymously(auth)
        setUsername(input.value.trim())
      } catch (error) {
        console.error('Sign-in error:', error)
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setUsername(null)
    } catch (error) {
      console.error('Sign-out error:', error)
    }
  }

  const handleJoinRoom = async (roomIdToJoin: string) => {
    if (!user || !username) {
      console.error('Cannot join room: missing user or username', { user: !!user, username })
      return
    }
    
    console.log('Joining room...', { roomId: roomIdToJoin, userId: user.uid, username })
    
    try {
      const playersRef = ref(database, `rooms/${roomIdToJoin}/players/${user.uid}`)
      await set(playersRef, {
        name: username,
        joinedAt: new Date().toISOString()
      })
      
      console.log('Successfully joined room')
      
      setRoomId(roomIdToJoin)
      
      // Update URL without page reload
      const url = new URL(window.location.href)
      url.searchParams.set('room', roomIdToJoin)
      window.history.pushState({}, '', url.toString())
    } catch (error) {
      console.error('Error joining room:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to join room')
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  const checkRoomExists = async (roomCode: string): Promise<boolean> => {
    const roomRef = ref(database, `rooms/${roomCode}`)
    const snapshot = await get(roomRef)
    return snapshot.exists()
  }

  const handleCreateRoom = async (): Promise<string> => {
    if (!user || !username) {
      throw new Error('Missing user or username')
    }
    
    console.log('Creating room...', { userId: user.uid, username })
    
    try {
      // Generate unique human-readable room code
      const roomCode = await generateUniqueRoomCode(checkRoomExists)
      console.log('Generated room code:', roomCode)
      
      // Initialize room with metadata
      await set(ref(database, `rooms/${roomCode}/metadata`), {
        status: 'LOBBY',
        adminId: user.uid,
        createdAt: new Date().toISOString()
      })
      
      console.log('Room metadata set')
      
      // Add admin as first player
      await set(ref(database, `rooms/${roomCode}/players/${user.uid}`), {
        name: username,
        isAdmin: true,
        joinedAt: new Date().toISOString()
      })
      
      console.log('Admin player added to room')
      
      setRoomId(roomCode)
      
      // Update URL
      const url = new URL(window.location.href)
      url.searchParams.set('room', roomCode)
      window.history.pushState({}, '', url.toString())
      
      console.log('Room creation completed successfully')
      return roomCode
    } catch (error) {
      console.error('Error creating room:', error)
      throw error instanceof Error ? error : new Error('Failed to create room')
    }
  }

  const handleDealRoles = async () => {
    if (!room || !user || !username) return
    
    const isAdmin = room.metadata?.adminId === user.uid
    if (!isAdmin) {
      console.error('Only admin can deal roles')
      return
    }

    const playerIds = Object.keys(room.players || {})
    if (playerIds.length < 5 || playerIds.length > 10) {
      console.error('Need 5-10 players to deal roles')
      return
    }

    try {
      await dealRoles(roomId!, playerIds)
      
      // Update room status to ROLE_REVEAL
      await update(ref(database, `rooms/${roomId}/metadata`), {
        status: 'ROLE_REVEAL'
      })
    } catch (error) {
      console.error('Error dealing roles:', error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8">
          Chancellor Dossier
        </h1>

        {!username ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSignIn} className="flex flex-col items-center gap-4">
              <Input
                type="text"
                name="username"
                placeholder="Enter your username"
                className="max-w-xs text-center"
                required
              />
              <Button type="submit">Sign In as Guest</Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                {errorMessage}
              </div>
            )}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xl text-slate-700 dark:text-slate-300">
                  Welcome, <span className="font-semibold">{username}</span>!
                </p>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
              
              {roomId ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                      Room: {roomId}
                    </h2>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {room?.metadata?.status || 'Unknown'}
                    </div>
                  </div>
                  
                  {room?.players && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-slate-700 dark:text-slate-300">Players ({Object.keys(room.players).length}):</h3>
                      <div className="grid gap-2">
                        {Object.entries(room.players).map(([playerId, player]) => (
                          <div key={playerId} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                            <span className="text-slate-800 dark:text-slate-200">{player.name}</span>
                            {player.isAdmin && <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">Admin</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Controls */}
                  {room?.metadata?.adminId === user?.uid && room?.metadata?.status === 'LOBBY' && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-slate-700 dark:text-slate-300">Admin Controls</h3>
                      {Object.keys(room.players || {}).length >= 5 && Object.keys(room.players || {}).length <= 10 ? (
                        <Button onClick={handleDealRoles} className="w-full">
                          Deal Roles ({Object.keys(room.players || {}).length} players)
                        </Button>
                      ) : (
                        <div className="text-sm text-slate-600 dark:text-slate-400 text-center p-3 bg-slate-100 dark:bg-slate-700 rounded">
                          Need 5-10 players to deal roles (currently {Object.keys(room.players || {}).length})
                        </div>
                      )}
                    </div>
                  )}

                  {/* Role Reveal */}
                  {room?.metadata?.status === 'ROLE_REVEAL' && room?.roles && (
                    <DigitalEnvelope roomId={roomId!} />
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter room ID to join"
                      value={joinRoomInput}
                      onChange={(e) => setJoinRoomInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => handleJoinRoom(joinRoomInput)} disabled={!joinRoomInput.trim()}>
                      Join Room
                    </Button>
                  </div>
                  
                  <div className="text-center text-slate-600 dark:text-slate-400">or</div>
                  
                  <Button onClick={() => setIsCreateRoomModalOpen(true)} className="w-full" variant="secondary">
                    Create New Room
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Room Creation Modal */}
        <RoomCreationModal
          isOpen={isCreateRoomModalOpen}
          onClose={() => setIsCreateRoomModalOpen(false)}
          onCreateRoom={handleCreateRoom}
          username={username || ''}
        />
      </div>
    </div>
  )
}

export default App
