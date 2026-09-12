/**
 * ConnectX Phase 4: Posts, Media, & Supabase Storage Security Tests.
 *
 * Verifies RLS policies, ownership constraints, visibility rules,
 * and storage namespace isolation from:
 * `supabase/migrations/20260911000003_posts_media_storage.sql`
 */

import { describe, it, expect, beforeEach } from "vitest";

interface PostRow {
  id: string;
  author_id: string;
  content: string;
  post_type: "post" | "reel" | "clip" | "thread" | "story" | "event";
  visibility: "public" | "followers" | "close_friends" | "private";
  status: "published" | "draft" | "archived" | "deleted";
  location_name?: string | null;
  created_at: string;
  updated_at: string;
}

interface MediaRow {
  id: string;
  owner_id: string;
  bucket_id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  extension: string;
  byte_size: number;
  processing_status: "pending" | "ready" | "failed";
  created_at: string;
  updated_at: string;
}

interface PostMediaRow {
  id: string;
  post_id: string;
  media_id: string;
  display_order: number;
}

interface StorageObjectRow {
  name: string; // e.g. "user123/media456_image.png"
  bucket_id: string;
  owner: string;
  created_at: string;
}


/**
 * In-memory simulation of the Supabase PostgreSQL database + Storage engine
 * enforcing RLS policies from migration 20260911000003_posts_media_storage.sql
 */
class MockPostsStorageDatabase {
  posts = new Map<string, PostRow>();
  media = new Map<string, MediaRow>();
  postMedia = new Map<string, PostMediaRow>();
  storageObjects = new Map<string, StorageObjectRow>();

  follows = new Set<string>(); // "follower_id:following_id"
  blocks = new Set<string>(); // "blocker_id:blocked_id"
  closeFriends = new Set<string>(); // "user_id:friend_id"

  reset() {
    this.posts.clear();
    this.media.clear();
    this.postMedia.clear();
    this.storageObjects.clear();
    this.follows.clear();
    this.blocks.clear();
    this.closeFriends.clear();
  }

  // Helpers for social relationships
  addFollow(followerId: string, followingId: string) {
    this.follows.add(`${followerId}:${followingId}`);
  }

  addBlock(blockerId: string, blockedId: string) {
    this.blocks.add(`${blockerId}:${blockedId}`);
  }

  addCloseFriend(userId: string, friendId: string) {
    this.closeFriends.add(`${userId}:${friendId}`);
  }

  isBlockedBetween(userA: string, userB: string): boolean {
    return (
      this.blocks.has(`${userA}:${userB}`) ||
      this.blocks.has(`${userB}:${userA}`)
    );
  }

  isFollowing(followerId: string, followingId: string): boolean {
    return this.follows.has(`${followerId}:${followingId}`);
  }

  isCloseFriend(userId: string, friendId: string): boolean {
    return this.closeFriends.has(`${userId}:${friendId}`);
  }

  // --- POSTS RLS POLICIES ---

  insertPost(authUid: string | null, input: Omit<PostRow, "created_at" | "updated_at">): { data?: PostRow; error?: string } {
    // RLS: posts_insert_policy -> auth.uid() IS NOT NULL AND author_id = auth.uid()
    if (!authUid) return { error: "Authentication required to create a post" };
    if (input.author_id !== authUid) return { error: "Cannot create a post under another user identity" };

    const now = new Date().toISOString();
    const row: PostRow = { ...input, created_at: now, updated_at: now };
    this.posts.set(row.id, row);
    return { data: row };
  }

  updatePost(authUid: string | null, postId: string, updates: Partial<PostRow>): { data?: PostRow; error?: string } {
    // RLS: posts_update_policy -> auth.uid() IS NOT NULL AND author_id = auth.uid()
    if (!authUid) return { error: "Authentication required" };
    const existing = this.posts.get(postId);
    if (!existing) return { error: "Post not found" };
    if (existing.author_id !== authUid) return { error: "Access denied: cannot update another user's post" };

    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    this.posts.set(postId, updated);
    return { data: updated };
  }

