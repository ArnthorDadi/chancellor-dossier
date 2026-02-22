import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/hooks/use-room";
import { useAuth } from "@/hooks/use-auth";
import type { Room, Player } from "@/types/game-types";

interface AdminControlPanelProps {
  room: Room;
  onPlayerRemove?: (playerId: string) => void;
  onAdminTransfer?: (playerId: string) => void;
  onSetStartingPlayer?: (playerId: string) => void;
  onStartGame?: () => void;
}

export function AdminControlPanel({
  room,
  onPlayerRemove,
  onAdminTransfer,
  onSetStartingPlayer,
  onStartGame,
}: AdminControlPanelProps) {
  const { user } = useAuth();
  const {
    removePlayerFromRoom,
    transferAdmin,
    startGame,
    setStartingPlayer,
    resetGame,
  } = useRoom();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<
    "start" | "remove" | "transfer" | "reset" | null
  >(null);
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resetOption, setResetOption] = useState<
    "ADMIN_REQUEST" | "GAME_OVER" | "CONSENSUS"
  >("ADMIN_REQUEST");

  // Admin is the first player in the room
  const playerIds = Object.keys(room.players || {});
  const adminId = playerIds.length > 0 ? playerIds[0] : null;
  const isAdmin = user?.uid === adminId;
  const players = Object.values(room.players || {});
  const playerCount = players.length;
  const canStartGame = playerCount >= 5;
  const isGameOver = room.status === "GAME_OVER";
  const canReset = isAdmin || isGameOver;

  if (!isAdmin) {
    return (
      <div className="border-4 border-noir-black bg-white p-6 shadow-2xl">
        <h3 className="font-bold text-lg mb-4 text-liberal-blue">
          WAITING FOR ADMIN
        </h3>
        <p className="font-courier text-sm text-noir-black/70">
          The room admin will start the game when ready
        </p>
        {playerCount < 5 && (
          <div className="border-2 border-fascist-red bg-fascist-red/10 p-4 mt-4">
            <p className="font-courier text-sm text-fascist-red">
              Need at least 5 players to start (currently {playerCount})
            </p>
          </div>
        )}
      </div>
    );
  }

  const handlePlayerRemove = async (playerId: string) => {
    if (!user || playerId === user.uid) return;

    const player = room.players[playerId];
    if (!player) return;

    setTargetPlayer(player);
    setActionType("remove");
    setShowConfirmDialog(true);
  };

  const handleAdminTransfer = async (playerId: string) => {
    if (!user || playerId === user.uid) return;

    const player = room.players[playerId];
    if (!player) return;

    setTargetPlayer(player);
    setActionType("transfer");
    setShowConfirmDialog(true);
  };

  const handleSetStartingPlayer = async (playerId: string) => {
    try {
      await setStartingPlayer(playerId);
      onSetStartingPlayer?.(playerId);
    } catch (error) {
      console.error("Failed to set starting player:", error);
    }
  };

  const handleResetGameClick = () => {
    if (isAdmin) {
      setResetOption("ADMIN_REQUEST");
    } else {
      setResetOption("GAME_OVER");
    }
    setActionType("reset");
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!targetPlayer && actionType !== "reset" && !user) return;

    setIsProcessing(true);
    try {
      switch (actionType) {
        case "remove":
          await removePlayerFromRoom(targetPlayer!.id);
          onPlayerRemove?.(targetPlayer!.id);
          break;
        case "transfer":
          await transferAdmin(targetPlayer!.id);
          onAdminTransfer?.(targetPlayer!.id);
          break;
        case "start":
          await startGame();
          onStartGame?.();
          break;
        case "reset":
          await resetGame(resetOption);
          break;
      }
    } catch (error) {
      console.error("Admin action failed:", error);
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
      setActionType(null);
      setTargetPlayer(null);
    }
  };

  const handleStartGameClick = () => {
    setActionType("start");
    setShowConfirmDialog(true);
  };

  return (
    <>
      <div className="border-4 border-noir-black bg-white p-6 shadow-2xl space-y-6">
        <div className="text-center">
          <h3 className="font-bold text-lg mb-2 text-liberal-blue">
            ADMIN CONTROL PANEL
          </h3>
          <div className="font-courier text-xs text-noir-black/60">
            Room Administrator Controls
          </div>
        </div>

        {/* Game Status */}
        <div className="border-2 border-noir-black/20 p-4">
          <h4 className="font-bold text-sm mb-2">GAME STATUS</h4>
          <div className="space-y-1">
            <p className="font-courier text-xs">
              <span className="font-bold">Players:</span> {playerCount}/10
            </p>
            <p className="font-courier text-xs">
              <span className="font-bold">Status:</span>{" "}
              {room.status || "UNKNOWN"}
            </p>
            <p className="font-courier text-xs">
              <span className="font-bold">Can Start:</span>{" "}
              {canStartGame ? "YES" : "NO"}
            </p>
          </div>
        </div>

        {/* Start Game Controls */}
        <div className="text-center">
          {playerCount < 5 ? (
            <div className="border-2 border-fascist-red bg-fascist-red/10 p-4">
              <p className="font-courier text-sm text-fascist-red font-bold">
                INSUFFICIENT PLAYERS
              </p>
              <p className="font-courier text-xs text-fascist-red mt-1">
                Need at least 5 players to start (currently {playerCount})
              </p>
            </div>
          ) : (
            <Button
              onClick={handleStartGameClick}
              className="w-full bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold px-8 py-4 border-2 border-noir-black text-lg"
              disabled={room.status !== "LOBBY"}
            >
              {room.status === "LOBBY" ? "START GAME" : "GAME IN PROGRESS"}
            </Button>
          )}
        </div>

        {/* Reset Game Controls */}
        {canReset && room.status !== "LOBBY" && (
          <div className="text-center border-2 border-yellow-600 bg-yellow-50 p-4">
            <p className="font-courier text-xs text-yellow-800 mb-3">
              {isGameOver
                ? "Game is over. Start a new game to play again."
                : "Reset the game to play again with the same players."}
            </p>
            <Button
              onClick={handleResetGameClick}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 border-2 border-noir-black"
            >
              {isGameOver ? "START NEW GAME" : "RESET GAME"}
            </Button>
          </div>
        )}

        {/* Player Management */}
        <div className="border-2 border-noir-black/20 p-4">
          <h4 className="font-bold text-sm mb-3">PLAYER MANAGEMENT</h4>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2 border border-noir-black/20 ${
                  player.id === user?.uid ? "bg-liberal-blue/10" : "bg-white"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-noir-black flex items-center justify-center bg-parchment text-xs font-bold">
                    {player.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-courier text-sm font-bold">
                      {player.name}
                    </p>
                    <p className="font-courier text-xs text-noir-black/60">
                      {player.id === user?.uid ? "ADMIN" : "PLAYER"}
                    </p>
                  </div>
                </div>

                {player.id !== user?.uid && (
                  <div className="flex space-x-1">
                    <Button
                      onClick={() => handleSetStartingPlayer(player.id)}
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 border border-noir-black hover:bg-yellow-100"
                      title="Set as starting player"
                    >
                      START
                    </Button>
                    <Button
                      onClick={() => handleAdminTransfer(player.id)}
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 border border-noir-black hover:bg-liberal-blue/20"
                      title="Transfer admin rights"
                    >
                      ADMIN
                    </Button>
                    <Button
                      onClick={() => handlePlayerRemove(player.id)}
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 border border-noir-black hover:bg-fascist-red/20"
                      title="Remove from room"
                    >
                      REMOVE
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reset History */}
        {room.resetHistory && room.resetHistory.length > 0 && (
          <div className="border-2 border-noir-black/20 p-4">
            <h4 className="font-bold text-sm mb-3">GAME RESET HISTORY</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {room.resetHistory.map((reset, index) => {
                const resetByPlayer = room.players[reset.resetBy];
                const playerName = resetByPlayer?.name || "Unknown";
                const date = new Date(reset.resetAt);
                const formattedDate = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={index}
                    className="font-courier text-xs border border-noir-black/10 p-2 bg-yellow-50"
                  >
                    <span className="font-bold">{playerName}</span> reset on{" "}
                    {formattedDate}
                    <span className="text-noir-black/60">
                      {" "}
                      (
                      {reset.reason === "ADMIN_REQUEST"
                        ? "Admin"
                        : reset.reason === "GAME_OVER"
                          ? "Game Over"
                          : "Consensus"}
                      )
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-noir-black shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-4">
              {actionType === "start" && "CONFIRM GAME START"}
              {actionType === "remove" && "CONFIRM PLAYER REMOVAL"}
              {actionType === "transfer" && "CONFIRM ADMIN TRANSFER"}
              {actionType === "reset" && "CONFIRM GAME RESET"}
            </h3>

            <div className="mb-6">
              {actionType === "start" && (
                <p className="font-courier text-sm text-noir-black/80">
                  Starting the game will assign roles and lock the room. No new
                  players will be able to join. This action cannot be undone.
                </p>
              )}
              {actionType === "remove" && targetPlayer && (
                <p className="font-courier text-sm text-noir-black/80">
                  Are you sure you want to remove{" "}
                  <span className="font-bold">{targetPlayer.name}</span> from
                  the room? They will need to rejoin if they want to play.
                </p>
              )}
              {actionType === "transfer" && targetPlayer && (
                <p className="font-courier text-sm text-noir-black/80">
                  Are you sure you want to transfer admin rights to{" "}
                  <span className="font-bold">{targetPlayer.name}</span>? You
                  will no longer have admin control.
                </p>
              )}
              {actionType === "reset" && (
                <div className="space-y-3">
                  <p className="font-courier text-sm text-noir-black/80">
                    Resetting the game will:
                  </p>
                  <ul className="font-courier text-xs text-noir-black/70 list-disc pl-4 space-y-1">
                    <li>Clear all player roles and party assignments</li>
                    <li>Reset enacted policies to zero</li>
                    <li>Clear all investigation results</li>
                    <li>Return the room to lobby status</li>
                    <li>Allow all players to stay and play again</li>
                  </ul>
                  {isGameOver && (
                    <p className="font-courier text-xs text-yellow-700 mt-2">
                      This will start a new game with the same players.
                    </p>
                  )}
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="mb-4 flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-liberal-blue border-t-transparent rounded-full animate-spin" />
                <span className="font-courier text-sm text-liberal-blue">
                  RESETTING GAME...
                </span>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                variant="outline"
                className="flex-1 border-2 border-noir-black hover:bg-noir-black/10"
                disabled={isProcessing}
              >
                CANCEL
              </Button>
              <Button
                onClick={confirmAction}
                className={`flex-1 font-bold border-2 border-noir-black ${
                  actionType === "start"
                    ? "bg-liberal-blue hover:bg-liberal-blue/90 text-white"
                    : actionType === "remove"
                      ? "bg-fascist-red hover:bg-fascist-red/90 text-white"
                      : "bg-yellow-500 hover:bg-yellow-600 text-black"
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? "PROCESSING..." : "CONFIRM"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
