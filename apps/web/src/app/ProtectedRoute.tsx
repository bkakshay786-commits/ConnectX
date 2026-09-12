import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import { appRoutes } from "@/app/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import { AppShell } from "@/components/layout/AppShell";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#090A0F] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
        <p className="font-display text-xs text-[#9EA5B9] font-medium tracking-wide">
          Entering ConnectX...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={appRoutes.login}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <AppShell>{children}</AppShell>;
}
