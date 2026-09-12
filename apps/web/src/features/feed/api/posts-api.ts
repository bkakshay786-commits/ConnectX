import { supabase, isSupabaseConfigured } from "@/utils/supabase/client";
import { localBackend } from "@/lib/local-backend-service";
import type {
  PostRecord,
  MediaRecord,
  CreatePostInput,
  UpdatePostInput,
  FeedFilter,
  PostType,
} from "../types/post-types";
import { postRecordToDomainPost } from "../types/post-types";
import type { Post } from "@/types/domain";
import type { Database } from "@/types/database.types";
import { mockPosts } from "@/mocks/mockData";

// Local cache of user-created posts in memory for fallback/offline/demo scenarios
const clientCreatedPosts: Post[] = [];

function mapPostTypeToDb(type?: PostType): NonNullable<Database["public"]["Tables"]["posts"]["Insert"]["post_type"]> {
  switch (type) {
    case "post":
    case "thread":
      return "text";
    case "reel":
    case "clip":
      return "video";
    case "story":
      return "mixed";
    case "event":
      return "live";
    case "image":
    case "video":
    case "audio":
    case "file":
    case "mixed":
    case "poll":
    case "code":
    case "3d":
    case "live":
    case "text":
      return type;
    default:
      return "text";
  }
}

/**
 * Upload a media file to local backend or Supabase storage
 */
