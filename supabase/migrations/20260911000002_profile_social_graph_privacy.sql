-- ConnectX Phase 3: Profile, Social Graph, and Privacy Migration
-- Implements follows, follow_requests, blocks, mutes, close_friends, and privacy_settings
-- Follows official Supabase Postgres Best Practices (security definer, cached (select auth.uid()), explicit grants)

-- 1. Ensure public.profiles has pronouns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pronouns TEXT NULL;

-- 2. Privacy Settings Table
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_visibility TEXT NOT NULL DEFAULT 'public' CHECK (account_visibility IN ('public', 'private')),
    message_permissions TEXT NOT NULL DEFAULT 'following' CHECK (message_permissions IN ('everyone', 'following', 'none')),
    mention_permissions TEXT NOT NULL DEFAULT 'everyone' CHECK (mention_permissions IN ('everyone', 'following', 'none')),
    tag_permissions TEXT NOT NULL DEFAULT 'everyone' CHECK (tag_permissions IN ('everyone', 'following', 'none')),
    story_visibility TEXT NOT NULL DEFAULT 'everyone' CHECK (story_visibility IN ('everyone', 'close_friends', 'followers')),
    activity_visibility BOOLEAN NOT NULL DEFAULT true,
    online_status BOOLEAN NOT NULL DEFAULT true,
    read_receipts BOOLEAN NOT NULL DEFAULT true,
    location_visibility BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own privacy settings" ON public.privacy_settings;
CREATE POLICY "Users can view their own privacy settings" 
    ON public.privacy_settings 
    FOR SELECT 
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own privacy settings" ON public.privacy_settings;
CREATE POLICY "Users can insert their own privacy settings" 
    ON public.privacy_settings 
    FOR INSERT 
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own privacy settings" ON public.privacy_settings;
CREATE POLICY "Users can update their own privacy settings" 
    ON public.privacy_settings 
    FOR UPDATE 
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own privacy settings" ON public.privacy_settings;
CREATE POLICY "Users can delete their own privacy settings" 
    ON public.privacy_settings 
    FOR DELETE 
    USING ((select auth.uid()) = user_id);

