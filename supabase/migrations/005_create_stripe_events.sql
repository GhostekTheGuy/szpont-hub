-- Create stripe_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_events_event_id ON stripe_events(event_id);

-- RLS: only service role should access this table (webhooks)
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
-- No user-facing policy needed — only supabaseAdmin (service role) uses this table
