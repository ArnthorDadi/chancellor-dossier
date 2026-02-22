import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QRCode } from "./qr-code";
import { Link2, QrCode, Check, Copy } from "lucide-react";

interface RoomSharingOptionsProps {
  roomCode: string;
  className?: string;
}

export function RoomSharingOptions({
  roomCode,
  className,
}: RoomSharingOptionsProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const roomUrl = `${window.location.origin}/room/${roomCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join My Secret Hitler Room",
          text: `Join my room using code: ${roomCode}`,
          url: roomUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Failed to share:", err);
        }
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className={className}>
      <div className="border-2 border-noir-black bg-vintage-cream p-4 dark:bg-card-foreground/5 dark:border-white/20">
        <h4 className="font-special-elite text-sm text-liberal-blue mb-3 dark:text-blue-300">
          SHARE THIS SAFE HOUSE
        </h4>

        <div className="space-y-3">
          {/* Copy Link Button */}
          <Button
            onClick={copyLink}
            className={`w-full flex items-center justify-center gap-2 py-2 border-2 border-noir-black font-courier text-sm transition-all dark:border-white/20 ${
              copied
                ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                : "bg-liberal-blue hover:bg-liberal-blue/90 text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>LINK COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY INVITE LINK</span>
              </>
            )}
          </Button>

          {/* Share Button (uses Web Share API if available) */}
          {!!navigator.share && (
            <Button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-noir-black bg-fascist-red hover:bg-fascist-red/90 text-white font-courier text-sm transition-colors dark:border-white/20"
            >
              <Link2 className="w-4 h-4" />
              <span>SHARE</span>
            </Button>
          )}

          {/* QR Code Toggle */}
          <Button
            onClick={() => setShowQR(!showQR)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-noir-black font-courier text-sm dark:border-white/20 dark:text-white"
          >
            <QrCode className="w-4 h-4" />
            <span>{showQR ? "HIDE QR CODE" : "SHOW QR CODE"}</span>
          </Button>

          {/* QR Code Display */}
          {showQR && (
            <div className="flex justify-center p-4 bg-white border-2 border-noir-black dark:border-white/20">
              <QRCode value={roomUrl} size={160} />
            </div>
          )}

          <p className="font-courier text-xs text-noir-black/60 text-center dark:text-white/60">
            Players can scan QR code or use room code:{" "}
            <span className="font-bold">{roomCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
