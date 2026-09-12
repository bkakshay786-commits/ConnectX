import { Sparkles, ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useStories } from "@/features/feed/hooks/useFeed";
import { useUiStore } from "@/stores/ui-store";
import { toast } from "@/components/ui/Toaster";
import { Skeleton } from "@/components/ui/Skeleton";

export function StoryRail() {
  const { data: stories, isLoading } = useStories();
  const setCreateOpen = useUiStore((s) => s.setCreateOpen);

  const handleStoryClick = (userName: string, isLiveSpace?: boolean) => {
    toast(`Viewing Story: ${userName}`, {
      description: isLiveSpace ? "Live Space stage session is currently on air." : "24-hour visual moment.",
    });
  };

  return (
    <div className="relative w-full bg-surface/60 backdrop-blur-xl rounded-card p-4 border border-hairline/25 shadow-lg">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="font-display font-semibold text-xs text-cx-text flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          Stories &amp; Spaces
        </span>
        <button
          type="button"
          onClick={() => toast("Playing all stories in chronological order.")}
          className="text-cx-muted hover:text-primary transition-colors font-display text-xs flex items-center gap-1 active:scale-95"
        >
          <span>Watch All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-1 no-scrollbar select-none">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-12 h-3 rounded-full" />
              </div>
            ))
          : stories?.map((story) => {
              const isSelf = story.id === "story-self";

              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() =>
                    isSelf ? setCreateOpen(true) : handleStoryClick(story.user.displayName, story.isLiveSpace)
                  }
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group focus:outline-none"
                >
                  <Avatar
                    src={story.previewUrl}
                    alt={story.user.displayName}
                    size="xl"
                    hasStory={!isSelf}
                    storySeen={!story.hasUnseen}
                    isAddStory={isSelf}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="font-display text-[11px] text-cx-text group-hover:text-primary transition-colors max-w-[68px] truncate">
                    {isSelf ? "Your Story" : story.user.displayName.split(" ")[0]}
                  </span>
                </button>
              );
            })}
      </div>
    </div>
  );
}
