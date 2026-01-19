
-- Add reelcoins column to partner_brands table if not already present
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='partner_brands' AND column_name='reelcoins') THEN
    ALTER TABLE partner_brands ADD COLUMN reelcoins INTEGER DEFAULT 0;
  END IF;
END $$;

-- Optional: Create a transaction log for brand funding to track admin top-ups
CREATE TABLE IF NOT EXISTS brand_funding_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES partner_brands(id),
  amount INTEGER NOT NULL,
  admin_uid TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
