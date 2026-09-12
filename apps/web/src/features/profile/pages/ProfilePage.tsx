import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  BadgeCheck,
  Calendar,
  Sparkles,
  FolderSync,
  Grid,
  Users,
  Settings,
  Share2,
  Lock,
  Star,
  MoreHorizontal,
  VolumeX,
  CircleSlash,
  Globe,
  MapPin,
  Check,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { PostCard } from "@/features/feed/components/PostCard";
import { mockCurrentUser, mockPosts, mockFiles, mockSpaces } from "@/mocks/mockData";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";
import {
  useProfile,
  useProfileRelationship,
  useProfileCounts,
  useSocialMutations,
} from "@/features/profile/hooks/useProfileSocial";

export function ProfilePage() {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentProfile = useAuthStore((s) => s.currentProfile);

  const [activeTab, setActiveTab] = useState<"posts" | "vault" | "spaces" | "ai">("posts");
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Fetch real profile from Supabase
  const { data: remoteProfile } = useProfile(username);

  // Determine if viewing own profile
  const isOwnProfile =
    !username ||
    (currentUser?.username && currentUser.username.toLowerCase() === username.toLowerCase()) ||
    (currentProfile?.username && currentProfile.username.toLowerCase() === username.toLowerCase()) ||
    (remoteProfile?.id && currentUser?.id === remoteProfile.id);

  // Fallback profile object for smooth visual rendering
  const profile = remoteProfile || {
    id: isOwnProfile ? (currentUser?.id || "current_user") : "viewed_user",
    username: username || currentUser?.username || "creator",
    display_name: isOwnProfile ? (currentUser?.displayName || "Creator") : (username || "ConnectX Creator"),
    avatar_url: isOwnProfile ? (currentUser?.avatarUrl || mockCurrentUser.avatarUrl) : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    bio: isOwnProfile ? (currentUser?.bio || "Designing spatial interfaces & sharing creative process ✨") : "Explorer and contributor on ConnectX universal ecosystem.",
    website: "https://connectx.io",
    location: "San Francisco, CA",
    pronouns: "they/them",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Relationship & counts hooks
  const targetUserId = remoteProfile?.id;
  const { data: relationship } = useProfileRelationship(isOwnProfile ? undefined : targetUserId);
  const { data: counts } = useProfileCounts(targetUserId);
  const mutations = useSocialMutations(targetUserId);

  const followersCount = counts?.followers_count ?? (isOwnProfile ? (mockCurrentUser.followersCount || 1284) : 482);
  const followingCount = counts?.following_count ?? (isOwnProfile ? (mockCurrentUser.followingCount || 342) : 189);

  // Handlers for social actions
  const handleFollowClick = async () => {
    if (!targetUserId) {
      toast("Follow action simulated.");
      return;
    }

    if (relationship?.is_following) {
      // Unfollow
      try {
        await mutations.unfollowMutation.mutateAsync();
        toast.success(`Unfollowed @${profile.username}`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to unfollow");
      }
    } else if (relationship?.follow_request_status === "pending") {
      // Cancel Request
      try {
        await mutations.cancelRequestMutation.mutateAsync();
        toast.info("Follow request cancelled.");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to cancel request");
      }
    } else {
      // Follow or Request
      try {
        const res = await mutations.followMutation.mutateAsync();
        if (res.status === "requested") {
          toast.success("Follow request sent.");
        } else {
          toast.success(`Following @${profile.username}!`);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to follow");
      }
    }
  };

  const handleBlockToggle = async () => {
    setShowMoreMenu(false);
    if (!targetUserId) {
      toast("Block action simulated.");
      return;
    }
    if (relationship?.is_blocked) {
      await mutations.unblockMutation.mutateAsync();
      toast.success(`Unblocked @${profile.username}`);
    } else {
      await mutations.blockMutation.mutateAsync();
      toast.error(`Blocked @${profile.username}`);
    }
  };

  const handleMuteToggle = async () => {
    setShowMoreMenu(false);
    if (!targetUserId) {
      toast("Mute action simulated.");
      return;
    }
    if (relationship?.is_muted) {
      await mutations.unmuteMutation.mutateAsync();
      toast.info(`Unmuted @${profile.username}`);
    } else {
      await mutations.muteMutation.mutateAsync();
      toast.info(`Muted @${profile.username}`);
    }
  };

  const handleCloseFriendToggle = async () => {
    if (!targetUserId) {
      toast("Close Friends updated.");
      return;
    }
    const currentlyFriend = Boolean(relationship?.is_close_friend);
    await mutations.toggleCloseFriendMutation.mutateAsync(currentlyFriend);
    toast.success(currentlyFriend ? "Removed from Close Friends" : "Added to Close Friends ⭐");
  };

  // Is content restricted due to private account?
  const isPrivateRestricted =
    Boolean(relationship?.is_private) && !isOwnProfile && !relationship?.is_following;

  // Filter posts
  const userPosts = mockPosts.filter((p) => p.author.username === "emily_designs" || p.author.username === "mayalin");

  return (
    <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-6 py-4 flex flex-col gap-6">
      {/* 1. Hero Cover Banner */}
      <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-surface-low border border-hairline/30 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80"
          alt="Profile cover banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast("Profile link copied to clipboard")}
            aria-label="Share Profile"
            className="w-9 h-9 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-cx-text border border-hairline/40 hover:bg-surface transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => navigate("/settings")}
              aria-label="Settings"
              className="w-9 h-9 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-cx-text border border-hairline/40 hover:bg-surface transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Profile Identity & Stats Island */}
      <div className="px-2 -mt-16 sm:-mt-20 relative z-20 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Avatar
                src={profile.avatar_url || undefined}
                alt={profile.display_name}
                size="2xl"
                hasStory
                presence="online"
                className="ring-4 ring-canvas shadow-2xl"
              />
            </div>
            <div className="flex flex-col pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-cx-text">
                  {profile.display_name}
                </h1>
                <BadgeCheck className="w-5 h-5 text-primary fill-primary/20 shrink-0" />
                {relationship?.is_private && (
                  <span className="flex items-center gap-1 text-[11px] font-body bg-surface-high text-cx-muted px-2 py-0.5 rounded-full border border-hairline/30">
                    <Lock className="w-3 h-3 text-cx-muted" />
                    Private
                  </span>
                )}
              </div>
              <p className="font-body text-xs sm:text-sm text-cx-muted flex items-center gap-2 mt-0.5">
                <span>@{profile.username}</span>
                {profile.pronouns && (
                  <span className="text-[11px] text-cx-subtle bg-surface-high px-1.5 py-0.2 rounded">
                    {profile.pronouns}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto relative">
            {isOwnProfile ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/settings/account")}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-full bg-surface-highest hover:bg-surface text-cx-text font-display text-xs font-semibold border border-hairline/40 transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => toast("Connecting AI Companion...")}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-gradient-to-r from-primary-fill/20 to-tertiary-fill/20 hover:from-primary-fill/30 text-primary font-display text-xs font-semibold border border-primary/40 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(124,58,237,0.2)] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Companion</span>
                </button>
              </>
            ) : relationship?.is_blocked ? (
              <button
                type="button"
                onClick={handleBlockToggle}
                className="flex-1 sm:flex-none px-5 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-display text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer"
              >
                Unblock
              </button>
            ) : (
              <>
                {/* Follow / Following / Requested button */}
                <button
                  type="button"
                  onClick={handleFollowClick}
                  disabled={mutations.followMutation.isPending || mutations.unfollowMutation.isPending}
                  className={cn(
                    "flex-1 sm:flex-none px-6 py-2 rounded-full font-display text-xs font-semibold transition-all cursor-pointer",
                    relationship?.is_following
                      ? "bg-surface-highest hover:bg-red-500/20 hover:text-red-400 text-cx-text border border-hairline/40 group"
                      : relationship?.follow_request_status === "pending"
                        ? "bg-surface-highest text-cx-muted border border-hairline/40 hover:border-red-400 hover:text-red-400"
                        : "bg-primary-fill text-white hover:bg-primary-fill/90 shadow-[0_0_12px_rgba(124,58,237,0.4)]",
                  )}
                >
                  {relationship?.is_following ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Following
                    </span>
                  ) : relationship?.follow_request_status === "pending" ? (
                    "Requested"
                  ) : (
                    "Follow"
                  )}
                </button>

                {/* Close Friend Star Toggle */}
                <button
                  type="button"
                  onClick={handleCloseFriendToggle}
                  title={relationship?.is_close_friend ? "Remove from Close Friends" : "Add to Close Friends"}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-colors border cursor-pointer",
                    relationship?.is_close_friend
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      : "bg-surface-highest border-hairline/40 text-cx-muted hover:text-cx-text",
                  )}
                >
                  <Star className={cn("w-4 h-4", relationship?.is_close_friend && "fill-emerald-400")} />
                </button>

                {/* More Options Dropdown Toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    aria-label="More profile actions"
                    className="w-9 h-9 rounded-full bg-surface-highest flex items-center justify-center text-cx-muted hover:text-cx-text border border-hairline/40 transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {showMoreMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-hairline/40 shadow-2xl py-1 z-50 flex flex-col">
                      <button
                        type="button"
                        onClick={handleMuteToggle}
                        className="px-4 py-2 text-left text-xs font-display text-cx-text hover:bg-surface-high flex items-center gap-2 cursor-pointer"
                      >
                        <VolumeX className="w-3.5 h-3.5 text-cx-muted" />
                        <span>{relationship?.is_muted ? "Unmute Account" : "Mute Account"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBlockToggle}
                        className="px-4 py-2 text-left text-xs font-display text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <CircleSlash className="w-3.5 h-3.5 text-red-400" />
                        <span>{relationship?.is_blocked ? "Unblock Account" : "Block Account"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bio & Links */}
        <div className="flex flex-col gap-2 max-w-2xl">
          <p className="font-body text-sm text-cx-text leading-relaxed">
            {profile.bio}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-body text-cx-muted">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{profile.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cx-subtle" />
                <span>{profile.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-6 text-xs font-body text-cx-muted border-y border-hairline/20 py-3">
          <div>
            <span className="font-display font-bold text-sm text-cx-text mr-1.5">
              {followersCount.toLocaleString()}
            </span>
            <span>Followers</span>
          </div>
          <div>
            <span className="font-display font-bold text-sm text-cx-text mr-1.5">
              {followingCount.toLocaleString()}
            </span>
            <span>Following</span>
          </div>
          <div>
            <span className="font-display font-bold text-sm text-cx-text mr-1.5">84</span>
            <span>Vault Assets</span>
          </div>
          <div>
            <span className="font-display font-bold text-sm text-cx-text mr-1.5">
              {mockCurrentUser.spacesCount}
            </span>
            <span>Spaces</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-cx-subtle ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            <span>Joined ConnectX</span>
          </div>
        </div>
      </div>

      {/* 3. Private Account Guard */}
      {isPrivateRestricted ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface/50 backdrop-blur-xl border border-hairline/30 rounded-2xl gap-3 my-4">
          <div className="w-14 h-14 rounded-full bg-surface-highest flex items-center justify-center border border-hairline/40 text-cx-muted mb-1">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-lg text-cx-text">
            This account is private
          </h3>
          <p className="font-body text-xs sm:text-sm text-cx-muted max-w-sm">
            Follow @{profile.username} to view their artifacts, drops, vault assets, and spaces.
          </p>
          <button
            type="button"
            onClick={handleFollowClick}
            className="mt-2 px-6 py-2 rounded-full bg-primary-fill hover:bg-primary-fill/90 text-white font-display text-xs font-semibold shadow-[0_0_12px_rgba(124,58,237,0.4)] cursor-pointer"
          >
            {relationship?.follow_request_status === "pending" ? "Requested" : "Follow"}
          </button>
        </div>
      ) : (
        <>
          {/* Profile Content Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-hairline/30 pb-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-display text-xs font-semibold transition-all shrink-0 cursor-pointer",
                activeTab === "posts"
                  ? "bg-primary-fill text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                  : "text-cx-muted hover:text-cx-text hover:bg-surface-high",
              )}
            >
              <Grid className="w-4 h-4" />
              <span>Artifacts &amp; Drops</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-display text-xs font-semibold transition-all shrink-0 cursor-pointer",
                activeTab === "vault"
                  ? "bg-primary-fill text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                  : "text-cx-muted hover:text-cx-text hover:bg-surface-high",
              )}
            >
              <FolderSync className="w-4 h-4" />
              <span>Digital Vault</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("spaces")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-display text-xs font-semibold transition-all shrink-0 cursor-pointer",
                activeTab === "spaces"
                  ? "bg-primary-fill text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                  : "text-cx-muted hover:text-cx-text hover:bg-surface-high",
              )}
            >
              <Users className="w-4 h-4" />
              <span>Spaces ({mockCurrentUser.spacesCount})</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "posts" && (
            <div className="flex flex-col gap-6 max-w-2xl">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {activeTab === "vault" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-card bg-surface/70 backdrop-blur-xl border border-hairline/30 flex flex-col justify-between gap-3 shadow-md"
                >
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-fill/20 text-primary uppercase font-bold">
                      {file.extension}
                    </span>
                    <h3 className="font-display font-semibold text-sm text-cx-text truncate mt-2">
                      {file.name}
                    </h3>
                    <p className="font-body text-xs text-cx-muted mt-1">
                      {(file.sizeBytes / 1024 / 1024).toFixed(1)} MB • {file.version}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast(`Opening ${file.name} from vault`)}
                    className="w-full py-1.5 rounded-full bg-surface-highest hover:bg-surface-high text-cx-text font-display text-xs font-semibold transition-colors border border-hairline/40 cursor-pointer"
                  >
                    Inspect Object
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "spaces" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
              {mockSpaces.map((sp) => (
                <div
                  key={sp.id}
                  className="p-4 rounded-card bg-surface/70 backdrop-blur-xl border border-hairline/30 flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="font-display font-semibold text-sm text-cx-text">{sp.name}</h3>
                    <p className="font-body text-xs text-cx-muted">
                      {sp.memberCount.toLocaleString()} members
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast(`Entering ${sp.name}`)}
                    className="px-4 py-1.5 rounded-full bg-surface-highest hover:bg-primary-fill hover:text-white text-cx-text font-display text-xs font-semibold transition-all border border-hairline/40 cursor-pointer"
                  >
                    View Guild
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
