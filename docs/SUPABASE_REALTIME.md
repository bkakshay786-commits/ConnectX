# ConnectX Supabase Realtime

## Scope

Realtime is required for conversations and message delivery, and optionally for ephemeral presence.

## Realtime-enabled tables

- `messages`
- `conversations`
- `notifications`
- `presence` or any ephemeral presence table if used

## Required behavior

- subscribe once per open conversation
- unsubscribe on route change
- deduplicate subscriptions on remount
- use conversation-scoped channels with auth-enforced visibility

## Presence

Presence should remain ephemeral in Realtime rather than being stored as durable PostgreSQL state.

Use:
- `presence` / `presence_state` channels for online/typing indicators
- `broadcast` for typing states when necessary

## Important safeguards

- never subscribe to broad `public` tables without a user filter
- always cleanup subscriptions on unmount
- do not duplicate message events when the same chat page is mounted multiple times
