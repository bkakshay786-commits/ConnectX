import { useState } from "react";
import { Image, Video, Folder, Mic, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { useCreatePostMutation } from "../hooks/usePosts";

export function HomeComposer() {
  const [content, setContent] = useState("");
  const setCreateOpen = useUiStore((s) => s.setCreateOpen);
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentProfile = useAuthStore((s) => s.currentProfile);
  const createPostMutation = useCreatePostMutation();

  const displayName = currentProfile?.display_name || currentUser?.displayName || "Creator";
  const avatarUrl = currentProfile?.avatar_url || currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  const handleQuickPost = () => {
    if (!content.trim()) {
      setCreateOpen(true);
      return;
    }

    createPostMutation.mutate({
      content: content.trim(),
      visibility: "public",
      post_type: "post",
    });
    setContent("");
  };

  return (
    <div className="bg-surface-low/85 backdrop-blur-2xl rounded-2xl sm:rounded-full p-2.5 sm:p-2 border border-hairline/40 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex items-center gap-2 sm:gap-3 transition-all hover:border-hairline/60">
      {/* Avatar with Plus Badge */}
      <div className="relative shrink-0 pl-1">
        <Avatar
          src={avatarUrl}
          alt={displayName}
          size="md"
          className="ring-2 ring-primary/40 shadow-sm"
        />
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label="Add story or media"
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary-fill text-white flex items-center justify-center ring-2 ring-surface text-xs font-bold shadow-md hover:scale-110 active:scale-95 transition-transform"
        >
          +
        </button>
      </div>

      {/* Input Field */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleQuickPost();
            }
          }}
          placeholder={`What's on your mind, ${displayName.split(" ")[0]}?`}
          className="w-full h-10 px-3 sm:px-4 bg-transparent text-cx-text placeholder:text-cx-muted font-body text-sm sm:text-base focus:outline-none"
        />
      </div>

      {/* Quick Action Format Icons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label="Attach photo"
          title="Attach photo"
          className="w-9 h-9 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors active:scale-90"
        >
          <Image className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label="Attach video or reel"
          title="Attach video or reel"
          className="w-9 h-9 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors active:scale-90"
        >
          <Video className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label="Record audio note"
          title="Record audio note"
          className="w-9 h-9 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors active:scale-90"
        >
          <Mic className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label="Upload universal file"
          title="Upload universal file"
          className="w-9 h-9 rounded-full hover:bg-surface-high text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors active:scale-90"
        >
          <Folder className="w-5 h-5" />
        </button>
      </div>

      {/* Post Action Button */}
      <div className="shrink-0 pr-1">
        <button
          type="button"
          onClick={handleQuickPost}
          disabled={createPostMutation.isPending}
          className="h-9 px-5 sm:px-6 rounded-full bg-gradient-to-r from-primary-fill to-secondary-fill hover:opacity-95 text-white font-display text-sm font-semibold shadow-[0_0_16px_rgba(124,58,237,0.45)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
        >
          {createPostMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <span>Post</span>
          )}
        </button>
      </div>
    </div>
  );
}
