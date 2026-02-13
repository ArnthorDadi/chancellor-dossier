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
  const { removePlayerFromRoom, transferAdmin, startGame, setStartingPlayer } =
    useRoom();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<
    "start" | "remove" | "transfer" | null
  >(null);
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = user?.uid === room.metadata?.adminId;
  const players = Object.values(room.players || {});
  const playerCount = players.length;
  const canStartGame = playerCount >= 5;

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

  const confirmAction = async () => {
    if (!targetPlayer || !actionType || !user) return;

    setIsProcessing(true);
    try {
      switch (actionType) {
        case "remove":
          await removePlayerFromRoom(targetPlayer.id);
          onPlayerRemove?.(targetPlayer.id);
          break;
        case "transfer":
          await transferAdmin(targetPlayer.id);
          onAdminTransfer?.(targetPlayer.id);
          break;
        case "start":
          await startGame();
          onStartGame?.();
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
              {room.metadata?.status || "UNKNOWN"}
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
              disabled={room.metadata?.status !== "LOBBY"}
            >
              {room.metadata?.status === "LOBBY"
                ? "START GAME"
                : "GAME IN PROGRESS"}
            </Button>
          )}
        </div>

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
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-noir-black shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-4">
              {actionType === "start" && "CONFIRM GAME START"}
              {actionType === "remove" && "CONFIRM PLAYER REMOVAL"}
              {actionType === "transfer" && "CONFIRM ADMIN TRANSFER"}
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
            </div>

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
                      : "bg-yellow-400 hover:bg-yellow-400/90 text-black"
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