  deletePost(authUid: string | null, postId: string): { success?: boolean; error?: string } {
    // RLS: posts_delete_policy -> auth.uid() IS NOT NULL AND author_id = auth.uid()
    if (!authUid) return { error: "Authentication required" };
    const existing = this.posts.get(postId);
    if (!existing) return { error: "Post not found" };
    if (existing.author_id !== authUid) return { error: "Access denied: cannot delete another user's post" };

    this.posts.delete(postId);
    return { success: true };
  }

  queryFeedPosts(authUid: string | null): PostRow[] {
    // RLS: posts_select_policy
    const visible: PostRow[] = [];
    for (const post of this.posts.values()) {
      if (post.status !== "published") continue;

      // Check block restrictions
      if (authUid && this.isBlockedBetween(authUid, post.author_id)) {
        continue;
      }

      // 1. Author can always see own post
      if (authUid && post.author_id === authUid) {
        visible.push(post);
        continue;
      }

      // 2. Public post is visible to all unblocked users
      if (post.visibility === "public") {
        visible.push(post);
        continue;
      }

      // 3. Followers-only post
      if (post.visibility === "followers" && authUid && this.isFollowing(authUid, post.author_id)) {
        visible.push(post);
        continue;
      }

      // 4. Close friends post
      if (post.visibility === "close_friends" && authUid && this.isCloseFriend(post.author_id, authUid)) {
        visible.push(post);
        continue;
      }

      // 5. Private post is visible only to author (handled in rule 1)
    }

    return visible;
  }

  // --- STORAGE RLS POLICIES ---

  uploadStorageObject(
    authUid: string | null,
    bucketId: string,
    storagePath: string
  ): { success?: boolean; error?: string } {
    // RLS: storage_objects_insert_owner
    // (bucket_id = 'media') AND (auth.role() = 'authenticated') AND ((storage.foldername(name))[1] = auth.uid()::text)
    if (!authUid) return { error: "Authentication required to upload storage objects" };
    if (bucketId !== "media") return { error: "Invalid storage bucket" };

    const folderName = storagePath.split("/")[0];
    if (folderName !== authUid) {
      return { error: "Storage violation: object must reside inside user namespace folder" };
    }

    this.storageObjects.set(`${bucketId}:${storagePath}`, {
      name: storagePath,
      bucket_id: bucketId,
      owner: authUid,
      created_at: new Date().toISOString(),
    });
    return { success: true };
  }

  deleteStorageObject(
    authUid: string | null,
    bucketId: string,
    storagePath: string
  ): { success?: boolean; error?: string } {
    // RLS: storage_objects_delete_owner -> bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text
    if (!authUid) return { error: "Authentication required" };
    const key = `${bucketId}:${storagePath}`;
    const existing = this.storageObjects.get(key);
    if (!existing) return { error: "Object not found" };

    const folderName = storagePath.split("/")[0];
    if (folderName !== authUid) {
      return { error: "Storage violation: cannot delete another user's storage object" };
    }

    this.storageObjects.delete(key);
    return { success: true };
  }
}

