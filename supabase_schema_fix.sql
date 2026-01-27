
-- 1. FORCE ADD ALL REQUIRED COLUMNS
-- This fixes the "column bio does not exist" error
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS niche TEXT DEFAULT 'CREATOR NODE';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. RESET STORAGE FOR DISPLAY PICTURES
-- Ensures the 'brand-assets' bucket is public and writable
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop and recreate storage policies for maximum compatibility with anon client
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'brand-assets');
CREATE POLICY "Allow public select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'brand-assets');
CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'brand-assets');
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'brand-assets');

-- 3. RESET PROFILE POLICIES
-- Allows your 'anon' client to update rows (required since you use Firebase for Auth)
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

-- 4. RELOAD CACHE
-- Forces Supabase to recognize the new 'bio' column immediately
NOTIFY pgrst, 'reload schema';
