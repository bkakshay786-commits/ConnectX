# ConnectX Supabase Storage Policies

## Bucket

The application uses the existing `media` bucket.

## Requirements

- keep the bucket private unless the product explicitly requires public access
- store every uploaded file under a user-owned path such as `${user_id}/...`
- keep object metadata in `media` and link content to posts, stories, and messages through relational rows
- do not expose `service_role` to the browser

## Policy principles

- Authenticated users may upload to their own object namespace.
- Users may delete their own files.
- Users may read only objects they are authorized to retrieve based on downstream content rules.
- The bucket should not be silently global-public.

## Recommended storage path

`{auth.uid()}/{uuid}_{file_name}`

This pattern keeps ownership clear and makes RLS checks predictable.

## Storage + metadata flow

1. Browser uploads to storage bucket
2. metadata row inserted into `media`
3. `post_media` or `story` or `message_attachments` references the media row
4. frontend reads signed/public URL only after authorization

## Deletion policy

- remove storage row only when the user owns the underlying file and the row has no active references
- delete relationship rows before or alongside storage delete if the app treats the file as orphaned
