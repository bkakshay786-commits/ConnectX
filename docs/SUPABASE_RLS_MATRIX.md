# ConnectX RLS Matrix

## Core rule

All tables that contain user data use `auth.uid()` and ownership checks instead of trusting client-side state.

| Table | Read policy | Write policy | Notes |
| --- | --- | --- | --- |
| `profiles` | everyone may read; owner may update | user can insert/update/delete self | identity + profile discovery |
| `privacy_settings` | owner only | owner only | private settings |
| `follows` | everyone can read relation rows | self-created inserts, self-deletes | follow graph |
| `blocks` | owner only | owner only | blocking |
| `mutes` | owner only | owner only | muting |
| `close_friends` | owner only | owner only | close friend access |
| `stories` | author and authorized viewers | author only | respect visibility and expiry |
| `story_views` | viewer or story owner | viewer inserts only | prevents duplicate per story issues |
| `story_reactions` | authenticated viewers | user self-manages | one reaction per user/story |
| `story_replies` | story viewers if allowed | author only | replies are owner-scoped |
| `comments` | authorized readers | author only writes | edit/delete only own comments |
| `post_reactions` | authenticated | self-managed | unique per post/user |
| `saved_posts` | owner | owner | personal saved state |
| `notifications` | recipient only | recipient only update/mark read | no cross-user visibility |
| `conversations` | participants only | participants only | access constrained to membership |
| `messages` | conversation participants only | sender writes; self-edit/delete allowed | no cross-conversation read |
| `message_attachments` | conversation participants | sender-created attachment only | bound to message sender |
| `media` | owner + authorized relation consumers | owner only | storage metadata origin |
| `user_settings` | owner only | owner only | preference persistence |

## Access control design

- `auth.uid()` is the canonical identity source.
- `SELECT` is generally denied by default unless the policy explicitly authorizes the user.
- Privacy enforcement is table-aware, not UI-only.
- Block and follow checks remain part of the authorization logic for content visibility.
