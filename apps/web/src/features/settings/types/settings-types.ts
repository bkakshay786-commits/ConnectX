export type SettingsSectionId =
  // Your account
  | "accounts-center"
  | "edit-profile"
  | "notifications"
  | "appearance"
  | "language"
  // Privacy & security
  | "account-privacy"
  | "close-friends"
  | "blocked"
  | "story-location"
  | "messages-replies"
  | "tags-mentions"
  | "comments"
  | "sharing-reuse"
  | "restricted"
  | "hidden-words"
  | "file-privacy"
  | "security"
  // What you see
  | "muted"
  | "content-preferences"
  | "like-share-counts"
  // Your app and media
  | "archiving-downloading"
  | "accessibility"
  | "website-permissions"
  // AI
  | "ai-preferences"
  // Spaces
  | "spaces-privacy"
  // Family Center
  | "supervision"
  // More info and support
  | "help"
  | "privacy-center"
  | "terms";

export interface SettingsNavGroup {
  title: string;
  items: {
    id: SettingsSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    subtitle?: string;
    badgeCount?: number;
  }[];
}
