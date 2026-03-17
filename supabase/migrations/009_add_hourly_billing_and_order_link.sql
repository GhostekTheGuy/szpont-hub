-- Add hourly billing support to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_type TEXT NOT NULL DEFAULT 'flat' CHECK (billing_type IN ('flat', 'hourly'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS hourly_rate TEXT; -- encrypted number

-- Link calendar events to orders
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES orders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_calendar_events_order_id ON calendar_events(order_id);
