import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RoomCodeDisplayProps {
  roomCode: string;
  className?: string;
}

export function RoomCodeDisplay({ roomCode, className }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy room code:", err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <div
      className={`border-4 border-liberal-blue bg-white p-6 shadow-2xl dark:bg-card dark:border-blue-400/50 ${className}`}
    >
      <div className="text-center">
        <h2 className="font-special-elite text-lg text-liberal-blue mb-4 dark:text-blue-300">
          ROOM CODE
        </h2>

        {/* Room Code */}
        <div className="border-4 border-noir-black p-4 bg-vintage-cream inline-block mb-4 dark:bg-card-foreground/5 dark:border-white/20">
          <div className="font-courier text-3xl font-bold tracking-widest dark:text-white">
            {roomCode}
          </div>
        </div>

        {/* Copy Button */}
        <Button
          onClick={copyToClipboard}
          className={`w-full font-bold px-6 py-3 border-2 border-noir-black transition-colors dark:border-white/20 ${
            copied
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-liberal-blue hover:bg-liberal-blue/90 text-white"
          }`}
        >
          {copied ? "✓ COPIED!" : "📋 COPY CODE"}
        </Button>

        <p className="font-courier text-sm text-noir-black/60 mt-4 dark:text-white/60">
          Share this code with friends to let them join
        </p>
      </div>
    </div>
  );
}
