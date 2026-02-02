
-- 1. FIX PROFILES COLUMN TYPES
ALTER TABLE public.profiles 
  ALTER COLUMN followers TYPE INTEGER USING (COALESCE(NULLIF(followers::text, ''), '0')::integer),
  ALTER COLUMN following TYPE INTEGER USING (COALESCE(NULLIF(following::text, ''), '0')::integer);

ALTER TABLE public.profiles ALTER COLUMN followers SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN following SET DEFAULT 0;

-- 2. CREATE FOLLOWS TABLE (The actual connections)
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id TEXT NOT NULL REFERENCES public.profiles(firebase_uid) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES public.profiles(firebase_uid) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- 3. CREATE LINK REQUESTS TABLE (Pending connections)
CREATE TABLE IF NOT EXISTS public.link_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_uid TEXT NOT NULL REFERENCES public.profiles(firebase_uid) ON DELETE CASCADE,
    receiver_uid TEXT NOT NULL REFERENCES public.profiles(firebase_uid) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sender_uid, receiver_uid)
);

-- 4. REPAIR THE FOLLOW STATS TRIGGER
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

-- 5. ATTACH TRIGGER TO FOLLOWS TABLE
DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_stats();

-- 6. ENABLE RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to follows" ON public.follows;
CREATE POLICY "Public access to follows" ON public.follows FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to link_requests" ON public.link_requests;
CREATE POLICY "Public access to link_requests" ON public.link_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 7. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
