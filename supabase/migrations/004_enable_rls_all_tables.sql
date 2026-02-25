-- Enable RLS on all tables
-- Cast both sides to text to avoid uuid vs text mismatch

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own profile" ON users
  FOR ALL USING (auth.uid()::text = id::text);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own wallets" ON wallets
  FOR ALL USING (auth.uid()::text = user_id::text);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own transactions" ON transactions
  FOR ALL USING (
    auth.uid()::text = (SELECT w.user_id::text FROM wallets w WHERE w.id = transactions.wallet_id)
  );

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own assets" ON assets
  FOR ALL USING (auth.uid()::text = user_id::text);

ALTER TABLE asset_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own asset_sales" ON asset_sales
  FOR ALL USING (auth.uid()::text = user_id::text);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own calendar_events" ON calendar_events
  FOR ALL USING (auth.uid()::text = user_id::text);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own habits" ON habits
  FOR ALL USING (auth.uid()::text = user_id::text);

ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own habit_entries" ON habit_entries
  FOR ALL USING (
    auth.uid()::text = (SELECT h.user_id::text FROM habits h WHERE h.id = habit_entries.habit_id)
  );

ALTER TABLE google_calendar_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own google_calendar_connections" ON google_calendar_connections
  FOR ALL USING (auth.uid()::text = user_id::text);

ALTER TABLE google_calendar_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own google_calendar_mappings" ON google_calendar_mappings
  FOR ALL USING (auth.uid()::text = user_id::text);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid()::text = user_id::text);

ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own scan_logs" ON scan_logs
  FOR ALL USING (auth.uid()::text = user_id::text);
