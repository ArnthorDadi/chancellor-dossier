import { useParams, useNavigate } from 'react-router-dom'
import { useGameState } from '@/hooks/use-game-state'
import { useRoom } from '@/hooks/use-room'
import { Button } from '@/components/ui/button'
import { DigitalEnvelope } from '@/components/digital-envelope'
import { InvestigationTargetSelection } from '@/components/investigation-target-selection'

export function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const gameState = useGameState(roomId)
  const roomHook = useRoom(roomId)

  const handleLeaveGame = () => {
    navigate('/')
  }

  if (gameState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-bg">
        <div className="border-4 border-noir-black bg-white p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-liberal-blue mx-auto"></div>
          <p className="mt-4 font-courier text-sm">Loading game...</p>
        </div>
      </div>
    )
  }

  if (gameState.error || !gameState.room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-bg">
        <div className="border-4 border-fascist-red bg-white p-8 shadow-2xl max-w-md mx-4">
          <h2 className="font-special-elite text-xl text-fascist-red mb-4 text-center">
            GAME ERROR
          </h2>
          <p className="font-courier text-sm text-noir-black/70 mb-6 text-center">
            {gameState.error || 'The game could not be loaded.'}
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

  // Show Investigation UI during EXECUTIVE_ACTION phase for President
  if (gameState.gameStatus === 'EXECUTIVE_ACTION' && gameState.isPresident) {
    const alreadyInvestigated = Object.keys(gameState.room?.investigations || {})
    
    return (
      <div className="min-h-screen bg-parchment-bg text-noir-black">
        {/* Paper texture background */}
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
          <header className="border-b-8 border-noir-black pb-4 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-bold text-2xl md:text-3xl tracking-tight">
                    EXECUTIVE ACTION
                  </h1>
                  <p className="font-courier text-sm text-noir-black/70">
                    {gameState.currentPhase}
                  </p>
                </div>
                <Button 
                  onClick={handleLeaveGame}
                  variant="outline"
                  className="bg-fascist-red hover:bg-fascist-red/90 text-white border-2 border-noir-black"
                >
                  LEAVE GAME
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <InvestigationTargetSelection
                players={gameState.allPlayers}
                currentPresidentId={gameState.room?.metadata?.currentPresidentId || ''}
                onInvestigate={roomHook.investigatePlayer}
                loading={roomHook.loading}
                alreadyInvestigated={alreadyInvestigated}
              />
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Show waiting screen for non-Presidents during EXECUTIVE_ACTION
  if (gameState.gameStatus === 'EXECUTIVE_ACTION' && !gameState.isPresident) {
    return (
      <div className="min-h-screen bg-parchment-bg text-noir-black">
        {/* Paper texture background */}
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
          <header className="border-b-8 border-noir-black pb-4 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-bold text-2xl md:text-3xl tracking-tight">
                    EXECUTIVE ACTION
                  </h1>
                  <p className="font-courier text-sm text-noir-black/70">
                    {gameState.currentPhase}
                  </p>
                </div>
                <Button 
                  onClick={handleLeaveGame}
                  variant="outline"
                  className="bg-fascist-red hover:bg-fascist-red/90 text-white border-2 border-noir-black"
                >
                  LEAVE GAME
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div className="border-4 border-noir-black bg-white p-8 shadow-2xl text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-liberal-blue rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-liberal-blue"></div>
                  </div>
                  <h2 className="font-special-elite text-2xl text-liberal-blue mb-4">
                    PRESIDENT ACTING
                  </h2>
                  <p className="font-courier text-sm text-noir-black/70 mb-2">
                    The President is using their executive power
                  </p>
                  <p className="font-courier text-xs text-noir-black/60">
                    Please wait for the President to complete their action...
                  </p>
                </div>
                
                <div className="border-2 border-noir-black/20 bg-vintage-cream p-4 rounded-lg">
                  <h3 className="font-bold text-sm mb-2 text-liberal-blue">CURRENT STATUS:</h3>
                  <div className="font-courier text-xs space-y-1 text-noir-black/70">
                    <p>• Game Phase: Executive Action</p>
                    <p>• President: {gameState.allPlayers.find(p => p.id === gameState.room?.metadata?.currentPresidentId)?.name || 'Unknown'}</p>
                    <p>• Enacted Policies: {gameState.enactedPolicies.liberal} Liberal, {gameState.enactedPolicies.fascist} Fascist</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Show Digital Envelope during role reveal phase
  if (gameState.gameStatus === 'ROLE_REVEAL' && gameState.currentPlayerRole && gameState.currentPlayerParty) {
    return (
      <div className="min-h-screen bg-parchment-bg text-noir-black">
        {/* Paper texture background */}
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
          <header className="border-b-8 border-noir-black pb-4 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 text-center">
              <div className="inline-block">
                <h1 className="font-bold text-2xl md:text-3xl tracking-tight">
                  SECRET HITLER
                </h1>
                <div className="font-bold text-sm md:text-base tracking-wide text-noir-black/70">
                  DIGITAL ENVELOPES
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <h2 className="font-special-elite text-xl text-liberal-blue mb-2">
                  {gameState.currentPhase}
                </h2>
                <p className="font-courier text-sm text-noir-black/60">
                  Your secret identity is enclosed below
                </p>
              </div>
              
              <DigitalEnvelope 
                role={gameState.currentPlayerRole}
                party={gameState.currentPlayerParty}
              />
            </div>
          </main>
        </div>
      </div>
    )
  }

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
                  GAME ROOM
                </h1>
                <p className="font-courier text-sm text-noir-black/70">
                  {gameState.currentPhase}
                </p>
              </div>
              <Button 
                onClick={handleLeaveGame}
                variant="outline"
                className="bg-fascist-red hover:bg-fascist-red/90 text-white border-2 border-noir-black"
              >
                LEAVE GAME
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="border-4 border-noir-black bg-white p-8 shadow-2xl text-center">
              <h2 className="font-special-elite text-2xl text-liberal-blue mb-4">
                GAME IN PROGRESS
              </h2>
              <p className="font-courier text-sm text-noir-black/70 mb-6">
                Game status: {gameState.gameStatus}
              </p>
              <p className="font-courier text-sm text-noir-black/60">
                The game interface will be implemented here.
              </p>
              
              {/* Game info display */}
              <div className="mt-8 space-y-4">
                <div className="border-2 border-noir-black p-4 bg-vintage-cream">
                  <h3 className="font-bold text-sm mb-2">GAME INFO:</h3>
                  <div className="font-courier text-xs space-y-1">
                    <p>Status: {gameState.gameStatus}</p>
                    <p>Players: {gameState.allPlayers.length}</p>
                    <p>Your Role: {gameState.currentPlayerRole || 'Not assigned'}</p>
                    <p>Your Party: {gameState.currentPlayerParty || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}