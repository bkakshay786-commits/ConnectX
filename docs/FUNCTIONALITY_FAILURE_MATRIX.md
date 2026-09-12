# ConnectX Functionality Failure Matrix

Date: 2026-09-11

| Feature | UI Exists | Handler | Supabase Table | Storage | RLS | Realtime | Current Error / Condition | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Email/password login | Yes | [apps/web/src/stores/auth-store.ts](../apps/web/src/stores/auth-store.ts) | auth.users + profiles | N/A | Depends on project auth and profile policies | No | Can be mock/local fallback, not verified against production auth flow | P0 | Failing / Partial |
| OAuth login | Yes | [apps/web/src/features/auth/pages/LoginPage.tsx](../apps/web/src/features/auth/pages/LoginPage.tsx) and [apps/web/src/stores/auth-store.ts](../apps/web/src/stores/auth-store.ts) | auth.users | N/A | Depends on provider config and redirect allowlist | No | 400 redirect rejection from Supabase auth domain | P0 | Failing |
| Session persistence | Yes | [apps/web/src/stores/auth-store.ts](../apps/web/src/stores/auth-store.ts) | auth.users | N/A | Depends on auth session | No | Local fallback logic still used instead of strict session layer | P0 | Partial |
| Own profile | Yes | [apps/web/src/features/profile/pages/ProfilePage.tsx](../apps/web/src/features/profile/pages/ProfilePage.tsx) | public.profiles | N/A | Profiles RLS exists partially | No | Not fully validated against auth and privacy conditions | P0 | Partial |
| Other-user profile | Yes | [apps/web/src/features/profile/pages/ProfilePage.tsx](../apps/web/src/features/profile/pages/ProfilePage.tsx) | public.profiles | N/A | RLS + relationship checks required | No | Cannot reliably open another user’s profile without proper route + privacy logic | P0 | Failing |
| Social graph follows | Yes | [apps/web/src/features/profile/api/social-api.ts](../apps/web/src/features/profile/api/social-api.ts) | public.follows | N/A | Row-level rules exist in migration | No | Fully validated only after real accounts and RLS checks | P0 | Partial |
| Settings persistence | Yes | [apps/web/src/features/settings/pages/SettingsPage.tsx](../apps/web/src/features/settings/pages/SettingsPage.tsx) | likely profiles / privacy_settings / preferences tables | N/A | Not fully audited | No | Many settings remain UI-only or local-state only | P0 | Failing |
| Posts create/read/update/delete | Yes | [apps/web/src/features/feed/api/posts-api.ts](../apps/web/src/features/feed/api/posts-api.ts) | public.posts, public.media, public.post_media | media bucket | Basic policies exist, but full lifecycle is not verified | No | Not proven end-to-end | P0 | Partial |
| Media upload | Yes | Create studio / upload flows | public.media | media bucket | Storage policies exist but upload flow needs end-to-end validation | No | Image upload visibility is not proven | P0 | Failing |
| Stories create/view | Yes | Story UI + feed flows | stories tables not present in current migration set | storage bucket path required | Not implemented | No | Story create/view flow incomplete | P0 | Failing |
| Story viewer navigation | Yes (UI exists) | feed/story interactions | stories + story_views | media files | Not implemented | No | Clicking stories is still mock/toast based | P0 | Failing |
| Comments | Yes | comment entry and thread flows | comments table not present | N/A | No complete policy set | No | Comments do not work in practice | P0 | Failing |
| Reactions / likes / saves | Yes | [apps/web/src/features/feed/components/PostCard.tsx](../apps/web/src/features/feed/components/PostCard.tsx) | likely post_reactions / saved_posts | N/A | Missing or unvalidated | No | Reaction state not persisted via real backend | P0 | Partial |
| Notifications | Yes | [apps/web/src/features/notifications/pages/NotificationsPage.tsx](../apps/web/src/features/notifications/pages/NotificationsPage.tsx) | notifications table not fully present | N/A | No schema/policies audited | No | Still local/mock and not persisted | P1 | Failing |
| Chat | Yes | [apps/web/src/features/chat/pages/ChatPage.tsx](../apps/web/src/features/chat/pages/ChatPage.tsx) | conversations/messages likely missing | message attachments | Not implemented | Missing | Uses mock arrays and local state | P1 | Failing |
| Chat media | Yes | chat upload flows | message_attachments not present | media bucket / attachment path | Not implemented | Likely required | Uploads not visible across sessions | P1 | Failing |
| Realtime chat | Yes in UI | chat subscriptions | realtime channels not configured | N/A | Auth + authorization needed | Required | Not implemented | P1 | Missing |
| Live / voice / video | Some UI exists | chat or space features | not yet confirmed | N/A | Not implemented | Not implemented | Requires WebRTC or a defined feature contract | P1 / P3 | Requires design clarification |
| Spaces | Yes | [apps/web/src/features/spaces/pages/SpacesPage.tsx](../apps/web/src/features/spaces/pages/SpacesPage.tsx) | likely spaces + members + channels | files/media | Not audited | Depends on feature | Still dominated by local mock state | P1 | Partial |
| Files / drive | Yes | [apps/web/src/features/files/pages/FilesPage.tsx](../apps/web/src/features/files/pages/FilesPage.tsx) | file metadata tables not fully defined | storage bucket(s) | Not fully audited | Optional | upload/listing is mock and not persisted | P1 | Failing |
| Search | Yes | [apps/web/src/features/search/pages/SearchPage.tsx](../apps/web/src/features/search/pages/SearchPage.tsx) | profiles/posts/spaces/files | N/A | RLS/privacy not validated | No | Currently array-based and static | P1 | Mock |
| Storage policies | Yes | bucket setup in migration | storage.objects | media bucket | Basic policies exist | N/A | Full ownership and permissions are not proven end-to-end | P0 | Partial |
| RLS security | Yes | all protected routes and data access | all relevant app tables | N/A | several tables incomplete | N/A | Not fully audited with A/B user tests | P0 | Partial |

## Current root-cause categories

1. Redirect configuration mismatch for Supabase auth
2. Incomplete schema coverage relative to the UI
3. Mock/local-backend fallbacks instead of live Supabase operations
4. Missing or partial RLS for user-specific and privacy-sensitive tables
5. Storage ownership and visibility not fully validated
6. Realtime implementation is not yet wired to the application data model

## Conclusion

The application builds successfully, but it is not yet functionally complete as a real connected product. The current issues are backend- and data-layer related rather than purely UI-related.

The correct next move is to proceed only after approval to begin the actual Supabase repair and migration work in dependency order.
