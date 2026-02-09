import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm() {
  const { user, loading, error, signIn, signOutWithCleanup } = useAuth();
  const [username, setUsername] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      return;
    }

    await signIn(username.trim());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="border-4 border-noir-black bg-white p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-liberal-blue mx-auto"></div>
          <p className="mt-4 font-courier text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="border-4 border-liberal-blue bg-white p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="font-special-elite text-2xl text-liberal-blue mb-4">
              AUTHENTICATION SUCCESSFUL
            </h2>
            <div className="border-2 border-noir-black p-4 bg-parchment mb-6">
              <p className="font-courier text-sm mb-2">User ID:</p>
              <p className="font-courier text-xs break-all">{user.uid}</p>
              <p className="font-courier text-sm mt-2">
                Status: Anonymous User
              </p>
            </div>
            <Button
              onClick={signOutWithCleanup}
              className="bg-fascist-red hover:bg-fascist-red/90 text-white border-2 border-noir-black"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="border-4 border-liberal-blue bg-white p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="font-special-elite text-2xl text-liberal-blue mb-6">
            SECRET DOSSIER ACCESS
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block font-courier text-sm font-bold mb-2"
              >
                ENTER YOUR NAME:
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Classified Agent"
                className="border-2 border-noir-black font-courier"
                required
              />
            </div>

            {error && (
              <div className="border-2 border-fascist-red bg-fascist-red/10 p-3">
                <p className="font-courier text-sm text-fascist-red">
                  ERROR: {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!username.trim() || loading}
              className="w-full bg-liberal-blue hover:bg-liberal-blue/90 text-white font-bold border-2 border-noir-black"
            >
              {loading ? "AUTHENTICATING..." : "ACCESS FILES"}
            </Button>
          </form>

          <div className="mt-6 border-t-2 border-noir-black pt-4">
            <p className="font-courier text-xs text-noir-black/60">
              Anonymous authentication • No personal data required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
