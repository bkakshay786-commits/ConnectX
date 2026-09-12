# ConnectX Supabase Core Schema

## Canonical tables

### `profiles`
Purpose: canonical user identity, linked to auth.users.

Key columns:
- `id`
- `username`
- `username_normalized`
- `display_name`
- `avatar_url`
- `bio`
- `website`
- `location`
- `pronouns`
- `created_at`
- `updated_at`

RLS:
- public read allowed for profile discovery
- users can update only their own row

### `media`
Purpose: file metadata for uploads, stories, posts, and chat attachments.

Key columns:
- `id`
- `owner_id`
- `bucket_id`
- `storage_path`
- `original_filename`
- `mime_type`
- `extension`
- `byte_size`
- `width`
- `height`
- `duration_seconds`
- `processing_status`
- `created_at`
- `updated_at`

### `stories`
Purpose: ephemeral social content with expiry.

Key columns:
- `id`
- `author_id`
- `media_id`
- `caption`
- `visibility`
- `created_at`
- `expires_at`

### `story_views`
Purpose: deduplicated view tracking for each viewer/story.

### `story_reactions`
Purpose: individual viewer reactions per story.

### `story_replies`
Purpose: story comment thread replies.

### `comments`
Purpose: comments on posts and stories.

### `post_reactions`
Purpose: single reaction per user/post.

### `saved_posts`
Purpose: user-saved content.

### `notifications`
Purpose: activity feed messages for a recipient.

### `conversations`
Purpose: direct/group chat containers.

### `conversation_members`
Purpose: membership relationship for chat access control.

### `messages`
Purpose: chat message payloads.

### `message_attachments`
Purpose: file attachments attached to messages.

### `message_reads`
Purpose: canonical read state for chat threads.

### `user_settings`
Purpose: persisted account + privacy + media preferences.

## Relationship integrity rules

- cascades are used only where a parent object is logically owned by the child row
- `media` has `owner_id` and is not global
- `messages` and `stories` can reference `media` without duplicating binary data
- comment/reaction/saved rows are user-owned and require ownership checks in RLS
