import { useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  Radio,
  FolderSync,
  CheckCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { mockNotifications } from "@/mocks/mockData";
import { FilterChip } from "@/components/ui/Chip";
import { toast } from "@/components/ui/Toaster";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils/cn";

export function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(mockNotifications);

  const filterTabs = [
    { id: "all", label: "All Activity" },
    { id: "reactions", label: "Reactions" },
    { id: "spaces", label: "Spaces" },
    { id: "files", label: "File Drops" },
  ];

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read.");
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "reaction":
        return <Heart className="w-3.5 h-3.5 text-tertiary fill-tertiary" />;
      case "comment":
        return <MessageCircle className="w-3.5 h-3.5 text-secondary" />;
      case "space_invite":
        return <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />;
      case "file_share":
        return <FolderSync className="w-3.5 h-3.5 text-primary" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-primary" />;
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto px-3 sm:px-6 py-4 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-2xl text-cx-text tracking-tight">
            Notification Center
          </h1>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="flex items-center gap-1.5 text-xs font-display text-primary hover:underline"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => (
          <FilterChip
            key={tab.id}
            active={filter === tab.id}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </FilterChip>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-2.5">
        {notifications.map((notif) => (
          <NavLink
            key={notif.id}
            to={notif.targetPath}
            className={cn(
              "p-4 rounded-card backdrop-blur-xl border transition-all flex items-start justify-between gap-3 shadow-sm",
              notif.isRead
                ? "bg-surface/50 border-hairline/25 text-cx-muted"
                : "bg-surface/85 border-hairline/60 text-cx-text shadow-md",
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="relative shrink-0">
                <Avatar src={notif.actor.avatarUrl} alt={notif.actor.displayName} size="md" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-highest flex items-center justify-center shadow-md">
                  {getIconForType(notif.type)}
                </div>
              </div>

              <div className="min-w-0">
                <p className="font-body text-xs sm:text-sm leading-snug">
                  <span className="font-display font-semibold text-cx-text">
                    {notif.actor.displayName}
                  </span>{" "}
                  {notif.message}
                </p>
                <span className="text-[11px] font-display text-cx-subtle mt-1 block">
                  {notif.createdAt}
                </span>
              </div>
            </div>

            {!notif.isRead && (
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fill shrink-0 mt-1 shadow-[0_0_8px_rgba(191,32,118,0.6)]" />
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
