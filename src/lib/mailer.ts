import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Wysyła e-mail przez Supabase Edge Function `send-email`.
 *
 * Dane SMTP (host/port/login/hasło/nadawca) trzymane są jako sekrety Supabase,
 * więc wysyłka nie zależy od zmiennych środowiskowych hostingu (Netlify).
 * Wywołanie autoryzowane jest kluczem service_role (supabaseAdmin) — funkcja
 * odrzuca każde inne żądanie.
 *
 * Rzuca Error z czytelnym komunikatem, gdy wysyłka się nie powiedzie —
 * wołający decyduje, jak to pokazać użytkownikowi.
 */
// Slug funkcji nadany przez Supabase przy deployu z panelu (losowy).
// Musi się zgadzać z adresem /functions/v1/<slug>.
const EMAIL_FUNCTION_SLUG = 'bright-endpoint';

export async function sendMail(payload: MailPayload): Promise<void> {
  const { error } = await supabaseAdmin.functions.invoke(EMAIL_FUNCTION_SLUG, {
    body: payload,
  });

  if (error) {
    let detail = error.message;
    // FunctionsHttpError niesie oryginalną odpowiedź funkcji w `context`.
    const ctx = (error as { context?: unknown }).context;
    if (ctx instanceof Response) {
      try {
        const body = (await ctx.clone().json()) as { error?: string };
        if (body?.error) detail = body.error;
      } catch {
        // odpowiedź nie-JSON — zostaw domyślny komunikat z error.message
      }
    }
    console.error('sendMail failed:', detail);
    throw new Error(detail);
  }
}
