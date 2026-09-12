# ConnectX component inventory

Status key:

- **pattern** — exists as duplicated HTML in prototypes; extract in React
- **planned** — required by architecture; not in HTML as a distinct block
- **asset** — SVG / static

Implementation home is `apps/web/src/...`.

---

## Brand

| Component | Status | Prototype | Notes |
| --- | --- | --- | --- |
| ConnectXMark | asset | `connectx_brand_mark` | C/X neon mark; copy to `public/brand` |
| Wordmark | pattern | Mobile headers | `Connect` + `X` in `text-primary` |

---

## Layout

| Component | Status | Prototype | Notes |
| --- | --- | --- | --- |
| AppShell | pattern | All desktop + mobile | Dual chrome; one React implementation |
| Sidebar / NavRail | pattern | Desktop `aside.w-20` | Icon-only; glow active; Create emphasized |
| Topbar | pattern | Desktop `header.h-16` | Search, Ask AI, send, bell, avatar |
| MobileTopbar | pattern | Mobile headers | Wordmark + search + bell + avatar |
| MobileNav | pattern | Bottom nav | Home, Explore, Create FAB, Chat, Spaces |
| PageContainer | pattern | `max-w-[1520px]` etc. | Unify max-width token |
| ContentColumn | pattern | `lg:col-span-8` | Feed spine |
| RightContextPanel | pattern | Home Live Spaces, Explore stream | Drawer on tablet |
| SectionHeader | pattern | “Live Spaces”, “Trending” | Title + text button |

---

## Navigation / overlays

| Component | Status | Notes |
| --- | --- | --- |
| NavItem | pattern | 48px round, `title` + must add `aria-label` |
| CreateFab | pattern | Rail gradient add + mobile raised 56px |
| Tooltip | planned | Required when rail is icon-only |
| CommandPalette | planned | Not in prototypes |
| SkipLink | planned | a11y |

---

## UI primitives (Phase 2)

| Component | Status | Variants from screens |
| --- | --- | --- |
| Button | pattern | Primary pill gradient, secondary surface, ghost, destructive, link |
| IconButton | pattern | ~40px round surface |
| Input | pattern | Pill search; 12–14px inputs |
| Textarea | planned | Composer / comments |
| Select | pattern | Audience, sort |
| Checkbox | pattern | Drive selection; DESIGN Universe describes 6px round square |
| Radio | planned | Poll options can share |
| Switch | planned | Settings |
| Badge | pattern | Creator, Encrypted, version |
| Chip | pattern | Filter / category |
| FilterChip | pattern | Active = violet→blue gradient |
| StatusBadge | pattern | Live, online |
| FileExtensionBadge | pattern | PDF, USDZ, FIG, BLEND |
| PresenceBadge | pattern | Dot on avatar (cyan/pink/green mix — standardize to secondary/tertiary tokens) |
| AIStatusBadge | pattern | Pulse on Ask AI |
| Avatar | pattern | 32–144px, gradient ring, add-story badge |
| Tooltip | planned | |
| Popover | pattern | Attach tray, share, sort |
| Dropdown | pattern | Audience, more |
| Dialog | planned | Focus-managed replacement for sheets |
| Drawer | pattern | Create Studio, call sidebar, chat info |
| Tabs | pattern | Profile, Space, call, For You/Following/Spaces |
| Toast | pattern | Space hub `showToast` |
| Progress | pattern | Upload bar gradient |
| Skeleton | pattern | Create overlay fake feed only; need real skeletons |
| Separator | pattern | `outline-variant` hairlines |

---

## Feedback

| Component | Status | Copy / behavior |
| --- | --- | --- |
| EmptyState | pattern | “You're all caught up!” |
| ErrorState | planned | Missing |
| LoadingState | planned | Missing |
| RetryButton | planned | Missing |
| ErrorBoundary | planned | App-level |

---

## Social

| Component | Status | Prototype |
| --- | --- | --- |
| StoryRail | pattern | Home desktop + mobile |
| StoryBubble | pattern | Gradient ring vs seen (muted) |
| ComposerBar | pattern | Home inline composer |
| PostCard | pattern | Split into header/content/actions |
| PostHeader | pattern | Avatar, name, badge, time, more |
| PostContext | pattern | “Why am I seeing this? • Following @user” |
| PostContent | pattern | Text + media/file/audio |
| PostActions | pattern | Like, comment, share/repost/fork, bookmark, send |
| MediaCard | pattern | 4:5 mobile, ~420px desktop height |
| FileInPost | pattern | First-class file object, not a link |
| AudioCard | pattern | Waveform + listen |
| PollCard | pattern | Chat + Space |
| EventCard | planned | Create type exists; no full event page |
| Comment | pattern | Post detail |
| CommentThread | pattern | Nested reply |
| ReactionBar | pattern | Counts with tnum |
| ShareDialog | pattern | Cross-sharing social graph |

---

## Files / Drive / viewer

