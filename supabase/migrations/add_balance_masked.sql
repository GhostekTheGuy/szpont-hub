-- Kolumna balance_masked na tabeli users (persystencja "ukryj kwoty")
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_masked BOOLEAN DEFAULT FALSE;
