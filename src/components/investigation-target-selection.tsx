import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { GamePlayer } from '@/types/game-types'

interface InvestigationTargetSelectionProps {
  players: GamePlayer[]
  currentPresidentId: string
  onInvestigate: (targetId: string) => Promise<void>
  loading?: boolean
  alreadyInvestigated?: string[]
}

export function InvestigationTargetSelection({
  players,
  currentPresidentId,
  onInvestigate,
  loading = false,
  alreadyInvestigated = []
}: InvestigationTargetSelectionProps) {
  const [investigating, setInvestigating] = useState(false)

  const handleInvestigate = async (targetId: string) => {
    if (loading || investigating) return
    
    setInvestigating(true)
    try {
      await onInvestigate(targetId)
    } catch (error) {
      console.error('Investigation failed:', error)
    } finally {
      setInvestigating(false)
    }
  }

  const canInvestigate = (player: GamePlayer): boolean => {
    // Cannot investigate self
    if (player.id === currentPresidentId) return false
    
    // Cannot investigate already investigated players
    if (alreadyInvestigated.includes(player.id)) return false
    
    // Can investigate all other players
    return true
  }

  const getInvestigationStatus = (player: GamePlayer): string => {
    if (player.id === currentPresidentId) return 'Cannot investigate self'
    if (alreadyInvestigated.includes(player.id)) return 'Already investigated'
    return 'Eligible for investigation'
  }

  return (
    <div className="border-4 border-noir-black bg-white p-6 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="font-special-elite text-2xl text-liberal-blue mb-2">
          INVESTIGATION POWER
        </h2>
        <p className="font-courier text-sm text-noir-black/70">
          As President, you may investigate one player's party membership
        </p>
      </div>

      <div className="space-y-3">
        {players.map((player) => {
          const isEligible = canInvestigate(player)
          const isAlreadyInvestigated = alreadyInvestigated.includes(player.id)
          const isSelf = player.id === currentPresidentId
          


          return (
            <div
              key={player.id}
              data-player-id={player.id}
              className={`
                border-2 p-4 rounded-lg transition-all duration-200
                ${isSelf ? 'border-hitler-brown bg-hitler-brown/10' : 
                  isAlreadyInvestigated ? 'border-noir-black/30 bg-noir-black/10' :
                  isEligible ? 'border-liberal-blue bg-liberal-blue/5 hover:border-liberal-blue/70 cursor-pointer' :
                  'border-noir-black/20 bg-noir-black/5'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Player avatar */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${isSelf ? 'bg-hitler-brown' :
                      isAlreadyInvestigated ? 'bg-noir-black/40' :
                      isEligible ? 'bg-liberal-blue' : 'bg-noir-black/20'}
                  `}>
                    {player.name.slice(0, 2).toUpperCase()}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-base">
                      {player.name}
                      {isSelf && (
                        <span className="ml-2 text-xs font-courier text-hitler-brown">
                          (YOU)
                        </span>
                      )}
                    </h3>
                    <p className="font-courier text-xs text-noir-black/60">
                      {getInvestigationStatus(player)}
                    </p>
                  </div>
                </div>

                {/* Investigate button */}
                {isEligible && (
                  <Button
                    onClick={() => handleInvestigate(player.id)}
                    disabled={loading || investigating}
                    className={`
                      bg-liberal-blue hover:bg-liberal-blue/90 text-white 
                      font-bold border-2 border-noir-black
                      min-h-[44px] min-w-[100px]
                      ${loading || investigating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {investigating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Investigating...</span>
                      </div>
                    ) : (
                      'Investigate'
                    )}
                  </Button>
                )}

                {/* Status indicators */}
                {isAlreadyInvestigated && (
                  <div className="flex items-center space-x-2 text-noir-black/60">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-courier text-xs">Investigated</span>
                  </div>
                )}

                {isSelf && (
                  <div className="flex items-center space-x-2 text-hitler-brown/60">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-courier text-xs">Self</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 border-2 border-noir-black/20 bg-vintage-cream rounded-lg">
        <h3 className="font-bold text-sm mb-2 text-liberal-blue">INVESTIGATION PROTOCOL:</h3>
        <ul className="font-courier text-xs space-y-1 text-noir-black/70">
          <li>• Select one player to investigate their party membership</li>
          <li>• Investigation results are visible only to you</li>
          <li>• Each player can only be investigated once per game</li>
          <li>• You cannot investigate yourself</li>
        </ul>
      </div>
    </div>
  )
}