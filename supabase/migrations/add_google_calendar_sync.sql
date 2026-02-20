-- Google Calendar OAuth connections (one per user)
CREATE TABLE google_calendar_connections (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_email TEXT NOT NULL,
  access_token TEXT NOT NULL,    -- encrypted with DEK
  refresh_token TEXT NOT NULL,   -- encrypted with DEK
  token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE google_calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own google connections"
  ON google_calendar_connections
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Google Calendar → wallet/rate mappings
CREATE TABLE google_calendar_mappings (
  id TEXT PRIMARY KEY,
  connection_id TEXT NOT NULL REFERENCES google_calendar_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_calendar_id TEXT NOT NULL,
  calendar_name TEXT NOT NULL,
  wallet_id TEXT REFERENCES wallets(id) ON DELETE SET NULL,
  hourly_rate TEXT,               -- encrypted with DEK
  is_enabled BOOLEAN DEFAULT FALSE,
  sync_token TEXT,                -- Google incremental sync token
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, google_calendar_id)
);

ALTER TABLE google_calendar_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own google calendar mappings"
  ON google_calendar_mappings
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Extend calendar_events for Google sync
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS google_calendar_id TEXT;

-- Unique partial index for deduplication (only for Google events)
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_events_google_dedup
  ON calendar_events (user_id, google_event_id)
  WHERE google_event_id IS NOT NULL;
