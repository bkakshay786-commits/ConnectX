export interface ProfileData {
  id: string;
  username: string;
  username_normalized?: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  pronouns?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileRelationship {
  is_following: boolean;
  is_followed_by: boolean;
  follow_request_status: "none" | "pending" | "accepted" | "rejected" | "cancelled";
  is_blocked: boolean;
  is_blocking: boolean;
  is_muted: boolean;
  is_close_friend: boolean;
  is_private: boolean;
}

export interface ProfileCounts {
  followers_count: number;
  following_count: number;
}

export interface PrivacySettingsData {
  user_id: string;
  account_visibility: "public" | "private";
  message_permissions?: "everyone" | "following" | "none";
  mention_permissions?: "everyone" | "following" | "none";
  tag_permissions?: "everyone" | "following" | "none";
  story_visibility?: "everyone" | "close_friends" | "followers";
  activity_visibility?: boolean;
  online_status?: boolean;
  read_receipts?: boolean;
  location_visibility?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FollowRequestData {
  id: string;
  requester_id: string;
  target_user_id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;
  requester?: ProfileData;
}