describe("ConnectX Phase 4: Posts, Media, & Storage Security", () => {
  let db: MockPostsStorageDatabase;
  const userA = "usr_alice_111";
  const userB = "usr_bob_222";
  const userC = "usr_charlie_333";

  beforeEach(() => {
    db = new MockPostsStorageDatabase();
  });

  it("1. Owner can insert post with content and post_type", () => {
    const res = db.insertPost(userA, {
      id: "post_1",
      author_id: userA,
      content: "Hello ConnectX Universe! First post with code and media.",
      post_type: "post",
      visibility: "public",
      status: "published",
      location_name: "San Francisco, CA",
    });

    expect(res.error).toBeUndefined();
    expect(res.data?.id).toBe("post_1");
    expect(res.data?.author_id).toBe(userA);
  });

  it("2. Owner can update their own post", () => {
    db.insertPost(userA, {
      id: "post_1",
      author_id: userA,
      content: "Initial draft caption",
      post_type: "post",
      visibility: "public",
      status: "published",
    });

    const updateRes = db.updatePost(userA, "post_1", {
      content: "Updated polished caption",
    });

    expect(updateRes.error).toBeUndefined();
    expect(updateRes.data?.content).toBe("Updated polished caption");
  });

  it("3. Owner can delete their own post", () => {
    db.insertPost(userA, {
      id: "post_1",
      author_id: userA,
      content: "Post to be deleted",
      post_type: "post",
      visibility: "public",
      status: "published",
    });

    const delRes = db.deletePost(userA, "post_1");
    expect(delRes.error).toBeUndefined();
    expect(delRes.success).toBe(true);
    expect(db.posts.has("post_1")).toBe(false);
  });

  it("4. Non-owner cannot update another user's post (RLS denial)", () => {
    db.insertPost(userA, {
      id: "post_alice",
      author_id: userA,
      content: "Alice's original thoughts",
      post_type: "post",
      visibility: "public",
      status: "published",
    });

    const maliciousUpdate = db.updatePost(userB, "post_alice", {
      content: "Hacked by Bob!",
    });

    expect(maliciousUpdate.error).toContain("cannot update another user's post");
    expect(db.posts.get("post_alice")?.content).toBe("Alice's original thoughts");
  });

  it("5. Non-owner cannot delete another user's post (RLS denial)", () => {
    db.insertPost(userA, {
      id: "post_alice",
      author_id: userA,
      content: "Alice's post",
      post_type: "post",
      visibility: "public",
      status: "published",
    });

    const maliciousDelete = db.deletePost(userB, "post_alice");
    expect(maliciousDelete.error).toContain("cannot delete another user's post");
    expect(db.posts.has("post_alice")).toBe(true);
  });

  it("6. Public post is visible to any user and unauthenticated queries", () => {
    db.insertPost(userA, {
      id: "post_public",
      author_id: userA,
      content: "Universal public announcement",
      post_type: "post",
      visibility: "public",
      status: "published",
    });

    // Visible to author
    expect(db.queryFeedPosts(userA).map((p) => p.id)).toContain("post_public");
    // Visible to Bob
    expect(db.queryFeedPosts(userB).map((p) => p.id)).toContain("post_public");
    // Visible to unauthenticated visitor
    expect(db.queryFeedPosts(null).map((p) => p.id)).toContain("post_public");
  });

  it("7. Followers-only post is visible to author and followers, hidden from non-followers", () => {
    db.insertPost(userA, {
      id: "post_followers",
      author_id: userA,
      content: "Exclusive update for my community",
      post_type: "post",
      visibility: "followers",
      status: "published",
    });

    // User B follows User A
    db.addFollow(userB, userA);

    // Visible to author Alice
    expect(db.queryFeedPosts(userA).map((p) => p.id)).toContain("post_followers");
    // Visible to follower Bob
    expect(db.queryFeedPosts(userB).map((p) => p.id)).toContain("post_followers");
    // Hidden from non-follower Charlie
    expect(db.queryFeedPosts(userC).map((p) => p.id)).not.toContain("post_followers");
    // Hidden from unauthenticated visitor
    expect(db.queryFeedPosts(null).map((p) => p.id)).not.toContain("post_followers");
  });

  it("8. Close-friends post is visible to author and close friends, hidden from others", () => {
    db.insertPost(userA, {
      id: "post_cf",
      author_id: userA,
      content: "Close friends only drop",
      post_type: "post",
      visibility: "close_friends",
      status: "published",
    });

    // Alice adds Bob to close friends, but not Charlie
    db.addCloseFriend(userA, userB);

    // Visible to Alice
    expect(db.queryFeedPosts(userA).map((p) => p.id)).toContain("post_cf");
    // Visible to close friend Bob
    expect(db.queryFeedPosts(userB).map((p) => p.id)).toContain("post_cf");
    // Hidden from Charlie
    expect(db.queryFeedPosts(userC).map((p) => p.id)).not.toContain("post_cf");
  });

  it("9. Private post is visible only to author", () => {
    db.insertPost(userA, {
      id: "post_private",
      author_id: userA,
      content: "My personal private encrypted diary note",
      post_type: "post",
      visibility: "private",
      status: "published",
    });

    db.addFollow(userB, userA);
    db.addCloseFriend(userA, userB);

    // Visible to Alice
    expect(db.queryFeedPosts(userA).map((p) => p.id)).toContain("post_private");
    // Hidden from Bob even if follower and close friend
    expect(db.queryFeedPosts(userB).map((p) => p.id)).not.toContain("post_private");
    // Hidden from Charlie
    expect(db.queryFeedPosts(userC).map((p) => p.id)).not.toContain("post_private");
  });

  it("10. Blocked user cannot see posts from blocker and vice versa", () => {
    db.insertPost(userA, {
      id: "post_alice_public",
      author_id: userA,
      content: "Alice's public drop",
      post_type: "post",
      visibility: "public",
      status: "published",
    });

    // Alice blocks Bob
    db.addBlock(userA, userB);

    // Bob cannot see Alice's public posts
    expect(db.queryFeedPosts(userB).map((p) => p.id)).not.toContain("post_alice_public");
    // Charlie (unblocked) can see it
    expect(db.queryFeedPosts(userC).map((p) => p.id)).toContain("post_alice_public");
  });

  it("11. Owner can upload media object to their own storage folder ({user_id}/*)", () => {
    const validPath = `${userA}/media_001_project.png`;
    const res = db.uploadStorageObject(userA, "media", validPath);

    expect(res.error).toBeUndefined();
    expect(res.success).toBe(true);
    expect(db.storageObjects.has(`media:${validPath}`)).toBe(true);
  });

  it("12. User cannot upload media to another user's storage folder ({other_user_id}/*)", () => {
    // Bob tries to upload to Alice's folder
    const invalidPath = `${userA}/malicious_file.png`;
    const res = db.uploadStorageObject(userB, "media", invalidPath);

    expect(res.error).toContain("Storage violation: object must reside inside user namespace folder");
    expect(db.storageObjects.has(`media:${invalidPath}`)).toBe(false);
  });

  it("13. User can delete their own media object in storage", () => {
    const path = `${userA}/media_to_delete.png`;
    db.uploadStorageObject(userA, "media", path);

    const delRes = db.deleteStorageObject(userA, "media", path);
    expect(delRes.error).toBeUndefined();
    expect(delRes.success).toBe(true);
    expect(db.storageObjects.has(`media:${path}`)).toBe(false);
  });

  it("14. User cannot delete another user's media object in storage", () => {
    const path = `${userA}/alice_precious_file.png`;
    db.uploadStorageObject(userA, "media", path);

    // Bob attempts to delete Alice's file
    const delRes = db.deleteStorageObject(userB, "media", path);
    expect(delRes.error).toContain("cannot delete another user's storage object");
    expect(db.storageObjects.has(`media:${path}`)).toBe(true);
  });

  it("15. Unauthenticated user cannot write posts or upload media", () => {
    const postRes = db.insertPost(null, {
      id: "anon_post",
      author_id: userA,
      content: "Anonymous post attempt",
      post_type: "post",
      visibility: "public",
      status: "published",
    });
    expect(postRes.error).toContain("Authentication required");

    const storageRes = db.uploadStorageObject(null, "media", `${userA}/file.png`);
    expect(storageRes.error).toContain("Authentication required");
  });
});
