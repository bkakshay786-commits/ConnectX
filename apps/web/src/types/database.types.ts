export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          username_normalized: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          location: string | null;
          pronouns: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
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
        };
        Update: {
          id?: string;
          username?: string;
          username_normalized?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          pronouns?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      privacy_settings: {
        Row: {
          user_id: string;
          account_visibility: "public" | "private";
          message_permissions: "everyone" | "following" | "none";
          mention_permissions: "everyone" | "following" | "none";
          tag_permissions: "everyone" | "following" | "none";
          story_visibility: "everyone" | "close_friends" | "followers";
          activity_visibility: boolean;
          online_status: boolean;
          read_receipts: boolean;
          location_visibility: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          account_visibility?: "public" | "private";
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
        };
        Update: {
          user_id?: string;
          account_visibility?: "public" | "private";
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
        };
        Relationships: [
          {
            foreignKeyName: "privacy_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      follow_requests: {
        Row: {
          id: string;
          requester_id: string;
          target_user_id: string;
          status: "pending" | "accepted" | "rejected" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          target_user_id: string;
          status?: "pending" | "accepted" | "rejected" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          target_user_id?: string;
          status?: "pending" | "accepted" | "rejected" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follow_requests_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follow_requests_target_user_id_fkey";
            columns: ["target_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocks_blocker_id_fkey";
            columns: ["blocker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocks_blocked_id_fkey";
            columns: ["blocked_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      mutes: {
        Row: {
          id: string;
          user_id: string;
          muted_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          muted_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          muted_user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mutes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mutes_muted_user_id_fkey";
            columns: ["muted_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      close_friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "close_friends_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "close_friends_friend_id_fkey";
            columns: ["friend_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      media: {
        Row: {
          id: string;
          owner_id: string;
          bucket_id: string;
          storage_path: string;
          original_filename: string;
          mime_type: string;
          extension: string;
          byte_size: number;
          width: number | null;
          height: number | null;
          duration_seconds: number | null;
          processing_status: "pending" | "uploading" | "uploaded" | "processing" | "ready" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          bucket_id?: string;
          storage_path: string;
          original_filename: string;
          mime_type: string;
          extension: string;
          byte_size: number;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          processing_status?: "pending" | "uploading" | "uploaded" | "processing" | "ready" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          bucket_id?: string;
          storage_path?: string;
          original_filename?: string;
          mime_type?: string;
          extension?: string;
          byte_size?: number;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          processing_status?: "pending" | "uploading" | "uploaded" | "processing" | "ready" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          post_type: "text" | "image" | "video" | "audio" | "file" | "mixed" | "poll" | "code" | "3d" | "live";
          visibility: "public" | "followers" | "close_friends" | "private";
          status: "draft" | "published" | "archived" | "deleted";
          location_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          content?: string;
          post_type?: "text" | "image" | "video" | "audio" | "file" | "mixed" | "poll" | "code" | "3d" | "live";
          visibility?: "public" | "followers" | "close_friends" | "private";
          status?: "draft" | "published" | "archived" | "deleted";
          location_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          content?: string;
          post_type?: "text" | "image" | "video" | "audio" | "file" | "mixed" | "poll" | "code" | "3d" | "live";
          visibility?: "public" | "followers" | "close_friends" | "private";
          status?: "draft" | "published" | "archived" | "deleted";
          location_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      post_media: {
        Row: {
          id: string;
          post_id: string;
          media_id: string;
          position?: number;
          display_order?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          media_id: string;
          position?: number;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          media_id?: string;
          position?: number;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_media_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      normalize_username: {
        Args: { input: string };
        Returns: string;
      };
      get_auth_email_by_username: {
        Args: { lookup_username: string };
        Returns: string | null;
      };
      follow_user: {
        Args: { p_target_user_id: string };
        Returns: Json;
      };
      unfollow_user: {
        Args: { p_target_user_id: string };
        Returns: boolean;
      };
      accept_follow_request: {
        Args: { p_request_id: string };
        Returns: boolean;
      };
      reject_follow_request: {
        Args: { p_request_id: string };
        Returns: boolean;
      };
      cancel_follow_request: {
        Args: { p_target_user_id: string };
        Returns: boolean;
      };
      block_user: {
        Args: { p_target_user_id: string };
        Returns: boolean;
      };
      unblock_user: {
        Args: { p_target_user_id: string };
        Returns: boolean;
      };
      get_profile_relationship: {
        Args: { p_target_user_id: string };
        Returns: Json;
      };
      get_profile_counts: {
        Args: { p_user_id: string };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}
