-- ConnectX Phase 7: Notifications, settings, and file metadata canonicalization
-- Reuses the existing `media` + `user_settings` pattern and adds the missing app-level tables
-- required by notifications and browser settings flows.

BEGIN;

-- 1. File metadata table (canonicalize if backend already uses `media`)
-- `media` is the real canonical table for files. This table is only created if the product contracts
-- require an explicit file registry separate from media metadata.
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_id UUID NULL REFERENCES public.media(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    folder_id UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_files_owner_id ON public.files(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_media_id ON public.files(media_id);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
CREATE POLICY "Users can view their own files"
    ON public.files
    FOR SELECT
    USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own files" ON public.files;
CREATE POLICY "Users can insert their own files"
    ON public.files
    FOR INSERT
    WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
CREATE POLICY "Users can update their own files"
    ON public.files
    FOR UPDATE
    USING (owner_id = (select auth.uid()))
    WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;
CREATE POLICY "Users can delete their own files"
    ON public.files
    FOR DELETE
    USING (owner_id = (select auth.uid()));

-- 2. User settings (if not already created by earlier migration)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    privacy_mode TEXT NOT NULL DEFAULT 'public' CHECK (privacy_mode IN ('public', 'followers', 'private')),
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    push_notifications BOOLEAN NOT NULL DEFAULT true,
    story_replies TEXT NOT NULL DEFAULT 'everyone' CHECK (story_replies IN ('everyone', 'following', 'off')),
    media_downloads_enabled BOOLEAN NOT NULL DEFAULT true,
    ai_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own preferences" ON public.user_preferences;
CREATE POLICY "Users can read their own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete their own preferences"
    ON public.user_preferences
    FOR DELETE
    USING (user_id = (select auth.uid()));

-- 3. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (
        type IN (
            'follow', 'follow_request', 'follow_accepted', 'comment', 'reaction', 'mention', 'message',
            'space_activity', 'system'
        )
    ),
    entity_type TEXT NOT NULL DEFAULT 'post',
    entity_id UUID NULL,
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON public.notifications(recipient_id, read_at);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (recipient_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create notifications for themselves" ON public.notifications;
CREATE POLICY "Users can create notifications for themselves"
    ON public.notifications
    FOR INSERT
    WITH CHECK (recipient_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can mark their own notifications as read" ON public.notifications;
CREATE POLICY "Users can mark their own notifications as read"
    ON public.notifications
    FOR UPDATE
    USING (recipient_id = (select auth.uid()))
    WITH CHECK (recipient_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users cannot delete other user notifications" ON public.notifications;
CREATE POLICY "Users cannot delete other user notifications"
    ON public.notifications
    FOR DELETE
    USING (recipient_id = (select auth.uid()));

-- 4. Storage policy review and bucket enforcement
-- The app already uses the `media` bucket; preserve it and avoid creating a duplicate public bucket.
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload to their own media path" ON storage.objects;
CREATE POLICY "Authenticated users can upload to their own media path"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

DROP POLICY IF EXISTS "Authenticated users can read own media objects" ON storage.objects;
CREATE POLICY "Authenticated users can read own media objects"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

DROP POLICY IF EXISTS "Authenticated users can delete own media objects" ON storage.objects;
CREATE POLICY "Authenticated users can delete own media objects"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- 5. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

COMMIT;
