import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { localBackend } from "@/lib/local-backend-service";
import type { Database } from "@/types/database.types";
import type {
  ProfileData,
  ProfileRelationship,
  ProfileCounts,
  PrivacySettingsData,
  FollowRequestData,
} from "@/features/profile/types/social-types";

/**
 * Fetch profile by normalized username
 */
export async function getProfileByUsername(username: string): Promise<ProfileData | null> {
  if (!isSupabaseConfigured) {
    return localBackend.getProfileByUsername(username);
  }

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_.]/g, "");
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, username_normalized, display_name, avatar_url, bio, website, location, pronouns, created_at, updated_at")
    .eq("username_normalized", cleanUsername)
    .maybeSingle();

  if (error) {
    console.warn("Error fetching profile by username:", error.message);
    return null;
  }
  return data as ProfileData | null;
}

/**
 * Fetch profile by user UUID
 */
export async function getProfileById(userId: string): Promise<ProfileData | null> {
  if (!isSupabaseConfigured) {
    return localBackend.getProfileById(userId);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, username_normalized, display_name, avatar_url, bio, website, location, pronouns, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Error fetching profile by id:", error.message);
    return null;
  }
  return data as ProfileData | null;
}

/**
 * Update authenticated user's own profile
 */
export async function updateCurrentProfile(updates: Partial<ProfileData>): Promise<{ success: boolean; error?: string; data?: ProfileData }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    return localBackend.updateProfile(active.id, updates);
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const payload: Database["public"]["Tables"]["profiles"]["Update"] = {
    updated_at: new Date().toISOString(),
  };

  if (updates.display_name !== undefined) payload.display_name = updates.display_name;
  if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.website !== undefined) payload.website = updates.website;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.pronouns !== undefined) payload.pronouns = updates.pronouns;

  if (updates.username) {
    const clean = updates.username.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    if (!clean) {
      return { success: false, error: "Invalid username format" };
    }
    payload.username = updates.username;
    payload.username_normalized = clean;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", session.user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as ProfileData };
}

/**
 * Get social relationship state between current user and target user
 */
export async function getProfileRelationship(targetUserId: string): Promise<ProfileRelationship> {
  const defaultState: ProfileRelationship = {
    is_following: false,
    is_followed_by: false,
    follow_request_status: "none",
    is_blocked: false,
    is_blocking: false,
    is_muted: false,
    is_close_friend: false,
    is_private: false,
  };

  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    return localBackend.getProfileRelationship(active ? active.id : null, targetUserId);
  }

  try {
    const { data, error } = await supabase.rpc("get_profile_relationship", {
      p_target_user_id: targetUserId,
    });

    if (error || !data) {
      return defaultState;
    }

    return data as unknown as ProfileRelationship;
  } catch (err) {
    console.warn("Relationship lookup fallback:", err);
    return defaultState;
  }
}

/**
 * Get follower and following counts for a user
 */
export async function getProfileCounts(userId: string): Promise<ProfileCounts> {
  if (!isSupabaseConfigured) {
    return localBackend.getProfileCounts(userId);
  }

  try {
    const { data, error } = await supabase.rpc("get_profile_counts", {
      p_user_id: userId,
    });

    if (error || !data) {
      const [followersRes, followingRes] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
      ]);
      return {
        followers_count: followersRes.count ?? 0,
        following_count: followingRes.count ?? 0,
      };
    }

    return data as unknown as ProfileCounts;
  } catch (err) {
    console.warn("Count lookup fallback:", err);
    return { followers_count: 0, following_count: 0 };
  }
}

/**
 * Follow user (Handles public direct follow vs private follow request)
 */
export async function followUser(targetUserId: string): Promise<{ success: boolean; status?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    return localBackend.followUser(active.id, targetUserId);
  }

  try {
    const { data, error } = await supabase.rpc("follow_user", {
      p_target_user_id: targetUserId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const res = data as { status: string };
    return { success: true, status: res?.status || "following" };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to follow user" };
  }
}

/**
 * Unfollow user (or cancel pending request)
 */
export async function unfollowUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    return localBackend.unfollowUser(active.id, targetUserId);
  }

  try {
    const { error } = await supabase.rpc("unfollow_user", {
      p_target_user_id: targetUserId,
    });

    if (error) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", session.user.id)
          .eq("following_id", targetUserId);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to unfollow user" };
  }
}

/**
 * Accept follow request
 */
export async function acceptFollowRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.rpc("accept_follow_request", {
      p_request_id: requestId,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to accept follow request" };
  }
}

/**
 * Reject follow request
 */
export async function rejectFollowRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.rpc("reject_follow_request", {
      p_request_id: requestId,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to reject follow request" };
  }
}

/**
 * Cancel follow request
 */