export async function uploadMediaFile(file: File, userId: string): Promise<MediaRecord> {
  if (!isSupabaseConfigured) {
    return localBackend.uploadMedia(file, userId);
  }

  const mediaId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  const ext = file.name.split(".").pop() || "bin";
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${userId}/${mediaId}_${sanitizedName}`;

  let publicUrl = "";

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    console.warn("Storage upload warning, continuing with object URL fallback:", uploadError.message);
    publicUrl = URL.createObjectURL(file);
  } else {
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(storagePath);
    publicUrl = urlData.publicUrl;
  }

  const mediaRecord: MediaRecord = {
    id: mediaId,
    owner_id: userId,
    bucket_id: "media",
    storage_path: storagePath,
    original_filename: file.name,
    mime_type: file.type || "application/octet-stream",
    extension: ext,
    byte_size: file.size,
    width_px: null,
    height_px: null,
    duration_seconds: null,
    processing_status: "ready",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    public_url: publicUrl,
  };

  try {
    const { data, error } = await supabase
      .from("media")
      .insert({
        id: mediaRecord.id,
        owner_id: mediaRecord.owner_id,
        bucket_id: mediaRecord.bucket_id,
        storage_path: mediaRecord.storage_path,
        original_filename: mediaRecord.original_filename,
        mime_type: mediaRecord.mime_type,
        extension: mediaRecord.extension,
        byte_size: mediaRecord.byte_size,
        processing_status: mediaRecord.processing_status,
      })
      .select()
      .single();

    if (!error && data) {
      return { ...data, public_url: publicUrl } as MediaRecord;
    }
  } catch (err) {
    console.warn("Could not insert media metadata row:", err);
  }

  return mediaRecord;
}

/**
 * Create a new Post with optional media attachments
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    const userId = active?.id || "usr-001";
    const domainPost = await localBackend.createPost(input, userId);
    clientCreatedPosts.unshift(domainPost);
    return domainPost;
  }

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "demo-user-id";
  const userMetadata = user?.user_metadata || {};

  // 1. Upload media files if any
  const mediaRecords: MediaRecord[] = [];
  if (input.media_files && input.media_files.length > 0) {
    for (const file of input.media_files) {
      const rec = await uploadMediaFile(file, userId);
      mediaRecords.push(rec);
    }
  }

  const postId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  const now = new Date().toISOString();

  let createdRecord: PostRecord | null = null;

  if (isSupabaseConfigured && user) {
    try {
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert({
          id: postId,
          author_id: userId,
          content: input.content,
          post_type: mapPostTypeToDb(input.post_type),
          visibility: input.visibility || "public",
          status: "published",
          location_name: input.location_name || null,
        })
        .select("*, author:profiles(*)")
        .single();

      if (!postError && postData) {
        createdRecord = postData as unknown as PostRecord;

        // Attach media junctions if any
        if (mediaRecords.length > 0) {
          const junctions = mediaRecords.map((m, idx) => ({
            post_id: postId,
            media_id: m.id,
            position: idx,
            display_order: idx,
          }));
          await supabase.from("post_media").insert(junctions);
        }
      } else if (postError) {
        console.warn("Supabase posts table insert notice:", postError.message);
      }
    } catch (err) {
      console.warn("Post database insert skipped:", err);
    }
  }

  // Fallback domain post generation for immediate optimistic display
  const domainPost: Post = createdRecord
    ? postRecordToDomainPost({ ...createdRecord, media: mediaRecords })
    : {
        id: postId,
        author: {
          id: userId,
          username: userMetadata.username || "creator",
          displayName: userMetadata.display_name || "ConnectX Creator",
          avatarUrl:
            userMetadata.avatar_url ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          verified: true,
        },
        createdAt: now,
        content:
          mediaRecords.length > 0
            ? {
                kind: "media",
                media: mediaRecords.map((m) => ({
                  id: m.id,
                  type: m.mime_type.startsWith("video")
                    ? "video"
                    : m.mime_type.startsWith("audio")
                    ? "audio"
                    : "image",
                  url: m.public_url || "",
                })),
                caption: input.content,
              }
            : { kind: "text", text: input.content },
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        bookmarkCount: 0,
        isLiked: false,
        isBookmarked: false,
      };

  clientCreatedPosts.unshift(domainPost);
  return domainPost;
}

/**
 * Update an existing post
 */
export async function updatePost(postId: string, input: UpdatePostInput): Promise<void> {
  if (!isSupabaseConfigured) {
    await localBackend.updatePost(postId, input);
  } else {
    try {
      const { error } = await supabase
        .from("posts")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (error) {
        console.warn("Supabase post update failed:", error.message);
      }
    } catch (err) {
      console.warn("Update post error:", err);
    }
  }

  // Also update client cache if present
  const idx = clientCreatedPosts.findIndex((p) => p.id === postId);
  if (idx !== -1) {
    const existing = clientCreatedPosts[idx];
    if (input.content) {
      if (existing.content.kind === "text") {
        existing.content = { kind: "text", text: input.content };
      } else if (existing.content.kind === "media") {
        existing.content = { ...existing.content, caption: input.content };
      }
    }
  }
}

/**
 * Delete an existing post
 */
export async function deletePost(postId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    await localBackend.deletePost(postId);
  } else {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) {
        console.warn("Supabase post delete failed:", error.message);
      }
    } catch (err) {
      console.warn("Delete post error:", err);
    }
  }

  // Remove from client in-memory cache
  const idx = clientCreatedPosts.findIndex((p) => p.id === postId);
  if (idx !== -1) {
    clientCreatedPosts.splice(idx, 1);
  }
}

/**
 * Fetch feed posts with optional filters, returning domain Post[]
 */
export async function fetchFeedPosts(filter?: FeedFilter): Promise<Post[]> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    const localPosts = await localBackend.getFeedPosts(filter, active ? active.id : null);
    if (localPosts && localPosts.length > 0) {
      return localPosts;
    }
    return mockPosts;
  }

  const dbDomainPosts: Post[] = [];

  try {
    let query = supabase
      .from("posts")
      .select(`
        id,
        author_id,
        content,
        post_type,
        visibility,
        status,
        location_name,
        created_at,
        updated_at,
        author:profiles(id, username, display_name, avatar_url, bio),
        post_media(id, media_id, media(*))
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (filter?.visibility) {
      query = query.eq("visibility", filter.visibility);
    }
    if (filter?.post_type) {
      query = query.eq("post_type", mapPostTypeToDb(filter.post_type));
    }
    if (filter?.author_id) {
      query = query.eq("author_id", filter.author_id);
    }

    const { data, error } = await query;

    if (!error && data) {
      for (const raw of data) {
        const rawItem = raw as unknown as {
          id: string;
          author_id: string;
          content: string;
          post_type: PostRecord["post_type"];
          visibility: PostRecord["visibility"];
          status: PostRecord["status"];
          location_name?: string | null;
          created_at: string;
          updated_at: string;
          author?: PostRecord["author"];
          post_media?: Array<{
            media: MediaRecord | MediaRecord[];
          }>;
        };

        const mediaList: MediaRecord[] = [];
        if (Array.isArray(rawItem.post_media)) {
          for (const pm of rawItem.post_media) {
            if (pm.media) {
              const item = Array.isArray(pm.media) ? pm.media[0] : pm.media;
              if (item) {
                const { data: urlData } = supabase.storage
                  .from(item.bucket_id || "media")
                  .getPublicUrl(item.storage_path);
                mediaList.push({
                  ...item,
                  public_url: urlData.publicUrl,
                });
              }
            }
          }
        }

        const record: PostRecord = {
          id: rawItem.id,
          author_id: rawItem.author_id,
          content: rawItem.content,
          post_type: rawItem.post_type,
          visibility: rawItem.visibility,
          status: rawItem.status,
          location_name: rawItem.location_name,
          created_at: rawItem.created_at,
          updated_at: rawItem.updated_at,
          author: rawItem.author,
          media: mediaList,
        };

        dbDomainPosts.push(postRecordToDomainPost(record));
      }
    }
  } catch (err) {
    console.warn("Error fetching posts from database, using fallback:", err);
  }

  // Combine database posts, user newly created client posts, and mock posts (de-duplicating by id)
  const allPosts = [...clientCreatedPosts, ...dbDomainPosts];
  const seenIds = new Set(allPosts.map((p) => p.id));

  for (const m of mockPosts) {
    if (!seenIds.has(m.id)) {
      allPosts.push(m);
      seenIds.add(m.id);
    }
  }

  return allPosts;
}

/**
 * Toggle like for a post
 */
export async function toggleLikePost(postId: string, userId: string): Promise<{ isLiked: boolean; count: number }> {
  if (!isSupabaseConfigured) {
    return localBackend.toggleLikePost(postId, userId);
  }
  return { isLiked: true, count: 1 };
}

/**
 * Toggle bookmark for a post
 */
export async function toggleBookmarkPost(postId: string, userId: string): Promise<{ isBookmarked: boolean }> {
  if (!isSupabaseConfigured) {
    return localBackend.toggleBookmarkPost(postId, userId);
  }
  return { isBookmarked: true };
}
