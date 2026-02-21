import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PlayerList } from "@/components/player-list";
import { RoomCodeDisplay } from "@/components/room-code-display";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/hooks/use-room";
import { useAuth } from "@/hooks/use-auth";

export function RoomLobbyPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { room, loading, error, leaveRoom, startGame } = useRoom(roomId);

  // Redirect to game page when game starts
  useEffect(() => {
    if (room && room.status !== "LOBBY") {
      navigate(`/room/${roomId}/game`);
    }
  }, [room, roomId, navigate]);

  const handleStartGame = async () => {
    try {
      await startGame();
      console.log("Game started successfully");
    } catch (err) {
      console.error("Failed to start game:", err);
      // Error is already handled by the useRoom hook
    }
  };

  const handleLeaveRoom = async () => {
    console.log("🚪 handleLeaveRoom called");
    try {
      console.log("🚪 Calling leaveRoom()...");
      await leaveRoom();
      console.log("🚪 leaveRoom() completed successfully");
      navigate("/");
    } catch (err) {
      console.error("❌ Failed to leave room:", err);
      // Navigate anyway to prevent user being stuck
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-bg dark:bg-background">
        <div className="border-4 border-noir-black bg-white p-8 shadow-2xl dark:bg-card dark:border-white/20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-liberal-blue mx-auto"></div>
          <p className="mt-4 font-courier text-sm dark:text-white">
            Loading room...
          </p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-bg dark:bg-background">
        <div className="border-4 border-fascist-red bg-white p-8 shadow-2xl max-w-md mx-4 dark:bg-card dark:border-red-500/50">
          <h2 className="font-special-elite text-xl text-fascist-red mb-4 text-center">
            ROOM NOT FOUND
          </h2>
          <p className="font-courier text-sm text-noir-black/70 mb-6 text-center dark:text-white/70">
            {error ||
              "The room could not be found. Please check the room code and try again."}
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

  const players = Object.values(room.players || {});
  const playerCount = players.length;

  // Admin is the first player in the room
  const playerIds = Object.keys(room.players || {});
  const adminId = playerIds.length > 0 ? playerIds[0] : null;
  const isAdmin = user?.uid === adminId;

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
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Room Code Display */}
            <RoomCodeDisplay roomCode={roomId || ""} />

            {/* Player List */}
            <PlayerList roomId={roomId} />

            {/* Game Controls */}
            <div className="border-4 border-noir-black bg-white p-6 shadow-2xl dark:bg-card dark:border-white/20">
              <div className="text-center space-y-4">
                {isAdmin ? (
                  <>
                    <h3 className="font-bold text-lg dark:text-white">
                      GAME CONTROLS
                    </h3>
                    {playerCount < 5 ? (
                      <div className="border-2 border-fascist-red bg-fascist-red/10 p-4">
                        <p className="font-courier text-sm text-fascist-red">
                          Need at least 5 players to start (currently{" "}
                          {playerCount})
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleStartGame}
                        className="bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold px-8 py-4 border-2 border-noir-black dark:border-white/20"
                      >
                        START GAME
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg dark:text-white">
                      WAITING FOR ADMIN
                    </h3>
                    <p className="font-courier text-sm text-noir-black/70 dark:text-white/70">
                      The room admin will start the game when ready
                    </p>
                    {playerCount < 5 && (
                      <div className="border-2 border-fascist-red bg-fascist-red/10 p-4">
                        <p className="font-courier text-sm text-fascist-red">
                          Need at least 5 players to start (currently{" "}
                          {playerCount})
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Leave Room */}
            <Button
              onClick={handleLeaveRoom}
              className="w-full bg-fascist-red hover:bg-fascist-red/90 text-white border-2 border-noir-black font-courier py-6 text-lg dark:border-white/20"
            >
              🚪 LEAVE ROOM
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
