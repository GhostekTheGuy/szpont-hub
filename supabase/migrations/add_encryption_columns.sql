-- Dodaj kolumny szyfrowania do tabeli users
ALTER TABLE users ADD COLUMN IF NOT EXISTS encryption_salt TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS encrypted_dek TEXT;

-- Zmień typy kolumn z numeric na text (zaszyfrowane wartości to tekst)
ALTER TABLE wallets ALTER COLUMN balance TYPE TEXT USING balance::TEXT;
ALTER TABLE transactions ALTER COLUMN amount TYPE TEXT USING amount::TEXT;
ALTER TABLE assets ALTER COLUMN quantity TYPE TEXT USING quantity::TEXT;
ALTER TABLE assets ALTER COLUMN current_price TYPE TEXT USING current_price::TEXT;
ALTER TABLE assets ALTER COLUMN total_value TYPE TEXT USING total_value::TEXT;
