
-- 1. CREATE LINK REQUESTS TABLE
-- This table handles pending identity links (follows) between agents
CREATE TABLE IF NOT EXISTS public.link_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_uid TEXT NOT NULL,
    receiver_uid TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sender_uid, receiver_uid)
);

-- 2. FIX PROFILES COLUMN TYPES (Force integers for COALESCE safety)
-- This resolves the "COALESCE types text and integer cannot be matched" error
ALTER TABLE public.profiles 
  ALTER COLUMN followers TYPE INTEGER USING (CASE WHEN followers::text ~ '^\d+$' THEN followers::integer ELSE 0 END),
  ALTER COLUMN following TYPE INTEGER USING (CASE WHEN following::text ~ '^\d+$' THEN following::integer ELSE 0 END);

-- 3. REPAIR THE FOLLOW STATS TRIGGER
-- Explicitly cast variables to integer to ensure compatibility
CREATE OR REPLACE FUNCTION public.handle_follow_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Increase following count for the sender
        UPDATE public.profiles 
        SET following = COALESCE(following::integer, 0) + 1 
        WHERE firebase_uid = NEW.follower_id;
        
        -- Increase followers count for the receiver
        UPDATE public.profiles 
        SET followers = COALESCE(followers::integer, 0) + 1 
        WHERE firebase_uid = NEW.following_id;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Decrease counts
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

-- 4. ENABLE PERMISSIONS (RLS)
ALTER TABLE public.link_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable link management for all" ON public.link_requests;
CREATE POLICY "Enable link management for all" ON public.link_requests
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. RELOAD SCHEMA CACHE
-- Crucial for PostgREST to recognize the new table immediately
NOTIFY pgrst, 'reload schema';
