import { useRoom } from '@/hooks/use-room'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface PlayerListProps {
  roomId?: string
  className?: string
}

export function PlayerList({ roomId, className }: PlayerListProps) {
  const { room, loading, error } = useRoom(roomId)
  const { user } = useAuth()

  if (loading) {
    return (
      <div className={cn("border-4 border-noir-black bg-white p-6 shadow-2xl", className)}>
        <h3 className="font-bold text-xl mb-4">PLAYERS</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border-2 border-noir-black bg-vintage-cream">
              <div className="w-8 h-8 bg-noir-black/20 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-noir-black/20 rounded animate-pulse w-3/4"></div>
              </div>
              <div className="w-16 h-6 bg-noir-black/20 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("border-4 border-fascist-red bg-white p-6 shadow-2xl", className)}>
        <h3 className="font-bold text-xl mb-4 text-fascist-red">ERROR</h3>
        <p className="text-sm font-courier-prime">{error}</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className={cn("border-4 border-noir-black bg-white p-6 shadow-2xl", className)}>
        <h3 className="font-bold text-xl mb-4">PLAYERS</h3>
        <p className="text-sm text-noir-black/60">No room data available</p>
      </div>
    )
  }

  const players = Object.values(room.players)
  const playerCount = players.length
  const isAdmin = user?.uid === room.metadata.adminId

  return (
    <div className={cn("border-4 border-noir-black bg-white p-6 shadow-2xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl">PLAYERS</h3>
        <div className="flex items-center space-x-2">
          <div className="border-2 border-noir-black px-2 py-1 bg-vintage-cream">
            <span className="text-sm font-bold">{playerCount}/10</span>
          </div>
          {isAdmin && (
            <div className="border-2 border-liberal-blue px-2 py-1 bg-liberal-blue/10">
              <span className="text-xs font-bold text-liberal-blue">ADMIN</span>
            </div>
          )}
        </div>
      </div>

      {/* Player List */}
      <div className="space-y-3">
        {players.length === 0 ? (
          <div className="text-center py-8 border-2 border-noir-black bg-vintage-cream">
            <p className="text-sm text-noir-black/60">No players in room yet</p>
            <p className="text-xs text-noir-black/40 mt-1">Be the first to join!</p>
          </div>
        ) : (
          players.map((player) => {
            const isCurrentUser = user?.uid === player.id
            const isAdminPlayer = room.metadata.adminId === player.id
            
            return (
              <div
                key={player.id}
                className={cn(
                  "flex items-center space-x-3 p-3 border-2 transition-all duration-200",
                  isCurrentUser && "bg-liberal-blue/10 border-liberal-blue",
                  isAdminPlayer && !isCurrentUser && "bg-fascist-red/10 border-fascist-red",
                  !isCurrentUser && !isAdminPlayer && "border-noir-black bg-vintage-cream"
                )}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                    isCurrentUser && "bg-liberal-blue text-white border-liberal-blue",
                    isAdminPlayer && !isCurrentUser && "bg-fascist-red text-white border-fascist-red",
                    !isCurrentUser && !isAdminPlayer && "bg-noir-black text-white border-noir-black"
                  )}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  {isAdminPlayer && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 border border-noir-black rounded-full"></div>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className={cn(
                      "font-courier-prime text-sm font-bold truncate",
                      isCurrentUser && "text-liberal-blue",
                      isAdminPlayer && !isCurrentUser && "text-fascist-red"
                    )}>
                      {player.name}
                    </p>
                    {isCurrentUser && (
                      <span className="text-xs text-noir-black/60">(You)</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {room.metadata.status === 'LOBBY' && (
                    <div className={cn(
                      "border px-2 py-1 text-xs font-bold",
                      player.isReady 
                        ? "bg-green-100 border-green-600 text-green-800" 
                        : "bg-yellow-100 border-yellow-600 text-yellow-800"
                    )}>
                      {player.isReady ? 'READY' : 'WAITING'}
                    </div>
                  )}
                  
                  {room.metadata.status !== 'LOBBY' && (
                    <div className="border-2 border-noir-black px-2 py-1 bg-vintage-cream">
                      <span className="text-xs font-bold">IN GAME</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Info */}
      {room.metadata.status === 'LOBBY' && (
        <div className="mt-6 pt-4 border-t-2 border-noir-black">
          <div className="text-center">
            <p className="text-xs text-noir-black/60">
              {playerCount < 5 
                ? `Need ${5 - playerCount} more player${5 - playerCount > 1 ? 's' : ''} to start`
                : 'Ready to start game!'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}