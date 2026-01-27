
-- 1. FIX COLUMN TYPES (Resolves "operator does not exist: text + integer")
-- Force followers and following to be integers even if they were created as text
ALTER TABLE public.profiles 
  ALTER COLUMN followers TYPE INTEGER USING (COALESCE(NULLIF(followers::text, ''), '0')::integer),
  ALTER COLUMN following TYPE INTEGER USING (COALESCE(NULLIF(following::text, ''), '0')::integer);

-- Ensure defaults are strictly 0
ALTER TABLE public.profiles ALTER COLUMN followers SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN following SET DEFAULT 0;

-- 2. REPAIR THE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_follow_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Person who clicks follow: their 'following' count increases
        UPDATE public.profiles 
        SET following = COALESCE(following, 0) + 1 
        WHERE firebase_uid = NEW.follower_id;
        
        -- Person being followed: their 'followers' count increases
        UPDATE public.profiles 
        SET followers = COALESCE(followers, 0) + 1 
        WHERE firebase_uid = NEW.following_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles 
        SET following = GREATEST(0, COALESCE(following, 0) - 1) 
        WHERE firebase_uid = OLD.follower_id;
        
        UPDATE public.profiles 
        SET followers = GREATEST(0, COALESCE(followers, 0) - 1) 
        WHERE firebase_uid = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ADD INDEXES FOR FAST LIST LOOKUPS
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 4. REFRESH SCHEMA
NOTIFY pgrst, 'reload schema';
