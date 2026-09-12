-- ConnectX Phase 4: Posts, Media, and Supabase Storage Foundation Migration
-- Follows official Supabase Postgres Best Practices (security definer, cached (select auth.uid()), explicit grants)

-- 1. Media Metadata Table (Universal File/Media Model)
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bucket_id TEXT NOT NULL DEFAULT 'media',
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    extension TEXT NOT NULL,
    byte_size BIGINT NOT NULL,
    width INTEGER NULL,
    height INTEGER NULL,
    duration_seconds NUMERIC NULL,
    processing_status TEXT NOT NULL DEFAULT 'ready' CHECK (processing_status IN ('pending', 'uploading', 'uploaded', 'processing', 'ready', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_media_owner_id ON public.media(owner_id);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at DESC);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own media" ON public.media;
CREATE POLICY "Users can view their own media" 
    ON public.media 
    FOR SELECT 
    USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create their own media records" ON public.media;
CREATE POLICY "Users can create their own media records" 
    ON public.media 
    FOR INSERT 
    WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own media records" ON public.media;
CREATE POLICY "Users can update their own media records" 
    ON public.media 
    FOR UPDATE 
    USING (owner_id = (select auth.uid()))
    WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own media records" ON public.media;
CREATE POLICY "Users can delete their own media records" 
    ON public.media 
    FOR DELETE 
    USING (owner_id = (select auth.uid()));

-- 2. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'audio', 'file', 'mixed', 'poll', 'code', '3d', 'live')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'close_friends', 'private')),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    location_name TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_status ON public.posts(visibility, status);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts visibility policy" ON public.posts;
CREATE POLICY "Posts visibility policy" 
    ON public.posts 
    FOR SELECT 
    USING (
        author_id = (select auth.uid())
        OR (
            status = 'published'
            AND NOT EXISTS (
                SELECT 1 FROM public.blocks b
                WHERE (b.blocker_id = posts.author_id AND b.blocked_id = (select auth.uid()))
                   OR (b.blocker_id = (select auth.uid()) AND b.blocked_id = posts.author_id)
            )
            AND (
                visibility = 'public'
                OR (
                    visibility = 'followers'
                    AND EXISTS (
                        SELECT 1 FROM public.follows f
                        WHERE f.follower_id = (select auth.uid())
                          AND f.following_id = posts.author_id
                    )
                )
                OR (
                    visibility = 'close_friends'
                    AND EXISTS (
                        SELECT 1 FROM public.close_friends cf
                        WHERE cf.user_id = posts.author_id
                          AND cf.friend_id = (select auth.uid())
                    )
                )
            )
        )
    );

DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
CREATE POLICY "Users can create their own posts" 
    ON public.posts 
    FOR INSERT 
    WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" 
    ON public.posts 
    FOR UPDATE 
    USING (author_id = (select auth.uid()))
    WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" 
    ON public.posts 
    FOR DELETE 
    USING (author_id = (select auth.uid()));

-- 3. Post Media Junction Table
CREATE TABLE IF NOT EXISTS public.post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_post_media_pair UNIQUE (post_id, media_id)
);

-- Ensure display_order column exists to support order indexing
ALTER TABLE public.post_media ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON public.post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_post_media_media_id ON public.post_media(media_id);

ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

-- Allow viewing media attached to visible posts
DROP POLICY IF EXISTS "Users can view attached media" ON public.media;
CREATE POLICY "Users can view attached media" 
    ON public.media 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.post_media pm
            JOIN public.posts p ON p.id = pm.post_id
            WHERE pm.media_id = media.id
        )
    );

DROP POLICY IF EXISTS "Post media viewable with post" ON public.post_media;
CREATE POLICY "Post media viewable with post" 
    ON public.post_media 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = post_media.post_id
        )
    );

DROP POLICY IF EXISTS "Users can link media to their own posts" ON public.post_media;
CREATE POLICY "Users can link media to their own posts" 
    ON public.post_media 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = post_media.post_id AND p.author_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can remove media from their own posts" ON public.post_media;
CREATE POLICY "Users can remove media from their own posts" 
    ON public.post_media 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = post_media.post_id AND p.author_id = (select auth.uid())
        )
    );

-- 4. Supabase Storage Bucket Initialization
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'media' bucket
DROP POLICY IF EXISTS "Authenticated users can upload to own folder in media bucket" ON storage.objects;
CREATE POLICY "Authenticated users can upload to own folder in media bucket"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

DROP POLICY IF EXISTS "Users can read objects in media bucket" ON storage.objects;
CREATE POLICY "Users can read objects in media bucket"
    ON storage.objects
    FOR SELECT
    TO authenticated, anon
    USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Users can delete their own objects in media bucket" ON storage.objects;
CREATE POLICY "Users can delete their own objects in media bucket"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = (select auth.uid())::text
    );

-- 5. Explicit Grants for PostgREST
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT SELECT ON public.media TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_media TO authenticated;
GRANT SELECT ON public.post_media TO anon;