-- 3. Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_follows_no_self_follow CHECK (follower_id != following_id),
    CONSTRAINT uq_follows_follower_following UNIQUE (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" 
    ON public.follows 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can create their own follow" ON public.follows;
CREATE POLICY "Users can create their own follow" 
    ON public.follows 
    FOR INSERT 
    WITH CHECK ((select auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Users can remove their own follows or followers" ON public.follows;
CREATE POLICY "Users can remove their own follows or followers" 
    ON public.follows 
    FOR DELETE 
    USING ((select auth.uid()) = follower_id OR (select auth.uid()) = following_id);

-- 4. Follow Requests Table (for Private Accounts)
CREATE TABLE IF NOT EXISTS public.follow_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_follow_requests_no_self CHECK (requester_id != target_user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_follow_request 
    ON public.follow_requests(requester_id, target_user_id) 
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_follow_requests_requester_id ON public.follow_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_target_user_id ON public.follow_requests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_status ON public.follow_requests(status);

ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view requests they sent or received" ON public.follow_requests;
CREATE POLICY "Users can view requests they sent or received" 
    ON public.follow_requests 
    FOR SELECT 
    USING ((select auth.uid()) = requester_id OR (select auth.uid()) = target_user_id);

DROP POLICY IF EXISTS "Users can create their own follow requests" ON public.follow_requests;
CREATE POLICY "Users can create their own follow requests" 
    ON public.follow_requests 
    FOR INSERT 
    WITH CHECK ((select auth.uid()) = requester_id);

DROP POLICY IF EXISTS "Target users can accept/reject or requesters cancel" ON public.follow_requests;
CREATE POLICY "Target users can accept/reject or requesters cancel" 
    ON public.follow_requests 
    FOR UPDATE 
    USING ((select auth.uid()) = target_user_id OR (select auth.uid()) = requester_id)
    WITH CHECK ((select auth.uid()) = target_user_id OR (select auth.uid()) = requester_id);

DROP POLICY IF EXISTS "Users can delete their own requests" ON public.follow_requests;
CREATE POLICY "Users can delete their own requests" 
    ON public.follow_requests 
    FOR DELETE 
    USING ((select auth.uid()) = requester_id OR (select auth.uid()) = target_user_id);

-- 5. Blocks Table
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_blocks_no_self CHECK (blocker_id != blocked_id),
    CONSTRAINT uq_blocks_pair UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON public.blocks(blocked_id);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own block list" ON public.blocks;
CREATE POLICY "Users can view their own block list" 
    ON public.blocks 
    FOR SELECT 
    USING ((select auth.uid()) = blocker_id);

DROP POLICY IF EXISTS "Users can block other users" ON public.blocks;
CREATE POLICY "Users can block other users" 
    ON public.blocks 
    FOR INSERT 
    WITH CHECK ((select auth.uid()) = blocker_id);

DROP POLICY IF EXISTS "Users can unblock users they blocked" ON public.blocks;
CREATE POLICY "Users can unblock users they blocked" 
    ON public.blocks 
    FOR DELETE 
    USING ((select auth.uid()) = blocker_id);

-- 6. Mutes Table
CREATE TABLE IF NOT EXISTS public.mutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    muted_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_mutes_no_self CHECK (user_id != muted_user_id),
    CONSTRAINT uq_mutes_pair UNIQUE (user_id, muted_user_id)
);

CREATE INDEX IF NOT EXISTS idx_mutes_user_id ON public.mutes(user_id);
CREATE INDEX IF NOT EXISTS idx_mutes_muted_user_id ON public.mutes(muted_user_id);

ALTER TABLE public.mutes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mute list" ON public.mutes;
CREATE POLICY "Users can view their own mute list" 
    ON public.mutes 
    FOR SELECT 
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can mute accounts" ON public.mutes;
CREATE POLICY "Users can mute accounts" 
    ON public.mutes 
    FOR INSERT 
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can unmute accounts" ON public.mutes;
CREATE POLICY "Users can unmute accounts" 
    ON public.mutes 
    FOR DELETE 
    USING ((select auth.uid()) = user_id);

-- 7. Close Friends Table
CREATE TABLE IF NOT EXISTS public.close_friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_close_friends_no_self CHECK (user_id != friend_id),
    CONSTRAINT uq_close_friends_pair UNIQUE (user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_close_friends_user_id ON public.close_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_close_friends_friend_id ON public.close_friends(friend_id);

ALTER TABLE public.close_friends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Close friends list is private to owner" ON public.close_friends;
CREATE POLICY "Close friends list is private to owner" 
    ON public.close_friends 
    FOR SELECT 
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can add to their close friends" ON public.close_friends;
CREATE POLICY "Users can add to their close friends" 
    ON public.close_friends 
    FOR INSERT 
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can remove from their close friends" ON public.close_friends;
CREATE POLICY "Users can remove from their close friends" 
    ON public.close_friends 
    FOR DELETE 
    USING ((select auth.uid()) = user_id);

-- 8. Atomic PostgreSQL Functions (SECURITY DEFINER with explicit search_path)

-- Follow User: Handles public (direct follow) vs private (follow request)
CREATE OR REPLACE FUNCTION public.follow_user(p_target_user_id UUID)
RETURNS jsonb AS $$
DECLARE
    v_caller_id UUID;
    v_is_private boolean;
    v_is_blocked boolean;
    v_status text;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF v_caller_id = p_target_user_id THEN
        RAISE EXCEPTION 'Cannot follow yourself';
    END IF;

    -- Check if either user has blocked the other
    SELECT EXISTS (
        SELECT 1 FROM public.blocks 
        WHERE (blocker_id = v_caller_id AND blocked_id = p_target_user_id)
           OR (blocker_id = p_target_user_id AND blocked_id = v_caller_id)
    ) INTO v_is_blocked;

    IF v_is_blocked THEN
        RAISE EXCEPTION 'Action unavailable due to block restrictions';
    END IF;

    -- Check account visibility
    SELECT (account_visibility = 'private') INTO v_is_private
    FROM public.privacy_settings
    WHERE user_id = p_target_user_id;

    IF v_is_private IS TRUE THEN
        -- Upsert follow request with status 'pending'
        INSERT INTO public.follow_requests (requester_id, target_user_id, status, updated_at)
        VALUES (v_caller_id, p_target_user_id, 'pending', timezone('utc'::text, now()))
        ON CONFLICT (requester_id, target_user_id) WHERE status = 'pending'
        DO NOTHING;

        v_status := 'requested';
    ELSE
        -- Public account: direct follow
        INSERT INTO public.follows (follower_id, following_id)
        VALUES (v_caller_id, p_target_user_id)
        ON CONFLICT (follower_id, following_id) DO NOTHING;

        -- Clean up any obsolete follow request
        DELETE FROM public.follow_requests
        WHERE requester_id = v_caller_id AND target_user_id = p_target_user_id;

        v_status := 'following';
    END IF;

    RETURN jsonb_build_object('status', v_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Unfollow User
CREATE OR REPLACE FUNCTION public.unfollow_user(p_target_user_id UUID)
RETURNS boolean AS $$
DECLARE
    v_caller_id UUID;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Remove from follows
    DELETE FROM public.follows
    WHERE follower_id = v_caller_id AND following_id = p_target_user_id;

    -- Cancel any pending request
    DELETE FROM public.follow_requests
    WHERE requester_id = v_caller_id AND target_user_id = p_target_user_id AND status = 'pending';

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Accept Follow Request
CREATE OR REPLACE FUNCTION public.accept_follow_request(p_request_id UUID)
RETURNS boolean AS $$
DECLARE
    v_caller_id UUID;
    v_req RECORD;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT * INTO v_req
    FROM public.follow_requests
    WHERE id = p_request_id AND target_user_id = v_caller_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending follow request not found or unauthorized';
    END IF;

    -- Create follow relationship
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (v_req.requester_id, v_req.target_user_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    -- Update request status to accepted
    UPDATE public.follow_requests
    SET status = 'accepted', updated_at = timezone('utc'::text, now())
    WHERE id = p_request_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reject Follow Request
CREATE OR REPLACE FUNCTION public.reject_follow_request(p_request_id UUID)
RETURNS boolean AS $$
DECLARE
    v_caller_id UUID;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    UPDATE public.follow_requests
    SET status = 'rejected', updated_at = timezone('utc'::text, now())
    WHERE id = p_request_id AND target_user_id = v_caller_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending follow request not found or unauthorized';
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Cancel Follow Request (Caller is requester)
CREATE OR REPLACE FUNCTION public.cancel_follow_request(p_target_user_id UUID)
RETURNS boolean AS $$
DECLARE
    v_caller_id UUID;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    UPDATE public.follow_requests
    SET status = 'cancelled', updated_at = timezone('utc'::text, now())
    WHERE requester_id = v_caller_id AND target_user_id = p_target_user_id AND status = 'pending';

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Block User: Atomically creates block and cleans up follows and requests in both directions
CREATE OR REPLACE FUNCTION public.block_user(p_target_user_id UUID)
RETURNS boolean AS $$
DECLARE
    v_caller_id UUID;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF v_caller_id = p_target_user_id THEN
        RAISE EXCEPTION 'Cannot block yourself';
    END IF;

    -- Insert block
    INSERT INTO public.blocks (blocker_id, blocked_id)
    VALUES (v_caller_id, p_target_user_id)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

    -- Delete follows in both directions
    DELETE FROM public.follows
    WHERE (follower_id = v_caller_id AND following_id = p_target_user_id)
       OR (follower_id = p_target_user_id AND following_id = v_caller_id);

    -- Delete/cancel follow requests in both directions
    DELETE FROM public.follow_requests
    WHERE (requester_id = v_caller_id AND target_user_id = p_target_user_id)
       OR (requester_id = p_target_user_id AND target_user_id = v_caller_id);

    -- Remove from close friends in both directions
    DELETE FROM public.close_friends
    WHERE (user_id = v_caller_id AND friend_id = p_target_user_id)
       OR (user_id = p_target_user_id AND friend_id = v_caller_id);

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Unblock User
CREATE OR REPLACE FUNCTION public.unblock_user(p_target_user_id UUID)
RETURNS boolean AS $$
DECLARE
    v_caller_id UUID;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    DELETE FROM public.blocks
    WHERE blocker_id = v_caller_id AND blocked_id = p_target_user_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Get Relationship State between Caller and Target User
CREATE OR REPLACE FUNCTION public.get_profile_relationship(p_target_user_id UUID)
RETURNS jsonb AS $$
DECLARE
    v_caller_id UUID;
    v_is_following boolean := false;
    v_is_followed_by boolean := false;
    v_request_status text := 'none';
    v_is_blocked boolean := false;
    v_is_blocking boolean := false;
    v_is_muted boolean := false;
    v_is_close_friend boolean := false;
    v_is_private boolean := false;
BEGIN
    v_caller_id := auth.uid();

    -- Check target privacy
    SELECT (account_visibility = 'private') INTO v_is_private
    FROM public.privacy_settings
    WHERE user_id = p_target_user_id;
    v_is_private := COALESCE(v_is_private, false);

    IF v_caller_id IS NOT NULL THEN
        -- Did caller block target?
        SELECT EXISTS (
            SELECT 1 FROM public.blocks WHERE blocker_id = v_caller_id AND blocked_id = p_target_user_id
        ) INTO v_is_blocked;

        -- Did target block caller?
        SELECT EXISTS (
            SELECT 1 FROM public.blocks WHERE blocker_id = p_target_user_id AND blocked_id = v_caller_id
        ) INTO v_is_blocking;

        -- Is caller following target?
        SELECT EXISTS (
            SELECT 1 FROM public.follows WHERE follower_id = v_caller_id AND following_id = p_target_user_id
        ) INTO v_is_following;

        -- Is target following caller?
        SELECT EXISTS (
            SELECT 1 FROM public.follows WHERE follower_id = p_target_user_id AND following_id = v_caller_id
        ) INTO v_is_followed_by;

        -- Pending request from caller to target?
        SELECT status INTO v_request_status
        FROM public.follow_requests
        WHERE requester_id = v_caller_id AND target_user_id = p_target_user_id AND status = 'pending'
        LIMIT 1;
        v_request_status := COALESCE(v_request_status, 'none');

        -- Did caller mute target?
        SELECT EXISTS (
            SELECT 1 FROM public.mutes WHERE user_id = v_caller_id AND muted_user_id = p_target_user_id
        ) INTO v_is_muted;

        -- Is target in caller's close friends?
        SELECT EXISTS (
            SELECT 1 FROM public.close_friends WHERE user_id = v_caller_id AND friend_id = p_target_user_id
        ) INTO v_is_close_friend;
    END IF;

    RETURN jsonb_build_object(
        'is_following', v_is_following,
        'is_followed_by', v_is_followed_by,
        'follow_request_status', v_request_status,
        'is_blocked', v_is_blocked,
        'is_blocking', v_is_blocking,
        'is_muted', v_is_muted,
        'is_close_friend', v_is_close_friend,
        'is_private', v_is_private
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Get Follower and Following Counts
CREATE OR REPLACE FUNCTION public.get_profile_counts(p_user_id UUID)
RETURNS jsonb AS $$
DECLARE
    v_followers bigint;
    v_following bigint;
BEGIN
    SELECT COUNT(*) INTO v_followers FROM public.follows WHERE following_id = p_user_id;
    SELECT COUNT(*) INTO v_following FROM public.follows WHERE follower_id = p_user_id;

    RETURN jsonb_build_object(
        'followers_count', v_followers,
        'following_count', v_following
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Explicit Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.privacy_settings TO authenticated;
GRANT SELECT ON public.privacy_settings TO anon;

GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT SELECT ON public.follows TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_requests TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.blocks TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.mutes TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.close_friends TO authenticated;

GRANT EXECUTE ON FUNCTION public.follow_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unfollow_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_follow_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_follow_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_follow_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.block_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unblock_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_relationship(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_counts(UUID) TO anon, authenticated;
