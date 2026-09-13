-- Udostępnianie tytułów wydarzeń ekipie (opt-in, globalny przełącznik per użytkownik).
--
-- shared_title to JAWNY tytuł wydarzenia (poza E2E). Wypełniany TYLKO gdy właściciel
-- włączył udostępnianie (users.share_event_titles = true); po wyłączeniu jest czyszczony.
-- Właściwy tytuł nadal jest szyfrowany DEK-iem właściciela w kolumnie title.
-- Stawki (hourly_rate) i portfele pozostają prywatne — nie są udostępniane.

ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS shared_title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS share_event_titles BOOLEAN NOT NULL DEFAULT false;
