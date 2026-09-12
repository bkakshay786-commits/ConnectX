# ConnectX frontend audit

**Date:** 2026-09-11  
**Scope:** Entire supplied workspace. No existing React application was found.  
**Rule followed:** Existing HTML prototypes and design files were inspected only. Nothing in those folders was rewritten.

---

## 1. Current architecture

The repository is a **Stitch / Google AIDA HTML prototype pack**, not a production frontend.

```
stitch_connectx_universal_social_ecosystem/
├── connectx_universe/DESIGN.md
├── connectx_modern_social/DESIGN.md
├── connectx_brand_mark/code.html
└── [13 screen folders]/code.html
```

There is **no** `package.json`, Vite app, TypeScript, router, API client, or shared component library.

Each `code.html` is a self-contained document that:

- Loads **Tailwind CDN** (`cdn.tailwindcss.com`) with an inline `tailwind.config`.
- Loads **Plus Jakarta Sans** (600/700/800) and **Inter** (400/500/600) from Google Fonts.
- Loads **Material Symbols Outlined** (often twice).
- Hardcodes a Material 3–style dark token map.
- Embeds all markup, duplicated chrome (rail/topbar/bottom nav), and local `addEventListener` scripts.
- Pulls photography from `lh3.googleusercontent.com` / `aida-public` URLs.

This is a **visual + interaction prototype layer**. It is the correct visual reference and an incorrect runtime architecture.

### Desktop chrome (repeated)

Fixed **80px icon rail** (`aside.w-20`) + **64px glass topbar** (`header.h-16`, offset `left-20`) + main canvas with a faint violet radial wash:

`bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.12),rgba(17,19,26,0))]`

### Mobile chrome (repeated)

Fixed glass **top bar** (`pt-safe`, ConnectX wordmark) + **bottom nav** with a raised central Create FAB (`w-14 h-14`, `-mt-6`) + `pb-24` content inset.

---

## 2. Existing pages

| Prototype | Product surface | Layout | Primary content |
| --- | --- | --- | --- |
| `connectx_dynamic_home_feed` | Home | Desktop 80px rail + 8/4 grid | Stories, composer, photo/file/audio posts, Live Spaces, trends |
| `connectx_mobile_dynamic_home_feed` | Home | Mobile column | Stories, For You / Following / Spaces, posts, “You're all caught up!” |
| `connectx_curated_explore` | Explore | Desktop rail + XL 8/4 | Filter pills, spotlight Space, bento, live Spaces |
| `connectx_mobile_universal_create` | Create Studio | Mobile sheet over blurred feed | “Share Anything” 8-type grid, drop zone, audience, Continue |
| `connectx_mobile_universal_file_picker` | Universal Drive | Mobile | Search, grid/list, filters, upload progress, file cards, selection |
| `connectx_mobile_space_community_hub` | Space | Mobile | Motion & Spatial Guild, join, tabs, poll, live stage, files |
| `connectx_creator_profile_social_vault` | Profile | Wide profile | Hero, stats, highlights, tabs, file posts, AI avatar, moderated Spaces |
| `connectx_messages_universal_sharing` | Chat | Desktop split 360px + thread | Conversation list, voice, file, poll, attach tray, info panel |
| `connectx_post_detail_interactive_comments` | Post | Desktop rail | Media, file badge, comments, sort, reply context |
| `connectx_notification_center_social_graph` | Notifications | Mobile | Filters, grouped events, right-rail social graph (desktop classes mixed in) |
| `connectx_universal_cross_sharing_social_graph` | Share | Mobile | File share targets, copy link, bottom nav |
| `connectx_universal_file_viewer_ai_assistant` | Document viewer | Desktop | PDF toolbar, pages, zoom, Share, Ask AI companion |
| `connectx_live_video_call_real_time_sharing` | Live call | Desktop stage + 360px drawer | Grid, mute/cam, in-call chat, shared assets |
| `connectx_brand_mark` | Brand | SVG | C/X mark |

**Missing as dedicated screens (required later, not present as HTML):**

- Auth (sign in / sign up / session restore)
- Settings (account, privacy, notifications, security)
- Dedicated `/search` (search exists as a topbar field only)
- Settings-less Settings route is only a rail icon with `href="#"`
- Tablet-specific layouts (desktop rail is not collapsed; mobile is a separate HTML file)
- Empty / error / retry / skeleton states as first-class UI
- Login-gated route boundary / 404

---

## 3. Existing components (as patterns, not modules)

These are copy-pasted markup, not React components. Treat them as extraction targets.

**Chrome:** icon rail, wordmark header, universal search input, Ask AI chip, notification bell + unread dot, avatar, mobile bottom nav, Create FAB.