export async function cancelFollowRequest(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false };
    return localBackend.unfollowUser(active.id, targetUserId);
  }

  try {
    const { error } = await supabase.rpc("cancel_follow_request", {
      p_target_user_id: targetUserId,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to cancel follow request" };
  }
}

/**
 * Block user
 */
export async function blockUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    return localBackend.blockUser(active.id, targetUserId);
  }

  try {
    const { error } = await supabase.rpc("block_user", {
      p_target_user_id: targetUserId,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to block user" };
  }
}

/**
 * Unblock user
 */
export async function unblockUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    return localBackend.unblockUser(active.id, targetUserId);
  }

  try {
    const { error } = await supabase.rpc("unblock_user", {
      p_target_user_id: targetUserId,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to unblock user" };
  }
}

/**
 * Mute user
 */
export async function muteUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    return localBackend.muteUser(active.id, targetUserId);
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("mutes").insert({
    user_id: session.user.id,
    muted_user_id: targetUserId,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Unmute user
 */
export async function unmuteUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    return localBackend.unmuteUser(active.id, targetUserId);
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("mutes")
    .delete()
    .eq("user_id", session.user.id)
    .eq("muted_user_id", targetUserId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Close Friends management
 */
export async function getCloseFriends(): Promise<ProfileData[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from("close_friends")
    .select("friend_id, profiles!friend_id(id, username, display_name, avatar_url)")
    .eq("user_id", session.user.id);

  if (error || !data) return [];
  return data
    .map((row) => (row as Record<string, unknown>).profiles as ProfileData)
    .filter(Boolean);
}

export async function addCloseFriend(friendId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    await localBackend.toggleCloseFriend(active.id, friendId);
    return { success: true };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("close_friends").insert({
    user_id: session.user.id,
    friend_id: friendId,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function removeCloseFriend(friendId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    await localBackend.toggleCloseFriend(active.id, friendId);
    return { success: true };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("close_friends")
    .delete()
    .eq("user_id", session.user.id)
    .eq("friend_id", friendId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Blocked accounts management
 */
export async function getBlockedUsers(): Promise<{ id: string; username: string; display_name: string; avatar_url: string | null }[]> {
  if (!isSupabaseConfigured) return [];

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from("blocks")
    .select("blocked_id, profiles!blocked_id(id, username, display_name, avatar_url)")
    .eq("blocker_id", session.user.id);

  if (error || !data) return [];
  return data
    .map((row) => (row as Record<string, unknown>).profiles as { id: string; username: string; display_name: string; avatar_url: string | null })
    .filter(Boolean);
}

/**
 * Muted accounts management
 */
export async function getMutedUsers(): Promise<{ id: string; username: string; display_name: string; avatar_url: string | null }[]> {
  if (!isSupabaseConfigured) return [];

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from("mutes")
    .select("muted_user_id, profiles!muted_user_id(id, username, display_name, avatar_url)")
    .eq("user_id", session.user.id);

  if (error || !data) return [];
  return data
    .map((row) => (row as Record<string, unknown>).profiles as { id: string; username: string; display_name: string; avatar_url: string | null })
    .filter(Boolean);
}

/**
 * Privacy Settings
 */
export async function getPrivacySettings(userId?: string): Promise<PrivacySettingsData | null> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    const targetId = userId || active?.id || "demo";
    return localBackend.getPrivacySettings(targetId);
  }

  const { data: { session } } = await supabase.auth.getSession();
  const targetId = userId || session?.user?.id;
  if (!targetId) return null;

  const { data, error } = await supabase
    .from("privacy_settings")
    .select("*")
    .eq("user_id", targetId)
    .maybeSingle();

  if (error || !data) {
    return {
      user_id: targetId,
      account_visibility: "public",
    };
  }

  return data as PrivacySettingsData;
}

export async function updatePrivacySettings(settings: Partial<PrivacySettingsData>): Promise<{ success: boolean; error?: string; data?: PrivacySettingsData }> {
  if (!isSupabaseConfigured) {
    const active = await localBackend.getActiveUser();
    if (!active) return { success: false, error: "Not authenticated" };
    return localBackend.updatePrivacySettings(active.id, settings);
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const payload = {
    user_id: session.user.id,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("privacy_settings")
    .upsert(payload)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as PrivacySettingsData };
}

/**
 * Get pending follow requests directed to authenticated user
 */
export async function getPendingFollowRequests(): Promise<FollowRequestData[]> {
  if (!isSupabaseConfigured) return [];

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from("follow_requests")
    .select("id, requester_id, target_user_id, status, created_at, updated_at, profiles!requester_id(id, username, display_name, avatar_url)")
    .eq("target_user_id", session.user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((item) => ({
    id: item.id,
    requester_id: item.requester_id,
    target_user_id: item.target_user_id,
    status: item.status as "pending",
    created_at: item.created_at,
    updated_at: item.updated_at,
    requester: (item as Record<string, unknown>).profiles as ProfileData,
  }));
}
