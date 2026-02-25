CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount TEXT NOT NULL,
  current_amount TEXT NOT NULL,
  target_date DATE,
  category TEXT NOT NULL DEFAULT 'savings',
  icon TEXT NOT NULL DEFAULT 'target',
  wallet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);
