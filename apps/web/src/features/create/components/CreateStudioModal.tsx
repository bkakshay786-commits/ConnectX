import * as React from "react";
import {
  X,
  Camera,
  Video,
  Mic,
  FileUp,
  Box,
  Code2,
  Radio,
  Vote,
  UploadCloud,
  Lock,
  Globe,
  Users,
  Send,
  Loader2,
} from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";
import { useCreatePostMutation } from "@/features/feed/hooks/usePosts";

export function CreateStudioModal() {
  const isCreateOpen = useUiStore((s) => s.isCreateOpen);
  const setCreateOpen = useUiStore((s) => s.setCreateOpen);
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentProfile = useAuthStore((s) => s.currentProfile);
  const createPostMutation = useCreatePostMutation();

  const [caption, setCaption] = React.useState("");
  const [selectedFormat, setSelectedFormat] = React.useState<string | null>(null);
  const [audience, setAudience] = React.useState<"public" | "spaces" | "encrypted">("public");
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const displayName = currentProfile?.display_name || currentUser?.displayName || "Creator";
  const avatarUrl =
    currentProfile?.avatar_url ||
    currentUser?.avatarUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  if (!isCreateOpen) return null;

  const mediaFormats = [
    { id: "photo", label: "Photo", icon: Camera, color: "text-primary", bg: "bg-primary-fill/20" },
    { id: "video", label: "Video", icon: Video, color: "text-secondary", bg: "bg-secondary-fill/20" },
    { id: "audio", label: "Audio", icon: Mic, color: "text-tertiary", bg: "bg-tertiary-fill/20" },
    { id: "file", label: "File", icon: FileUp, color: "text-secondary", bg: "bg-secondary-fill/30" },
    { id: "3d", label: "3D Asset", icon: Box, color: "text-primary", bg: "bg-primary-fill/30" },
    { id: "code", label: "Code", icon: Code2, color: "text-secondary", bg: "bg-surface-highest" },
    { id: "live", label: "Live Cast", icon: Radio, color: "text-error", bg: "bg-error-fill/30" },
    { id: "vote", label: "Vote / Event", icon: Vote, color: "text-tertiary", bg: "bg-tertiary-fill/25" },
  ];

  const handlePublish = async () => {
    if (!caption.trim() && !selectedFile) {
      toast.error("Please enter thoughts or select a file to share.");
      return;
    }

    const visibilityMap = {
      public: "public" as const,
      spaces: "followers" as const,
      encrypted: "private" as const,
    };

    const typeMap = {
      photo: "post" as const,
      video: "reel" as const,
      audio: "post" as const,
      file: "post" as const,
      "3d": "post" as const,
      code: "post" as const,
      live: "event" as const,
      vote: "post" as const,
    };

    try {
      await createPostMutation.mutateAsync({
        content: caption.trim() || (selectedFile ? `Shared file: ${selectedFile.name}` : "Untitled Drop"),
        visibility: visibilityMap[audience] || "public",
        post_type: selectedFormat && selectedFormat in typeMap ? typeMap[selectedFormat as keyof typeof typeMap] : "post",
        media_files: selectedFile ? [selectedFile] : undefined,
      });

      setCreateOpen(false);
      setSelectedFile(null);
      setSelectedFormat(null);
      setCaption("");
    } catch {
      // Toast notification is automatically handled by the mutation hook
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-canvas-lowest/80 backdrop-blur-md transition-opacity"
        onClick={() => setCreateOpen(false)}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-labelledby="create-modal-title"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg bg-surface-low/95 backdrop-blur-2xl rounded-t-[28px] sm:rounded-2xl border border-hairline/40 shadow-[0_-12px_48px_rgba(0,0,0,0.85)] p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Mobile Drag Handle */}
        <div className="w-full flex items-center justify-center -mt-1 pb-1">
          <div className="w-12 h-1 rounded-full bg-hairline/60" />
        </div>

        {/* Modal Header */}
        <div className="relative flex items-center justify-center pb-1">
          <h2
            id="create-modal-title"
            className="font-display font-bold text-lg text-cx-text tracking-tight"
          >
            Create Post
          </h2>
          <button
            type="button"
            onClick={() => setCreateOpen(false)}
            aria-label="Dismiss modal"
            className="absolute right-0 top-0 w-8 h-8 rounded-full bg-surface-high hover:bg-surface-highest transition-all flex items-center justify-center text-cx-muted hover:text-cx-text active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User & Audience Row */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Avatar
              src={avatarUrl}
              alt={displayName}
              size="sm"
              className="ring-1 ring-primary/40 shrink-0"
            />
            <span className="font-body text-sm text-cx-muted truncate">
              Posting as <span className="text-cx-text font-medium">{displayName}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAudience(audience === "public" ? "spaces" : audience === "spaces" ? "encrypted" : "public")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-high hover:bg-surface-highest text-xs font-display font-medium text-cx-text border border-hairline/50 transition-colors shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-secondary" />
            <span className="capitalize">{audience}</span>
            <span className="text-[10px] text-cx-muted">▾</span>
          </button>
        </div>

        {/* Thought / Caption Composer Area */}
        <div className="w-full">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`What's happening in your universe, ${displayName.split(" ")[0]}? Add thoughts, code snippets, or tags...`}
            rows={3}
            className="w-full p-3 rounded-xl bg-surface/40 hover:bg-surface/60 focus:bg-surface/80 border border-hairline/40 focus:border-primary/50 text-cx-text placeholder:text-cx-muted font-body text-sm resize-none focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Format Selector Grid (8 formats in 2 rows of 4) */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {mediaFormats.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = selectedFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setSelectedFormat(fmt.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all text-center select-none active:scale-95",
                  isSelected
                    ? "bg-primary-fill/20 border border-primary/50 shadow-[0_0_14px_rgba(124,58,237,0.3)]"
                    : "bg-surface/50 hover:bg-surface-high border border-transparent",
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-shadow",
                    fmt.bg,
                  )}
                >
                  <Icon className={cn("w-5 h-5", fmt.color)} />
                </div>
                <span className="font-display text-xs font-medium text-cx-text truncate w-full">
                  {fmt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Universal Drop Zone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              setSelectedFile(e.dataTransfer.files[0]);
            }
          }}
          className={cn(
            "relative overflow-hidden group w-full rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer transition-all border border-dashed select-none shadow-inner",
            isDragging
              ? "border-primary bg-primary-fill/15"
              : "border-hairline/60 bg-surface/40 hover:bg-surface-high/60 hover:border-primary/40",
          )}
        >
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 rounded-full bg-primary-fill/20 flex items-center justify-center mb-2 shadow-md group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all">
            <UploadCloud className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="font-display font-semibold text-sm text-cx-text">
            {selectedFile ? selectedFile.name : "Drop files here or tap to browse"}
          </p>
          <p className="font-body text-xs text-cx-muted mt-0.5">
            {selectedFile
              ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload`
              : "End-to-end encrypted • Up to 5.0 GB per asset"}
          </p>

          {/* Ecosystem Extension Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 max-w-[340px]">
            {[".fig", ".blend", ".usdz", ".pdf", ".mov", ".wav", ".mp3", ".ts", ".zip"].map((ext) => (
              <span
                key={ext}
                className="px-2 py-0.5 rounded-full bg-surface-highest/80 text-cx-subtle font-mono text-[10px]"
              >
                {ext}
              </span>
            ))}
          </div>
        </label>

        {/* Audience Selector Bar */}
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-surface/70 border border-hairline/30">
          <button
            type="button"
            onClick={() => setAudience("public")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-lg font-display text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
              audience === "public"
                ? "bg-surface-highest text-cx-text shadow-sm"
                : "text-cx-muted hover:text-cx-text",
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public</span>
          </button>
          <button
            type="button"
            onClick={() => setAudience("spaces")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-lg font-display text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
              audience === "spaces"
                ? "bg-surface-highest text-cx-text shadow-sm"
                : "text-cx-muted hover:text-cx-text",
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Spaces</span>
          </button>
          <button
            type="button"
            onClick={() => setAudience("encrypted")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-lg font-display text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
              audience === "encrypted"
                ? "bg-surface-highest text-primary shadow-sm"
                : "text-cx-muted hover:text-cx-text",
            )}
          >
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Encrypted</span>
          </button>
        </div>

        {/* Action Button: Share to ConnectX */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handlePublish}
            disabled={createPostMutation.isPending}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-fill to-secondary-fill hover:opacity-95 text-white font-display text-sm font-semibold shadow-[0_0_20px_rgba(124,58,237,0.45)] hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {createPostMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sharing to the Universe...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Share to ConnectX</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
