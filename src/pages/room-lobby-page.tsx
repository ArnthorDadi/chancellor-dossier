import { useParams, useNavigate } from 'react-router-dom'
import { PlayerList } from '@/components/player-list'
import { RoomCodeDisplay } from '@/components/room-code-display'
import { Button } from '@/components/ui/button'
import { useRoom } from '@/hooks/use-room'
import { useAuth } from '@/hooks/use-auth'

export function RoomLobbyPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { room, loading, error } = useRoom(roomId)

  const handleLeaveRoom = () => {
    navigate('/')
  }

  const handleStartGame = () => {
    // This will be implemented later
    console.log('Start game clicked')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-bg">
        <div className="border-4 border-noir-black bg-white p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-liberal-blue mx-auto"></div>
          <p className="mt-4 font-courier text-sm">Loading room...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-bg">
        <div className="border-4 border-fascist-red bg-white p-8 shadow-2xl max-w-md mx-4">
          <h2 className="font-special-elite text-xl text-fascist-red mb-4 text-center">
            ROOM NOT FOUND
          </h2>
          <p className="font-courier text-sm text-noir-black/70 mb-6 text-center">
            {error || 'The room could not be found. Please check the room code and try again.'}
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="w-full bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold border-2 border-noir-black"
          >
            BACK TO HOME
          </Button>
        </div>
      </div>
    )
  }

  const players = Object.values(room.players || {})
  const playerCount = players.length
  const isAdmin = user?.uid === room.metadata?.adminId
  const canStartGame = playerCount >= 5 && players.every(p => p.isReady)

  return (
    <div className="min-h-screen bg-parchment-bg text-noir-black">
      {/* Subtle paper texture background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" 
             style={{ 
               backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b-8 border-noir-black pb-4 bg-white/50 backdrop-blur-sm pt-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-2xl md:text-3xl tracking-tight">
                  ROOM LOBBY
                </h1>
                <p className="font-courier text-sm text-noir-black/70">
                  Waiting for players to join...
                </p>
              </div>
              <Button 
                onClick={handleLeaveRoom}
                variant="outline"
                className="bg-fascist-red hover:bg-fascist-red/90 text-white border-2 border-noir-black"
              >
                LEAVE ROOM
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Room Code Display */}
            <RoomCodeDisplay roomCode={roomId || ''} />

            {/* Player List */}
            <PlayerList roomId={roomId} />

            {/* Game Controls */}
            <div className="border-4 border-noir-black bg-white p-6 shadow-2xl">
              <div className="text-center space-y-4">
                {isAdmin ? (
                  <>
                    <h3 className="font-bold text-lg">GAME CONTROLS</h3>
                    {playerCount < 5 ? (
                      <div className="border-2 border-fascist-red bg-fascist-red/10 p-4">
                        <p className="font-courier text-sm text-fascist-red">
                          Need at least 5 players to start (currently {playerCount})
                        </p>
                      </div>
                    ) : !canStartGame ? (
                      <div className="border-2 border-yellow-400 bg-yellow-100 p-4">
                        <p className="font-courier text-sm text-yellow-800">
                          Waiting for all players to be ready...
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleStartGame}
                        className="bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold px-8 py-4 border-2 border-noir-black"
                      >
                        START GAME
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg">WAITING FOR ADMIN</h3>
                    <p className="font-courier text-sm text-noir-black/70">
                      The room admin will start the game when ready
                    </p>
                    {playerCount < 5 && (
                      <div className="border-2 border-fascist-red bg-fascist-red/10 p-4">
                        <p className="font-courier text-sm text-fascist-red">
                          Need at least 5 players to start (currently {playerCount})
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}