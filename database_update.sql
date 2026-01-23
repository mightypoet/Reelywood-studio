
-- 1. Ensure missions table status column is flexible and defaults to pending
ALTER TABLE missions ALTER COLUMN status TYPE TEXT;
ALTER TABLE missions ALTER COLUMN status SET DEFAULT 'pending_approval';

-- 2. Drop existing constraint if it limits status values too strictly
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'missions' AND constraint_name = 'missions_status_check') THEN
    ALTER TABLE missions DROP CONSTRAINT missions_status_check;
  END IF;
END $$;

-- 3. Enable RLS and setup policies for mission insertion
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON missions;
CREATE POLICY "Enable insert for authenticated users only" ON missions
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON missions;
CREATE POLICY "Enable update for authenticated users only" ON missions
  FOR UPDATE TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable select for all users" ON missions;
CREATE POLICY "Enable select for all users" ON missions
  FOR SELECT TO authenticated
  USING (true);
