# ConnectX Supabase Core Schema Plan

## 1. Source-of-truth inspection summary

The current frontend expects social functionality across stories, comments, post interactions, notifications, conversations, direct messages, media metadata, and settings persistence.

The database already contains the following core tables from the initial migrations:
- `profiles`
- `privacy_settings`
- `follows`
- `follow_requests`
- `blocks`
- `mutes`
- `close_friends`
- `media`
- `posts`
- `post_media`

The backend still needed the missing tables below to match the app’s product contract.

## 2. Dependency map

| Feature | Table(s) | Relationships | Indexes | RLS | Realtime |
| --- | --- | --- | --- | --- | --- |
| Stories | `stories`, `story_views`, `story_reactions`, `story_replies` | `stories.author_id -> profiles.id`, `stories.media_id -> media.id` | `author_id`, `created_at`, `expires_at`, `visibility` | Required | Optional |
| Comments | `comments` | `comments.post_id -> posts.id`, `comments.author_id -> profiles.id`, `comments.parent_comment_id -> comments.id` | `post_id`, `parent_comment_id`, `author_id` | Required | Optional |
| Post reactions | `post_reactions` | `post_id -> posts.id`, `user_id -> profiles.id` | `post_id`, `user_id` | Required | Optional |
| Saved posts | `saved_posts` | `post_id -> posts.id`, `user_id -> profiles.id` | `user_id`, `post_id` | Required | Optional |
| Notifications | `notifications` | `recipient_id -> profiles.id`, `actor_id -> profiles.id` | `recipient_id`, `read_at`, `created_at` | Required | Optional |
| Conversations | `conversations`, `conversation_members` | conversation participants to profiles | `user_id`, `conversation_id` | Required | Yes |
| Messages | `messages`, `message_attachments`, `message_reads` | `conversation_id -> conversations.id`, `sender_id -> profiles.id`, `media_id -> media.id` | `conversation_id`, `sender_id`, `message_id` | Required | Yes |
| File metadata | `media` reused as canonical metadata table | `owner_id -> profiles.id` | `owner_id`, `created_at` | Required | Optional |
| Settings | `user_settings` | `user_id -> profiles.id` | `user_id` | Required | Optional |

## 3. Frontend usage mapping

- Stories: used in the StoryRail and feed surfaces
- Story views: tied to story consumption events
- Story reactions: UI-level reaction feedback on story cards
- Story replies: social commentary on story content
- Comments: post detail/comment thread flows
- Post reactions: like or reaction actions on posts
- Saved posts: profile vault and saved collection views
- Notifications: bell center and activity feed
- Conversations/messages: chat UI and attachments
- Files/settings: drive and account preference sections

## 4. Design principles used

- Reuse `media` instead of inventing a second storage-metadata model.
- Reuse `profiles` and `privacy_settings` rather than creating parallel identity tables.
- Keep RLS ownership checks based on `auth.uid()`.
- Avoid service-role access from the browser.
- Use Realtime only for ephemeral delivery and presence; persistent state remains in Postgres.
