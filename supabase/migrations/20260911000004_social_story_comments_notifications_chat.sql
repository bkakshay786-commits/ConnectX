-- ConnectX Phase 5: Stories, Comments, Notifications, and Chat Migration
-- Adds the persistence layer required for live story feeds, comments, notifications, and direct chat.
-- Security model: authenticated users manage their own rows; public reads remain privacy-aware but intentionally
-- constrained by table-level checks to avoid leaking private content.

BEGIN;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. User settings / preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
    language TEXT NOT NULL DEFAULT 'en',
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    push_notifications BOOLEAN NOT NULL DEFAULT true,
    story_view_mode TEXT NOT NULL DEFAULT 'replay' CHECK (story_view_mode IN ('replay', 'tap', 'auto')),
    auto_play_video BOOLEAN NOT NULL DEFAULT true,
    allow_tag_mentions BOOLEAN NOT NULL DEFAULT true,
    profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'followers', 'private')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their own settings" ON public.user_settings;
CREATE POLICY "Users view their own settings"
    ON public.user_settings
    FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users insert their own settings" ON public.user_settings;
CREATE POLICY "Users insert their own settings"
    ON public.user_settings
    FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users update their own settings" ON public.user_settings;
CREATE POLICY "Users update their own settings"
    ON public.user_settings
    FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- 2. Stories
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_id UUID NULL REFERENCES public.media(id) ON DELETE SET NULL,
    story_type TEXT NOT NULL DEFAULT 'image' CHECK (story_type IN ('image', 'video', 'text', 'audio')),
    caption TEXT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'close_friends', 'private')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '24 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_stories_author_id ON public.stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON public.stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stories are readable for allowed viewers" ON public.stories;
CREATE POLICY "Stories are readable for allowed viewers"
    ON public.stories
    FOR SELECT
    USING (
        author_id = (select auth.uid())
        OR (
            expires_at > timezone('utc'::text, now())
            AND status = 'published'
        )
    );

DROP POLICY IF EXISTS "Users can create stories" ON public.stories;
CREATE POLICY "Users can create stories"
    ON public.stories
    FOR INSERT
    WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their stories" ON public.stories;
CREATE POLICY "Users can update their stories"
    ON public.stories
    FOR UPDATE
    USING (author_id = (select auth.uid()))
    WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their stories" ON public.stories;
CREATE POLICY "Users can delete their stories"
    ON public.stories
    FOR DELETE
    USING (author_id = (select auth.uid()));

-- 3. Story views
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_story_view UNIQUE (story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON public.story_views(viewer_id);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own story interactions" ON public.story_views;
CREATE POLICY "Users can view their own story interactions"
    ON public.story_views
    FOR SELECT
    USING (viewer_id = (select auth.uid()) OR EXISTS (
        SELECT 1 FROM public.stories s
        WHERE s.id = story_views.story_id
          AND s.author_id = (select auth.uid())
    ));

DROP POLICY IF EXISTS "Users can log story views" ON public.story_views;
CREATE POLICY "Users can log story views"
    ON public.story_views
    FOR INSERT
    WITH CHECK (viewer_id = (select auth.uid()));

-- 4. Story reactions
CREATE TABLE IF NOT EXISTS public.story_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL DEFAULT 'like' CHECK (reaction IN ('like', 'love', 'fire', 'wow', 'sad')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_story_reactions UNIQUE (story_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_story_reactions_story_id ON public.story_reactions(story_id);

ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Story reactions are visible to viewers" ON public.story_reactions;
CREATE POLICY "Story reactions are visible to viewers"
    ON public.story_reactions
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can react to stories" ON public.story_reactions;
CREATE POLICY "Users can react to stories"
    ON public.story_reactions
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove their reactions" ON public.story_reactions;
CREATE POLICY "Users can remove their reactions"
    ON public.story_reactions
    FOR DELETE
    USING (user_id = (select auth.uid()));

-- 5. Comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'story', 'profile')),
    target_id UUID NOT NULL,
    parent_id UUID NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_comments_target ON public.comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are readable by authenticated users" ON public.comments;
CREATE POLICY "Comments are readable by authenticated users"
    ON public.comments
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND (
            author_id = (select auth.uid())
            OR target_type = 'profile'
            OR target_type = 'story'
            OR (
                target_type = 'post'
                AND EXISTS (
                    SELECT 1 FROM public.posts p
                    WHERE p.id = comments.target_id
                      AND (
                          p.author_id = (select auth.uid())
                          OR p.visibility = 'public'
                          OR (
                              p.visibility = 'followers'
                              AND EXISTS (
                                  SELECT 1 FROM public.follows f
                                  WHERE f.follower_id = (select auth.uid())
                                    AND f.following_id = p.author_id
                              )
                          )
                      )
                )
            )
        )
    );

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments"
    ON public.comments
    FOR INSERT
    WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update comments they own" ON public.comments;