**Social:** story ring, composer, post card, “Why am I seeing this?”, reaction bar, file-as-post, audio waveform post, feed complete state.

**Discovery:** filter pills, spotlight banner, bento tile, live Space row.

**Create:** type selector (Photo, Video, Audio, File, 3D Asset, Code, Live Cast, Vote/Event), drop zone, extension chips, audience menu, upload snippet.

**Files:** Drive header + view toggle, category pills, upload progress card, file row with thumbnail/extension/size/AI actions, selection checkbox.

**Chat:** conversation row, presence, unread, message bubbles, voice note, attachment picker, poll card, composer.

**Spaces:** hero, guild avatar, join/leave, live stage pill, tab strip, poll, file vault card, FAB.

**Profile:** cover, gradient avatar ring, stats island, highlight stories, content tabs, AI companion card.

**Viewer:** document toolbar, page controls, zoom, metadata chips, AI panel.

**Call:** participant grid, control dock, tabbed side drawer.

---

## 4. Existing interactions

Converted from DOM scripts / `onclick`. Production must use React state + mutations, **not** `getElementById` / `innerHTML`.

| Interaction | Where | Prototype behavior |
| --- | --- | --- |
| Like / bookmark toggle | Home, post detail, Space | Class toggle on the button |
| Comment sort | Post detail | Dropdown + label swap |
| Reply context | Post detail | Injects `@handle` into composer |
| Share menu | Post detail | Click-outside hide |
| Chat attach tray | Messages | Toggle + outside click |
| Conversation info panel | Messages | Show/hide |
| Voice note play | Messages | Fake timer / waveform |
| Send message | Messages | Appends a bubble to the DOM |
| Audience selector | Create | Public / Team / Encrypted |
| Drag-and-drop highlight | Create | `dragover` / `drop` class |
| File filter pills | Drive | Active class on pills |
| File selection count | Drive | Checkbox change |
| Grid / list toggle | Drive | Button active state |
| Space join/leave | Spaces | Label swap + toast |
| Space tabs | Spaces | Tab activation |
| Poll vote | Spaces | Exclusive selection |
| Tune into stage | Spaces | Button state |
| PDF prev/next | Viewer | Counter 1–36 |
| Mic / cam / chat drawer | Live call | Class toggles |
| Mark as read | Notifications | `innerHTML` replacement |
| Copy share link | Share sheet | Clipboard + label |
| Caught-up “Back to top” | Mobile home | `window.scrollTo` |

None of these persist. None talk to an API. Several mutate the DOM unsafely.

---

## 5. Reusable components (extract first)

Highest reuse / duplication:

1. **AppShell** — desktop rail + topbar vs mobile header + bottom nav.
2. **NavItem** — 48px round, active = `bg-primary-container` + violet glow.
3. **CreateAction** — gradient FAB (rail and mobile).
4. **SearchField** — pill, icon inset, focus ring `primary`.
5. **AskAIButton** — `auto_awesome` + gradient wash.
6. **Avatar** — image, story gradient ring, presence dot.
7. **FilterChip / CategoryPill** — inactive surface vs gradient active.
8. **PostCard** family — header, context reason, media, file object, actions.
9. **FileCard** — thumbnail, extension badge, metadata, Preview / Ask AI.
10. **UploadProgress** — filename, % , speed, pause/cancel, gradient bar.
11. **ConversationItem / MessageBubble**.
12. **PresenceBadge**.
13. **EmptyCatchUp** — “You're all caught up!”.
14. **Glass surface** — `bg-surface-container/70 backdrop-blur-xl rounded-2xl`.

---

## 6. Design tokens

### What the prototypes actually render

Every HTML screen uses the **same Tailwind color map** (ConnectX Universe YAML / Material 3 dark):

| Token | Hex | Typical use in screens |
| --- | --- | --- |
| `background` / `surface` / `surface-dim` | `#11131a` | Canvas |
| `surface-container-lowest` | `#0c0e15` | Topbar, chat list, viewer stage |
| `surface-container-low` | `#191b23` | Rail, nested rows |
| `surface-container` | `#1d1f27` | Cards |
| `surface-container-high` | `#282a31` | Inputs, hover |
| `surface-container-highest` / `surface-variant` | `#33343c` | Highest fills |
| `on-surface` | `#e2e2ec` | Primary text |
| `on-surface-variant` | `#ccc3d8` | Secondary text |
| `outline` | `#958da1` | Placeholders / chrome |
| `outline-variant` | `#4a4455` | Hairline rules |
| `primary` | `#d2bbff` | Accents, wordmark X, focus ring |
| `primary-container` | `#7c3aed` | Filled CTAs, active nav |
| `on-primary-container` | `#ede0ff` | Text on filled violet |
| `on-primary` | `#3f008e` | Text on light primary (used inconsistently on gradient buttons) |
| `secondary` | `#adc6ff` | Presence, file/blue actions |
| `secondary-container` | `#0566d9` | Gradient end, Listen chips |
| `tertiary` | `#ffb0cd` | Likes, live, unread |
| `tertiary-container` | `#bf2076` | Magenta fills |
| `error` | `#ffb4ab` | Destructive / live-cast tile |

