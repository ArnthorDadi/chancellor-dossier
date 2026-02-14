import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

interface AuthHeaderProps {
  className?: string;
}

export function AuthHeader({ className }: AuthHeaderProps) {
  const { user, loading, username, signOutWithCleanup } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutWithCleanup();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Get user display name (username or fallback)
  const getUserDisplay = () => {
    return `Agent: ${username?.slice(0, 15)}`;
  };

  return (
    <div
      className={`sticky top-0 z-50 border-b-4 border-noir-black bg-white/90 backdrop-blur-sm shadow-lg dark:bg-card/90 dark:border-white/10 ${className}`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Status */}
          <div className="flex items-center space-x-3">
            <div
              className={`w-2 h-2 rounded-full border border-noir-black ${
                user ? "bg-liberal-blue" : "bg-fascist-red"
              }`}
            ></div>
            <div className="hidden sm:block">
              <p className="font-courier text-xs text-noir-black/60 uppercase tracking-wider dark:text-white/60">
                Status:
              </p>
              <p
                className={`font-special-elite text-sm font-bold ${
                  user
                    ? "text-liberal-blue dark:text-blue-300"
                    : "text-fascist-red"
                }`}
              >
                {user ? getUserDisplay() : "AUTHENTICATION REQUIRED"}
              </p>
            </div>
            {/* Mobile status */}
            <div className="sm:hidden">
              <p
                className={`font-courier text-xs font-bold uppercase tracking-wider dark:text-white/60 ${
                  user
                    ? "text-liberal-blue dark:text-blue-300"
                    : "text-fascist-red"
                }`}
              >
                {user ? getUserDisplay() : "LOGIN REQUIRED"}
              </p>
            </div>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-liberal-blue"></div>
                <span className="font-courier text-xs text-noir-black/60 dark:text-white/60">
                  Loading...
                </span>
              </div>
            ) : (
              <>
                {/* Login/Logout button */}
                {user ? (
                  <Button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="bg-fascist-red hover:bg-fascist-red/90 text-white border-2 border-noir-black font-courier text-sm dark:border-white/20"
                    size="sm"
                  >
                    {isSigningOut ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        <span>LOGOUT...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>👤</span>
                        <span>LOGOUT</span>
                      </div>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSignIn}
                    variant="outline"
                    className="bg-liberal-blue hover:bg-liberal-blue/90 text-white border-2 border-noir-black font-courier text-sm"
                    size="sm"
                  >
                    <div className="flex items-center space-x-2">
                      <span>🔐</span>
                      <span>LOGIN</span>
                    </div>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
