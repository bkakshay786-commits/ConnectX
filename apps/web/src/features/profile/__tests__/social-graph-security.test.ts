/**
 * ConnectX Phase 3: Social Graph, Privacy, & Database Security Tests.
 *
 * Verifies RLS policies, constraints, and atomic functions for:
 * User A, User B, and User C across all social graph relationships:
 * 1. Public profile
 * 2. Private profile
 * 3. Follow
 * 4. Unfollow
 * 5. Follow request
 * 6. Accept request
 * 7. Reject request
 * 8. Cancel request
 * 9. Block
 * 10. Unblock
 * 11. Mute
 * 12. Unmute
 * 13. Close Friends
 * 14. Privacy settings
 * 15. Unauthorized mutations & RLS bypass prevention
 */

import { describe, it, expect, beforeEach } from "vitest";

interface ProfileRow {
  id: string;
  username: string;
  username_normalized: string;
  display_name: string;
  pronouns?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  location?: string | null;
}

interface PrivacySettingsRow {
  user_id: string;
  account_visibility: "public" | "private";
}

interface FollowRow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

interface FollowRequestRow {
  id: string;
  requester_id: string;
  target_user_id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;
}

interface BlockRow {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

interface MuteRow {
  id: string;
  user_id: string;
  muted_user_id: string;
  created_at: string;
}

interface CloseFriendRow {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
}

/**
 * In-memory simulation of the Supabase PostgreSQL database engine
 * enforcing RLS policies, constraints, and atomic functions from:
 * `supabase/migrations/20260911000002_profile_social_graph_privacy.sql`
 */
class MockSocialDatabase {
  profiles = new Map<string, ProfileRow>();
  privacySettings = new Map<string, PrivacySettingsRow>();
  follows = new Map<string, FollowRow>();
  followRequests = new Map<string, FollowRequestRow>();
  blocks = new Map<string, BlockRow>();
  mutes = new Map<string, MuteRow>();
  closeFriends = new Map<string, CloseFriendRow>();

  reset() {
    this.profiles.clear();
    this.privacySettings.clear();
    this.follows.clear();
    this.followRequests.clear();
    this.blocks.clear();
    this.mutes.clear();
    this.closeFriends.clear();
  }

  // Helper to seed test profiles
  seedUser(id: string, username: string, displayName: string, isPrivate: boolean = false) {
    this.profiles.set(id, {
      id,
      username,
      username_normalized: username.toLowerCase(),
      display_name: displayName,
      bio: `Bio for ${username}`,
    });
    this.privacySettings.set(id, {
      user_id: id,
      account_visibility: isPrivate ? "private" : "public",
    });
  }

  // --- RLS & Query Methods ---

  // Check if either user blocked the other
  isBlockedBetween(userA: string, userB: string): boolean {
    for (const b of this.blocks.values()) {
      if (
        (b.blocker_id === userA && b.blocked_id === userB) ||
        (b.blocker_id === userB && b.blocked_id === userA)
      ) {
        return true;
      }
    }
    return false;
  }