CREATE POLICY "Users can update comments they own"
    ON public.comments
    FOR UPDATE
    USING (author_id = (select auth.uid()))
    WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete comments they own" ON public.comments;
CREATE POLICY "Users can delete comments they own"
    ON public.comments
    FOR DELETE
    USING (author_id = (select auth.uid()));

CREATE TRIGGER comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 6. Comment reactions
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL DEFAULT 'like' CHECK (reaction IN ('like', 'love', 'fire')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_comment_reactions UNIQUE (comment_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);

ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comment reactions readable to users" ON public.comment_reactions;
CREATE POLICY "Comment reactions readable to users"
    ON public.comment_reactions
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can react to comments" ON public.comment_reactions;
CREATE POLICY "Users can react to comments"
    ON public.comment_reactions
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove own comment reactions" ON public.comment_reactions;
CREATE POLICY "Users can remove own comment reactions"
    ON public.comment_reactions
    FOR DELETE
    USING (user_id = (select auth.uid()));

-- 7. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('follow_request', 'follow', 'mention', 'comment', 'reaction', 'story_reply', 'message', 'system')),
    entity_type TEXT NOT NULL DEFAULT 'post',
    entity_id UUID NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their own notifications" ON public.notifications;
CREATE POLICY "Users view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create notifications for themselves" ON public.notifications;
CREATE POLICY "Users can create notifications for themselves"
    ON public.notifications
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications"
    ON public.notifications
    FOR UPDATE
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- 8. Conversations and direct messages
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_conversation_participants CHECK (participant_a <> participant_b),
    CONSTRAINT uq_conversation_pair UNIQUE (participant_a, participant_b)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_a ON public.conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_b ON public.conversations(participant_b);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in"
    ON public.conversations
    FOR SELECT
    USING (
        participant_a = (select auth.uid())
        OR participant_b = (select auth.uid())
    );

DROP POLICY IF EXISTS "Users can create conversations with others" ON public.conversations;
CREATE POLICY "Users can create conversations with others"
    ON public.conversations
    FOR INSERT
    WITH CHECK (
        participant_a = (select auth.uid())
        OR participant_b = (select auth.uid())
    );

CREATE TRIGGER conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'system')),
    media_id UUID NULL REFERENCES public.media(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own conversation messages" ON public.messages;
CREATE POLICY "Users can read their own conversation messages"
    ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
              AND (
                  c.participant_a = (select auth.uid())
                  OR c.participant_b = (select auth.uid())
              )
        )
    );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        sender_id = (select auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
              AND (
                  c.participant_a = (select auth.uid())
                  OR c.participant_b = (select auth.uid())
              )
        )
    );

DROP POLICY IF EXISTS "Users can edit their own messages" ON public.messages;
CREATE POLICY "Users can edit their own messages"
    ON public.messages
    FOR UPDATE
    USING (sender_id = (select auth.uid()))
    WITH CHECK (sender_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Users can delete their own messages"
    ON public.messages
    FOR DELETE
    USING (sender_id = (select auth.uid()));

CREATE TRIGGER messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 9. Message attachments (optional but useful for chat/media uploads)
CREATE TABLE IF NOT EXISTS public.message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (message_id, media_id)
);

ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view message attachments in their chats" ON public.message_attachments;
CREATE POLICY "Users can view message attachments in their chats"
    ON public.message_attachments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.messages m
            JOIN public.conversations c ON c.id = m.conversation_id
            WHERE m.id = message_attachments.message_id
              AND (
                  c.participant_a = (select auth.uid())
                  OR c.participant_b = (select auth.uid())
              )
        )
    );

DROP POLICY IF EXISTS "Users can attach files to their messages" ON public.message_attachments;
CREATE POLICY "Users can attach files to their messages"
    ON public.message_attachments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.messages m
            WHERE m.id = message_attachments.message_id
              AND m.sender_id = (select auth.uid())
        )
    );

-- 10. Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.story_views TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.story_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.comment_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT ON public.message_attachments TO authenticated;

COMMIT;
