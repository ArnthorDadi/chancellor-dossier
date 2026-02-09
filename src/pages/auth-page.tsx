import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthForm } from '@/components/auth-form'
import { useAuth } from '@/hooks/use-auth'

export function AuthPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get return URL from location state or default to landing
  const from = location.state?.from?.pathname || '/'

  // Redirect authenticated users to intended destination
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

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
        <AuthForm />
      </div>
    </div>
  )
}