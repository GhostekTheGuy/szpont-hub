# Szpont Hub

Kompleksowa aplikacja do zarządzania finansami osobistymi, pracy i inwestycji z szyfrowaniem end-to-end.

## Technologie

- **Next.js 14** (App Router, Server Actions)
- **TypeScript** (strict mode)
- **Supabase** (PostgreSQL, Auth)
- **Tailwind CSS** (Dark Mode)
- **Recharts** (wykresy finansowe)
- **Zustand** (zarządzanie stanem)
- **Framer Motion** (animacje)
- **Stripe** (subskrypcje)
- **Radix UI** (dostępne komponenty)

## Funkcjonalności

### Portfele i transakcje
- Wiele portfeli z własnymi kolorami i ikonami
- Obsługa wielu walut (PLN, USD, EUR i inne)
- Transakcje: przychody, wydatki, transfery
- Kategorie transakcji (Jedzenie, Transport, Zakupy, Rozrywka, Zdrowie, Edukacja itp.)
- Przeliczanie sald i historia

### Aktywa i inwestycje
- Kryptowaluty (CoinGecko API) i akcje (Yahoo Finance API)
- Automatyczna aktualizacja cen i zmiana 24h
- Przypisywanie aktywów do portfeli
- Śledzenie cost basis i kalkulacja zysku/straty
- Sprzedaż aktywów z rocznym podsumowaniem podatkowym (Belka 19%)
- Oddzielne opłacanie podatku (pojedynczo lub zbiorczo)

### Kalendarz i praca
- Integracja z Google Calendar (OAuth, synchronizacja)
- Wydarzenia robocze z ustawianiem stawki godzinowej
- Rozliczanie godzin pracy
- Import czasu z Toggl Track (PDF)
- Podsumowania pracy AI

### Klienci i zlecenia
- Baza klientów (osoba/firma) z danymi kontaktowymi
- Zarządzanie zleceniami i ich statusami
- Rozliczanie zleceń
- Fakturowanie przez Kugaru API

### Faktury (Kugaru)
- Generowanie faktur z pozycjami i VAT
- Obsługa typów umowy i praw autorskich
- Automatyczne kalkulacje netto/brutto/VAT
- Generowanie PDF

### Nawyki
- Codzienne śledzenie nawyków
- Wizualizacja streak i radar chart
- Historia wpisów

### Cele finansowe
- Ustawianie celów z kwotą docelową i terminem
- Śledzenie postępu
- Przypisanie do portfela

### Wydatki cykliczne
- Zarządzanie subskrypcjami i stałymi opłatami
- Przypomnienia e-mail (3 dni przed terminem, cron)
- Pomijanie lub opłacanie wydatków

### AI i automatyzacja
- **Tygodniowy raport finansowy** - analiza AI (Groq/Llama): przychody vs wydatki, kategorie, godziny pracy, nawyki
- **Skanowanie paragonów** - OCR z AI, automatyczne tworzenie transakcji
- **Podsumowania kalendarza** - AI-generowane streszczenia wydarzeń

### Wykresy
- Wartość portfela w czasie (1W, 1M, 3M, 1Y)
- Miesięczny cashflow (przychody vs wydatki)
- Wykres kołowy wydatków
- Widget BTC/PLN
- Projekcja net worth
- Procent składany
- Poduszka finansowa

## Bezpieczeństwo

### Szyfrowanie E2E
- KEK (Key Encryption Key) z hasła przez PBKDF2 (100k iteracji)
- DEK (Data Encryption Key) per użytkownik
- Szyfrowanie AES-256-GCM na poziomie pól (nazwy portfeli, kwoty, opisy, kategorie)
- Sesyjny DEK w httpOnly encrypted cookies

### Autentykacja
- Email/hasło przez Supabase Auth
- Weryfikacja email przy rejestracji
- Reset hasła przez email
- Sesje z 24h expiry

## Subskrypcje (Stripe)
- Plan Free: 3 skany/tydzień, 1 raport/tydzień
- Plan Pro: bez limitów
- Zarządzanie subskrypcją przez portal Stripe

## Instalacja

### Wymagania
- Node.js 18+
- pnpm

### Kroki

```bash
# Instalacja zależności
pnpm install

# Uruchomienie dev
pnpm run dev

# Build produkcyjny
pnpm run build
pnpm start
```

### Zmienne środowiskowe

Wymagane zmienne w `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PRICE_ID`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD`
- `KUGARU_API_KEY`

## Design

- Dark mode z fioletowo-niebieskimi akcentami
- Responsive (mobile-first)
- Animowane przejścia (Framer Motion)
- Custom toast/confirm system
- Sidebar z nawigacją i sekcjami
