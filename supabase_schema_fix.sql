
-- IMPORTANT: RUN THESE COMMANDS IN YOUR SUPABASE SQL EDITOR --

-- 1. FIX PROFILE UPDATES
-- Enable RLS (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public select for profiles" ON profiles;
DROP POLICY IF EXISTS "Public update profiles" ON profiles;

-- Create a policy that allows the 'anon' role (your client) to update rows.
-- This is necessary because you are using Firebase for auth.
CREATE POLICY "Enable updates for all" ON profiles
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create a policy for reading profiles
CREATE POLICY "Enable select for all" ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. FIX STORAGE UPLOADS
-- Ensure the 'brand-assets' bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old storage policies
DROP POLICY IF EXISTS "Public access to brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload to brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public upload to brand-assets" ON storage.objects;

-- Allow 'anon' role to upload files to the bucket
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'brand-assets');

-- Allow 'anon' role to select/read files
CREATE POLICY "Allow public select" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'brand-assets');

-- Allow overwriting/updating existing files (important for DP changes)
CREATE POLICY "Allow public update" ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'brand-assets');
