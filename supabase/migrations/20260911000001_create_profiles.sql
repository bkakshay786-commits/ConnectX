-- ConnectX Phase 2: Profiles, Security & Username Lookup Migration
-- Accurately reflects existing database state and applies RLS with explicit grants
-- Follows official Supabase Postgres Best Practices (security definer, cached auth.uid(), least privilege)

-- 1. Helper function to normalize usernames
CREATE OR REPLACE FUNCTION public.normalize_username(input text)
RETURNS text AS $$
BEGIN
    RETURN LOWER(REGEXP_REPLACE(input, '[^a-zA-Z0-9_.]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Create or alter public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT NULL,
    bio TEXT NULL,
    website TEXT NULL,
    location TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all required columns exist on public.profiles even if table already existed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_normalized TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pronouns TEXT NULL;

-- Populate username_normalized for any existing rows
UPDATE public.profiles 
SET username_normalized = public.normalize_username(COALESCE(username, 'user_' || SUBSTRING(id::text, 1, 8)))
WHERE username_normalized IS NULL OR username_normalized = '';

-- Ensure username_normalized is NOT NULL
ALTER TABLE public.profiles ALTER COLUMN username_normalized SET NOT NULL;

-- Ensure unique constraint exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_profiles_username_normalized'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT uq_profiles_username_normalized UNIQUE (username_normalized);
    END IF;
END $$;

-- 3. Indexes for high-performance lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username_normalized 
    ON public.profiles(username_normalized);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at 
    ON public.profiles(created_at DESC);

-- 4. Enable Row Level Security (MANDATORY)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Optimized RLS Policies (Wrapping auth.uid() in select for per-query caching)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
    ON public.profiles 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING ((select auth.uid()) = id) 
    WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" 
    ON public.profiles 
    FOR DELETE 
    USING ((select auth.uid()) = id);

-- 6. Trigger to automatically provision profile when an auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    v_raw_username text;
    v_username text;
    v_normalized text;
    v_display_name text;
BEGIN
    v_raw_username := COALESCE(
        new.raw_user_meta_data->>'username',
        SPLIT_PART(new.email, '@', 1),
        'user_' || SUBSTRING(new.id::text, 1, 8)
    );
    v_normalized := public.normalize_username(v_raw_username);
    
    IF v_normalized = '' THEN
        v_normalized := 'user_' || SUBSTRING(new.id::text, 1, 8);
    END IF;
    
    v_username := v_raw_username;
    v_display_name := COALESCE(
        new.raw_user_meta_data->>'display_name',
        new.raw_user_meta_data->>'full_name',
        v_username
    );

    INSERT INTO public.profiles (id, username, username_normalized, display_name, avatar_url, bio)
    VALUES (
        new.id,
        v_username,
        v_normalized,
        v_display_name,
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'bio'
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Secure function for username-based authentication lookup
-- Resolves a username to the corresponding user email for Supabase signInWithPassword
CREATE OR REPLACE FUNCTION public.get_auth_email_by_username(lookup_username text)
RETURNS text AS $$
DECLARE
    found_email text;
    clean_username text;
BEGIN
    clean_username := public.normalize_username(lookup_username);
    
    SELECT u.email INTO found_email
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE p.username_normalized = clean_username
    LIMIT 1;

    RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Explicit Role Grants (Required for PostgREST and anon/authenticated access)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_email_by_username(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_username(text) TO anon, authenticated;
