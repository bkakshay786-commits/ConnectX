import { Radio, Users, Sparkles, TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { mockSpaces, mockUsers } from "@/mocks/mockData";
import { toast } from "@/components/ui/Toaster";
import { NavLink } from "react-router";
import { appRoutes } from "@/app/config/routes";

export function LiveSpacesSidebar() {
  const liveSpaces = mockSpaces.filter((s) => s.liveStageActive);

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-full max-w-[360px] sticky top-20">
      {/* 1. Live Stages Hub */}
      <div className="bg-surface/70 backdrop-blur-xl rounded-card p-5 border border-hairline/30 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-tertiary-fill/20 text-tertiary">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <h3 className="font-display font-bold text-sm text-cx-text">Live Stages</h3>
          </div>
          <NavLink
            to={appRoutes.spaces}
            className="text-primary hover:underline font-display text-xs font-semibold"
          >
            Explore
          </NavLink>
        </div>

        <div className="flex flex-col gap-3">
          {liveSpaces.map((space) => (
            <div
              key={space.id}
              className="p-3 rounded-xl bg-surface-high/60 border border-hairline/40 flex flex-col gap-2.5 transition-all hover:border-primary/40 hover:bg-surface-high"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-fill to-secondary-fill flex items-center justify-center text-white shrink-0 shadow-md">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-semibold text-xs text-cx-text truncate">
                      {space.name}
                    </h4>
                    <p className="font-body text-[11px] text-tertiary truncate">
                      {space.liveStageListenersCount} tuning in
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast(`Tuning into live audio: ${space.liveStageTitle}`, {
                      description: "Connected with low-latency spatial audio channel.",
                    })
                  }
                  className="px-3 py-1 rounded-full bg-tertiary-fill/20 hover:bg-tertiary-fill/30 text-tertiary font-display text-xs font-semibold shrink-0 transition-colors active:scale-95"
                >
                  Listen
                </button>
              </div>
              <p className="font-body text-xs text-cx-muted line-clamp-1">
                {space.liveStageTitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Trending Topics */}
      <div className="bg-surface/70 backdrop-blur-xl rounded-card p-5 border border-hairline/30 shadow-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-cx-text">Trending Sparks</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {["#SpatialHaptics", "#VisionPro3D", "#ProceduralShaders", "#DesignTokens", "#AudioStems", "#AstCompiler"].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toast(`Browsing topic ${tag}`)}
                className="px-2.5 py-1 rounded-full bg-surface-high hover:bg-surface-highest text-cx-muted hover:text-cx-text font-display text-xs transition-colors border border-hairline/30 active:scale-95"
              >
                {tag}
              </button>
            ),
          )}
        </div>
      </div>

      {/* 3. Recommended Creators */}
      <div className="bg-surface/70 backdrop-blur-xl rounded-card p-5 border border-hairline/30 shadow-xl flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            <h3 className="font-display font-bold text-sm text-cx-text">Creative Minds</h3>
          </div>
          <span className="text-[11px] font-body text-cx-subtle">Suggested</span>
        </div>

        <div className="flex flex-col gap-3">
          {[mockUsers.elena, mockUsers.marcus].map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar src={user.avatarUrl} alt={user.displayName} size="sm" presence={user.presence} />
                <div className="min-w-0">
                  <h4 className="font-display font-semibold text-xs text-cx-text truncate">
                    {user.displayName}
                  </h4>
                  <p className="font-body text-[11px] text-cx-subtle truncate">
                    @{user.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.success(`Following @${user.username}`)}
                className="px-3 py-1 rounded-full bg-surface-highest hover:bg-primary-fill hover:text-white text-cx-text font-display text-xs font-semibold transition-all border border-hairline/40 active:scale-95 shrink-0"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
