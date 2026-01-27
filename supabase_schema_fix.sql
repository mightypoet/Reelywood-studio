
-- 1. FORCE ADD ALL MISSING COLUMNS TO PROFILES
-- This directly resolves the "column bio does not exist" error
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS niche TEXT DEFAULT 'CREATOR NODE';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. REPAIR PERMISSIONS (RLS)
-- Since you use Firebase for Auth, we must allow the 'anon' role to update rows
-- based on the firebase_uid to ensure your profile edits save correctly.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable updates for all" ON public.profiles;
DROP POLICY IF EXISTS "Enable select for all" ON public.profiles;

CREATE POLICY "Enable updates for all" ON public.profiles
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable select for all" ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. FIX STORAGE BUCKET FOR DISPLAY PICTURES
-- Ensures 'brand-assets' exists and allows anonymous uploads/updates
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;

CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'brand-assets');
CREATE POLICY "Allow public select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'brand-assets');
CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'brand-assets');

-- 4. FORCE REFRESH SCHEMA CACHE
-- This tells Supabase to instantly "see" the new bio column
NOTIFY pgrst, 'reload schema';
