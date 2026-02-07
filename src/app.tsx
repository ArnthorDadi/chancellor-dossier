import { Button } from '@/components/ui/button'
import { AuthForm } from '@/components/auth-form'
import { useAuth } from '@/hooks/use-auth'

function App() {
  const { user } = useAuth()

  // Show authentication form if user is not signed in
  if (!user) {
    return <AuthForm />
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

      <div className="relative z-10">
        {/* Header - Inspired by Secret Hitler logo treatment */}
        <header className="border-b-8 border-noir-black pb-8 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 text-center">
            <div className="inline-block">
              <h1 className="font-bold text-4xl md:text-6xl tracking-tight mb-2">
                SECRET HITLER
              </h1>
              <div className="font-bold text-lg md:text-xl tracking-wide text-noir-black/70">
                DIGITAL ENVELOPES
              </div>
            </div>
          </div>
        </header>

        {/* Main Hero Section - Board Game Inspired */}
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-16">
            {/* Left - Envelope Focus */}
            <div className="relative">
              <div className="border-4 border-noir-black bg-white p-8 shadow-2xl transform rotate-1">
                <div className="border-2 border-noir-black p-6 bg-vintage-cream">
                  <div className="text-center mb-6">
                    <div className="inline-block">
                      <div className="text-6xl font-bold">📋</div>
                      <p className="text-sm font-bold mt-2">SECRET IDENTITY</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-liberal-blue border-2 border-noir-black"></div>
                      <span className="font-courier-prime text-sm">LIBERAL PARTY</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-fascist-red border-2 border-noir-black"></div>
                      <span className="font-courier-prime text-sm">FASCIST PARTY</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="inline-block border border-noir-black px-3 py-1 bg-yellow-200">
                      <span className="text-xs font-bold">TOP SECRET</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tape effect */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-20 h-4 bg-fascist-red/80 border border-noir-black"></div>
              <div className="absolute bottom-0 right-0 transform translate-y-2 translate-x-2 w-16 h-4 bg-liberal-blue/80 border border-noir-black"></div>
            </div>

            {/* Right - Game Info */}
            <div className="space-y-6">
              <div className="border-4 border-noir-black bg-white p-6 shadow-2xl">
                <h2 className="font-bold text-2xl mb-4">ABOUT THE GAME</h2>
                <div className="space-y-4 text-sm">
                  <p>
                    A social deduction game for 5-10 players about finding and stopping the secret Hitler.
                  </p>
                  <p>
                    Players are secretly divided into two teams - liberals and fascists - and must 
                    figure out who's who before it's too late.
                  </p>
                  <p className="font-bold">
                    This app replaces the physical envelope system with secure digital role cards.
                  </p>
                </div>
              </div>

              {/* Party Icons - Inspired by actual game design */}
              <div className="border-4 border-noir-black bg-white p-6 shadow-2xl">
                <h3 className="font-bold text-xl mb-4 text-center">PARTY MEMBERSHIP</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border-2 border-liberal-blue bg-liberal-blue/10">
                    <div className="text-3xl mb-2">🦅</div>
                    <div className="w-8 h-8 mx-auto mb-2 bg-liberal-blue border-2 border-noir-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">L</span>
                    </div>
                    <p className="text-xs font-bold">LIBERAL</p>
                  </div>
                  <div className="text-center p-4 border-2 border-fascist-red bg-fascist-red/10">
                    <div className="text-3xl mb-2">🦎</div>
                    <div className="w-8 h-8 mx-auto mb-2 bg-fascist-red border-2 border-noir-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">F</span>
                    </div>
                    <p className="text-xs font-bold">FASCIST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid - Board Game Style */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="border-4 border-noir-black bg-white p-6 shadow-2xl transform -rotate-1">
              <div className="text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="font-bold text-lg mb-2">MOBILE FIRST</h3>
                <p className="text-sm">
                  Optimized for phones and tablets with touch-friendly controls
                </p>
              </div>
            </div>
            <div className="border-4 border-noir-black bg-white p-6 shadow-2xl transform rotate-1">
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="font-bold text-lg mb-2">SECURE</h3>
                <p className="text-sm">
                  Private role reveals keep your identity secret until the right moment
                </p>
              </div>
            </div>
            <div className="border-4 border-noir-black bg-white p-6 shadow-2xl transform rotate-2">
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-bold text-lg mb-2">INSTANT</h3>
                <p className="text-sm">
                  Real-time synchronization with all players immediately
                </p>
              </div>
            </div>
          </div>

          {/* Player Count Info - Simple Block Style */}
          <div className="border-4 border-noir-black bg-white p-8 shadow-2xl max-w-4xl mx-auto mb-12">
            <h3 className="font-bold text-2xl mb-6 text-center">PLAYER COUNTS</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="border-2 border-noir-black p-3 bg-vintage-cream">
                <div className="font-bold">5 Players</div>
                <div>3 Liberal • 1 Fascist • 1 Hitler</div>
              </div>
              <div className="border-2 border-noir-black p-3 bg-vintage-cream">
                <div className="font-bold">6 Players</div>
                <div>4 Liberal • 1 Fascist • 1 Hitler</div>
              </div>
              <div className="border-2 border-noir-black p-3 bg-vintage-cream">
                <div className="font-bold">7 Players</div>
                <div>4 Liberal • 2 Fascist • 1 Hitler</div>
              </div>
              <div className="border-2 border-noir-black p-3 bg-vintage-cream">
                <div className="font-bold">8 Players</div>
                <div>5 Liberal • 2 Fascist • 1 Hitler</div>
              </div>
              <div className="border-2 border-noir-black p-3 bg-vintage-cream">
                <div className="font-bold">9 Players</div>
                <div>5 Liberal • 3 Fascist • 1 Hitler</div>
              </div>
              <div className="border-2 border-noir-black p-3 bg-vintage-cream">
                <div className="font-bold">10 Players</div>
                <div>6 Liberal • 3 Fascist • 1 Hitler</div>
              </div>
            </div>
          </div>

          {/* Call to Action - Simple Bold */}
          <div className="text-center mb-12">
            <div className="inline-block border-8 border-noir-black bg-white p-8 shadow-2xl transform rotate-1">
              <h2 className="font-bold text-3xl mb-4">READY TO PLAY?</h2>
              <p className="text-lg mb-6 text-noir-black/70">
                Digital envelope system coming soon
              </p>
              <Button 
                size="lg" 
                disabled
                className="bg-noir-black text-white font-bold text-lg px-8 py-4 border-4 border-noir-black"
              >
                COMING SOON
              </Button>
            </div>
          </div>
        </section>

        {/* Footer - Simple Game Style */}
        <footer className="border-t-8 border-noir-black bg-white py-6">
          <div className="container mx-auto px-4 text-center">
            <div className="text-sm font-bold mb-2">
              CHANCELLOR DOSSIER v1.8.0
            </div>
            <div className="text-xs text-noir-black/60">
              Digital envelope system for Secret Hitler board game
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
