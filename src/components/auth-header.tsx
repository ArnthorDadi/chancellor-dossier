import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

interface AuthHeaderProps {
  className?: string
}

export function AuthHeader({ className }: AuthHeaderProps) {
  const { user, loading, username, signOut } = useAuth()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignIn = () => {
    navigate('/login')
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  // Get user display name (username or fallback)
  const getUserDisplay = () => {
    return `Agent: ${username?.slice(0, 15)}`
  }

  return (
    <div className={`sticky top-0 z-50 border-b-4 border-noir-black bg-white/90 backdrop-blur-sm shadow-lg ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Status */}
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full border border-noir-black ${
              user ? 'bg-liberal-blue' : 'bg-fascist-red'
            }`}></div>
            <div className="hidden sm:block">
              <p className="font-courier text-xs text-noir-black/60 uppercase tracking-wider">
                Status:
              </p>
              <p className={`font-special-elite text-sm font-bold ${
                user ? 'text-liberal-blue' : 'text-fascist-red'
              }`}>
                {user ? getUserDisplay() : 'AUTHENTICATION REQUIRED'}
              </p>
            </div>
            {/* Mobile status */}
            <div className="sm:hidden">
              <p className={`font-courier text-xs font-bold uppercase tracking-wider ${
                user ? 'text-liberal-blue' : 'text-fascist-red'
              }`}>
                {user ? getUserDisplay() : 'LOGIN REQUIRED'}
              </p>
            </div>
          </div>

          {/* Right side - Auth Button */}
          <div className="flex items-center">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-liberal-blue"></div>
                <span className="font-courier text-xs text-noir-black/60">Loading...</span>
              </div>
            ) : user ? (
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                size="sm"
                className="bg-fascist-red hover:bg-fascist-red/90 text-white font-bold px-4 py-2 border-2 border-noir-black transition-colors"
              >
                {isSigningOut ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>LOGOUT...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🚪</span>
                    <span>LOGOUT</span>
                  </div>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSignIn}
                size="sm"
                className="bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold px-4 py-2 border-2 border-noir-black transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>🔐</span>
                  <span>LOGIN</span>
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
