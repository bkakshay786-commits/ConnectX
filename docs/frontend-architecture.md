# ConnectX frontend architecture

**Status:** Phase 0 decision record + Phase 1 target.  
**Visual law:** Existing HTML prototypes beat personal preference and beat DESIGN.md prose when they conflict.

---

## 1. Goal

Turn the Stitch HTML pack into a **maintainable React 19 application** that still looks like ConnectX: social, media-first, file-first, AI-native, dark, electric glass — **not** LinkedIn, not a SaaS dashboard, not a generic Tailwind kit.

---

## 2. Canonical token decision

### Verdict

**Canonical implementation tokens = ConnectX Universe YAML as compiled into every `code.html` Tailwind config.**

That is the only set that actually paints the screens.

| Layer | Source | Use |
| --- | --- | --- |
| **Canonical** | Universe YAML + HTML `tailwind.config` | CSS variables, Tailwind theme, components |
| **Narrative** | Universe DESIGN.md prose (“Deep Cyber Dark + Electric Luminous Glassmorphism”) | Motion, elevation *behavior*, product language |
| **Alternate** | Modern Social DESIGN.md | Do not implement. Keep as archive. |
| **Mark** | `connectx_brand_mark` SVG | Logo asset; its hexes (`#8B5CF6`, `#3B82F6`, `#EC4899`, `#121624`) stay in the SVG |

### Why not the prose hexes?

If we shipped `#0B0D14` / `#1B2036` / `#7C5CFF` as the app theme, Home/Explore/Chat would no longer match the prototypes. The product brief forbids a silent redesign.

### Why not Modern Social?

Modern Social is Jakarta-only, different spacing scale, different primary (`#cabeff` / `#947dff` in YAML vs `#7C5CFF` in prose). Zero HTML screens use that map.

### Change-later architecture

Tokens live in **one CSS file** as custom properties. Tailwind maps to those variables. Swapping canvas from `#11131a` toward `#0B0D14` later is a token edit, not a component rewrite.

### Canonical color tokens

```css
:root {
  /* Canvas */
  --cx-canvas: #11131a;
  --cx-canvas-lowest: #0c0e15;
  --cx-surface-low: #191b23;
  --cx-surface: #1d1f27;
  --cx-surface-high: #282a31;
  --cx-surface-highest: #33343c;

  /* Text */
  --cx-text: #e2e2ec;
  --cx-text-muted: #ccc3d8;
  --cx-text-subtle: #958da1;
  --cx-hairline: #4a4455;

  /* Brand */
  --cx-primary: #d2bbff;          /* luminous violet — icons, wordmark, focus */
  --cx-primary-fill: #7c3aed;     /* CTA / active nav */
  --cx-primary-on-fill: #ede0ff;
  --cx-secondary: #adc6ff;
  --cx-secondary-fill: #0566d9;
  --cx-tertiary: #ffb0cd;
  --cx-tertiary-fill: #bf2076;
  --cx-error: #ffb4ab;
  --cx-error-fill: #93000a;

  /* Glow (from screens, not invented) */
  --cx-glow-violet: 0 0 16px rgba(124, 58, 237, 0.45);
  --cx-wash-violet: rgba(124, 58, 237, 0.12);
}
```

**CTA gradient (screens):** `from-primary-container to-secondary-container` = `#7c3aed` → `#0566d9`.  
**Active filter chips:** same gradient, white/on-container label, optional cyan/white status dot.

### Typography

| Role | Family | Weights |
| --- | --- | --- |
| Display, headlines, nav, labels, names | Plus Jakarta Sans | 600, 700, 800 |
| Body, messages, metadata, file info | Inter | 400, 500, 600 |

Scale (from HTML, which matches Universe YAML):

| Token | Size / line / tracking / weight |
| --- | --- |
| display-lg | 48/56 / -0.03em / 800 |
| display-lg-mobile | 32/40 / -0.02em / 800 |
| headline-xl | 36/44 / -0.02em / 700 |
| headline-xl-mobile | 26/34 / -0.015em / 700 |
| headline-lg | 24/32 / -0.015em / 700 |
| headline-md | 20/28 / -0.01em / 600 |
| headline-sm | 16/24 / 0 / 600 |
| body-lg | 16/26 / -0.005em / 400 Inter |
| body-md | 14/22 / 0 / 400 Inter |
| body-sm | 12/18 / 0.01em / 400 Inter |
| label-lg | 14/20 / 0.01em / 600 |
| label-md | 12/16 / 0.02em / 600 |
| label-sm | 10/14 / 0.04em / 700 |

