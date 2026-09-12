import { useState, useRef, useMemo, useEffect } from "react";
import { useLocation } from "react-router";
import {
  Search,
  User,
  Lock,
  Bell,
  Sun,
  Globe,
  Star,
  CircleSlash,
  MapPin,
  Send,
  AtSign,
  MessageSquare,
  Repeat,
  EyeOff,
  Type,
  VolumeX,
  SlidersHorizontal,
  Heart,
  DownloadCloud,
  Eye,
  ShieldCheck,
  Users,
  HelpCircle,
  Shield,
  FileText,
  ChevronRight,
  ChevronLeft,
  Camera,
  Trash2,
  Check,
  FolderLock,
  X,
  Download,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmationDialog } from "@/features/settings/components/ConfirmationDialog";
import { mockCurrentUser } from "@/mocks/mockData";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";
import type { SettingsSectionId, SettingsNavGroup } from "@/features/settings/types/settings-types";
import {
  useProfile,
  usePrivacySettings,
  useSocialMutations,
} from "@/features/profile/hooks/useProfileSocial";

export function SettingsPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("account-privacy");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Social & Profile queries
  const { data: profileData } = useProfile();
  const { data: privacySettings } = usePrivacySettings();
  const mutations = useSocialMutations();

  // Sync section with route if navigated directly
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (location.pathname.includes("/settings/account")) {
      setActiveSection("edit-profile");
      if (isMobile) setIsMobileDetailOpen(true);
    } else if (location.pathname.includes("/settings/privacy")) {
      setActiveSection("account-privacy");
    } else if (location.pathname.includes("/settings/notifications")) {
      setActiveSection("notifications");
      if (isMobile) setIsMobileDetailOpen(true);
    } else if (location.pathname.includes("/settings/security")) {
      setActiveSection("security");
      if (isMobile) setIsMobileDetailOpen(true);
    }
  }, [location.pathname]);

  // Accessible Confirmation Dialog
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: "",
    onConfirm: () => {},
  });

  // Account Privacy State (Matching exact reference screenshot)
  const [isPrivateAccount, setIsPrivateAccount] = useState(true);
  const [allowSearchEngines, setAllowSearchEngines] = useState(false);

  // Edit Profile State (Matching reference screenshot 1)
  const [displayName, setDisplayName] = useState("Emily Chen");
  const [username, setUsername] = useState("emily_designs");
  const [bio, setBio] = useState("Designing spatial interfaces & sharing creative process ✨");
  const [website, setWebsite] = useState("https://emilychen.design");
  const [pronouns, setPronouns] = useState("she/her");
  const [userLocation, setUserLocation] = useState("San Francisco, CA");
  const [avatarUrl, setAvatarUrl] = useState(mockCurrentUser.avatarUrl);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Sync state from backend profile & privacy data
  useEffect(() => {
    if (privacySettings) {
      setIsPrivateAccount(privacySettings.account_visibility === "private");
    }
  }, [privacySettings]);

  useEffect(() => {
    if (profileData) {
      if (profileData.display_name) setDisplayName(profileData.display_name);
      if (profileData.username) setUsername(profileData.username);
      if (profileData.bio) setBio(profileData.bio);
      if (profileData.website) setWebsite(profileData.website);
      if (profileData.pronouns) setPronouns(profileData.pronouns);
      if (profileData.location) setUserLocation(profileData.location);
      if (profileData.avatar_url) setAvatarUrl(profileData.avatar_url);
    }
  }, [profileData]);

  // Close Friends State
  const [closeFriends, setCloseFriends] = useState<string[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const potentialFriends = [
    { handle: "alex_3d", name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" },
    { handle: "sarah_ai", name: "Sarah Connor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
    { handle: "david_cad", name: "David Kim", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80" },
    { handle: "maya_vfx", name: "Maya Lin", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80" },
  ];

  // Blocked Accounts State
  const [blockedUsers, setBlockedUsers] = useState<string[]>([
    "alex_spammer",
    "crypto_bot_99",
    "unknown_crawler",
    "random_troll_4",
    "spoof_account",
    "phishing_test",
    "shadow_profile",
    "ad_bot_v2",
    "fake_recruiter",
    "leaker_user",
    "scraper_one",
    "bot_network_7",
  ]);
  const [blockedSearch, setBlockedSearch] = useState("");

  // Interactions State
  const [readReceipts, setReadReceipts] = useState(true);
  const [messageRequests, setMessageRequests] = useState<"everyone" | "following">("following");
  const [storyReplies, setStoryReplies] = useState<"everyone" | "following" | "off">("everyone");
  const [hideOffensiveWords, setHideOffensiveWords] = useState(true);

  // Notifications State
  const [pauseAllNotifications, setPauseAllNotifications] = useState(false);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifySpaces, setNotifySpaces] = useState(true);
  const [notifyFiles, setNotifyFiles] = useState(true);

  // Appearance State
  const [themeMode, setThemeMode] = useState<"obsidian" | "midnight" | "oled">("obsidian");
  const [accentColor, setAccentColor] = useState("violet");
  const [glowEffects, setGlowEffects] = useState(true);

  // Complete Navigation Hierarchy (Matching reference screenshot)
  const navGroups: SettingsNavGroup[] = useMemo(() => [
    {
      title: "Your account",
      items: [
        {
          id: "accounts-center",
          label: "Accounts Center",
          icon: User,
          subtitle: "Password, security, personal details, connected experiences",
        },
        { id: "edit-profile", label: "Edit profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "appearance", label: "Appearance", icon: Sun },
        { id: "language", label: "Language", icon: Globe },
      ],
    },
    {
      title: "Privacy & security",
      items: [
        { id: "account-privacy", label: "Account privacy", icon: Lock },
        { id: "close-friends", label: "Close Friends", icon: Star, badgeCount: closeFriends.length },
        { id: "blocked", label: "Blocked", icon: CircleSlash, badgeCount: blockedUsers.length },
        { id: "story-location", label: "Story and location", icon: MapPin },
        { id: "messages-replies", label: "Messages and story replies", icon: Send },
        { id: "tags-mentions", label: "Tags and mentions", icon: AtSign },
        { id: "comments", label: "Comments", icon: MessageSquare },
        { id: "sharing-reuse", label: "Sharing and reuse", icon: Repeat },
        { id: "restricted", label: "Restricted accounts", icon: EyeOff },
        { id: "hidden-words", label: "Hidden Words", icon: Type },
        { id: "file-privacy", label: "File & media privacy", icon: FolderLock },
        { id: "security", label: "Password & security", icon: Shield },
      ],
    },
    {
      title: "What you see",
      items: [
        { id: "muted", label: "Muted accounts", icon: VolumeX },
        { id: "content-preferences", label: "Content preferences", icon: SlidersHorizontal },
        { id: "like-share-counts", label: "Like and share counts", icon: Heart },
      ],
    },
    {
      title: "Your app and media",
      items: [
        { id: "archiving-downloading", label: "Archiving and downloading", icon: DownloadCloud },
        { id: "accessibility", label: "Accessibility", icon: Eye },
        { id: "website-permissions", label: "Website permissions", icon: ShieldCheck },
      ],
    },
    {
      title: "Family Center",
      items: [
        { id: "supervision", label: "Supervision for Teen Accounts", icon: Users },
      ],
    },
    {
      title: "More info and support",
      items: [
        { id: "help", label: "Help", icon: HelpCircle },
        { id: "privacy-center", label: "Privacy Center", icon: Shield },
        { id: "terms", label: "Terms", icon: FileText },
      ],
    },
  ], [closeFriends.length, blockedUsers.length]);

  // Search Filtering
  const filteredNavGroups = useMemo(() => {
    if (!searchQuery.trim()) return navGroups;
    const q = searchQuery.toLowerCase();
    return navGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.subtitle?.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [searchQuery, navGroups]);

  const handleSelectSection = (id: SettingsSectionId) => {
    setActiveSection(id);
    setIsMobileDetailOpen(true);
  };

  // Switch to Private Account Confirmation Dialog
  const handleTogglePrivateAccount = () => {
    const willBePrivate = !isPrivateAccount;
    setDialogConfig({
      isOpen: true,
      title: willBePrivate ? "Switch to private account?" : "Switch to public account?",
      description: willBePrivate
        ? "Only people you approve will see your photos, videos, 3D models, files, and followers. Your existing followers won't be affected."
        : "Anyone on or off ConnectX will be able to see your profile and posts. Pending follow requests will be automatically approved.",
      confirmLabel: willBePrivate ? "Switch to Private" : "Switch to Public",
      onConfirm: async () => {
        try {
          await mutations.updatePrivacySettingsMutation.mutateAsync({
            account_visibility: willBePrivate ? "private" : "public",
          });
          setIsPrivateAccount(willBePrivate);
          setDialogConfig((prev) => ({ ...prev, isOpen: false }));
          toast.success(willBePrivate ? "Account is now Private" : "Account is now Public");
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to update privacy");
        }
      },
    });
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      toast.success("Profile photo updated!");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutations.updateProfileMutation.mutateAsync({
        display_name: displayName,
        username,
        bio,
        website,
        pronouns,
        location: userLocation,
        avatar_url: avatarUrl,
      });
      toast.success("Profile changes saved successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile changes");
    }
  };

  const triggerDeactivate = () => {
    setDialogConfig({
      isOpen: true,
      title: "Deactivate Account?",
      description: "Your profile, posts, files, and spaces will be hidden until you reactivate by logging back in.",
      confirmLabel: "Deactivate",
      onConfirm: () => {
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
        toast.error("Account deactivated.");
      },
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 select-none">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F6FA]">
          Settings
        </h1>
        <p className="font-body text-xs sm:text-sm text-[#9EA5B9] mt-1">
          Manage your account, privacy, and preferences.
        </p>
      </div>

      {/* Main Two-Column Container */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[310px_1fr] gap-6 lg:gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: PERSISTENT SETTINGS NAVIGATION */}
        {/* ========================================================= */}
        <aside
          className={cn(
            "flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-none pb-8",
            isMobileDetailOpen ? "hidden md:flex" : "flex",
          )}
          aria-label="Settings navigation menu"
        >
          {/* Search Settings Input */}
          <div className="relative flex items-center mb-1">
            <Search className="absolute left-3.5 w-4 h-4 text-[#5B6275] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-[#171923] border border-[#232736] text-[#F5F6FA] placeholder:text-[#5B6275] text-xs sm:text-sm font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-[#5B6275] hover:text-[#F5F6FA] p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Navigation Groups List */}
          {filteredNavGroups.length > 0 ? (
            <div className="flex flex-col gap-5">
              {filteredNavGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-1">
                  <span className="px-3 text-[11px] font-display font-bold uppercase tracking-wider text-[#5B6275]">
                    {group.title}
                  </span>

                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSection(item.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-[0.99] cursor-pointer",
                            isActive
                              ? "bg-[#7C5CFF]/20 text-white font-semibold border border-[#7C5CFF]/30 shadow-[0_0_12px_rgba(124,92,255,0.25)]"
                              : "text-[#9EA5B9] hover:text-[#F5F6FA] hover:bg-[#171923] border border-transparent",
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <Icon
                              className={cn(
                                "w-4 h-4 shrink-0",
                                isActive ? "text-[#7C5CFF]" : "text-[#9EA5B9] group-hover:text-[#F5F6FA]",
                              )}
                            />
                            <div className="min-w-0">
                              <p className="font-display text-xs sm:text-sm font-medium truncate">
                                {item.label}
                              </p>
                              {item.subtitle && (
                                <p className="font-body text-[10px] text-[#5B6275] truncate mt-0.5 max-w-[190px]">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {item.badgeCount !== undefined ? (
                            <span className="text-[11px] font-display text-[#5B6275] shrink-0 font-medium">
                              {item.badgeCount}
                            </span>
                          ) : (
                            <ChevronRight
                              className={cn(
                                "w-3.5 h-3.5 shrink-0 transition-transform",
                                isActive ? "text-[#7C5CFF] translate-x-0.5" : "text-[#5B6275] opacity-60 group-hover:opacity-100",
                              )}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs font-body text-[#5B6275] flex flex-col items-center gap-2">
              <Search className="w-5 h-5 text-[#5B6275]/60" />
              <span>No settings found matching "{searchQuery}"</span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#7C5CFF] font-semibold hover:underline mt-1 cursor-pointer"
              >
                Reset search
              </button>
            </div>
          )}
        </aside>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: SCROLLABLE SETTINGS CONTENT */}
        {/* ========================================================= */}
        <main
          className={cn(
            "flex flex-col gap-6 min-w-0 pb-12",
            !isMobileDetailOpen ? "hidden md:flex" : "flex",
          )}
        >
          {/* Mobile Back Button Bar */}
          <div className="md:hidden flex items-center gap-2 pb-2 border-b border-[#232736]">
            <button
              type="button"
              onClick={() => setIsMobileDetailOpen(false)}
              className="flex items-center gap-1.5 text-xs font-display font-semibold text-[#7C5CFF] hover:underline py-1.5 px-2 -ml-2 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Settings</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* 1. ACCOUNT PRIVACY (Exact reference screenshot match) */}
          {/* ========================================================= */}
          {activeSection === "account-privacy" && (
            <div className="flex flex-col gap-6">
              {/* Primary Toggle Card */}
              <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col gap-6">
                <h2 className="font-display font-bold text-lg text-[#F5F6FA]">
                  Account privacy
                </h2>

                <div className="flex flex-col divide-y divide-[#232736]/60">
                  {/* Private account */}
                  <div className="pb-5 flex items-start justify-between gap-4">
                    <div className="flex-1 pr-2">
                      <p className="font-display text-sm font-semibold text-[#F5F6FA]">
                        Private account
                      </p>
                      <p className="font-body text-xs text-[#9EA5B9] mt-1.5 leading-relaxed">
                        When your account is public, your profile and posts can be seen by anyone, on or off ConnectX, even if they don't have an account.
                      </p>
                      <p className="font-body text-xs text-[#9EA5B9] mt-1.5 leading-relaxed">
                        When your account is private, only the followers you approve can see what you share, including your photos or videos on hashtag and location pages, and your followers and following lists. Certain info on your profile, like your profile picture and username, is visible to everyone on and off ConnectX.{" "}
                        <button type="button" onClick={() => toast.info("Privacy Policy Guide")} className="text-[#7C5CFF] hover:underline cursor-pointer">
                          Learn more
                        </button>
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPrivateAccount}
                      onClick={handleTogglePrivateAccount}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF] cursor-pointer",
                        isPrivateAccount ? "bg-[#7C5CFF]" : "bg-[#282a31]",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full bg-white transition-transform shadow-md",
                          isPrivateAccount ? "translate-x-6" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>

                  {/* Allow public content in search engine results */}
                  <div className="pt-5 flex items-start justify-between gap-4">
                    <div className="flex-1 pr-2">
                      <p className="font-display text-sm font-semibold text-[#F5F6FA]">
                        Allow public content to appear in search engine results
                      </p>
                      <p className="font-body text-xs text-[#9EA5B9] mt-1.5 leading-relaxed">
                        When this is on, search engines like Google can show your public photos and videos in search results outside of ConnectX. When this is off, links to your publicly shared content can still appear in search results.{" "}
                        <button type="button" onClick={() => toast.info("Search Visibility Guide")} className="text-[#7C5CFF] hover:underline cursor-pointer">
                          Learn more
                        </button>
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={allowSearchEngines}
                      onClick={() => {
                        setAllowSearchEngines(!allowSearchEngines);
                        toast.info(allowSearchEngines ? "Search engine indexing disabled" : "Search engine indexing enabled");
                      }}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF] cursor-pointer",
                        allowSearchEngines ? "bg-[#7C5CFF]" : "bg-[#282a31]",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full bg-white transition-transform shadow-md",
                          allowSearchEngines ? "translate-x-6" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section: Who can see your content */}
              <div className="bg-[#171923] border border-[#232736] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-3">
                <h3 className="font-display font-semibold text-sm text-[#F5F6FA] px-1">
                  Who can see your content
                </h3>
                <div className="flex flex-col divide-y divide-[#232736]/50">
                  <button
                    type="button"
                    onClick={() => handleSelectSection("close-friends")}
                    className="py-3 px-1 flex items-center justify-between hover:bg-[#11131A]/60 rounded-xl transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 text-[#9EA5B9] group-hover:text-[#F5F6FA]" />
                      <span className="font-display text-sm text-[#F5F6FA]">Close Friends</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#9EA5B9]">
                      <span>{closeFriends.length} people</span>
                      <ChevronRight className="w-4 h-4 text-[#5B6275]" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSection("blocked")}
                    className="py-3 px-1 flex items-center justify-between hover:bg-[#11131A]/60 rounded-xl transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <CircleSlash className="w-4 h-4 text-[#9EA5B9] group-hover:text-[#F5F6FA]" />
                      <span className="font-display text-sm text-[#F5F6FA]">Blocked</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#9EA5B9]">
                      <span>{blockedUsers.length} accounts</span>
                      <ChevronRight className="w-4 h-4 text-[#5B6275]" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSection("story-location")}
                    className="py-3 px-1 flex items-center justify-between hover:bg-[#11131A]/60 rounded-xl transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#9EA5B9] group-hover:text-[#F5F6FA]" />
                      <span className="font-display text-sm text-[#F5F6FA]">Story and live location</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#5B6275]" />
                  </button>
                </div>
              </div>

              {/* Section: How others can interact with you */}
              <div className="bg-[#171923] border border-[#232736] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-3">
                <h3 className="font-display font-semibold text-sm text-[#F5F6FA] px-1">
                  How others can interact with you
                </h3>
                <div className="flex flex-col divide-y divide-[#232736]/50">
                  {[
                    { id: "messages-replies" as SettingsSectionId, label: "Messages and story replies", icon: Send },
                    { id: "tags-mentions" as SettingsSectionId, label: "Tags and mentions", icon: AtSign },
                    { id: "comments" as SettingsSectionId, label: "Comments", icon: MessageSquare },
                    { id: "sharing-reuse" as SettingsSectionId, label: "Sharing and reuse", icon: Repeat },
                    { id: "restricted" as SettingsSectionId, label: "Restricted accounts", icon: EyeOff },
                    { id: "hidden-words" as SettingsSectionId, label: "Hidden Words", icon: Type },
                  ].map((row) => {
                    const Icon = row.icon;
                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => handleSelectSection(row.id)}
                        className="py-3 px-1 flex items-center justify-between hover:bg-[#11131A]/60 rounded-xl transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-[#9EA5B9] group-hover:text-[#F5F6FA]" />
                          <span className="font-display text-sm text-[#F5F6FA]">{row.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5B6275]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section: What you see */}
              <div className="bg-[#171923] border border-[#232736] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-3">
                <h3 className="font-display font-semibold text-sm text-[#F5F6FA] px-1">
                  What you see
                </h3>
                <div className="flex flex-col divide-y divide-[#232736]/50">
                  {[
                    { id: "muted" as SettingsSectionId, label: "Muted accounts", icon: VolumeX },
                    { id: "content-preferences" as SettingsSectionId, label: "Content preferences", icon: SlidersHorizontal },
                    { id: "like-share-counts" as SettingsSectionId, label: "Like and share counts", icon: Heart },
                  ].map((row) => {
                    const Icon = row.icon;
                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => handleSelectSection(row.id)}
                        className="py-3 px-1 flex items-center justify-between hover:bg-[#11131A]/60 rounded-xl transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-[#9EA5B9] group-hover:text-[#F5F6FA]" />
                          <span className="font-display text-sm text-[#F5F6FA]">{row.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5B6275]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section: Data and permissions */}
              <div className="bg-[#171923] border border-[#232736] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-3">
                <h3 className="font-display font-semibold text-sm text-[#F5F6FA] px-1">
                  Data and permissions
                </h3>
                <div className="flex flex-col divide-y divide-[#232736]/50">
                  <button
                    type="button"
                    onClick={() => handleSelectSection("archiving-downloading")}
                    className="py-3 px-1 flex items-center justify-between hover:bg-[#11131A]/60 rounded-xl transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <DownloadCloud className="w-4 h-4 text-[#9EA5B9] group-hover:text-[#F5F6FA]" />
                      <span className="font-display text-sm text-[#F5F6FA]">Archiving and downloading</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#5B6275]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSection("website-permissions")}
                    className="py-3 px-1 flex items-center justify-between hover:bg-[#11131A]/60 rounded-xl transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-[#9EA5B9] group-hover:text-[#F5F6FA]" />
                      <span className="font-display text-sm text-[#F5F6FA]">Website permissions</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#5B6275]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. EDIT PROFILE (Exact match to reference screenshot 1) */}
          {/* ========================================================= */}
          {activeSection === "edit-profile" && (
            <div className="flex flex-col gap-6">
              {/* Card 1: Profile Information */}
              <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-[#F5F6FA]">
                    Profile Information
                  </h2>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-[#11131A] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] font-display text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#7C5CFF]" />
                    <span>Change Photo</span>
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar with Camera badge */}
                    <div className="relative shrink-0">
                      <Avatar
                        src={avatarUrl}
                        alt={displayName}
                        size="xl"
                        className="w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-[#7C5CFF]/40 shadow-xl"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#7C5CFF] text-white flex items-center justify-center shadow-lg ring-2 ring-[#171923] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        title="Upload photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 w-full flex flex-col gap-4">
                      {/* Name */}
                      <div className="flex flex-col gap-1">
                        <label className="font-display text-xs font-semibold text-[#9EA5B9]">Name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="h-11 px-4 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] font-body text-sm focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                        />
                      </div>

                      {/* Username */}
                      <div className="flex flex-col gap-1">
                        <label className="font-display text-xs font-semibold text-[#9EA5B9]">Username</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-[#5B6275] text-sm font-display font-bold">@</span>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                            className="w-full h-11 pl-8 pr-4 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] font-body text-sm focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                          />
                        </div>
                      </div>

                      {/* Bio with Live Counter */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="font-display text-xs font-semibold text-[#9EA5B9]">Bio</label>
                          <span className="text-[11px] font-mono text-[#5B6275]">{bio.length}/160</span>
                        </div>
                        <textarea
                          rows={3}
                          maxLength={160}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] font-body text-sm focus:outline-none focus:ring-1 focus:ring-[#7C5CFF] resize-none"
                        />
                      </div>

                      {/* Website, Pronouns & Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="flex flex-col gap-1">
                          <label className="font-display text-xs font-semibold text-[#9EA5B9]">Website</label>
                          <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="h-10 px-3.5 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] font-body text-xs focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-display text-xs font-semibold text-[#9EA5B9]">Pronouns</label>
                          <input
                            type="text"
                            value={pronouns}
                            onChange={(e) => setPronouns(e.target.value)}
                            placeholder="she/her, they/them"
                            className="h-10 px-3.5 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] font-body text-xs focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-display text-xs font-semibold text-[#9EA5B9]">Location</label>
                          <input
                            type="text"
                            value={userLocation}
                            onChange={(e) => setUserLocation(e.target.value)}
                            placeholder="San Francisco, CA"
                            className="h-10 px-3.5 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] font-body text-xs focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#3B82F6] hover:opacity-95 text-white font-display text-xs font-semibold shadow-lg shadow-primary-vibrant/25 active:scale-95 transition-all cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Card 2: Email & Security (Matching reference screenshot 1) */}
              <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col gap-4">
                <h3 className="font-display font-bold text-base text-[#F5F6FA]">
                  Email & Security
                </h3>

                <div className="flex flex-col divide-y divide-[#232736]/60">
                  {/* Email */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-xs font-semibold text-[#9EA5B9]">Email</p>
                      <p className="font-body text-sm text-[#F5F6FA] mt-0.5">emily@connectx.io</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info("Email change verification code sent.")}
                      className="px-3.5 py-1.5 rounded-xl bg-[#11131A] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] font-display text-xs font-medium transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Password */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-xs font-semibold text-[#9EA5B9]">Password</p>
                      <p className="font-mono text-sm text-[#F5F6FA] mt-0.5 tracking-wider">••••••••••••</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info("Password update link dispatched.")}
                      className="px-3.5 py-1.5 rounded-xl bg-[#11131A] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] font-display text-xs font-medium transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-xs font-semibold text-[#9EA5B9]">Two-Factor Authentication</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="font-body text-xs text-emerald-300 font-medium">Enabled</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info("Managing 2FA Security Keys & Authenticator")}
                      className="px-3.5 py-1.5 rounded-xl bg-[#11131A] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] font-display text-xs font-medium transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Manage Account (Matching reference screenshot 1) */}
              <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col gap-4">
                <h3 className="font-display font-bold text-base text-[#F5F6FA]">
                  Manage Account
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => toast.success("Compiling complete ConnectX archive (3D assets, messages, files)...")}
                    className="p-3.5 rounded-xl bg-[#11131A] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] font-display text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#7C5CFF]" />
                    <span>Download Your Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={triggerDeactivate}
                    className="p-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-display text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Deactivate Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. CLOSE FRIENDS SUB-SCREEN */}
          {/* ========================================================= */}
          {activeSection === "close-friends" && (
            <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-lg text-[#F5F6FA]">Close Friends</h2>
                  <p className="font-body text-xs text-[#9EA5B9] mt-0.5">
                    We don't send notifications when you edit your close friends list.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF] text-xs font-display font-semibold">
                  {closeFriends.length} selected
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-[#5B6275]" />
                <input
                  type="text"
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  placeholder="Search people..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#11131A] border border-[#232736] text-xs text-[#F5F6FA] focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                />
              </div>

              {/* User Selection List */}
              <div className="flex flex-col divide-y divide-[#232736]/50">
                {potentialFriends
                  .filter((u) => u.name.toLowerCase().includes(friendSearch.toLowerCase()) || u.handle.includes(friendSearch.toLowerCase()))
                  .map((user) => {
                    const isSelected = closeFriends.includes(user.handle);
                    return (
                      <div key={user.handle} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} alt={user.name} size="md" />
                          <div>
                            <p className="font-display text-xs font-semibold text-[#F5F6FA]">{user.name}</p>
                            <p className="font-body text-[11px] text-[#9EA5B9]">@{user.handle}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setCloseFriends((prev) => prev.filter((h) => h !== user.handle));
                              toast.info(`Removed @${user.handle} from Close Friends`);
                            } else {
                              setCloseFriends((prev) => [...prev, user.handle]);
                              toast.success(`Added @${user.handle} to Close Friends`);
                            }
                          }}
                          className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-display font-semibold transition-all cursor-pointer",
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-[#11131A] text-[#F5F6FA] border border-[#232736] hover:border-[#7C5CFF]",
                          )}
                        >
                          {isSelected ? "Close Friend ✓" : "Add"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. BLOCKED ACCOUNTS SUB-SCREEN */}
          {/* ========================================================= */}
          {activeSection === "blocked" && (
            <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-lg text-[#F5F6FA]">Blocked accounts</h2>
                  <p className="font-body text-xs text-[#9EA5B9] mt-0.5">
                    Blocked people cannot see your profile, files, or spaces on ConnectX.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#11131A] text-[#9EA5B9] border border-[#232736] text-xs font-display font-semibold">
                  {blockedUsers.length} blocked
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-[#5B6275]" />
                <input
                  type="text"
                  value={blockedSearch}
                  onChange={(e) => setBlockedSearch(e.target.value)}
                  placeholder="Search blocked accounts..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#11131A] border border-[#232736] text-xs text-[#F5F6FA] focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                />
              </div>

              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {blockedUsers
                  .filter((handle) => handle.toLowerCase().includes(blockedSearch.toLowerCase()))
                  .map((handle) => (
                    <div key={handle} className="p-3 rounded-xl bg-[#11131A] border border-[#232736] flex items-center justify-between">
                      <span className="font-display text-xs text-[#F5F6FA]">@{handle}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setBlockedUsers((prev) => prev.filter((u) => u !== handle));
                          toast.success(`Unblocked @${handle}`);
                        }}
                        className="px-3.5 py-1 rounded-full bg-[#171923] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] text-xs font-display font-medium transition-colors cursor-pointer"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. MESSAGES & STORY REPLIES SUB-SCREEN */}
          {/* ========================================================= */}
          {activeSection === "messages-replies" && (
            <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div>
                <h2 className="font-display font-bold text-lg text-[#F5F6FA]">
                  Messages and story replies
                </h2>
                <p className="font-body text-xs text-[#9EA5B9] mt-0.5">
                  Decide who can reach you through DMs and reply to your live moments.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-[#232736]/60">
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold text-[#F5F6FA]">Read receipts</p>
                    <p className="font-body text-xs text-[#9EA5B9]">Others can see when you have opened their direct messages.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={readReceipts}
                    onClick={() => setReadReceipts(!readReceipts)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer",
                      readReceipts ? "bg-[#7C5CFF]" : "bg-[#282a31]",
                    )}
                  >
                    <div className={cn("w-5 h-5 rounded-full bg-white transition-transform", readReceipts ? "translate-x-5" : "")} />
                  </button>
                </div>

                <div className="py-4 flex flex-col gap-2">
                  <p className="font-display text-sm font-semibold text-[#F5F6FA]">Message Requests</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "following", label: "People you follow only" },
                      { id: "everyone", label: "Everyone on ConnectX" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMessageRequests(opt.id as typeof messageRequests)}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-between text-xs font-display font-medium text-left cursor-pointer",
                          messageRequests === opt.id ? "bg-[#7C5CFF]/15 border-[#7C5CFF] text-white" : "bg-[#11131A] border-[#232736] text-[#9EA5B9]",
                        )}
                      >
                        <span>{opt.label}</span>
                        {messageRequests === opt.id && <Check className="w-4 h-4 text-[#7C5CFF]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-4 flex flex-col gap-2">
                  <p className="font-display text-sm font-semibold text-[#F5F6FA]">Story Replies</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "everyone", label: "Allow replies from everyone" },
                      { id: "following", label: "Allow replies only from people you follow" },
                      { id: "off", label: "Don't allow replies" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setStoryReplies(opt.id as typeof storyReplies)}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-between text-xs font-display font-medium text-left cursor-pointer",
                          storyReplies === opt.id ? "bg-[#7C5CFF]/15 border-[#7C5CFF] text-white" : "bg-[#11131A] border-[#232736] text-[#9EA5B9]",
                        )}
                      >
                        <span>{opt.label}</span>
                        {storyReplies === opt.id && <Check className="w-4 h-4 text-[#7C5CFF]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* HIDDEN WORDS SUB-SCREEN */}
          {/* ========================================================= */}
          {activeSection === "hidden-words" && (
            <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div>
                <h2 className="font-display font-bold text-lg text-[#F5F6FA]">Hidden Words</h2>
                <p className="font-body text-xs text-[#9EA5B9] mt-0.5">
                  Protect yourself from offensive comments and message requests.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-[#232736]/60">
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-sm font-semibold text-[#F5F6FA]">Hide offensive comments</p>
                    <p className="font-body text-xs text-[#9EA5B9] mt-0.5">
                      Comments that may be offensive, derogatory, or spam will be filtered into a hidden review queue.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hideOffensiveWords}
                    onClick={() => {
                      setHideOffensiveWords(!hideOffensiveWords);
                      toast.info(hideOffensiveWords ? "Offensive comments filter disabled" : "Offensive comments filter enabled");
                    }}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer",
                      hideOffensiveWords ? "bg-[#7C5CFF]" : "bg-[#282a31]",
                    )}
                  >
                    <div className={cn("w-5 h-5 rounded-full bg-white transition-transform", hideOffensiveWords ? "translate-x-5" : "")} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. APPEARANCE SUB-SCREEN */}
          {/* ========================================================= */}
          {activeSection === "appearance" && (
            <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div>
                <h2 className="font-display font-bold text-lg text-[#F5F6FA]">Appearance</h2>
                <p className="font-body text-xs text-[#9EA5B9] mt-0.5">
                  Customize the cyber dark canvas and luminous neon accents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "obsidian", label: "Obsidian Cyber", desc: "#090A0F true dark", active: themeMode === "obsidian" },
                  { id: "midnight", label: "Midnight Slate", desc: "#11131A deep space", active: themeMode === "midnight" },
                  { id: "oled", label: "OLED Black", desc: "#000000 pure black", active: themeMode === "oled" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setThemeMode(item.id as typeof themeMode);
                      toast.success(`Theme set to ${item.label}`);
                    }}
                    className={cn(
                      "p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                      item.active ? "bg-[#7C5CFF]/20 border-[#7C5CFF] text-white" : "bg-[#11131A] border-[#232736] text-[#9EA5B9]",
                    )}
                  >
                    <p className="font-display text-xs font-semibold text-[#F5F6FA]">{item.label}</p>
                    <p className="font-body text-[11px] text-[#5B6275] mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              {/* Accent Color Chooser */}
              <div className="pt-3 border-t border-[#232736] flex flex-col gap-2.5">
                <p className="font-display text-xs sm:text-sm font-semibold text-[#F5F6FA]">Accent Palette</p>
                <div className="flex items-center gap-3">
                  {[
                    { id: "violet", label: "Electric Violet", color: "bg-[#7C5CFF]" },
                    { id: "cyan", label: "Cyan Ray", color: "bg-[#38D9FF]" },
                    { id: "pink", label: "Magenta Glow", color: "bg-[#FF4FA3]" },
                    { id: "blue", label: "Cobalt Blue", color: "bg-[#4C8DFF]" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAccentColor(item.id);
                        toast.success(`Accent color set to ${item.label}`);
                      }}
                      className={cn(
                        "w-7 h-7 rounded-full transition-transform flex items-center justify-center cursor-pointer",
                        item.color,
                        accentColor === item.id ? "ring-2 ring-white ring-offset-2 ring-offset-[#171923] scale-110" : "opacity-75 hover:opacity-100",
                      )}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#232736] flex items-center justify-between">
                <div>
                  <p className="font-display text-xs sm:text-sm font-semibold text-[#F5F6FA]">Ambient Glow Spheres</p>
                  <p className="font-body text-[11px] text-[#9EA5B9]">Render atmospheric lighting in backgrounds.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={glowEffects}
                  onClick={() => setGlowEffects(!glowEffects)}
                  className={cn("w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer", glowEffects ? "bg-[#7C5CFF]" : "bg-[#282a31]")}
                >
                  <div className={cn("w-5 h-5 rounded-full bg-white transition-transform", glowEffects ? "translate-x-5" : "")} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. NOTIFICATIONS SUB-SCREEN */}
          {/* ========================================================= */}
          {activeSection === "notifications" && (
            <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div>
                <h2 className="font-display font-bold text-lg text-[#F5F6FA]">Notifications</h2>
                <p className="font-body text-xs text-[#9EA5B9] mt-0.5">
                  Select which alerts and spatial stage broadcasts ping your devices.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-between">
                <div>
                  <p className="font-display text-xs sm:text-sm font-semibold text-[#7C5CFF]">Pause All Notifications</p>
                  <p className="font-body text-[11px] text-[#9EA5B9]">Temporarily silence all push notifications and live stage invites.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={pauseAllNotifications}
                  onClick={() => setPauseAllNotifications(!pauseAllNotifications)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer",
                    pauseAllNotifications ? "bg-[#7C5CFF]" : "bg-[#282a31]",
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-full bg-white transition-transform", pauseAllNotifications ? "translate-x-5" : "")} />
                </button>
              </div>

              <div className="flex flex-col divide-y divide-[#232736]/60">
                <div className="py-3.5 flex items-center justify-between">
                  <span className="font-display text-xs sm:text-sm font-medium text-[#F5F6FA]">Reactions & Comments</span>
                  <button type="button" onClick={() => setNotifyLikes(!notifyLikes)} className={cn("w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer", notifyLikes ? "bg-[#7C5CFF]" : "bg-[#282a31]")}>
                    <div className={cn("w-5 h-5 rounded-full bg-white transition-transform", notifyLikes ? "translate-x-5" : "")} />
                  </button>
                </div>
                <div className="py-3.5 flex items-center justify-between">
                  <span className="font-display text-xs sm:text-sm font-medium text-[#F5F6FA]">Live Audio Spaces</span>
                  <button type="button" onClick={() => setNotifySpaces(!notifySpaces)} className={cn("w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer", notifySpaces ? "bg-[#7C5CFF]" : "bg-[#282a31]")}>
                    <div className={cn("w-5 h-5 rounded-full bg-white transition-transform", notifySpaces ? "translate-x-5" : "")} />
                  </button>
                </div>
                <div className="py-3.5 flex items-center justify-between">
                  <span className="font-display text-xs sm:text-sm font-medium text-[#F5F6FA]">Universal File Drops</span>
                  <button type="button" onClick={() => setNotifyFiles(!notifyFiles)} className={cn("w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer", notifyFiles ? "bg-[#7C5CFF]" : "bg-[#282a31]")}>
                    <div className={cn("w-5 h-5 rounded-full bg-white transition-transform", notifyFiles ? "translate-x-5" : "")} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. ACCOUNTS CENTER SUB-SCREEN */}
          {/* ========================================================= */}
          {activeSection === "accounts-center" && (
            <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col gap-6">
              <div>
                <h2 className="font-display font-bold text-lg text-[#F5F6FA]">Accounts Center</h2>
                <p className="font-body text-xs text-[#9EA5B9] mt-0.5">
                  Manage connected experiences and shared login accounts across the ConnectX ecosystem.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#11131A] border border-[#232736] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={avatarUrl} alt={displayName} size="md" />
                  <div>
                    <p className="font-display text-xs font-semibold text-[#F5F6FA]">{displayName}</p>
                    <p className="font-body text-[11px] text-[#9EA5B9]">ConnectX Universal Identity</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                  Active
                </span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 9. FALLBACK / OTHER SECTIONS */}
          {/* ========================================================= */}
          {![
            "account-privacy",
            "edit-profile",
            "close-friends",
            "blocked",
            "messages-replies",
            "hidden-words",
            "appearance",
            "notifications",
            "accounts-center",
          ].includes(activeSection) && (
            <div className="bg-[#171923] border border-[#232736] rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col gap-4">
              <h2 className="font-display font-bold text-lg text-[#F5F6FA] capitalize">
                {activeSection.replace("-", " ")}
              </h2>
              <p className="font-body text-xs text-[#9EA5B9]">
                Configure settings for this section according to your preferences.
              </p>
              <div className="p-4 rounded-xl bg-[#11131A] border border-[#232736] text-xs font-body text-[#9EA5B9]">
                All settings under {activeSection.replace("-", " ")} are synced to your ConnectX cloud account.
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmLabel={dialogConfig.confirmLabel}
        onConfirm={dialogConfig.onConfirm}
        onCancel={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
