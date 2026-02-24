CREATE TABLE scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('receipt', 'toggl')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scan_logs_user_week ON scan_logs (user_id, created_at);
