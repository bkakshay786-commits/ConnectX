# ConnectX Supabase Functionality Audit

Date: 2026-09-11
Status: Phase 0 complete

## Executive summary

The ConnectX UI is visually complete, but the working implementation is still largely mock/local-state based rather than backed by a live Supabase data layer.

The main root causes are:
- OAuth redirect configuration is not valid for the local app origin
- the current migration set covers only a subset of the app
- the app contains mock/local-backend fallbacks that bypass real backend operations
- several tables and policies required by stories, comments, media, notifications, chat, and other interactions are absent or incomplete
- browser auth and storage flows are not consistently connected to real Supabase data

## Verified evidence from the codebase

### App build status
The project currently builds successfully:

- Command run: `npm run build`
- Result: Vite build completed with `✓ built in 8.57s`

This confirms the frontend compiles, but compile success does not prove end-to-end runtime functionality.

### Auth and state are still local/mock-oriented
Relevant files:
- [apps/web/src/stores/auth-store.ts](../apps/web/src/stores/auth-store.ts)
- [apps/web/src/lib/local-backend-service.ts](../apps/web/src/lib/local-backend-service.ts)
- [apps/web/src/features/auth/pages/LoginPage.tsx](../apps/web/src/features/auth/pages/LoginPage.tsx)
- [apps/web/src/app/config/env.ts](../apps/web/src/app/config/env.ts)

Observed behavior:
- `useAuthStore` falls back to `localBackend` when Supabase is not configured
- several login flows use `setTimeout` and mock state transitions
- the app still contains explicit local fallback logic instead of strict real-backend-only logic

### Current Supabase schema coverage is incomplete
Relevant files:
- [supabase/migrations/20260911000001_create_profiles.sql](../supabase/migrations/20260911000001_create_profiles.sql)
- [supabase/migrations/20260911000002_profile_social_graph_privacy.sql](../supabase/migrations/20260911000002_profile_social_graph_privacy.sql)
- [supabase/migrations/20260911000003_posts_media_storage.sql](../supabase/migrations/20260911000003_posts_media_storage.sql)

Observed coverage:
- profiles
- social graph state (follows, blocks, mutes, close_friends)
- posts + media + storage bucket setup

Missing or incomplete for P0 features:
- stories
- story_views
- story_reactions
- story_replies
- comments
- comment security policies
- notifications
- conversations and messages
- chat message attachments
- real-time subscription schema and policies
- drive/files access controls beyond the initial media bucket

## Functional findings by area

### Authentication and OAuth
Status: not fully working

Evidence:
- Browser requests to Google auth endpoint are returning a 400 response from the Supabase auth domain
- the app intentionally generates provider OAuth URLs with `redirect_to=http://localhost:5173/`
- local Supabase config has been updated for localhost, but the remote project settings must also allow those redirect URLs

Root cause:
- redirect allowlist mismatch between the app and the Supabase project settings

### Other-user profiles
Status: not reliably working

Evidence:
- profile logic depends on route parameter lookups and profile existence
- username/profile routing exists, but path resolution and user identity checks need to be validated against the real schema

Root cause:
- profile-by-username and related privacy logic must be tested against the live database layer and RLS

### Stories
Status: broken / incomplete

Evidence:
- Story UI exists, but the underlying schema and storage flow are not fully implemented
- no dedicated stories migration set was found beyond the initial profiles/posts/media migration

Root cause:
- missing story tables, policies, and UI-to-database query mapping

### Comments and post interactions
Status: broken / incomplete

Evidence:
- comments are not connected to a live table in the existing migrations
- the relevant UI path shows placeholder or toast-only behavior

Root cause:
- missing comments table, policies, query invalidation, and post/thread mapping

### Media upload and visibility
Status: not reliable

Evidence:
- the media bucket is initialized, but ownership-aware storage paths, post-to-media linking, and frontend rendering are not fully validated end-to-end

Root cause:
- storage schema and policies exist only at a basic level; full upload/visibility lifecycle is not verified

### Settings persistence
Status: not fully working

Evidence:
- settings logic appears to be mixed with local state and mock-backend behavior

Root cause:
- schema for settings/preferences tables is not yet validated or implemented fully

### Chat and real-time flows
Status: incomplete

Evidence:
- no complete conversation/message schema was found in the migration set
- the app uses mock conversation arrays and local React state for chat behavior

Root cause:
- missing conversations/messages and realtime subscriptions

## Priority findings

### P0 blockers
- authentication and OAuth redirect flow
- profile by username / other-user profile flow
- story creation, viewing, and expiration logic
- comments and reactions
- settings persistence
- media upload and visibility

### P1 blockers
- notifications
- chat and message persistence
- spaces membership and channel data
- files/drive metadata and access
- search indexing and privacy-aware queries

### P2 / P3
- live video / voice features
- AI features
- exploration and discovery enhancement

## Audit conclusion

The project is not yet functionally complete as a real Supabase-backed product. It currently builds, but it is still dependent on mock/local-state behavior in multiple critical flows.

The next step is not a UI rewrite. The next step is to fix the actual backend dependency chain in this order:
1. Auth + OAuth redirect allowlist
2. Profiles + username routing
3. Settings persistence
4. Storage + media
5. Posts
6. Stories
7. Comments + reactions + saves
8. Notifications
9. Chat + real-time
10. Spaces + files + search

## Required next action

This audit is complete, and the app must not advance to Phase 1 without explicit approval to begin the actual backend repair work.
