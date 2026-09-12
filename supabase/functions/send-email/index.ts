// Supabase Edge Function: send-email
//
// Wysyła transakcyjny e-mail przez SMTP. Dane SMTP trzymane są jako sekrety
// Supabase (SMTP_HOST/PORT/SECURE/USER/PASS/FROM), dzięki czemu wysyłka NIE
// zależy od zmiennych środowiskowych hostingu aplikacji (Netlify).
//
// Autoryzacja: wymaga włączonego "Verify JWT" (autentyczność) + roli
// service_role w tokenie (tylko backend aplikacji). Anon/użytkownik odrzucony.
//
// Deploy:  supabase functions deploy send-email
// Sekrety: supabase secrets set SMTP_HOST=... SMTP_PORT=587 SMTP_SECURE=false \
//                               SMTP_USER=... SMTP_PASS=... SMTP_FROM="Szpont Hub <adres>"

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Odczytuje claim `role` z JWT (bez weryfikacji podpisu — od tego jest
// włączone "Verify JWT" w ustawieniach funkcji, które gwarantuje autentyczność).
function jwtRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded?.role === "string" ? decoded.role : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // --- Autoryzacja: tylko wywołania z rolą service_role (backend aplikacji) ---
  // Autentyczność tokenu gwarantuje włączone "Verify JWT" w ustawieniach funkcji;
  // tu odrzucamy zwykłych użytkowników/anon, przepuszczając tylko service_role.
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (jwtRole(token) !== "service_role") {
    return json({ error: "Unauthorized" }, 401);
  }

  // --- Walidacja payloadu ---
  let payload: MailPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const { to, subject, html } = payload;
  if (
    typeof to !== "string" || !to.includes("@") || to.length > 254 ||
    typeof subject !== "string" || subject.length === 0 || subject.length > 500 ||
    typeof html !== "string" || html.length === 0
  ) {
    return json({ error: "Missing or invalid fields (to, subject, html)" }, 400);
  }

  // --- Konfiguracja SMTP z sekretów ---
  const host = Deno.env.get("SMTP_HOST");
  const from = Deno.env.get("SMTP_FROM");
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");
  if (!host || !from || !user || !pass) {
    console.error("SMTP secrets are not configured");
    return json({ error: "SMTP is not configured on the server" }, 500);
  }
  const port = Number(Deno.env.get("SMTP_PORT") ?? "587");
  // true => implicit TLS (port 465). false => STARTTLS (port 587) — denomailer
  // sam podniesie połączenie, jeśli serwer to wspiera.
  const tls = (Deno.env.get("SMTP_SECURE") ?? "false") === "true";

  const client = new SMTPClient({
    connection: {
      hostname: host,
      port,
      tls,
      auth: { username: user, password: pass },
    },
  });

  try {
    await client.send({ from, to, subject, html });
    await client.close();
  } catch (err) {
    console.error("SMTP send failed:", err);
    try { await client.close(); } catch { /* ignore */ }
    const detail = err instanceof Error ? err.message : "Unknown SMTP error";
    return json({ error: `SMTP send failed: ${detail}` }, 502);
  }

  return json({ ok: true }, 200);
});
