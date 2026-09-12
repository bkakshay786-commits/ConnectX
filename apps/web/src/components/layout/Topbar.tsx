import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { Search, Sparkles, Send, Bell } from "lucide-react";
import { appRoutes } from "@/app/config/routes";
import { Avatar } from "@/components/ui/Avatar";
import { mockCurrentUser } from "@/mocks/mockData";
import { toast } from "@/components/ui/Toaster";

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${appRoutes.search}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAskAI = () => {
    toast("ConnectX AI Companion", {
      description: "Ask anything about documents, 3D assets, code, or trends.",
    });
  };

  return (
    <header className="fixed top-0 left-0 lg:left-20 xl:left-60 right-0 h-16 bg-canvas-lowest/85 backdrop-blur-2xl z-40 border-b border-hairline/20 shadow-[0_1px_12px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="h-16 w-full px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Mobile Wordmark (hidden on desktop) */}
        <div className="flex lg:hidden items-center gap-2">
          <NavLink to={appRoutes.home} className="flex items-center gap-2">
            <img
              src="/brand/connectx-mark.svg"
              alt="ConnectX Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-display font-bold text-xl tracking-tight text-cx-text">
              Connect<span className="text-primary">X</span>
            </span>
          </NavLink>
        </div>

        {/* Universal Search (Desktop Center Spine) */}
        <div className="hidden sm:flex flex-1 max-w-2xl">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <Search className="absolute left-3.5 w-4 h-4 text-cx-subtle pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people, posts, files, spaces, or ask AI..."
              className="w-full h-10 pl-10 pr-4 bg-surface-high/80 rounded-full font-body text-sm text-cx-text placeholder:text-cx-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-highest transition-all"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ask AI Pill Button */}
          <button
            type="button"
            onClick={handleAskAI}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-gradient-to-r from-primary-fill/20 to-tertiary-fill/20 hover:from-primary-fill/30 hover:to-tertiary-fill/30 text-primary font-display font-semibold text-xs transition-all shadow-[0_0_12px_rgba(124,58,237,0.25)] border border-primary/30 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Chat Quick Link */}
          <NavLink
            to={appRoutes.chat}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-surface hover:bg-surface-high text-cx-muted hover:text-cx-text border border-hairline/40 transition-colors"
            aria-label="Direct Messages"
            title="Direct Messages"
          >
            <Send className="w-4 h-4" />
          </NavLink>

          {/* Notifications Bell */}
          <NavLink
            to={appRoutes.notifications}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-surface hover:bg-surface-high text-cx-muted hover:text-cx-text border border-hairline/40 transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tertiary-fill ring-2 ring-surface animate-pulse" />
          </NavLink>

          {/* User Profile Avatar Link */}
          <div className="flex items-center pl-1">
            <NavLink
              to={appRoutes.profile}
              className="relative flex items-center justify-center rounded-full ring-2 ring-primary/30 hover:ring-primary transition-all"
              aria-label="Your Profile"
            >
              <Avatar
                src={mockCurrentUser.avatarUrl}
                alt={mockCurrentUser.displayName}
                size="sm"
                presence="online"
              />
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}
