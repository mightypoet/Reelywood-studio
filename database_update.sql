
-- Add reelcoins column to partner_brands table
ALTER TABLE partner_brands 
ADD COLUMN reelcoins INTEGER DEFAULT 0;

-- Optional: Add a comment for documentation
COMMENT ON COLUMN partner_brands.reelcoins IS 'Total Reelcoins balance available for mission rewards';
