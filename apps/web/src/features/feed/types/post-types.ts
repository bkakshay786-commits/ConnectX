import type { Profile, User, Post } from "@/types/domain";

export type PostVisibility = "public" | "followers" | "close_friends" | "private";
export type PostType = "post" | "reel" | "clip" | "thread" | "story" | "event" | "text" | "image" | "video" | "audio" | "file" | "mixed" | "poll" | "code" | "3d" | "live";
export type PostStatus = "published" | "draft" | "archived" | "deleted";
export type MediaType = "image" | "video" | "audio" | "document" | "archive";
export type MediaProcessingStatus = "pending" | "uploading" | "uploaded" | "processing" | "ready" | "failed";

export interface MediaRecord {
  id: string;
  owner_id: string;
  bucket_id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  extension: string;
  byte_size: number;
  width_px?: number | null;
  height_px?: number | null;
  duration_seconds?: number | null;
  processing_status: MediaProcessingStatus;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  public_url?: string;
}

export interface PostRecord {
  id: string;
  author_id: string;
  content: string;
  post_type: PostType;
  visibility: PostVisibility;
  status: PostStatus;
  location_name?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  media?: MediaRecord[];
}

export interface CreatePostInput {
  content: string;
  post_type?: PostType;
  visibility?: PostVisibility;
  location_name?: string | null;
  media_files?: File[];
}

export interface UpdatePostInput {
  content?: string;
  visibility?: PostVisibility;
  status?: PostStatus;
  location_name?: string | null;
}

export interface FeedFilter {
  visibility?: PostVisibility;
  post_type?: PostType;
  author_id?: string;
}

/**
 * Adapter function to convert a DB PostRecord into a UI-ready domain Post
 */
export function postRecordToDomainPost(record: PostRecord): Post {
  const authorUser: User = {
    id: record.author?.id || record.author_id,
    username: record.author?.username || "creator",
    displayName: record.author?.display_name || "ConnectX Creator",
    avatarUrl:
      record.author?.avatar_url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: record.author?.bio || undefined,
    verified: true,
  };

  const mediaItems = (record.media || []).map((m) => {
    const isVideo = m.mime_type.startsWith("video");
    const isAudio = m.mime_type.startsWith("audio");
    return {
      id: m.id,
      type: isVideo ? ("video" as const) : isAudio ? ("audio" as const) : ("image" as const),
      url: m.public_url || "",
      width: m.width_px || undefined,
      height: m.height_px || undefined,
      durationSeconds: m.duration_seconds || undefined,
    };
  });

  return {
    id: record.id,
    author: authorUser,
    createdAt: record.created_at,
    content:
      mediaItems.length > 0
        ? { kind: "media", media: mediaItems, caption: record.content }
        : { kind: "text", text: record.content },
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    bookmarkCount: 0,
    isLiked: false,
    isBookmarked: false,
  };
}