| Component | Status | Prototype |
| --- | --- | --- |
| FileCard | pattern | Drive + feed + profile |
| FileGrid / FileList | pattern | View toggle |
| FilePreview | pattern | Thumb + poly/page meta |
| FileMetadata | pattern | Size, time, encryption |
| FileActions | pattern | Preview, Ask AI, Inspect 3D, Diff, Listen, Download… |
| FileUploadItem | pattern | Create snippet |
| UploadProgress | pattern | 68% blend upload card |
| FilePermissionBadge | pattern | Encrypted / Space |
| FileVersionBadge | pattern | v2.4 |
| FileTypeIcon | pattern | Material icons by type |
| FileSearch | pattern | Drive search |
| FileFilters | pattern | All Assets, Docs, 3D, Code, Audio, Archives |
| FileViewer | pattern | Universal file viewer |
| DocumentToolbar | pattern | Pages, zoom, present, share, download |
| AICompanion | pattern | Viewer right pane |

---

## Create Studio

| Component | Status |
| --- | --- |
| CreateStudio | pattern (one HTML sheet) — split in React |
| ComposerHeader | pattern “Share Anything” |
| ContentTypeSelector | pattern 4×2 grid |
| TextComposer | planned (sheet is type+drop first) |
| MediaPicker / FileUploader | pattern drop zone |
| AudioComposer | planned |
| CodeComposer | planned |
| ThreeDAssetPicker | planned |
| PollComposer / EventComposer | planned (tile exists) |
| AudienceSelector | pattern |
| AttachmentList | pattern |
| PublishBar | pattern Continue / Browse Files |

---

## Chat

| Component | Status |
| --- | --- |
| ChatPage | pattern |
| ConversationList | pattern |
| ConversationItem | pattern |
| ConversationHeader | pattern |
| MessageList | pattern |
| MessageBubble | pattern incoming / outgoing violet |
| MessageComposer | pattern |
| AttachmentPicker | pattern |
| ReplyPreview | pattern (post detail; chat later) |
| ConversationInfo | pattern toggle panel |
| TypingIndicator | planned (not in HTML) |
| VoiceNote | pattern |

---

## Spaces

| Component | Status | Notes |
| --- | --- | --- |
| SpaceCard | pattern | Explore + home live rows |
| SpaceHeader | pattern | Motion & Spatial Guild |
| SpaceNavigation | pattern | Tabs |
| SpacePost | pattern | Like Space feed cards |
| ChannelList | planned | Route exists; HTML is tabbed hub |
| LiveStage | pattern | Audio stage pill + tune in |
| MemberList | pattern | Counts; full list missing |
| Poll | pattern | Exclusive option |
| EventCard | planned | |

---

## Profile

| Component | Status |
| --- | --- |
| ProfileHero | pattern cover + glow |
| ProfileIdentity | pattern name, pronouns, links |
| ProfileStats | pattern glass island |
| HighlightsRail | pattern |
| ProfileTabs | pattern posts / files / spaces |
| FollowButton | planned (own profile shows Edit) |
| AIAvatarCard | pattern “Ask Emily's AI” |

---

## Notifications / search

| Component | Status |
| --- | --- |
| NotificationList | pattern grouped |
| NotificationItem | pattern |
| SearchField | pattern |
| SearchResults | planned dedicated page |
| FilterChips (notif) | pattern All / Mentions / Files… |

---

## AI

| Component | Status | Rule |
| --- | --- | --- |
| AIButton / AskAIButton | pattern | Always presentational |
| AIInsight / AIReason | pattern | “Why am I seeing this?” is recommendation UX, not model output |
| AIProcessingBadge | pattern | |
| AIAnswerPanel | pattern | Viewer companion — **mock adapter only** until Phase 15 |
| AICompanion | pattern | |

---

## Media / calls

| Component | Status |
| --- | --- |
| ImageViewer | pattern |
| VideoPlayer | planned (reels tiles exist) |
| AudioPlayer | pattern waveform |
| MediaGallery / Carousel | planned |
| FullscreenMediaViewer | planned |
| CallStage | pattern live video HTML |
| CallControls | pattern |
| CallSideDrawer | pattern |

---

## Duplicate patterns to collapse

1. Desktop rail markup (~identical on Home, Explore, Chat, Viewer, Messages, Post, Call).
2. Desktop topbar (search + Ask AI + send + bell + avatar).
3. Mobile header (logo + ConnectX + search + bell + avatar).
4. Mobile bottom nav (identical on Home, Notifications, Share, Spaces).
5. Post action row (like / comment / share / bookmark).
6. File social object (thumbnail, extension, Ask AI).
7. Filter pill (gradient active vs surface inactive).
8. Tailwind config JSON (every HTML file).

---

## Build order for React components

1. `cn`, tokens, Button, IconButton, Avatar, Input, Chip, Badge, Card/GlassCard, Skeleton, Toast.
2. AppShell, NavRail, Topbar, MobileNav.
3. PostCard composition + StoryRail + ComposerBar.
4. FileCard + UploadProgress + FilterChip.
5. CreateStudio split.
6. Chat list + bubbles.
7. SpaceHeader + tabs + poll.
8. Profile hero.
9. Viewer + AICompanion (mocked).
10. Notifications + Search page.

Do not add a second visual kit. If a screen needs a new primitive, extend this inventory first.
