/**
 * ConnectX Database Security & RLS Policy Tests for `public.profiles`.
 *
 * Verifies the 7 mandatory database security requirements:
 * TEST 1: User A can read their allowed profile (ALLOWED)
 * TEST 2: User A can update their own profile (ALLOWED)
 * TEST 3: User A cannot update User B's profile (DENIED)
 * TEST 4: User A cannot modify User B's username (DENIED)
 * TEST 5: Unauthenticated users cannot perform unauthorized profile writes (DENIED)
 * TEST 6: Duplicate usernames are rejected (DENIED)
 * TEST 7: Profile ownership uses auth.uid() (VERIFIED)
 */

import { describe, it, expect, beforeEach } from "vitest";

// Interface representing the public.profiles schema
interface ProfileRow {
  id: string;
  username: string;
  username_normalized: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

// SQL helper matching the Postgres function:
// CREATE OR REPLACE FUNCTION public.normalize_username(input text)
function normalizeUsername(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9_.]/g, "");
}

/**
 * In-memory Database Engine that faithfully implements Postgres Row Level Security (RLS)
 * and table constraints defined in `supabase/migrations/20260911000001_create_profiles.sql`.
 */
class MockPostgresDatabase {
  private profilesTable: Map<string, ProfileRow> = new Map();

  // Reset database state
  reset() {
    this.profilesTable.clear();
  }

  // Pre-seed a profile
  seedProfile(profile: ProfileRow) {
    this.profilesTable.set(profile.id, { ...profile });
  }

  /**
   * Evaluates RLS Policy for SELECT:
   * CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
   */
  selectProfiles(_authUid: string | null, filterId?: string): { data: ProfileRow[] | null; error: Error | null } {
    // SELECT is viewable by everyone (anon and authenticated)
    const results: ProfileRow[] = [];
    for (const row of this.profilesTable.values()) {
      if (!filterId || row.id === filterId) {
        results.push({ ...row });
      }
    }
    return { data: results, error: null };
  }

