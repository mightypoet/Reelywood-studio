
-- Add reelcoins column to partner_brands table
ALTER TABLE partner_brands 
ADD COLUMN reelcoins INTEGER DEFAULT 0;

-- Optional: Create a transaction log for brand funding
CREATE TABLE brand_funding_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES partner_brands(id),
  amount INTEGER NOT NULL,
  admin_uid TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