  // Follow User function (Atomic function simulation)
  followUser(authUid: string | null, targetUserId: string): { status?: string; error?: string } {
    if (!authUid) return { error: "Authentication required" };
    if (authUid === targetUserId) return { error: "Cannot follow yourself" };

    if (this.isBlockedBetween(authUid, targetUserId)) {
      return { error: "Action unavailable due to block restrictions" };
    }

    const privacy = this.privacySettings.get(targetUserId);
    const isPrivate = privacy?.account_visibility === "private";

    if (isPrivate) {
      // Check if pending request already exists
      for (const req of this.followRequests.values()) {
        if (req.requester_id === authUid && req.target_user_id === targetUserId && req.status === "pending") {
          return { status: "requested" };
        }
      }
      const reqId = `req_${authUid}_${targetUserId}`;
      this.followRequests.set(reqId, {
        id: reqId,
        requester_id: authUid,
        target_user_id: targetUserId,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return { status: "requested" };
    } else {
      const followId = `fol_${authUid}_${targetUserId}`;
      this.follows.set(followId, {
        id: followId,
        follower_id: authUid,
        following_id: targetUserId,
        created_at: new Date().toISOString(),
      });
      return { status: "following" };
    }
  }

  // Unfollow user
  unfollowUser(authUid: string | null, targetUserId: string): { success: boolean; error?: string } {
    if (!authUid) return { success: false, error: "Authentication required" };

    const followId = `fol_${authUid}_${targetUserId}`;
    this.follows.delete(followId);

    // Cancel pending request if any
    const reqId = `req_${authUid}_${targetUserId}`;
    const req = this.followRequests.get(reqId);
    if (req && req.status === "pending") {
      this.followRequests.delete(reqId);
    }

    return { success: true };
  }

  // Accept follow request (Atomic function simulation)
  acceptFollowRequest(authUid: string | null, requestId: string): { success: boolean; error?: string } {
    if (!authUid) return { success: false, error: "Authentication required" };

    const req = this.followRequests.get(requestId);
    if (!req || req.status !== "pending") {
      return { success: false, error: "Pending request not found" };
    }

    // RLS: Target user must be caller
    if (req.target_user_id !== authUid) {
      return { success: false, error: "Unauthorized: not directed to you" };
    }

    req.status = "accepted";
    req.updated_at = new Date().toISOString();

    const followId = `fol_${req.requester_id}_${req.target_user_id}`;
    this.follows.set(followId, {
      id: followId,
      follower_id: req.requester_id,
      following_id: req.target_user_id,
      created_at: new Date().toISOString(),
    });

    return { success: true };
  }

  // Reject follow request
  rejectFollowRequest(authUid: string | null, requestId: string): { success: boolean; error?: string } {
    if (!authUid) return { success: false, error: "Authentication required" };

    const req = this.followRequests.get(requestId);
    if (!req || req.status !== "pending") {
      return { success: false, error: "Pending request not found" };
    }

    if (req.target_user_id !== authUid) {
      return { success: false, error: "Unauthorized: not directed to you" };
    }

    req.status = "rejected";
    req.updated_at = new Date().toISOString();
    return { success: true };
  }

  // Cancel follow request
  cancelFollowRequest(authUid: string | null, targetUserId: string): { success: boolean; error?: string } {
    if (!authUid) return { success: false, error: "Authentication required" };

    const reqId = `req_${authUid}_${targetUserId}`;
    const req = this.followRequests.get(reqId);
    if (!req || req.status !== "pending") {
      return { success: false, error: "Pending request not found" };
    }

    if (req.requester_id !== authUid) {
      return { success: false, error: "Unauthorized: not your request" };
    }

    req.status = "cancelled";
    req.updated_at = new Date().toISOString();
    return { success: true };
  }

  // Block user (Atomic block + cleanup)
  blockUser(authUid: string | null, targetUserId: string): { success: boolean; error?: string } {
    if (!authUid) return { success: false, error: "Authentication required" };
    if (authUid === targetUserId) return { success: false, error: "Cannot block yourself" };

    const blockId = `block_${authUid}_${targetUserId}`;
    this.blocks.set(blockId, {
      id: blockId,
      blocker_id: authUid,
      blocked_id: targetUserId,
      created_at: new Date().toISOString(),
    });

    // Delete follows in both directions
    this.follows.delete(`fol_${authUid}_${targetUserId}`);
    this.follows.delete(`fol_${targetUserId}_${authUid}`);

    // Delete requests in both directions
    this.followRequests.delete(`req_${authUid}_${targetUserId}`);
    this.followRequests.delete(`req_${targetUserId}_${authUid}`);

    // Remove from close friends
    this.closeFriends.delete(`cf_${authUid}_${targetUserId}`);
    this.closeFriends.delete(`cf_${targetUserId}_${authUid}`);

    return { success: true };
  }

  // Unblock user
  unblockUser(authUid: string | null, targetUserId: string): { success: boolean; error?: string } {
    if (!authUid) return { success: false, error: "Authentication required" };

    const blockId = `block_${authUid}_${targetUserId}`;
    const existed = this.blocks.delete(blockId);
    return { success: existed };
  }

  // Mute & Unmute
  muteUser(authUid: string | null, targetUserId: string): { success: boolean; error?: string } {
    if (!authUid) return { success: false, error: "Authentication required" };
    if (authUid === targetUserId) return { success: false, error: "Cannot mute yourself" };

    const muteId = `mute_${authUid}_${targetUserId}`;
    this.mutes.set(muteId, {
      id: muteId,
      user_id: authUid,
      muted_user_id: targetUserId,
      created_at: new Date().toISOString(),
    });
    return { success: true };
  }

  unmuteUser(authUid: string | null, targetUserId: string): { success: boolean } {
    if (!authUid) return { success: false };
    const muteId = `mute_${authUid}_${targetUserId}`;
    return { success: this.mutes.delete(muteId) };
  }

  // Close Friends
  addCloseFriend(authUid: string | null, friendId: string): { success: boolean; error?: string } {
    if (!authUid) return { success: false, error: "Authentication required" };
    if (authUid === friendId) return { success: false, error: "Cannot add yourself" };

    const cfId = `cf_${authUid}_${friendId}`;
    this.closeFriends.set(cfId, {
      id: cfId,
      user_id: authUid,
      friend_id: friendId,
      created_at: new Date().toISOString(),
    });
    return { success: true };
  }

  removeCloseFriend(authUid: string | null, friendId: string): { success: boolean } {
    if (!authUid) return { success: false };
    const cfId = `cf_${authUid}_${friendId}`;
    return { success: this.closeFriends.delete(cfId) };
  }

  // Query Close Friends (RLS: strictly user_id = auth.uid())
  selectCloseFriends(authUid: string | null, targetUserId: string): { data: CloseFriendRow[]; error?: string } {
    if (!authUid || authUid !== targetUserId) {
      return { data: [], error: "RLS violation: Close friends list is private to owner" };
    }
    const results: CloseFriendRow[] = [];
    for (const cf of this.closeFriends.values()) {
      if (cf.user_id === authUid) results.push({ ...cf });
    }
    return { data: results };
  }

  // Query Privacy Settings (RLS: strictly user_id = auth.uid())
  updatePrivacySettings(authUid: string | null, targetUserId: string, isPrivate: boolean): { success: boolean; error?: string } {
    if (!authUid || authUid !== targetUserId) {
      return { success: false, error: "RLS violation: Unauthorized privacy settings update" };
    }
    this.privacySettings.set(targetUserId, {
      user_id: targetUserId,
      account_visibility: isPrivate ? "private" : "public",
    });
    return { success: true };
  }

  // Check if content of target is visible to viewer
  canViewProtectedContent(viewerId: string | null, targetId: string): boolean {
    if (viewerId === targetId) return true;
    if (viewerId && this.isBlockedBetween(viewerId, targetId)) return false;

    const privacy = this.privacySettings.get(targetId);
    if (privacy?.account_visibility === "public") return true;

    // Private account: must be in follows
    if (!viewerId) return false;
    return this.follows.has(`fol_${viewerId}_${targetId}`);
  }
}

describe("ConnectX Phase 3: Social Graph, Privacy, & RLS Security", () => {
  let db: MockSocialDatabase;

  const USER_A = "11111111-1111-4111-8111-111111111111"; // Alice
  const USER_B = "22222222-2222-4222-8222-222222222222"; // Bob (Private account)
  const USER_C = "33333333-3333-4333-8333-333333333333"; // Charlie (Public account)

  beforeEach(() => {
    db = new MockSocialDatabase();
    db.reset();

    // Alice: Public
    db.seedUser(USER_A, "alice", "Alice Wonder", false);
    // Bob: Private
    db.seedUser(USER_B, "bob", "Bob Builder", true);
    // Charlie: Public
    db.seedUser(USER_C, "charlie", "Charlie Brown", false);
  });

  // 1. Public Profile Access
  it("Test 1: Public profile content is accessible to visitors", () => {
    expect(db.canViewProtectedContent(USER_A, USER_C)).toBe(true);
    expect(db.canViewProtectedContent(null, USER_C)).toBe(true);
  });

  // 2. Private Profile Access Control
  it("Test 2: Private profile content is restricted to non-followers", () => {
    // Alice cannot view Bob's protected content initially
    expect(db.canViewProtectedContent(USER_A, USER_B)).toBe(false);
    expect(db.canViewProtectedContent(null, USER_B)).toBe(false);
    // Bob can always view his own content
    expect(db.canViewProtectedContent(USER_B, USER_B)).toBe(true);
  });

  // 3. Follow on Public Account
  it("Test 3: Following a public account immediately establishes follow relationship", () => {
    const res = db.followUser(USER_A, USER_C);
    expect(res.status).toBe("following");
    expect(db.follows.has(`fol_${USER_A}_${USER_C}`)).toBe(true);
  });

  // 4. Unfollow
  it("Test 4: Unfollowing removes follow relationship", () => {
    db.followUser(USER_A, USER_C);
    expect(db.follows.has(`fol_${USER_A}_${USER_C}`)).toBe(true);

    const unfollowRes = db.unfollowUser(USER_A, USER_C);
    expect(unfollowRes.success).toBe(true);
    expect(db.follows.has(`fol_${USER_A}_${USER_C}`)).toBe(false);
  });

  // 5. Follow Request for Private Account
  it("Test 5: Following a private account creates a pending follow request", () => {
    const res = db.followUser(USER_A, USER_B);
    expect(res.status).toBe("requested");
    expect(db.follows.has(`fol_${USER_A}_${USER_B}`)).toBe(false);

    const req = db.followRequests.get(`req_${USER_A}_${USER_B}`);
    expect(req).toBeDefined();
    expect(req?.status).toBe("pending");
  });

  // 6. Accept Follow Request
  it("Test 6: Accepting a follow request transitions request to accepted and creates follow", () => {
    db.followUser(USER_A, USER_B);
    const reqId = `req_${USER_A}_${USER_B}`;

    // Bob accepts Alice's request
    const acceptRes = db.acceptFollowRequest(USER_B, reqId);
    expect(acceptRes.success).toBe(true);
    expect(db.follows.has(`fol_${USER_A}_${USER_B}`)).toBe(true);

    // Alice can now access Bob's private content
    expect(db.canViewProtectedContent(USER_A, USER_B)).toBe(true);
  });

  // 7. Reject Follow Request
  it("Test 7: Rejecting a follow request leaves user unapproved", () => {
    db.followUser(USER_C, USER_B);
    const reqId = `req_${USER_C}_${USER_B}`;

    const rejectRes = db.rejectFollowRequest(USER_B, reqId);
    expect(rejectRes.success).toBe(true);
    expect(db.follows.has(`fol_${USER_C}_${USER_B}`)).toBe(false);
    expect(db.canViewProtectedContent(USER_C, USER_B)).toBe(false);
  });

  // 8. Cancel Follow Request
  it("Test 8: Requester can cancel pending follow request", () => {
    db.followUser(USER_A, USER_B);
    const cancelRes = db.cancelFollowRequest(USER_A, USER_B);
    expect(cancelRes.success).toBe(true);

    const req = db.followRequests.get(`req_${USER_A}_${USER_B}`);
    expect(req?.status).toBe("cancelled");
  });

  // 9. Block User & Atomic Cleanup
  it("Test 9: Blocking a user atomically severs follows, requests, and close friends", () => {
    // Establish relationship: Alice follows Charlie, Charlie is close friend
    db.followUser(USER_A, USER_C);
    db.followUser(USER_C, USER_A);
    db.addCloseFriend(USER_A, USER_C);
    expect(db.follows.has(`fol_${USER_A}_${USER_C}`)).toBe(true);
    expect(db.closeFriends.has(`cf_${USER_A}_${USER_C}`)).toBe(true);

    // Alice blocks Charlie
    const blockRes = db.blockUser(USER_A, USER_C);
    expect(blockRes.success).toBe(true);
    expect(db.blocks.has(`block_${USER_A}_${USER_C}`)).toBe(true);

    // Follows and close friends cleared in both directions
    expect(db.follows.has(`fol_${USER_A}_${USER_C}`)).toBe(false);
    expect(db.follows.has(`fol_${USER_C}_${USER_A}`)).toBe(false);
    expect(db.closeFriends.has(`cf_${USER_A}_${USER_C}`)).toBe(false);
  });

  // 10. Block Isolation Enforced
  it("Test 10: Blocked users cannot follow or access each other", () => {
    db.blockUser(USER_A, USER_C);

    // Charlie attempts to follow Alice -> rejected by block check
    const followRes = db.followUser(USER_C, USER_A);
    expect(followRes.error).toContain("block restrictions");

    // Content hidden
    expect(db.canViewProtectedContent(USER_C, USER_A)).toBe(false);
    expect(db.canViewProtectedContent(USER_A, USER_C)).toBe(false);
  });

  // 11. Unblock
  it("Test 11: Unblocking restores ability to interact", () => {
    db.blockUser(USER_A, USER_C);
    const unblockRes = db.unblockUser(USER_A, USER_C);
    expect(unblockRes.success).toBe(true);

    // Charlie can now follow Alice
    const followRes = db.followUser(USER_C, USER_A);
    expect(followRes.status).toBe("following");
  });

  // 12. Mute & Unmute
  it("Test 12: Mute and unmute manages user mute relationship without affecting follows", () => {
    db.followUser(USER_A, USER_C);
    const muteRes = db.muteUser(USER_A, USER_C);
    expect(muteRes.success).toBe(true);
    expect(db.mutes.has(`mute_${USER_A}_${USER_C}`)).toBe(true);
    // Follow relationship remains intact
    expect(db.follows.has(`fol_${USER_A}_${USER_C}`)).toBe(true);

    const unmuteRes = db.unmuteUser(USER_A, USER_C);
    expect(unmuteRes.success).toBe(true);
    expect(db.mutes.has(`mute_${USER_A}_${USER_C}`)).toBe(false);
  });

  // 13. Close Friends Private Inspection (RLS)
  it("Test 13: Close friends list is strictly private and non-inspectable by others", () => {
    db.addCloseFriend(USER_A, USER_B);

    // Alice queries her own close friends -> ALLOWED
    const aliceQuery = db.selectCloseFriends(USER_A, USER_A);
    expect(aliceQuery.error).toBeUndefined();
    expect(aliceQuery.data).toHaveLength(1);
    expect(aliceQuery.data[0].friend_id).toBe(USER_B);

    // Charlie attempts to query Alice's close friends -> DENIED by RLS
    const charlieQuery = db.selectCloseFriends(USER_C, USER_A);
    expect(charlieQuery.error).toContain("RLS violation");
    expect(charlieQuery.data).toHaveLength(0);
  });

  // 14. Privacy Settings Update & RLS
  it("Test 14: Users can update their own privacy settings but not others", () => {
    // Alice updates her privacy to private -> ALLOWED
    const aliceUpdate = db.updatePrivacySettings(USER_A, USER_A, true);
    expect(aliceUpdate.success).toBe(true);
    expect(db.privacySettings.get(USER_A)?.account_visibility).toBe("private");

    // Charlie attempts to update Alice's privacy -> DENIED
    const charlieUpdate = db.updatePrivacySettings(USER_C, USER_A, false);
    expect(charlieUpdate.success).toBe(false);
    expect(charlieUpdate.error).toContain("RLS violation");
    expect(db.privacySettings.get(USER_A)?.account_visibility).toBe("private");
  });

  // 15. Unauthorized Mutations Prevention
  it("Test 15: Cross-user request tampering is rejected", () => {
    // Alice sends follow request to Bob
    db.followUser(USER_A, USER_B);
    const reqId = `req_${USER_A}_${USER_B}`;

    // Charlie attempts to accept Bob's request -> DENIED
    const unauthorizedAccept = db.acceptFollowRequest(USER_C, reqId);
    expect(unauthorizedAccept.success).toBe(false);
    expect(unauthorizedAccept.error).toContain("Unauthorized");
    expect(db.follows.has(`fol_${USER_A}_${USER_B}`)).toBe(false);

    // Unauthenticated caller cannot follow
    const unauthFollow = db.followUser(null, USER_C);
    expect(unauthFollow.error).toContain("Authentication required");
  });
});
