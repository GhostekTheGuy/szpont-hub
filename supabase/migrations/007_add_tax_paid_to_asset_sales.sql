-- Add tax_paid column to asset_sales table
ALTER TABLE asset_sales ADD COLUMN IF NOT EXISTS tax_paid boolean DEFAULT false;
