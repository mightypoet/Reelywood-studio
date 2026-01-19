
-- Add brand_email column to link Firebase users to brand profiles
ALTER TABLE partner_brands 
ADD COLUMN brand_email TEXT UNIQUE;

-- Create an index for faster lookup during login
CREATE INDEX idx_partner_brands_email ON partner_brands(brand_email);
