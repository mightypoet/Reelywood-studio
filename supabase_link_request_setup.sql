
-- 1. CREATE LINK REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.link_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_uid TEXT NOT NULL,
    receiver_uid TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sender_uid, receiver_uid)
);

-- 2. FIX PROFILES COLUMN TYPES (Force integers for COALESCE safety)
-- This ensures the DB level doesn't mismatch types
ALTER TABLE public.profiles 
  ALTER COLUMN followers TYPE INTEGER USING (CASE WHEN followers::text ~ '^\d+$' THEN followers::integer ELSE 0 END),
  ALTER COLUMN following TYPE INTEGER USING (CASE WHEN following::text ~ '^\d+$' THEN following::integer ELSE 0 END);

-- 3. REPAIR THE TRIGGER FUNCTION WITH EXPLICIT CASTING
-- The COALESCE error happens when comparing a text column with an integer literal.
-- We cast both arguments to ensure they match.
CREATE OR REPLACE FUNCTION public.handle_follow_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Person who clicks follow: their 'following' count increases
        UPDATE public.profiles 
        SET following = COALESCE(following::integer, 0) + 1 
        WHERE firebase_uid = NEW.follower_id;
        
        -- Person being followed: their 'followers' count increases
        UPDATE public.profiles 
        SET followers = COALESCE(followers::integer, 0) + 1 
        WHERE firebase_uid = NEW.following_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles 
        SET following = GREATEST(0, COALESCE(following::integer, 0) - 1) 
        WHERE firebase_uid = OLD.follower_id;
        
        UPDATE public.profiles 
        SET followers = GREATEST(0, COALESCE(followers::integer, 0) - 1) 
        WHERE firebase_uid = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ENABLE RLS
ALTER TABLE public.link_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable link management for all" ON public.link_requests;
CREATE POLICY "Enable link management for all" ON public.link_requests
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
