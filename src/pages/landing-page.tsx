import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useCreateRoom } from "@/hooks/use-room-code";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/auth-header";

export function LandingPage() {
  const { user } = useAuth();
  const { createRoom, loading: createLoading } = useCreateRoom();

  return (
    <div className="min-h-screen bg-parchment-bg text-noir-black">
      {/* Subtle paper texture background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Auth Header */}
        <AuthHeader />

        {/* Main Header - Inspired by Secret Hitler logo treatment */}
        <header
          className="border-b-8 border-noir-black backdrop-blur-sm shadow-2xl relative overflow-hidden"
          style={{
            background:
              "linear-gradient(to right, var(--liberal-blue), var(--fascist-red))",
          }}
        >
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top right, rgba(255,255,255,0.1), transparent, rgba(0,0,0,0.1))",
              }}
            ></div>
          </div>

          <div className="container mx-auto px-4 py-8 text-center relative z-10">
            <div className="border-4 border-noir-black p-6 shadow-2xl transform rotate-1 bg-vintage-cream">
              <h1
                className="font-special-elite text-4xl md:text-6xl tracking-tight mb-2"
                style={{
                  background:
                    "linear-gradient(to right, var(--liberal-blue), var(--fascist-red))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                SECRET HITLER
              </h1>
              <div className="font-bold text-lg md:text-xl tracking-wide text-noir-black/90 border-t-2 border-noir-black pt-2">
                DIGITAL ENVELOPES
              </div>
            </div>
          </div>
        </header>

        {/* Main Hero Section - Board Game Inspired */}
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Call to Action - Classified Dossier Style */}
          <div className="text-center mb-12">
            {/* Main dossier container with aged paper effect */}
            <div className="relative inline-block max-w-full w-full sm:max-w-md lg:max-w-lg">
              {/* Tape effects */}
              <div className="absolute z-10 top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-24 h-4 bg-yellow-400/80 border border-noir-black shadow-md"></div>

              {/* Main dossier */}
              <div className="border-4 border-noir-black bg-vintage-cream p-1 shadow-2xl transform rotate-1">
                <div className="border-2 border-noir-black bg-white p-8">
                  {/* Header with classified stamp */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="border-2 border-noir-black px-2 sm:px-4 py-2 bg-red-600 transform rotate-3">
                        <span className="text-white font-bold text-xs tracking-widest">
                          CLASSIFIED
                        </span>
                      </div>
                    </div>

                    <h2 className="font-special-elite text-2xl sm:text-3xl text-liberal-blue mb-2">
                      TOP SECRET
                    </h2>

                    <div className="border-t-2 border-b-2 border-noir-black py-2 mb-4">
                      <h3 className="font-courier text-lg font-bold tracking-wider">
                        MISSION BRIEFING
                      </h3>
                    </div>

                    <p className="font-courier text-sm text-noir-black/70 mb-6">
                      Agent, select your operation to begin
                    </p>
                  </div>

                  {/* Action buttons in dossier format */}
                  <div className="space-y-4">
                    {/* Create Room Operation */}
                    <div className="border-2 border-liberal-blue bg-liberal-blue/5 p-1">
                      {user ? (
                        <Button
                          size="lg"
                          onClick={async () => {
                            try {
                              await createRoom();
                            } catch (err) {
                              console.error("Failed to create room:", err);
                            }
                          }}
                          disabled={createLoading}
                          className="w-full bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold px-6 py-3 border-2 border-noir-black transition-colors"
                        >
                          {createLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>INITIALIZING...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <span>🏛️</span>
                              <span>ESTABLISH SAFE HOUSE</span>
                            </div>
                          )}
                        </Button>
                      ) : (
                        <Link
                          to="/login"
                          state={{
                            from: { pathname: "/login" },
                            intent: "create-room",
                          }}
                        >
                          <Button
                            size="lg"
                            className="w-full bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold px-8 py-4 border-2 border-noir-black transition-colors"
                          >
                            CREATE A ROOM
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Join Room Operation */}
                    <div className="border-2 border-fascist-red bg-fascist-red/5 p-1">
                      <Link
                        to={user ? "/join-room" : "/login"}
                        state={{ from: { pathname: "/join-room" } }}
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full bg-fascist-red hover:bg-fascist-red/90 text-white font-bold px-6 py-3 border-2 border-noir-black transition-colors"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span>🕵️</span>
                            <span>
                              {user
                                ? "INFILTRATE SAFE HOUSE"
                                : "AUTHENTICATE & INFILTRATE"}
                            </span>
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Status footer */}
                  <div className="mt-6 pt-4 border-t-2 border-noir-black">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-courier text-xs text-noir-black/60">
                          STATUS:
                        </p>
                        <p className="font-courier text-xs font-bold text-liberal-blue">
                          {user
                            ? "AGENT AUTHENTICATED"
                            : "AUTHENTICATION REQUIRED"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-courier text-xs text-noir-black/60">
                          CLEARANCE:
                        </p>
                        <p className="font-courier text-xs font-bold text-fascist-red">
                          {user ? "LEVEL 5 - TOP SECRET" : "PENDING"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center mb-16">
            {/* Right - Game Info */}
            <div className="space-y-6">
              <div className="border-4 border-noir-black bg-white p-6 shadow-2xl">
                <h2 className="font-bold text-2xl mb-4">ABOUT THE GAME</h2>
                <div className="space-y-4 text-sm">
                  <p>
                    A social deduction game for 5-10 players about finding and
                    stopping the secret Hitler.
                  </p>
                  <p>
                    Players are secretly divided into two teams - liberals and
                    fascists - and must figure out who's who before it's too
                    late.
                  </p>
                  <p className="font-bold">
                    This app replaces the physical envelope system with secure
                    digital role cards.
                  </p>
                </div>
              </div>

              {/* Party Icons - Inspired by actual game design */}
              <div className="border-4 border-noir-black bg-white p-6 shadow-2xl">
                <h3 className="font-bold text-xl mb-4 text-center">
                  PARTY MEMBERSHIP
                </h3>
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
  );
}
