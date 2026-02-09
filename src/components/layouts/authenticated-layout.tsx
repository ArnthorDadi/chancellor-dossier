import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { AuthHeader } from "@/components/auth-header";

export function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
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

        <div className="relative z-10 border-4 border-noir-black bg-white p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            {/* Loading Spinner */}
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-liberal-blue"></div>

            <p className="font-courier text-sm text-noir-black/70">
              VERIFYING ACCESS...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login with return URL if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render child routes if authenticated
  return (
    <>
      <AuthHeader />
      <Outlet />
    </>
  );
}
