import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { useCreateRoom } from "@/hooks/use-room-code";

export function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { createRoom } = useCreateRoom();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Get return URL and intent from location state
  const from = location.state?.from?.pathname || "/";
  const intent = location.state?.intent;

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    try {
      await createRoom();
      // Navigation is handled by createRoom hook
    } catch (err) {
      console.error("Failed to create room after authentication:", err);
      // Fallback to join room page if room creation fails
      navigate("/join-room", { replace: true });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Handle post-authentication flow
  useEffect(() => {
    if (user) {
      if (intent === "create-room") {
        // User authenticated with intent to create room
        handleCreateRoom();
      } else {
        // Normal redirect flow
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from, intent, handleCreateRoom]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment-bg">
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

      <div className="relative z-10 w-full max-w-md mx-4">
        {user && isCreatingRoom ? (
          <div className="bg-white border-2 border-noir-black rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-liberal-blue mx-auto mb-4"></div>
            <h2 className="font-special-elite text-xl text-liberal-blue mb-2">
              ESTABLISHING SAFE HOUSE...
            </h2>
            <p className="font-courier text-sm text-noir-black/70">
              Initializing secure location
            </p>
          </div>
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
}