**Type in prototypes:** Plus Jakarta Sans for display/headline/label; Inter for body. Matches Universe YAML, not Modern Social (Jakarta-only).

**Spacing in prototypes:** `space-xs` 0.25rem … `space-xl` 2rem (8pt). Matches Universe YAML, not Modern Social (looser 0.375–2.5rem).

**Radius in Tailwind config:** `DEFAULT` 4px, `lg` 8px, `xl` 12px, `full` pill. Cards still use `rounded-2xl` (Tailwind default **16px**, not overridden).

### Conflicting written systems

See [frontend-architecture.md](./frontend-architecture.md) § Token decision. Prose in both DESIGN files describes a different canvas (`#0B0D14` / `#090A0F`) and different accent names (`#7C5CFF`, `#8B5CF6`, `#FF4FA3`). Those values are **not** what the HTML paints.

Brand SVG uses the Universe **prose** accents (`#8B5CF6`, `#3B82F6`, `#06B6D4`, `#EC4899`) on canvas `#121624` — a third mix.

---

## 7. Responsive rules

| Breakpoint | Observed in prototypes | Gap |
| --- | --- | --- |
| Mobile `<768` | Dedicated mobile HTML: single column, bottom nav, `margin-mobile` 1rem, `gutter-mobile` 0.75rem, `viewport-fit=cover`, `user-scalable=no` | Desktop HTML does not restyle into this; it is a **separate document**. |
| Tablet 768–1024 | Almost unused. Chat uses `md:grid-cols-[360px_1fr]`. | No collapsible rail, no overlay drawers as specified in DESIGN prose. |
| Desktop `lg`/`xl` | 12-col grids (`lg:col-span-8` + `4`, or `xl` 8/4). Rail always 80px. | Prose asked for 80 **or** 240px labeled sidebar; screens are icon-only 80px. |
| Ultra-wide | `max-w-[1520px]` / `[1720px]` / `[1440px]` inconsistent. | Need one content max-width token. |

**Critical:** Do not “shrink the desktop rail page.” Mobile layouts in the pack are intentional (raised Create, wordmark header, edge stories).

`user-scalable=no` must **not** ship; it fails WCAG zoom.

---

## 8. Navigation architecture

### Desktop primary (rail)

Home, Explore, **Create** (gradient, emphasized), Chat, Spaces, Files, Profile. Settings at the bottom.

Active: filled `primary-container` + `shadow-[0_0_16px_rgba(124,58,237,0.45)]`.  
Create is never the “active page” style; it is always the gradient add control.

### Mobile primary (bottom)

Home (`dynamic_feed`), Explore, **Create FAB**, Chat, Spaces.

Files and Profile are **not** in the mobile tab bar; they are reached from header avatar / other entry points. Product brief also lists Files and Profile as primary — **conflict**. Recommendation: keep the prototype mobile five-item bar; put Files/Profile in the header overflow / avatar / search.

### Secondary

Search, Notifications, Ask AI, Settings, Profile avatar.

### Routing reality today

All links are `href="#"` with `data-path` hints (`home`, `explore`, `create`, `chat`, `spaces`, `files`, `profile`, `settings`, `home-feed`, `explore-discover`, `universal-search`, `notifications`, `creator-profile`). Path names are **inconsistent** (`home` vs `home-feed`).

---

## 9. State requirements

### Server state (TanStack Query later)

Users, profiles, feed pages, posts, comments, reactions, follow graph, notifications, conversations, messages, Spaces, channels, members, files/metadata, uploads, search, AI jobs (status only — never fake answers as live AI).

### Client state (Zustand)

Sidebar collapsed, mobile nav, Create Studio open + selected type, Drive view mode + selected file IDs (IDs only), upload **UI** progress (not file bytes), media lightbox, composer draft metadata, command palette, theme preference.

### Prototype state that must not become globals

Like counts hardcoded in markup, “Joined” strings, poll percentages, PDF page index, fake upload 68% — all should be local or query cache.

---

## 10. API integration requirements

No backend, env files, or API types exist.

Prepare FastAPI-shaped client:

