-- Tabela habits (definicje nawyków)
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT NOT NULL DEFAULT 'star',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_habits_user ON habits (user_id);

-- Tabela habit_entries (checkboxy per dzień)
CREATE TABLE IF NOT EXISTS habit_entries (
  id TEXT PRIMARY KEY,
  habit_id TEXT REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (habit_id, date)
);

-- RLS
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit entries"
  ON habit_entries FOR SELECT
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own habit entries"
  ON habit_entries FOR INSERT
  WITH CHECK (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own habit entries"
  ON habit_entries FOR UPDATE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own habit entries"
  ON habit_entries FOR DELETE
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE INDEX idx_habit_entries_habit_date ON habit_entries (habit_id, date);
