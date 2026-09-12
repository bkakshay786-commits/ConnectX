import * as React from "react";
import {
  Heart,
  MessageCircle,
  GitFork,
  Bookmark,
  MoreHorizontal,
  Info,
  X,
  BadgeCheck,
  Sparkles,
  ExternalLink,
  Share2,
  Play,
  Pause,
  CloudCheck,
  Trash2,
  Edit3,
  Copy,
  Check,
} from "lucide-react";
import type { Post } from "@/types/domain";
import { Avatar } from "@/components/ui/Avatar";
import { FileExtensionBadge } from "@/components/ui/Badge";
import { usePostReactions } from "@/features/feed/hooks/useFeed";
import { useAuthStore } from "@/stores/auth-store";
import { useDeletePostMutation, useUpdatePostMutation } from "@/features/feed/hooks/usePosts";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";

export function PostCard({ post }: { post: Post }) {
  const { toggleLike, toggleBookmark } = usePostReactions(post.id);
  const currentUser = useAuthStore((s) => s.currentUser);
  const deletePostMutation = useDeletePostMutation();
  const updatePostMutation = useUpdatePostMutation();

  const [showContext, setShowContext] = React.useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editCaption, setEditCaption] = React.useState(
    post.content.kind === "text"
      ? post.content.text
      : post.content.kind === "media"
      ? post.content.caption || ""
      : ""
  );

  const isAuthor = currentUser?.id === post.author.id;

  const handleAskAiOnFile = (fileName: string) => {
    toast("ConnectX File Intelligence", {
      description: `Analyzing tokens and AST structure for ${fileName}…`,
    });
  };

  const handleSaveEdit = async () => {
    if (!editCaption.trim()) return;
    await updatePostMutation.mutateAsync({
      postId: post.id,
      input: { content: editCaption.trim() },
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePostMutation.mutateAsync(post.id);
      setIsMenuOpen(false);
    }
  };

  const content = post.content;

  return (
    <article className="bg-surface/75 backdrop-blur-2xl rounded-card p-4 sm:p-6 border border-hairline/30 shadow-xl flex flex-col gap-3.5 transition-all">
      {/* 1. Context Pill */}
      {showContext && post.contextReason && (
        <div className="flex items-center justify-between pb-1.5 border-b border-hairline/20 text-xs text-cx-muted font-body">
          <span className="flex items-center gap-1.5 truncate">
            <Info className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span className="truncate">{post.contextReason}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowContext(false)}
            aria-label="Dismiss context note"
            className="text-cx-subtle hover:text-cx-text transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Post Author Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            size="md"
            presence={post.author.presence}
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-sm text-cx-text truncate">
                {post.author.displayName}
              </span>
              {post.author.verified && (
                <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-cx-muted font-body text-xs">
              <span className="truncate">@{post.author.username}</span>
              <span>•</span>
              <time>{post.createdAt}</time>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="More options"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-cx-muted hover:text-cx-text hover:bg-surface-high transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-44 rounded-xl bg-surface-low/95 backdrop-blur-xl border border-hairline/50 p-1.5 shadow-2xl z-20 flex flex-col gap-1">
              {isAuthor && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left font-display text-xs text-cx-text hover:bg-surface-high flex items-center gap-2 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-secondary" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deletePostMutation.isPending}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left font-display text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletePostMutation.isPending ? "Deleting..." : "Delete Post"}</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Post link copied to clipboard!");
                  setIsMenuOpen(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left font-display text-xs text-cx-muted hover:text-cx-text hover:bg-surface-high flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Post Content */}
      <div className="flex flex-col gap-3">
        {/* Inline Editing Mode */}
        {isEditing ? (
          <div className="flex flex-col gap-2 p-2 rounded-xl bg-surface-high/60 border border-hairline/40">
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              rows={2}
              className="w-full p-2 bg-transparent text-cx-text text-sm rounded-lg focus:outline-none resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg text-xs font-display text-cx-muted hover:text-cx-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={updatePostMutation.isPending}
                className="px-3 py-1 rounded-lg bg-primary-fill text-xs font-display font-medium text-white flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{updatePostMutation.isPending ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Caption */}
            {content.kind === "text" && (
              <p className="font-body text-sm text-cx-text leading-relaxed whitespace-pre-wrap">
                {content.text}
              </p>
            )}

            {content.kind === "media" && (
              <>
                {content.caption && (
                  <p className="font-body text-sm text-cx-text leading-relaxed">
                    {content.caption}
                  </p>
                )}
                <div className="rounded-xl overflow-hidden bg-surface-lowest border border-hairline/40 max-h-[460px] flex items-center justify-center">
                  {content.media[0]?.type === "video" ? (
                    <video
                      src={content.media[0]?.url}
                      controls
                      className="w-full h-auto max-h-[460px] object-cover"
                    />
                  ) : (
                    <img
                      src={content.media[0]?.url}
                      alt={content.media[0]?.altText || "Post media"}
                      className="w-full h-auto object-cover max-h-[460px]"
                      loading="lazy"
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* First-Class Social File Attachment */}
        {content.kind === "file" && (
          <>
            {content.description && (
              <p className="font-body text-sm text-cx-text leading-relaxed">
                {content.description}
              </p>
            )}

            <div className="rounded-xl bg-surface-high/80 p-3.5 border border-hairline/50 flex flex-col gap-3 shadow-inner">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0 w-12 h-12 rounded-lg bg-surface-highest flex items-center justify-center shadow-md">
                    <FileExtensionBadge extension={content.file.extension} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-semibold text-sm text-cx-text truncate">
                      {content.file.name}
                    </h4>
                    <div className="flex items-center gap-2 text-cx-muted font-body text-xs mt-0.5">
                      <span>{(content.file.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                      <span>•</span>
                      <span className="text-secondary font-medium">Ready to duplicate</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-surface-lowest text-primary">
                  <CloudCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Ask AI Micro Tray */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface/80 border border-hairline/30 text-xs">
                <div className="flex items-center gap-1.5 min-w-0 text-cx-muted">
                  <Sparkles className="w-3.5 h-3.5 text-tertiary shrink-0" />
                  <span className="truncate">
                    Ask AI: <span className="text-tertiary italic">"Summarize component kit &amp; tokens"</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAskAiOnFile(content.file.name)}
                  className="py-0.5 px-2 rounded-md bg-surface-high hover:bg-surface-highest text-cx-text hover:text-primary font-display font-medium shrink-0 transition-colors"
                >
                  Ask ✨
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => toast(`Opening ${content.file.name} in spatial canvas.`)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-primary-fill hover:bg-primary-fill/90 text-white font-display text-xs font-semibold shadow-[0_0_14px_rgba(124,58,237,0.35)] transition-all active:scale-[0.98]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Canvas</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast(`Created branch of ${content.file.name}.`)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-surface-highest hover:bg-surface text-cx-text font-display text-xs font-semibold transition-colors active:scale-[0.98] border border-hairline/40"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Branch / Share</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Audio Waveform Object */}
        {content.kind === "audio" && (
          <div className="rounded-xl bg-surface-high/80 p-4 border border-hairline/50 flex flex-col gap-3">
            {content.description && (
              <p className="font-body text-sm text-cx-text leading-relaxed">
                {content.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                aria-label={isPlayingAudio ? "Pause audio" : "Play audio"}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-primary-fill to-secondary-fill text-white flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.4)] hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                {isPlayingAudio ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-semibold text-sm text-cx-text truncate">
                  {content.title}
                </h4>
                <p className="font-body text-xs text-cx-muted truncate">
                  {content.artist}
                </p>
              </div>
            </div>

            {/* Simulated Waveform Visualizer */}
            <div className="flex items-center gap-1 h-8 px-1">
              {(content.waveform || [30, 60, 90, 40, 70, 100, 50, 80, 60, 40, 90, 30]).map(
                (h, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex-1 rounded-full transition-all duration-200",
                      isPlayingAudio
                        ? "bg-gradient-to-t from-primary to-secondary animate-pulse"
                        : "bg-surface-highest",
                    )}
                    style={{ height: `${h}%` }}
                  />
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Social Actions Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-hairline/20 text-cx-muted">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            type="button"
            onClick={() => toggleLike()}
            className={cn(
              "flex items-center gap-1.5 transition-colors group",
              post.isLiked ? "text-tertiary font-semibold" : "hover:text-tertiary",
            )}
            aria-label="Like post"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-transform group-active:scale-125",
                post.isLiked ? "fill-tertiary text-tertiary" : "",
              )}
            />
            <span className="font-display text-xs">{post.likeCount}</span>
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={() => toast("Opening comment thread…")}
            className="flex items-center gap-1.5 hover:text-cx-text transition-colors"
            aria-label="Comments"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-display text-xs">{post.commentCount}</span>
          </button>

          {/* Fork / Share */}
          <button
            type="button"
            onClick={() => toast("Forked into your workspace")}
            className={cn(
              "flex items-center gap-1.5 hover:text-primary transition-colors",
              post.isForked && "text-primary",
            )}
            aria-label="Fork post"
          >
            <GitFork className="w-4 h-4" />
            <span className="font-display text-xs">{post.shareCount} forks</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          type="button"
          onClick={() => toggleBookmark()}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            post.isBookmarked
              ? "text-primary fill-primary"
              : "text-cx-muted hover:text-cx-text",
          )}
          aria-label="Bookmark post"
        >
          <Bookmark className={cn("w-4 h-4", post.isBookmarked && "fill-primary")} />
        </button>
      </div>
    </article>
  );
}
