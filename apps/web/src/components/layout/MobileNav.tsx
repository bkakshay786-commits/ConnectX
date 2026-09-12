import { NavLink, useLocation } from "react-router";
import { Home, Compass, Plus, MessageSquare, Users } from "lucide-react";
import { appRoutes } from "@/app/config/routes";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

export function MobileNav() {
  const location = useLocation();
  const setCreateOpen = useUiStore((s) => s.setCreateOpen);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-canvas/90 backdrop-blur-2xl border-t border-hairline/30 shadow-[0_-8px_32px_rgba(0,0,0,0.6)] lg:hidden"
      aria-label="Mobile Navigation"
    >
      <div className="relative flex items-center justify-around h-16 px-2">
        {/* 1. Home */}
        <NavLink
          to={appRoutes.home}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center min-w-[56px] h-14 gap-1 transition-all",
              isActive || location.pathname === appRoutes.root
                ? "text-primary font-display font-semibold"
                : "text-cx-muted hover:text-cx-text",
            )
          }
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-display">Home</span>
        </NavLink>

        {/* 2. Explore */}
        <NavLink
          to={appRoutes.explore}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center min-w-[56px] h-14 gap-1 transition-all",
              isActive ? "text-primary font-display font-semibold" : "text-cx-muted hover:text-cx-text",
            )
          }
          aria-label="Explore"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[11px] font-display">Explore</span>
        </NavLink>

        {/* 3. Central Create FAB */}
        <div className="relative flex items-center justify-center -mt-6">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary-fill via-[#6366f1] to-secondary-fill shadow-[0_0_24px_rgba(124,58,237,0.55)] active:scale-95 transition-transform text-white border-2 border-canvas"
            aria-label="Create Studio"
            title="Create Studio"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Chat */}
        <NavLink
          to={appRoutes.chat}
          className={({ isActive }) =>
            cn(
              "relative flex flex-col items-center justify-center min-w-[56px] h-14 gap-1 transition-all",
              isActive ? "text-primary font-display font-semibold" : "text-cx-muted hover:text-cx-text",
            )
          }
          aria-label="Chat"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-tertiary-fill text-white font-display text-[9px] font-bold shadow-[0_0_8px_rgba(191,32,118,0.5)]">
              2
            </span>
          </div>
          <span className="text-[11px] font-display">Chat</span>
        </NavLink>

        {/* 5. Spaces */}
        <NavLink
          to={appRoutes.spaces}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center min-w-[56px] h-14 gap-1 transition-all",
              isActive ? "text-primary font-display font-semibold" : "text-cx-muted hover:text-cx-text",
            )
          }
          aria-label="Spaces"
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] font-display">Spaces</span>
        </NavLink>
      </div>
    </nav>
  );
}
