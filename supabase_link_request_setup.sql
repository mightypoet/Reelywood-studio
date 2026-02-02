
-- 1. FIX PROFILES COLUMN TYPES (Strictly enforce integers)
-- This resolves: "COALESCE types text and integer cannot be matched"
ALTER TABLE public.profiles 
  ALTER COLUMN followers TYPE INTEGER USING (COALESCE(NULLIF(followers::text, ''), '0')::integer),
  ALTER COLUMN following TYPE INTEGER USING (COALESCE(NULLIF(following::text, ''), '0')::integer);

ALTER TABLE public.profiles ALTER COLUMN followers SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN following SET DEFAULT 0;

-- 2. RECREATE LINK REQUESTS TABLE WITH CLEAR RELATIONSHIPS
DROP TABLE IF EXISTS public.link_requests;
CREATE TABLE public.link_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_uid TEXT NOT NULL REFERENCES public.profiles(firebase_uid) ON DELETE CASCADE,
    receiver_uid TEXT NOT NULL REFERENCES public.profiles(firebase_uid) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sender_uid, receiver_uid)
);

-- 3. REPAIR THE FOLLOW STATS TRIGGER (Explicit integer casting)
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
        -- Decrease counts safely
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

-- 4. ENABLE RLS & PERMISSIONS
ALTER TABLE public.link_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access to link_requests" ON public.link_requests;
CREATE POLICY "Public access to link_requests" ON public.link_requests
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
