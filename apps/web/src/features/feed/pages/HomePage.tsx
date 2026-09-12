import { useState } from "react";
import { StoryRail } from "@/features/feed/components/StoryRail";
import { HomeComposer } from "@/features/feed/components/HomeComposer";
import { PostCard } from "@/features/feed/components/PostCard";
import { FeedCaughtUp } from "@/features/feed/components/FeedCaughtUp";
import { LiveSpacesSidebar } from "@/features/feed/components/LiveSpacesSidebar";
import { useFeedPosts } from "@/features/feed/hooks/useFeed";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

export function HomePage() {
  const [feedSegment, setFeedSegment] = useState<"forYou" | "following" | "spaces">("forYou");
  const { data: posts, isLoading, isError, refetch } = useFeedPosts();

  return (
    <div className="w-full max-w-[1480px] mx-auto px-3 sm:px-6 py-4">
      {/* Mobile Segmented Feed Selector */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center p-1 rounded-full bg-surface-low/80 border border-hairline/30 shadow-sm">
          <button
            type="button"
            onClick={() => setFeedSegment("forYou")}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-full font-display text-xs font-semibold text-center transition-all",
              feedSegment === "forYou"
                ? "bg-gradient-to-r from-primary-fill to-secondary-fill text-white shadow-[0_2px_12px_rgba(124,58,237,0.45)]"
                : "text-cx-muted hover:text-cx-text",
            )}
          >
            For You
          </button>
          <button
            type="button"
            onClick={() => setFeedSegment("following")}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-full font-display text-xs font-semibold text-center transition-all",
              feedSegment === "following"
                ? "bg-gradient-to-r from-primary-fill to-secondary-fill text-white shadow-[0_2px_12px_rgba(124,58,237,0.45)]"
                : "text-cx-muted hover:text-cx-text",
            )}
          >
            Following
          </button>
          <button
            type="button"
            onClick={() => setFeedSegment("spaces")}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-full font-display text-xs font-semibold text-center transition-all",
              feedSegment === "spaces"
                ? "bg-gradient-to-r from-primary-fill to-secondary-fill text-white shadow-[0_2px_12px_rgba(124,58,237,0.45)]"
                : "text-cx-muted hover:text-cx-text",
            )}
          >
            Spaces
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CENTER FEED SPINE (8 cols on desktop) */}
        <section className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* Stories Rail */}
          <StoryRail />

          {/* Social Composer */}
          <HomeComposer />

          {/* Feed Stream */}
          <div className="flex flex-col gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-surface/60 rounded-card p-6 border border-hairline/25 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="w-32 h-4 rounded-full" />
                      <Skeleton className="w-20 h-3 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-48 rounded-xl" />
                  <div className="flex gap-4">
                    <Skeleton className="w-16 h-4 rounded-full" />
                    <Skeleton className="w-16 h-4 rounded-full" />
                  </div>
                </div>
              ))
            ) : isError ? (
              <div className="bg-surface rounded-card p-8 text-center border border-error-fill/40 flex flex-col items-center gap-3">
                <p className="text-error text-sm font-body">Unable to load feed drops.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="px-4 py-1.5 rounded-full bg-surface-high hover:bg-surface-highest text-cx-text text-xs font-display font-semibold"
                >
                  Retry
                </button>
              </div>
            ) : (
              posts?.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>

          {/* Feed Completion Milestone */}
          {!isLoading && <FeedCaughtUp />}
        </section>

        {/* RIGHT CONTEXT PANEL (4 cols on desktop) */}
        <div className="hidden lg:block lg:col-span-4">
          <LiveSpacesSidebar />
        </div>
      </div>
    </div>
  );
}
