-- Udostępnianie grafiku (free/busy) między użytkownikami.
-- Zaproszenie idzie mailem z jednorazowym linkiem; w bazie trzymamy tylko hash tokenu.
-- Po akceptacji powstaje dwustronna para w schedule_shares (kanoniczna kolejność user_a < user_b).

CREATE TABLE IF NOT EXISTS schedule_share_invites (
  id TEXT PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,                 -- lowercase, adres z konta zapraszanego
  token_hash TEXT NOT NULL UNIQUE,             -- sha256(token) — surowy token tylko w mailu
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_schedule_share_invites_inviter ON schedule_share_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_schedule_share_invites_invitee_email ON schedule_share_invites(invitee_email) WHERE status = 'pending';

ALTER TABLE schedule_share_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviter manages own invites" ON schedule_share_invites
  FOR ALL USING (auth.uid() = inviter_id) WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Invitee sees invites to own email" ON schedule_share_invites
  FOR SELECT USING (lower(auth.jwt() ->> 'email') = invitee_email);

CREATE TABLE IF NOT EXISTS schedule_shares (
  id TEXT PRIMARY KEY,
  user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_a, user_b),
  CHECK (user_a < user_b)
);

CREATE INDEX IF NOT EXISTS idx_schedule_shares_user_a ON schedule_shares(user_a);
CREATE INDEX IF NOT EXISTS idx_schedule_shares_user_b ON schedule_shares(user_b);

ALTER TABLE schedule_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Both sides see and can end the share" ON schedule_shares
  FOR ALL USING (auth.uid() = user_a OR auth.uid() = user_b);
