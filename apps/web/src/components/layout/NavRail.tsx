import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  Home,
  Compass,
  PlusSquare,
  Film,
  MessageSquare,
  Bell,
  Users,
  User,
  Settings,
  Menu,
  LogOut,
  Moon,
  Keyboard,
} from "lucide-react";
import { appRoutes } from "@/app/config/routes";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";

export function NavRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const setCreateOpen = useUiStore((s) => s.setCreateOpen);
  const [showMoreMenu, setShowMoreMenu] = useState(false);


  type NavItem =
    | {
        label: string;
        path: string;
        icon: React.ComponentType<{ className?: string }>;
        isAction?: false;
      }
    | {
        label: string;
        isAction: true;
        onClick: () => void;
        icon: React.ComponentType<{ className?: string }>;
        path?: undefined;
      };

  const navItems: NavItem[] = [
    { label: "Home", path: appRoutes.home, icon: Home },
    { label: "Explore", path: appRoutes.explore, icon: Compass },
    {
      label: "Create",
      isAction: true,
      onClick: () => setCreateOpen(true),
      icon: PlusSquare,
    },
    { label: "Reels", path: appRoutes.explore, icon: Film },
    { label: "Messages", path: appRoutes.chat, icon: MessageSquare },
    { label: "Notifications", path: appRoutes.notifications, icon: Bell },
    { label: "Spaces", path: appRoutes.spaces, icon: Users },
    { label: "Profile", path: appRoutes.profile, icon: User },
  ];

  const isSettingsActive = location.pathname.startsWith(appRoutes.settings);

  return (
    <aside className="fixed left-0 top-0 h-full w-20 xl:w-60 bg-surface-low/95 backdrop-blur-2xl z-50 hidden lg:flex flex-col py-5 px-3 xl:px-4 border-r border-hairline/20 shadow-[0_1px_12px_rgba(0,0,0,0.4)] transition-all duration-300 select-none">
      {/* Brand Mark & Wordmark */}
      <div className="flex items-center mb-8 px-2 xl:px-2">
        <NavLink
          to={appRoutes.home}
          className="flex items-center gap-3 transition-transform hover:scale-105"
          aria-label="ConnectX Home"
        >
          <img
            src="/brand/connectx-mark.svg"
            alt="ConnectX Mark"
            className="h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(124,58,237,0.5)] shrink-0"
          />
          <span className="hidden xl:inline font-display font-bold text-xl tracking-tight text-cx-text">
            Connect<span className="text-primary">X</span>
          </span>
        </NavLink>
      </div>

      {/* Navigation Stack */}
      <nav className="flex-1 flex flex-col gap-1.5 w-full" aria-label="Primary Desktop Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key="create-action"
                type="button"
                onClick={item.onClick}
                className="flex items-center justify-center xl:justify-start gap-3 w-full h-11 px-3 rounded-xl text-cx-muted hover:text-cx-text hover:bg-surface-high transition-all active:scale-98 group text-left"
                aria-label="Create Post"
                title="Create Post"
              >
                <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline font-display text-sm font-medium">
                  {item.label}
                </span>
              </button>
            );
          }

          const isActive =
            item.path === appRoutes.home
              ? location.pathname === appRoutes.home || location.pathname === appRoutes.root
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center justify-center xl:justify-start gap-3 w-full h-11 px-3 rounded-xl transition-all text-left",
                isActive
                  ? "bg-primary-fill/20 text-primary font-semibold border border-primary/30 shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                  : "text-cx-muted hover:bg-surface-high hover:text-cx-text border border-transparent",
              )}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "")} />
              <span className="hidden xl:inline font-display text-sm">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Settings & More at Bottom */}
      <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-hairline/20 relative">
        {/* Settings Item */}
        <NavLink
          to={appRoutes.settings}
          className={cn(
            "flex items-center justify-center xl:justify-start gap-3 w-full h-11 px-3 rounded-xl transition-all text-left",
            isSettingsActive
              ? "bg-primary-fill/20 text-primary font-semibold border border-primary/30 shadow-[0_0_12px_rgba(124,58,237,0.25)]"
              : "text-cx-muted hover:bg-surface-high hover:text-cx-text border border-transparent",
          )}
          aria-label="Settings"
          title="Settings"
        >
          <Settings className={cn("w-5 h-5 shrink-0", isSettingsActive ? "text-primary" : "")} />
          <span className="hidden xl:inline font-display text-sm font-medium">
            Settings
          </span>
        </NavLink>

        {/* More Menu Trigger */}
        <button
          type="button"
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="flex items-center justify-center xl:justify-start gap-3 w-full h-11 px-3 rounded-xl text-cx-muted hover:text-cx-text hover:bg-surface-high transition-all text-left"
          aria-label="More options"
          title="More"
        >
          <Menu className="w-5 h-5 shrink-0" />
          <span className="hidden xl:inline font-display text-sm font-medium">
            More
          </span>
        </button>

        {/* More Popover Menu */}
        {showMoreMenu && (
          <div className="absolute bottom-14 left-2 xl:left-0 w-48 bg-surface-high/95 backdrop-blur-2xl rounded-2xl p-2 border border-hairline/50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col gap-1 z-50">
            <button
              type="button"
              onClick={() => {
                setShowMoreMenu(false);
                toast("Dark Theme active");
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-medium text-cx-muted hover:text-cx-text hover:bg-surface-highest transition-colors text-left"
            >
              <Moon className="w-4 h-4 text-primary" />
              <span>Switch Appearance</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMoreMenu(false);
                toast("Shortcuts: ⌘K to search, Esc to close");
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-medium text-cx-muted hover:text-cx-text hover:bg-surface-highest transition-colors text-left"
            >
              <Keyboard className="w-4 h-4 text-secondary" />
              <span>Keyboard Shortcuts</span>
            </button>
            <div className="h-px bg-hairline/30 my-1" />
            <button
              type="button"
              onClick={async () => {
                setShowMoreMenu(false);
                await logout();
                toast.success("Logged out successfully");
                navigate(appRoutes.login);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-medium text-rose-400 hover:bg-error-fill/15 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

