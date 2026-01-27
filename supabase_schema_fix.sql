
-- IMPORTANT: RUN THESE COMMANDS IN YOUR SUPABASE SQL EDITOR --

-- 1. ADD MISSING COLUMNS
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. RELOAD SCHEMA CACHE (Fixes the "column not found" error in app)
NOTIFY pgrst, 'reload schema';

-- 3. RESET POLICIES FOR 'ANON' ACCESS
-- This ensures that since you use Firebase Auth, the Supabase 'anon' client can still update.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable updates for all" ON profiles;
DROP POLICY IF EXISTS "Enable select for all" ON profiles;

CREATE POLICY "Enable updates for all" ON profiles
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable select for all" ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. STORAGE BUCKET PERMISSIONS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;

CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'brand-assets');
CREATE POLICY "Allow public select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'brand-assets');
CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'brand-assets');