Tabular nums (`tnum`) on counts, times, file sizes.

### Spacing (8pt)

`xs` 4px · `sm` 8px · `md` 16px · `lg` 24px · `xl` 32px  
`gutter` 20px · `gutter-mobile` 12px · `margin` 32px · `margin-mobile` 16px

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `control` | 8px | small nested controls, file type tiles |
| `input` | 12px | non-pill inputs |
| `card` | 16px | posts, files, glass modules (`rounded-2xl` in prototypes) |
| `sheet` | 20–28px | Create Studio top corners |
| `pill` | 9999px | buttons, chips, search, avatars |

Do not mix arbitrary `rounded-md/lg/xl/2xl` outside these roles.

### Elevation

| Level | Implementation from screens |
| --- | --- |
| 0 | `--cx-canvas` + optional top radial violet wash |
| 1 | `--cx-surface-low` / lowest + blur on rails/headers |
| 2 | `--cx-surface` at ~75% + `backdrop-blur-xl` + soft shadow |
| 3 | sheets `bg-surface-container-low/95 backdrop-blur-2xl` + deep shadow |

Glass is **selective**: chrome, cards, sheets — not every nested row.

---

## 3. Repository layout

Prototypes stay at repo root. Production app:

```
apps/web/                 Vite + React 19 + TypeScript
docs/                     audit, architecture, inventory, design-reference index
```

Inside `apps/web/src`:

```
app/           App, router, providers, config
assets/        local brand + fallbacks
components/    ui, layout, navigation, media, files, social, feedback, overlays
features/      auth, feed, explore, create, chat, spaces, files, profile,
               notifications, search, ai, settings, viewer, calls
hooks/
lib/api        client, endpoints, errors, queryKeys
lib/utils
lib/validation
lib/constants
stores/        Zustand UI stores only
types/         shared domain unions
mocks/         replaceable adapters (never inline fakeUser in components)
styles/        tokens.css, global.css
```

Path alias: `@/` → `src/`.

---

## 4. Routing

React Router. No `window.location` for in-app navigation.

| Path | Feature | Auth |
| --- | --- | --- |
| `/` | redirect → `/home` | protected |
| `/home` | Feed | protected |
| `/explore` | Explore | protected |
| `/create` | Create Studio | protected |
| `/chat` | Inbox | protected |
| `/chat/:conversationId` | Thread | protected |
| `/spaces` | Discovery | protected |
| `/spaces/:spaceId` | Space | protected |
| `/spaces/:spaceId/:channelId` | Channel | protected |
| `/files` | Drive | protected |
| `/files/:fileId` | File in Drive | protected |
| `/profile` | Self | protected |
| `/profile/:username` | Public profile | protected |
| `/notifications` | Notifications | protected |
| `/search` | Universal search | protected |
| `/settings` | Settings hub | protected |
| `/settings/account` etc. | Nested settings | protected |
| `/post/:postId` | Post detail | protected |
| `/document/:fileId` | Document viewer | protected |
| `/media/:mediaId` | Media viewer | protected |
| `/login` | Auth | public |
| `*` | 404 | public |

Lazy-load feature routes. `ProtectedRoute` reads session from Query (`currentUser`), not Zustand.

Until Phase 15, a **dev mock session** may exist behind `VITE_USE_MOCKS=true` so the shell is usable. Mock auth is not production security.

---

## 5. App shell

One `AppShell`:

- **≥1024px:** 80px rail (expandable to ~240px later), 64px topbar, main, optional right context (~340–420px). Center spine ~640–720px when a right panel exists.
- **768–1023:** collapsible rail or overlay; right panel as drawer.
- **<768:** top contextual bar, single column, bottom nav with Create FAB, `env(safe-area-inset-*)`.

Do not render desktop rail and mobile nav both visible.

---

## 6. State ownership

| Kind | Tool | Examples |
| --- | --- | --- |
| Server | TanStack Query | feed, files, messages, Spaces, notifications |
| UI | Zustand | nav, modals, composer type, selected file IDs, lightbox |
| Forms | React Hook Form + Zod | create, settings, auth, poll, event |
| Ephemeral local | `useState` | PDF page, hover, open dropdown |

