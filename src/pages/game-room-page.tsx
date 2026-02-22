import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { useRoom } from "@/hooks/use-room";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { InvestigationTargetSelection } from "@/components/investigation-target-selection";
import { InvestigationResult } from "@/components/investigation-result";
import { PlayerList } from "@/components/player-list";

export function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const gameState = useGameState(roomId);
  const roomHook = useRoom(roomId);

  const knownPlayers = useMemo(() => {
    if (!gameState.visibleRoles || gameState.allPlayers.length === 0) {
      return [];
    }

    return Object.entries(gameState.visibleRoles)
      .filter(([playerId]) => playerId !== user?.uid)
      .map(([playerId, role]) => {
        const player = gameState.allPlayers.find((p) => p.id === playerId);
        return { id: playerId, name: player?.name || "Unknown", role };
      });
  }, [gameState.visibleRoles, gameState.allPlayers, user]);

  if (gameState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-bg dark:bg-background">
        <div className="border-4 border-noir-black bg-white p-8 shadow-2xl dark:bg-card dark:border-white/20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-liberal-blue mx-auto"></div>
          <p className="mt-4 font-courier text-sm dark:text-white">
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  if (gameState.error || !gameState.room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-bg dark:bg-background">
        <div className="border-4 border-fascist-red bg-white p-8 shadow-2xl max-w-md mx-4 dark:bg-card dark:border-red-500/50">
          <h2 className="font-special-elite text-xl text-fascist-red mb-4 text-center">
            GAME ERROR
          </h2>
          <p className="font-courier text-sm text-noir-black/70 mb-6 text-center dark:text-white/70">
            {gameState.error || "The game could not be loaded."}
          </p>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold border-2 border-noir-black dark:border-white/20"
          >
            BACK TO HOME
          </Button>
        </div>
      </div>
    );
  }

  // Show Investigation UI during EXECUTIVE_ACTION phase for President
  if (gameState.gameStatus === "EXECUTIVE_ACTION" && gameState.isPresident) {
    const investigations = gameState.room?.investigations || {};
    const alreadyInvestigated = Object.keys(investigations);
    const hasInvestigationResult = alreadyInvestigated.length > 0;

    // If President has already investigated, show the result
    if (hasInvestigationResult) {
      const targetId = alreadyInvestigated[0];
      const investigation = investigations[targetId];
      const targetPlayer = gameState.room?.players?.[targetId];

      if (targetPlayer && investigation) {
        return (
          <div className="min-h-screen bg-parchment-bg text-noir-black dark:bg-background dark:text-white">
            {/* Paper texture background */}
            <div className="absolute inset-0 opacity-30 dark:opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
              {/* Header */}
              <header className="border-b-8 border-noir-black pb-4 bg-white/50 backdrop-blur-sm dark:border-white/20 dark:bg-card/50">
                <div className="container mx-auto px-4 py-4">
                  <div>
                    <h1 className="font-bold text-2xl md:text-3xl tracking-tight dark:text-white">
                      EXECUTIVE ACTION
                    </h1>
                    <p className="font-courier text-sm text-noir-black/70 dark:text-white/70">
                      {gameState.currentPhase}
                    </p>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                  <InvestigationResult
                    targetName={targetPlayer.name}
                    party={investigation.result}
                    investigatedAt={investigation.investigatedAt}
                  />
                </div>
              </main>
            </div>
          </div>
        );
      }
    }

    // Otherwise show the target selection
    return (
      <div className="min-h-screen bg-parchment-bg text-noir-black dark:bg-background dark:text-white">
        {/* Paper texture background */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b-8 border-noir-black pb-4 bg-white/50 backdrop-blur-sm dark:border-white/20 dark:bg-card/50">
            <div className="container mx-auto px-4 py-4">
              <div>
                <h1 className="font-bold text-2xl md:text-3xl tracking-tight dark:text-white">
                  EXECUTIVE ACTION
                </h1>
                <p className="font-courier text-sm text-noir-black/70 dark:text-white/70">
                  {gameState.currentPhase}
                </p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <InvestigationTargetSelection
                players={gameState.allPlayers}
                currentPresidentId=""
                onInvestigate={roomHook.investigatePlayer}
                loading={roomHook.loading}
                alreadyInvestigated={alreadyInvestigated}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show waiting screen for non-Presidents during EXECUTIVE_ACTION
  if (gameState.gameStatus === "EXECUTIVE_ACTION" && !gameState.isPresident) {
    return (
      <div className="min-h-screen bg-parchment-bg text-noir-black dark:bg-background dark:text-white">
        {/* Paper texture background */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b-8 border-noir-black pb-4 bg-white/50 backdrop-blur-sm dark:border-white/20 dark:bg-card/50">
            <div className="container mx-auto px-4 py-4">
              <div>
                <h1 className="font-bold text-2xl md:text-3xl tracking-tight dark:text-white">
                  EXECUTIVE ACTION
                </h1>
                <p className="font-courier text-sm text-noir-black/70 dark:text-white/70">
                  {gameState.currentPhase}
                </p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div className="border-4 border-noir-black bg-white p-8 shadow-2xl text-center dark:bg-card dark:border-white/20">
                <h2 className="font-special-elite text-2xl text-fascist-red mb-4">
                  WAITING FOR PRESIDENT
                </h2>
                <p className="font-courier text-sm text-noir-black/70 dark:text-white/70">
                  The President is investigating a player's party membership
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-bg text-noir-black dark:bg-background dark:text-white">
      {/* Subtle paper texture background */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b-8 border-noir-black pb-4 bg-white/50 backdrop-blur-sm dark:border-white/20 dark:bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div>
              <h1 className="font-bold text-2xl md:text-3xl tracking-tight dark:text-white">
                EXECUTIVE ACTION
              </h1>
              <p className="font-courier text-sm text-noir-black/70 dark:text-white/70">
                {gameState.currentPhase}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Player List */}
            <PlayerList roomId={roomId} />

            <div className="border-4 border-noir-black bg-white p-8 shadow-2xl text-center dark:bg-card dark:border-white/20">
              <h2 className="font-special-elite text-2xl text-liberal-blue mb-4 dark:text-blue-300">
                GAME IN PROGRESS
              </h2>
              <p className="font-courier text-sm text-noir-black/70 mb-6 dark:text-white/70">
                Game status: {gameState.gameStatus}
              </p>
              <p className="font-courier text-sm text-noir-black/60 dark:text-white/60">
                The game interface will be implemented here.
              </p>

              {/* Game info display */}
              <div className="mt-8 space-y-4">
                <div className="border-2 border-noir-black p-4 bg-vintage-cream dark:bg-card dark:border-white/20">
                  <h3 className="font-bold text-sm mb-2 dark:text-white">
                    GAME INFO:
                  </h3>
                  <div className="font-courier text-xs space-y-1 dark:text-white/80">
                    <p>Status: {gameState.gameStatus}</p>
                    <p>Players: {gameState.allPlayers.length}</p>
                    <p>
                      Your Role: {gameState.currentPlayerRole || "Not assigned"}
                    </p>
                    <p>
                      Your Party: {gameState.currentPlayerParty || "Unknown"}
                    </p>
                    {knownPlayers.length > 0 && gameState.currentPlayerRole && (
                      <div className="mt-3 pt-2 border-t border-noir-black/20">
                        <p className="font-bold">You know:</p>
                        {knownPlayers.map(({ id, name, role }) => (
                          <p key={id}>
                            - {name}:{" "}
                            <span
                              className={
                                role === "HITLER"
                                  ? "text-hitler-brown font-bold"
                                  : "text-fascist-red font-bold"
                              }
                            >
                              {role}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
