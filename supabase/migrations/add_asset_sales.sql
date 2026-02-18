-- Add cost_basis column to assets (encrypted TEXT, like other numeric fields)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS cost_basis TEXT;

-- Create asset_sales table for tracking sell history
CREATE TABLE IF NOT EXISTS asset_sales (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  quantity_sold TEXT NOT NULL,
  sale_price_per_unit TEXT NOT NULL,
  cost_basis_per_unit TEXT NOT NULL,
  total_proceeds TEXT NOT NULL,
  total_cost TEXT NOT NULL,
  profit TEXT NOT NULL,
  tax_amount TEXT NOT NULL,
  wallet_id TEXT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_asset_sales_user_id ON asset_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_sales_sale_date ON asset_sales(sale_date);