- `VITE_API_BASE_URL` only (never hardcoded hosts).
- Typed `getCurrentUser`, `getFeed`, `getPost`, `createPost`, `likePost`, `getFiles`, `requestUpload`, `getConversations`, `getSpaces`, etc.
- Mock adapter behind the same interfaces, structurally identical to API DTOs.
- Direct-to-object-storage uploads via signed URLs; do not put binaries in Zustand.
- Auth tokens only in httpOnly cookie or memory via the client — never in source.

---

## 11. Accessibility requirements

Current issues:

- Many icon controls lack `aria-label` (desktop rail uses `title` only).
- Scrollbars globally `display: none` with no alternative.
- `user-scalable=no` on mobile prototypes.
- Color-only unread dots and like states.
- Dialogs (Create sheet, share, attach) lack focus trap, `role="dialog"`, Escape, restore focus.
- Decorative blur orbs are sometimes not `aria-hidden`.
- Images rely on long `data-alt` marketing captions; `alt` is often missing or generic.
- Contrast: `outline` `#958da1` on `#11131a` is borderline for small placeholder text.
- `onclick` innerHTML in notifications is an XSS footgun.
- No skip link, no reduced-motion handling (`animate-ping`, `animate-bounce` always on).
- Hit targets: some 32–36px icon buttons; DESIGN asks 44px for important touch controls.

Target: WCAG-conscious. Semantic landmarks (`header`, `nav`, `main`, `aside`). Keyboardable pills and composer.

---

## 12. Performance risks

- Tailwind **CDN + JIT in the browser**.
- Duplicate Material Symbol font CSS.
- Unoptimized remote hero images, no `srcset`, no local cache.
- Entire screens in one HTML file (no code split).
- Hidden scrollbars hide overflow bugs.
- Constant `backdrop-blur-xl/2xl` on many layers (GPU cost on low-end mobile).
- `animate-ping` / bounce on load.
- Chat send appends unbounded DOM nodes.
- No virtualization plan for feed/chat (acceptable until lists are long).

---

## 13. Technical debt

1. **14 copies** of the same Tailwind token block.
2. **14 copies** of rail or mobile chrome.
3. Design **prose vs YAML vs SVG vs HTML** token drift.
4. Fragile external assets.
5. Imperative JS instead of state.
6. No TypeScript, tests, lint, or env.
7. Fake AI copy mixed into UI (must become mock adapters).
8. Inconsistent max-widths and `data-path` names.
9. `on-primary` vs `on-primary-container` used interchangeably on gradient buttons (text can go dark purple on violet).
10. No auth, 404, loading, or error architecture.

---

## 14. Recommended migration strategy

Do **not** HTML-to-JSX the files blindly.

1. **Phase 0 (this audit)** — freeze visual identity; pick canonical tokens.
2. **Phase 1** — Vite + React 19 + TS + Tailwind + Router + Query + Zustand. Keep prototypes on disk as reference.
3. **Phase 2** — Design tokens as CSS variables + primitives (Button, Chip, Avatar, Input, Card, Toast, Skeleton).
4. **Phase 3** — AppShell that switches desktop rail vs mobile bottom nav (one React tree, not two HTML documents).
5. **Phases 4–14** — One product surface at a time, extracting patterns from the matching `code.html`.
6. Replace AIDA images with `/public` or `/src/assets` as each screen is built.
7. Map `data-path` to React Router paths listed in the product brief.
8. Swap mock services for FastAPI without changing UI components.

**Checkpoint:** Do not delete prototype folders until Home, Explore, Create, Drive, Profile, Chat, and Spaces have been visually compared and signed off.

---

## 15. Contradictions log (summary)

| Topic | Universe YAML + HTML | Universe prose | Modern Social | Product brief | Decision |
| --- | --- | --- | --- | --- | --- |
| Canvas | `#11131a` | `#0B0D14` | `#090A0F` | both | **HTML `#11131a`**, alias `--cx-canvas` |
| Primary fill | `#7c3aed` container | `#7C3AED`–`#8B5CF6` | `#7C5CFF` | both | **`#7c3aed` + gradient to `#0566d9`** as in screens |
| Primary text accent | `#d2bbff` | electric purple | `#7C5CFF` | — | Keep **`#d2bbff` as `primary`** |
| Body font | Inter | Inter | Plus Jakarta | Jakarta + Inter | **Jakarta + Inter** |
| Desktop nav | 80px icons | 80 or 240px | 280px labeled | 80–280 | **80px rail + later collapsed/expanded mode** |
| Mobile nav | Home Explore Create Chat Spaces | — | — | same + Files/Profile primary | **Preserve 5-item bar** |
| Card radius | `rounded-2xl` = 16px | 16–20 | 16–20 | 16–20 | **16px cards, 20px sheets** (`rounded-t-[28px]` Create) |

Full token mapping lives in `docs/frontend-architecture.md`.
