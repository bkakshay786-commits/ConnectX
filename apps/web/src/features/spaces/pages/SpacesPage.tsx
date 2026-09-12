import { useState } from "react";
import {
  Users,
  Radio,
  Bookmark,
  FolderArchive,
  Calendar,
  ExternalLink,
  Share2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { mockSpaces } from "@/mocks/mockData";
import { FileExtensionBadge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";

export function SpacesPage() {
  const [selectedSpaceId, setSelectedSpaceId] = useState("space-motion");
  const [activeTab, setActiveTab] = useState<"feed" | "chat" | "files" | "events" | "members">("feed");
  const [isJoined, setIsJoined] = useState(true);
  const [votedOption, setVotedOption] = useState<number | null>(0);

  const currentSpace = mockSpaces.find((s) => s.id === selectedSpaceId) || mockSpaces[0];

  const pollOptions = [
    { id: 0, text: "Critique 0.82 Damping (Snappy overshoot)", votes: 78, percent: 54 },
    { id: 1, text: "Critique 0.70 Damping (Loose inertia)", votes: 38, percent: 26 },
    { id: 2, text: "Critique 0.95 Damping (Critical damped)", votes: 28, percent: 20 },
  ];

  return (
    <div className="w-full max-w-[1480px] mx-auto px-3 sm:px-6 py-4 flex flex-col gap-6">
      {/* 1. Space Hero Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-surface-low border border-hairline/30 shadow-2xl">
        <div className="relative w-full h-44 sm:h-60 overflow-hidden">
          <img
            src={currentSpace.bannerUrl}
            alt={currentSpace.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-low via-surface-low/50 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast("Bookmarked space to quick dock")}
              aria-label="Bookmark space"
              className="w-9 h-9 rounded-full bg-surface-high/80 backdrop-blur-md flex items-center justify-center text-cx-text shadow-md hover:bg-surface transition-colors"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toast("Share space invite link")}
              aria-label="Share space"
              className="w-9 h-9 rounded-full bg-surface-high/80 backdrop-blur-md flex items-center justify-center text-cx-text shadow-md hover:bg-surface transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Space Profile Header Info */}
        <div className="px-4 sm:px-8 -mt-12 relative z-20 pb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-highest p-1 shadow-2xl flex items-center justify-center ring-4 ring-surface-low">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-primary-fill via-secondary to-tertiary-fill flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                  <Users className="w-10 h-10" />
                </div>
              </div>

              <div className="flex flex-col pb-1">
                <h1 className="font-display font-bold text-xl sm:text-2xl text-cx-text tracking-tight">
                  {currentSpace.name}
                </h1>
                <div className="flex items-center gap-2 text-cx-muted font-display text-xs">
                  <span>{currentSpace.memberCount.toLocaleString()} members</span>
                  <span>•</span>
                  <span className="text-secondary flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    {currentSpace.onlineCount} online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setIsJoined(!isJoined);
                  toast.success(isJoined ? "Left Space" : "Joined Space Guild!");
                }}
                className={cn(
                  "flex-1 sm:flex-none h-10 px-5 rounded-full font-display text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95",
                  isJoined
                    ? "bg-surface-high text-cx-text border border-hairline/50 hover:bg-surface-highest"
                    : "bg-primary-fill text-white shadow-[0_0_16px_rgba(124,58,237,0.4)]",
                )}
              >
                {isJoined && <CheckCircle2 className="w-4 h-4 text-primary" />}
                <span>{isJoined ? "Joined Guild" : "Join Guild"}</span>
              </button>
              <button
                type="button"
                onClick={() => toast("Invite link copied to clipboard")}
                className="h-10 px-4 rounded-full bg-surface-high hover:bg-surface-highest text-cx-text font-display text-xs font-semibold flex items-center justify-center gap-1.5 border border-hairline/40 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Invite</span>
              </button>
            </div>
          </div>

          <p className="font-body text-xs sm:text-sm text-cx-muted max-w-2xl leading-relaxed">
            {currentSpace.description}
          </p>

          {/* Compact Live Stage Banner */}
          {currentSpace.liveStageActive && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/80 border border-tertiary-fill/30 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-tertiary-fill/20 text-tertiary flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4 animate-pulse" />
                </span>
                <div className="min-w-0">
                  <div className="font-display font-semibold text-xs text-cx-text truncate">
                    {currentSpace.liveStageTitle}
                  </div>
                  <div className="font-body text-[11px] text-tertiary">
                    {currentSpace.liveStageListenersCount} listeners tuning in
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast("Joined spatial audio room.")}
                className="px-3.5 py-1.5 rounded-full bg-tertiary-fill text-white font-display text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-[0_0_10px_rgba(191,32,118,0.4)]"
              >
                Listen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-hairline/25 no-scrollbar">
        {[
          { id: "feed", label: "Feed", icon: <Users className="w-4 h-4" /> },
          { id: "chat", label: "Chat Lounge", count: "5", icon: <Users className="w-4 h-4" /> },
          { id: "files", label: "File Vault", count: "184", icon: <FolderArchive className="w-4 h-4" /> },
          { id: "events", label: "Critique Events", icon: <Calendar className="w-4 h-4" /> },
          { id: "members", label: "Guild Members", icon: <Users className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "px-4 py-2 rounded-full font-display text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 select-none",
              activeTab === tab.id
                ? "bg-primary-fill text-white shadow-[0_0_12px_rgba(124,58,237,0.35)]"
                : "text-cx-muted hover:text-cx-text hover:bg-surface-high",
            )}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Tab Body */}
      {activeTab === "feed" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Spine */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Interactive Guild Poll Card */}
            <div className="bg-surface/75 backdrop-blur-xl rounded-card p-5 border border-hairline/30 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fill/20 text-tertiary font-display font-semibold text-[10px] uppercase tracking-wider">
                  Active Guild Poll
                </span>
                <span className="text-xs text-cx-subtle font-body">144 total votes</span>
              </div>

              <div>
                <h3 className="font-display font-semibold text-base text-cx-text">
                  Preferred Spring Damping for Spatial HUD Sheet Dismissals?
                </h3>
                <p className="font-body text-xs text-cx-muted mt-1">
                  Testing physics parameters for rapid gesture flicks on head-mounted displays.
                </p>
              </div>

              {/* Poll Options */}
              <div className="flex flex-col gap-2">
                {pollOptions.map((opt) => {
                  const isSelected = votedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setVotedOption(opt.id)}
                      className={cn(
                        "relative overflow-hidden p-3 rounded-xl text-left border transition-all flex items-center justify-between",
                        isSelected
                          ? "border-primary/60 bg-primary-fill/15"
                          : "border-hairline/40 bg-surface-high/60 hover:bg-surface-high",
                      )}
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-primary-fill/20 rounded-xl transition-all duration-500"
                        style={{ width: `${opt.percent}%` }}
                      />
                      <span className="relative z-10 font-display font-medium text-xs text-cx-text">
                        {opt.text}
                      </span>
                      <span className="relative z-10 font-mono text-xs font-bold text-primary">
                        {opt.percent}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Space File Vault Item */}
            <div className="bg-surface/75 backdrop-blur-xl rounded-card p-5 border border-hairline/30 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-xs text-cx-muted uppercase tracking-wider">
                  Vault Drop
                </span>
                <span className="text-xs text-secondary font-display font-medium">Ready in Drive</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative shrink-0 w-12 h-12 rounded-lg bg-surface-highest flex items-center justify-center shadow-md">
                  <FileExtensionBadge extension=".blend" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-semibold text-sm text-cx-text truncate">
                    VisionPro_Shader_Pipelines_v3.blend
                  </h4>
                  <p className="font-body text-xs text-cx-muted">
                    142 MB • Curated by Guild Lead
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast("Opening shader asset in Universal Drive")}
                className="w-full py-2 rounded-full bg-surface-high hover:bg-surface-highest text-cx-text font-display text-xs font-semibold border border-hairline/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Inspect in Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Rail: Guild Channels & Switcher */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-surface/70 backdrop-blur-xl rounded-card p-4 border border-hairline/30 flex flex-col gap-3">
              <h3 className="font-display font-bold text-xs text-cx-muted uppercase tracking-wider">
                Guild Channels
              </h3>
              <div className="flex flex-col gap-1">
                {currentSpace.channels?.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toast(`Switching to channel #${ch.name}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-high text-xs font-display text-cx-muted hover:text-cx-text transition-colors text-left"
                  >
                    <span># {ch.name}</span>
                    {ch.unreadCount && (
                      <span className="px-1.5 py-0.2 rounded-full bg-tertiary-fill text-white font-mono text-[10px]">
                        {ch.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Other Spaces Quick Switcher */}
            <div className="bg-surface/70 backdrop-blur-xl rounded-card p-4 border border-hairline/30 flex flex-col gap-3">
              <h3 className="font-display font-bold text-xs text-cx-muted uppercase tracking-wider">
                Explore Guilds
              </h3>
              <div className="flex flex-col gap-2">
                {mockSpaces.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSelectedSpaceId(sp.id)}
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-xl transition-colors text-left",
                      sp.id === selectedSpaceId ? "bg-surface-high text-primary" : "hover:bg-surface text-cx-muted",
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-surface-highest flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-cx-text" />
                    </div>
                    <span className="font-display font-semibold text-xs truncate">
                      {sp.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== "feed" && (
        <div className="p-8 rounded-card bg-surface/60 border border-hairline/30 text-center flex flex-col items-center justify-center gap-2">
          <p className="font-display text-sm text-cx-text capitalize">
            {activeTab} channel is active for {currentSpace.name}
          </p>
          <span className="text-xs text-cx-muted font-body">
            Connected via real-time presence cluster.
          </span>
        </div>
      )}
    </div>
  );
}
