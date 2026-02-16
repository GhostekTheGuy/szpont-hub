-- Tabela calendar_events
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  wallet_id TEXT REFERENCES wallets(id) ON DELETE SET NULL,
  hourly_rate TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  is_settled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar events"
  ON calendar_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own calendar events"
  ON calendar_events FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own calendar events"
  ON calendar_events FOR DELETE
  USING (user_id = auth.uid());

-- Index for efficient week queries
CREATE INDEX idx_calendar_events_user_time
  ON calendar_events (user_id, start_time, end_time);