Never duplicate server entities in Zustand.

Query key factory in `lib/api/queryKeys.ts`, e.g. `queryKeys.feed.home(cursor)`, `queryKeys.files.detail(id)`.

---

## 7. API + mocks

```
lib/api/client.ts       fetch wrapper, auth header, error mapping
lib/api/errors.ts       typed ApiError
lib/api/queryKeys.ts
features/*/api.ts       getFeed(), likePost(), requestUpload()...
mocks/adapters/*        same function signatures
```

`VITE_API_BASE_URL` and `VITE_USE_MOCKS` only. No secrets in the client.

AI: `mocks/ai/` returns labeled **sample** insights. Production `features/ai/api.ts` calls the backend. UI must never claim mock text is a live model.

Uploads: request signed URL → PUT to storage → poll processing status. Progress events in an upload UI store keyed by `uploadId`, not `File` blobs.

---

## 8. Domain types (discriminated content)

Prefer unions over mega-optional `Post`:

```ts
type PostContent =
  | { kind: "text" }
  | { kind: "image"; media: MediaRef[] }
  | { kind: "video"; media: MediaRef }
  | { kind: "audio"; media: MediaRef }
  | { kind: "file"; file: FileObject }
  | { kind: "code"; file: FileObject }
  | { kind: "model3d"; file: FileObject }
  | { kind: "poll"; poll: Poll }
  | { kind: "event"; event: EventObject }
  | { kind: "link"; link: LinkPreview };
```

Shared names: `User`, `Profile`, `Post`, `Reaction`, `Comment`, `Story`, `Conversation`, `Message`, `Space`, `FileObject`, `FileVersion`, `Upload`, `Notification`, `SearchResult`, `AIJob`.

---

## 9. Feature module shape

Each feature:

```
features/feed/
  api.ts
  queryKeys.ts          (or re-export from lib)
  hooks/useFeed.ts
  components/           feature-only compositions
  pages/HomePage.tsx
```

Presentational pieces that appear in 2+ features live under `components/`.

---

## 10. Styling

- Tailwind 4 + CSS variables.
- `cn()` = `clsx` + `tailwind-merge`.
- `cva` for Button, Chip, Badge variants.
- Lucide for new UI icons. Material Symbol **names** from prototypes may be mapped to Lucide equivalents; do not mix extra icon kits. Brand mark stays SVG.
- Dark-first: `.dark` on `<html>`. Light tokens can be added later on the same variables.

---

## 11. Accessibility & motion

- 44px minimum on primary touch targets (nav, Create, composer send).
- Focus rings use `--cx-primary`.
- Dialogs: focus trap, Escape, labelled title.
- `prefers-reduced-motion: reduce` disables ping/bounce/ambient orb animation.
- Allow pinch zoom.
- Icon-only buttons always `aria-label`.

---

## 12. Performance

- Route-level `React.lazy`.
- Query cache as feed source of truth.
- Lazy images / future `srcset`.
- Virtualize only when lists are demonstrably long.
- Skeletons matching card geometry, not spinners-only.

---

## 13. Error model

Every async surface: **Loading / Success / Empty / Error+Retry**.

- `ErrorBoundary` at app root and around heavy viewers.
- `EmptyState`, `ErrorState`, `LoadingState`, `Skeleton`.
- Feed completion copy from mobile home: **“You're all caught up!”**

---

## 14. Security (frontend)

- Hide actions for UX; backend authorizes.
- No `dangerouslySetInnerHTML` for user content.
- No tokens in repo or Zustand persist to localStorage unless encrypted and reviewed (default: don't persist secrets).
- Sanitize file names in UI; never execute uploaded content in the app origin.

---

## 15. Phase plan (execution)

| Phase | Outcome |
| --- | --- |
| 0 | This document + audit + inventory |
| 1 | Tooling boots: install, lint, build |
| 2 | Tokens + primitive UI |
| 3 | AppShell responsive |
| 4–14 | Screens in product order |
| 15 | Real auth + API |
| 16 | Perf / a11y hardening |

Do not generate all screens in one pass.

---

## 16. Definition of done (per feature)

TypeScript, lint, and build pass; no console errors in the happy path; loading/empty/error exist; mocks isolated; visual check vs the matching prototype at mobile and desktop; keyboard reachable; no new token hexes outside `tokens.css`.
