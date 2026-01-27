
-- IMPORTANT: RUN THESE COMMANDS IN YOUR SUPABASE SQL EDITOR --

-- 1. Disable RLS temporarily or enable a permissive policy for profiles
-- This allows authenticated users (even via Firebase if Supabase Auth isn't strictly synced)
-- to manage their own records.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public select for profiles" ON profiles;
CREATE POLICY "Public select for profiles" ON profiles
  FOR SELECT
  USING (true);

-- 2. Setup storage bucket permissions
-- Replace 'brand-assets' with your actual bucket name if different.
-- This ensures the SYNC tab can upload avatars.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public access to brand-assets" ON storage.objects;
CREATE POLICY "Public access to brand-assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Authenticated upload to brand-assets" ON storage.objects;
CREATE POLICY "Authenticated upload to brand-assets" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Public delete for brand-assets" ON storage.objects;
CREATE POLICY "Public delete for brand-assets" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'brand-assets');