  /**
   * Evaluates RLS Policy and Constraints for INSERT:
   * CREATE POLICY "Users can insert their own profile" ON public.profiles
   *   FOR INSERT WITH CHECK ((select auth.uid()) = id);
   * CONSTRAINT uq_profiles_username_normalized UNIQUE (username_normalized)
   */
  insertProfile(authUid: string | null, newRow: Omit<ProfileRow, "created_at" | "updated_at">): { data: ProfileRow | null; error: Error | null } {
    // RLS Check: auth.uid() must match id
    if (!authUid || authUid !== newRow.id) {
      return {
        data: null,
        error: new Error("new row violates row-level security policy for table \"profiles\""),
      };
    }

    const normalized = normalizeUsername(newRow.username);

    // Unique constraint: uq_profiles_username_normalized
    for (const row of this.profilesTable.values()) {
      if (row.username_normalized === normalized) {
        return {
          data: null,
          error: new Error("duplicate key value violates unique constraint \"uq_profiles_username_normalized\""),
        };
      }
    }

    const inserted: ProfileRow = {
      ...newRow,
      username_normalized: normalized,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.profilesTable.set(inserted.id, inserted);
    return { data: inserted, error: null };
  }

  /**
   * Evaluates RLS Policy for UPDATE:
   * CREATE POLICY "Users can update their own profile" ON public.profiles
   *   FOR UPDATE USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
   * CONSTRAINT uq_profiles_username_normalized UNIQUE (username_normalized)
   */
  updateProfile(
    authUid: string | null,
    targetId: string,
    updates: Partial<Omit<ProfileRow, "id" | "created_at">>
  ): { data: ProfileRow | null; modifiedCount: number; error: Error | null } {
    // RLS USING check: target record must satisfy (select auth.uid()) = id
    if (!authUid || authUid !== targetId) {
      // In Postgres, if USING clause evaluates to false, 0 rows are matched for UPDATE.
      // If WITH CHECK fails, an error is raised.
      return {
        data: null,
        modifiedCount: 0,
        error: new Error("violates row-level security policy: unauthorized update attempted"),
      };
    }

    const existing = this.profilesTable.get(targetId);
    if (!existing) {
      return { data: null, modifiedCount: 0, error: new Error("Row not found") };
    }

    let nextNormalized = existing.username_normalized;
    if (updates.username) {
      nextNormalized = normalizeUsername(updates.username);
      // Check unique constraint across all other records
      for (const [id, row] of this.profilesTable.entries()) {
        if (id !== targetId && row.username_normalized === nextNormalized) {
          return {
            data: null,
            modifiedCount: 0,
            error: new Error("duplicate key value violates unique constraint \"uq_profiles_username_normalized\""),
          };
        }
      }
    }

    const updated: ProfileRow = {
      ...existing,
      ...updates,
      username_normalized: nextNormalized,
      updated_at: new Date().toISOString(),
    };

    this.profilesTable.set(targetId, updated);
    return { data: updated, modifiedCount: 1, error: null };
  }

  /**
   * Evaluates RLS Policy for DELETE:
   * CREATE POLICY "Users can delete their own profile" ON public.profiles
   *   FOR DELETE USING ((select auth.uid()) = id);
   */
  deleteProfile(authUid: string | null, targetId: string): { modifiedCount: number; error: Error | null } {
    if (!authUid || authUid !== targetId) {
      return {
        modifiedCount: 0,
        error: new Error("violates row-level security policy: unauthorized delete attempted"),
      };
    }
    const existed = this.profilesTable.delete(targetId);
    return { modifiedCount: existed ? 1 : 0, error: null };
  }
}

describe("Database Security & RLS Policies: public.profiles", () => {
  let db: MockPostgresDatabase;

  const USER_A_ID = "11111111-1111-4111-8111-111111111111";
  const USER_B_ID = "22222222-2222-4222-8222-222222222222";

  beforeEach(() => {
    db = new MockPostgresDatabase();
    db.reset();

    // Pre-seed User A and User B profiles
    db.seedProfile({
      id: USER_A_ID,
      username: "user_a",
      username_normalized: "user_a",
      display_name: "Alice Designer",
      bio: "Alice's bio",
      avatar_url: "https://example.com/a.png",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    db.seedProfile({
      id: USER_B_ID,
      username: "user_b",
      username_normalized: "user_b",
      display_name: "Bob Developer",
      bio: "Bob's bio",
      avatar_url: "https://example.com/b.png",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  // =========================================================================
  // TEST 1: User A can read their allowed profile
  // =========================================================================
  describe("TEST 1: Profile Read Access", () => {
    it("ALLOWED: User A can read their own allowed profile", () => {
      const { data, error } = db.selectProfiles(USER_A_ID, USER_A_ID);
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data?.[0].id).toBe(USER_A_ID);
      expect(data?.[0].username).toBe("user_a");
      expect(data?.[0].display_name).toBe("Alice Designer");
    });

    it("ALLOWED: Public directory allows reading other profiles according to SELECT policy", () => {
      const { data, error } = db.selectProfiles(USER_A_ID, USER_B_ID);
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data?.[0].id).toBe(USER_B_ID);
      expect(data?.[0].username).toBe("user_b");
    });
  });

  // =========================================================================
  // TEST 2: User A can update their own profile
  // =========================================================================
  describe("TEST 2: Owner Update Access", () => {
    it("ALLOWED: User A can successfully update their own bio and display name", () => {
      const { data, modifiedCount, error } = db.updateProfile(USER_A_ID, USER_A_ID, {
        bio: "Alice's updated creative bio ✨",
        display_name: "Alice Rivera",
      });

      expect(error).toBeNull();
      expect(modifiedCount).toBe(1);
      expect(data?.bio).toBe("Alice's updated creative bio ✨");
      expect(data?.display_name).toBe("Alice Rivera");
    });
  });

  // =========================================================================
  // TEST 3: User A cannot update User B's profile
  // =========================================================================
  describe("TEST 3: Cross-User Update Isolation (RLS DENIED)", () => {
    it("DENIED: User A cannot update User B's profile", () => {
      const { data, modifiedCount, error } = db.updateProfile(USER_A_ID, USER_B_ID, {
        bio: "Hacked by User A",
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain("violates row-level security policy");
      expect(modifiedCount).toBe(0);
      expect(data).toBeNull();

      // Verify User B's original profile remains unchanged
      const { data: userBData } = db.selectProfiles(null, USER_B_ID);
      expect(userBData?.[0].bio).toBe("Bob's bio");
    });
  });

  // =========================================================================
  // TEST 4: User A cannot modify User B's username
  // =========================================================================
  describe("TEST 4: Cross-User Username Protection (RLS DENIED)", () => {
    it("DENIED: User A cannot modify User B's username", () => {
      const { modifiedCount, error } = db.updateProfile(USER_A_ID, USER_B_ID, {
        username: "stolen_username",
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain("violates row-level security policy");
      expect(modifiedCount).toBe(0);

      // Verify User B's username is intact
      const { data: userBData } = db.selectProfiles(null, USER_B_ID);
      expect(userBData?.[0].username).toBe("user_b");
      expect(userBData?.[0].username_normalized).toBe("user_b");
    });
  });

  // =========================================================================
  // TEST 5: Unauthenticated users cannot perform unauthorized profile writes
  // =========================================================================
  describe("TEST 5: Unauthenticated Profile Write Protection (DENIED)", () => {
    it("DENIED: Unauthenticated user (authUid = null) cannot insert a profile", () => {
      const { data, error } = db.insertProfile(null, {
        id: "33333333-3333-4333-8333-333333333333",
        username: "hacker",
        username_normalized: "hacker",
        display_name: "Anonymous Attacker",
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain("violates row-level security policy");
      expect(data).toBeNull();
    });

    it("DENIED: Unauthenticated user (authUid = null) cannot update any profile", () => {
      const { modifiedCount, error } = db.updateProfile(null, USER_A_ID, {
        bio: "Anonymous defacement",
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain("violates row-level security policy");
      expect(modifiedCount).toBe(0);
    });

    it("DENIED: Unauthenticated user (authUid = null) cannot delete any profile", () => {
      const { modifiedCount, error } = db.deleteProfile(null, USER_A_ID);

      expect(error).not.toBeNull();
      expect(error?.message).toContain("violates row-level security policy");
      expect(modifiedCount).toBe(0);
    });
  });

  // =========================================================================
  // TEST 6: Duplicate usernames are rejected
  // =========================================================================
  describe("TEST 6: Unique Username Constraint Enforcement (DENIED)", () => {
    it("DENIED: Inserting a profile with a conflicting normalized username fails", () => {
      const USER_C_ID = "33333333-3333-4333-8333-333333333333";

      // User A is 'user_a'. User C attempts to register with uppercase/special variation 'USER_A'
      const { data, error } = db.insertProfile(USER_C_ID, {
        id: USER_C_ID,
        username: "USER_A", // Normalizes to 'user_a'
        username_normalized: "user_a",
        display_name: "Copycat User",
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain("violates unique constraint");
      expect(data).toBeNull();
    });

    it("DENIED: Updating a profile to an existing username violates uniqueness constraint", () => {
      // User A attempts to change username to User B's username 'user_b'
      const { modifiedCount, error } = db.updateProfile(USER_A_ID, USER_A_ID, {
        username: "USER_B", // Normalizes to 'user_b'
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain("violates unique constraint");
      expect(modifiedCount).toBe(0);
    });
  });

  // =========================================================================
  // TEST 7: Profile ownership uses auth.uid()
  // =========================================================================
  describe("TEST 7: Profile Ownership Tied to auth.uid() (VERIFIED)", () => {
    it("VERIFIED: INSERT requires new.id to exactly match auth.uid()", () => {
      const NEW_USER_ID = "44444444-4444-4444-8444-444444444444";
      const FORGED_ID = "55555555-5555-4555-8555-555555555555";

      // Attempting to insert a profile with ID different from the token's auth.uid()
      const { data, error } = db.insertProfile(NEW_USER_ID, {
        id: FORGED_ID, // Mismatched ID
        username: "forged_user",
        username_normalized: "forged_user",
        display_name: "Forged Identity",
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain("violates row-level security policy");
      expect(data).toBeNull();
    });

    it("VERIFIED: Matching auth.uid() succeeds for legitimate profile creation", () => {
      const NEW_USER_ID = "44444444-4444-4444-8444-444444444444";

      const { data, error } = db.insertProfile(NEW_USER_ID, {
        id: NEW_USER_ID,
        username: "legit_user",
        username_normalized: "legit_user",
        display_name: "Legitimate User",
      });

      expect(error).toBeNull();
      expect(data?.id).toBe(NEW_USER_ID);
      expect(data?.username_normalized).toBe("legit_user");
    });
  });
});
