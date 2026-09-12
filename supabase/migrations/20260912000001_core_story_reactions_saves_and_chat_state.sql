-- ConnectX Phase 6: Social reactions, saves, story replies, and chat membership/read state
-- This migration complements the earlier profile/posts/media/story/comment layers and keeps schema
-- consistent with the existing frontend contract without creating duplicate systems.

BEGIN;

-- 1. Story replies
CREATE TABLE IF NOT EXISTS public.story_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_story_replies_story_id ON public.story_replies(story_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_replies_author_id ON public.story_replies(author_id);

ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Story replies readable for authorized viewers" ON public.story_replies;
CREATE POLICY "Story replies readable for authorized viewers"
    ON public.story_replies
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stories s
            WHERE s.id = story_replies.story_id
              AND (
                  s.author_id = (select auth.uid())
                  OR s.visibility = 'public'
                  OR (
                      s.visibility = 'followers'
                      AND EXISTS (
                          SELECT 1 FROM public.follows f
                          WHERE f.follower_id = (select auth.uid())
                            AND f.following_id = s.author_id
                      )
                  )
                  OR (
                      s.visibility = 'close_friends'
                      AND EXISTS (
                          SELECT 1 FROM public.close_friends cf
                          WHERE cf.user_id = s.author_id
                            AND cf.friend_id = (select auth.uid())
                      )
                  )
              )
        )
    );

DROP POLICY IF EXISTS "Users can create story replies" ON public.story_replies;
CREATE POLICY "Users can create story replies"
    ON public.story_replies
    FOR INSERT
    WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own story replies" ON public.story_replies;
CREATE POLICY "Users can update their own story replies"
    ON public.story_replies
    FOR UPDATE
    USING (author_id = (select auth.uid()))
    WITH CHECK (author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own story replies" ON public.story_replies;
CREATE POLICY "Users can delete their own story replies"
    ON public.story_replies
    FOR DELETE
    USING (author_id = (select auth.uid()));

-- 2. Post reactions
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'fire', 'wow')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read post reactions" ON public.post_reactions;
CREATE POLICY "Users can read post reactions"
    ON public.post_reactions
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS "Users can manage their own post reactions" ON public.post_reactions;
CREATE POLICY "Users can manage their own post reactions"
    ON public.post_reactions
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own post reactions" ON public.post_reactions;
CREATE POLICY "Users can update their own post reactions"
    ON public.post_reactions
    FOR UPDATE
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own post reactions" ON public.post_reactions;
CREATE POLICY "Users can delete their own post reactions"
    ON public.post_reactions
    FOR DELETE
    USING (user_id = (select auth.uid()));

-- 3. Saved posts
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON public.saved_posts(post_id);

ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own saved posts" ON public.saved_posts;
CREATE POLICY "Users can read their own saved posts"
    ON public.saved_posts
    FOR SELECT
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can save posts" ON public.saved_posts;
CREATE POLICY "Users can save posts"
    ON public.saved_posts
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unsave posts" ON public.saved_posts;
CREATE POLICY "Users can unsave posts"
    ON public.saved_posts
    FOR DELETE
    USING (user_id = (select auth.uid()));

-- 4. Conversation members
CREATE TABLE IF NOT EXISTS public.conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_read_at TIMESTAMPTZ NULL,
    UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id ON public.conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON public.conversation_members(user_id);

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversation membership" ON public.conversation_members;
CREATE POLICY "Users can view their own conversation membership"
    ON public.conversation_members
    FOR SELECT
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can join conversations they are invited to" ON public.conversation_members;
CREATE POLICY "Users can join conversations they are invited to"
    ON public.conversation_members
    FOR INSERT
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own membership state" ON public.conversation_members;
CREATE POLICY "Users can update their own membership state"
    ON public.conversation_members
    FOR UPDATE
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can leave their own conversations" ON public.conversation_members;
CREATE POLICY "Users can leave their own conversations"
    ON public.conversation_members
    FOR DELETE
    USING (user_id = (select auth.uid()));

-- 5. Message reads (canonical read-state strategy)
CREATE TABLE IF NOT EXISTS public.message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON public.message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id ON public.message_reads(user_id);

ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own message read state" ON public.message_reads;
CREATE POLICY "Users can read their own message read state"
    ON public.message_reads
    FOR SELECT
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can record read state for messages they can access" ON public.message_reads;
CREATE POLICY "Users can record read state for messages they can access"
    ON public.message_reads
    FOR INSERT
    WITH CHECK (
        user_id = (select auth.uid())
        AND EXISTS (
            SELECT 1
            FROM public.messages m
            JOIN public.conversations c ON c.id = m.conversation_id
            WHERE m.id = message_reads.message_id
              AND (
                  c.participant_a = (select auth.uid())
                  OR c.participant_b = (select auth.uid())
              )
        )
    );

DROP POLICY IF EXISTS "Users can delete their own read state" ON public.message_reads;
CREATE POLICY "Users can delete their own read state"
    ON public.message_reads
    FOR DELETE
    USING (user_id = (select auth.uid()));

-- 6. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_replies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_reactions TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.saved_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_members TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.message_reads TO authenticated;

COMMIT;
