export type PresenceStatus = "online" | "idle" | "offline";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  verified?: boolean;
  presence?: PresenceStatus;
  followersCount?: number;
  followingCount?: number;
  spacesCount?: number;
}

export interface Profile {
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


export type MediaFormat = "image" | "video" | "audio";

export interface MediaItem {
  id: string;
  type: MediaFormat;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  aspectRatio?: string;
  altText?: string;
}

export type FileCategory = "docs" | "3d" | "code" | "audio" | "archives" | "media";

export type FilePermission = "public" | "space" | "encrypted";

export interface FileObject {
  id: string;
  name: string;
  extension: string;
  sizeBytes: number;
  url: string;
  mimeType: string;
  createdAt: string;
  updatedAt?: string;
  uploadedBy: User;
  version?: string;
  permission: FilePermission;
  category: FileCategory;
  thumbnailUrl?: string;
  aiSummary?: string;
  pageCount?: number;
  downloadCount?: number;
  scanStatus?: "clean" | "scanning" | "flagged";
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  expiresAt?: string;
}

export type PostContent =
  | { kind: "text"; text: string }
  | { kind: "media"; media: MediaItem[]; caption?: string }
  | { kind: "file"; file: FileObject; description?: string }
  | {
      kind: "audio";
      media: MediaItem;
      waveform?: number[];
      title?: string;
      artist?: string;
      description?: string;
    }
  | { kind: "poll"; poll: Poll; text?: string };

export interface Post {
  id: string;
  author: User;
  createdAt: string;
  contextReason?: string;
  content: PostContent;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  bookmarkCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isForked?: boolean;
  tags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  likeCount: number;
  isLiked?: boolean;
  replyToHandle?: string;
}

export interface Story {
  id: string;
  user: User;
  mediaUrl: string;
  previewUrl: string;
  createdAt: string;
  hasUnseen: boolean;
  isLiveSpace?: boolean;
  spaceTitle?: string;
}

export interface SpaceChannel {
  id: string;
  spaceId: string;
  name: string;
  type: "feed" | "chat" | "files" | "events" | "stage";
  unreadCount?: number;
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl: string;
  avatarUrl: string;
  verified: boolean;
  memberCount: number;
  onlineCount: number;
  isJoined?: boolean;
  isBookmarked?: boolean;
  category: string;
  liveStageActive?: boolean;
  liveStageTitle?: string;
  liveStageListenersCount?: number;
  channels?: SpaceChannel[];
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  createdAt: string;
  attachments?: FileObject[];
  replyToId?: string;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  isRead?: boolean;
  readBy?: string[];
}

export interface Conversation {
  id: string;
  title?: string;
  isGroup: boolean;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  isPinned?: boolean;
}

export type NotificationType =
  | "reaction"
  | "comment"
  | "follow"
  | "mention"
  | "space_invite"
  | "file_share"
  | "ai_ready";

export interface Notification {
  id: string;
  type: NotificationType;
  actor: User;
  message: string;
  targetPath: string;
  createdAt: string;
  isRead: boolean;
  mediaThumb?: string;
  metaBadge?: string;
}

export interface SearchResult {
  people: User[];
  spaces: Space[];
  files: FileObject[];
  posts: Post[];
}
