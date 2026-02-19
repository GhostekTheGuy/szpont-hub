-- Add is_confirmed column to calendar_events
-- is_confirmed = user confirmed the event happened (checkbox)
-- is_settled   = earnings already converted to wallet transaction
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT FALSE;
