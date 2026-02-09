import { useState } from 'react'
import type { FormEvent } from 'react'
import { useJoinRoom } from '@/hooks/use-room-code'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function JoinRoomPage() {
  const { joinRoom, loading, error } = useJoinRoom()
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!roomCode.trim()) {
      return
    }

    setIsJoining(true)
    try {
      await joinRoom(roomCode.trim())
      // Navigation is handled in the hook
    } catch (err) {
      // Error is handled in the hook
      console.error('Failed to join room:', err)
    } finally {
      setIsJoining(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and limit to alphanumeric characters
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setRoomCode(value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment-bg">
      {/* Subtle paper texture background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" 
             style={{ 
               backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="border-4 border-fascist-red bg-white p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-fascist-red border-2 border-noir-black rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">🔑</span>
            </div>
            
            <h2 className="font-special-elite text-2xl text-fascist-red mb-2">
              JOIN ROOM
            </h2>
            
            <p className="font-courier text-sm text-noir-black/70">
              Enter the room code provided by your friend
            </p>
          </div>

          {/* Join Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="roomCode" 
                className="block font-courier text-sm font-bold mb-3"
              >
                ROOM CODE:
              </label>
              <Input
                id="roomCode"
                type="text"
                value={roomCode}
                onChange={handleInputChange}
                placeholder="ABC123"
                className="border-2 border-noir-black font-courier text-center text-lg tracking-widest font-bold"
                maxLength={6}
                required
                disabled={loading || isJoining}
              />
              <p className="font-courier text-xs text-noir-black/60 mt-2">
                Enter the 4-6 character room code
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="border-2 border-fascist-red bg-fascist-red/10 p-3">
                <p className="font-courier text-sm text-fascist-red">
                  ERROR: {error}
                </p>
              </div>
            )}

            {/* Join Button */}
            <Button
              type="submit"
              disabled={!roomCode.trim() || loading || isJoining}
              className="w-full bg-fascist-red hover:bg-fascist-red/90 text-white font-bold px-6 py-4 border-2 border-noir-black transition-colors"
            >
              {loading || isJoining ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>JOINING ROOM...</span>
                </div>
              ) : (
                'JOIN ROOM'
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t-2 border-noir-black">
            <p className="font-courier text-xs text-noir-black/60 text-center">
              Ask your friend for the room code<br/>
              Room codes are 4-6 characters long
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}