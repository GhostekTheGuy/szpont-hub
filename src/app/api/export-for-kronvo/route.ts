import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/cached';
import { decryptFromCookie, decryptString, decryptNumber } from '@/lib/crypto';
import { expandRecurringEvents } from '@/lib/calendar-utils';

const ALLOWED_EMAIL = 'cezar.prusak@gmail.com';

function isAllowedOrigin(origin: string): boolean {
  const allowList = (process.env.KRONVO_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowList.includes(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return true;
    if (u.hostname.endsWith('.vercel.app')) return true;
    if (u.hostname === 'kronvo.pl' || u.hostname.endsWith('.kronvo.pl')) return true;
  } catch {
    return false;
  }
  return false;
}

function renderHtmlResponse(
  status: 'ok' | 'error',
  payloadOrError: unknown,
  targetOrigin: string,
): Response {
  const json = JSON.stringify(payloadOrError).replace(/</g, '\\u003c');
  const body = `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <title>SzpontHub → Kronvo</title>
  <style>
    body{font-family:system-ui,sans-serif;padding:2rem;max-width:32rem;margin:0 auto;color:#111}
    .ok{color:#065f46}.err{color:#991b1b}
    pre{background:#f4f4f5;padding:1rem;border-radius:8px;overflow:auto;font-size:0.8rem}
  </style>
</head>
<body>
  <p id="msg">Wysyłam dane do Kronvo…</p>
  <script>
    (function () {
      var status = ${JSON.stringify(status)};
      var body = ${json};
      var target = ${JSON.stringify(targetOrigin)};
      var msg = document.getElementById('msg');
      try {
        if (!window.opener) {
          msg.className = 'err';
          msg.textContent = 'Brak okna Kronvo. Otwórz eksport z przycisku "Import ze SzpontHub" w Kronvo.';
          return;
        }
        window.opener.postMessage(
          { type: 'szpont-hub-export', status: status, payload: status === 'ok' ? body : null, error: status === 'error' ? body : null },
          target,
        );
        msg.className = status === 'ok' ? 'ok' : 'err';
        msg.textContent = status === 'ok'
          ? 'Wysłane do Kronvo. To okno można zamknąć.'
          : 'Błąd: ' + (body && body.error ? body.error : 'nieznany');
        if (status === 'ok') setTimeout(function () { window.close(); }, 600);
      } catch (e) {
        msg.className = 'err';
        msg.textContent = 'Błąd postMessage: ' + (e && e.message ? e.message : String(e));
      }
    })();
  </script>
</body>
</html>`;
  return new Response(body, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function warsawLocalToUtcIso(localIso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(localIso);
  if (!match) return localIso;
  const [, ys, mos, ds, hs, mis, ss] = match;
  const y = Number(ys), mo = Number(mos), d = Number(ds);
  const h = Number(hs), mi = Number(mis), s = Number(ss ?? '0');

  const guessUtc = Date.UTC(y, mo - 1, d, h, mi, s);
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(guessUtc));
  const pick = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  let wh = pick('hour');
  if (wh === 24) wh = 0;
  const warsawAsUtc = Date.UTC(pick('year'), pick('month') - 1, pick('day'), wh, pick('minute'), pick('second'));
  const offsetMs = warsawAsUtc - guessUtc;
  return new Date(guessUtc - offsetMs).toISOString();
}

export async function GET(req: NextRequest) {
  const targetOrigin = req.nextUrl.searchParams.get('target_origin');
  const wantsHtml = !!targetOrigin;
  const htmlOr = (status: 'ok' | 'error', body: unknown, httpStatus = 200) => {
    if (wantsHtml && targetOrigin && isAllowedOrigin(targetOrigin)) {
      return renderHtmlResponse(status, body, targetOrigin);
    }
    return NextResponse.json(body, { status: httpStatus });
  };

  const user = await getUser();
  if (!user) return htmlOr('error', { error: 'unauthorized' }, 401);
  if (user.email !== ALLOWED_EMAIL) {
    return htmlOr('error', { error: 'forbidden' }, 403);
  }

  const cookieStore = await cookies();
  const encryptedCookie = cookieStore.get('encryption_dek')?.value;
  if (!encryptedCookie) {
    return htmlOr(
      'error',
      { error: 'no_encryption_session', hint: 'zaloguj się ponownie w przeglądarce przed eksportem' },
      400,
    );
  }
  const dek = decryptFromCookie(encryptedCookie);

  const [settledRes, recurringRes, ordersRes, clientsRes] = await Promise.all([
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_settled', true)
      .neq('event_type', 'personal'),
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_settled', true)
      .eq('is_recurring', true),
    supabaseAdmin.from('orders').select('*').eq('user_id', user.id),
    supabaseAdmin.from('clients').select('*').eq('user_id', user.id),
  ]);

  if (settledRes.error || recurringRes.error || ordersRes.error || clientsRes.error) {
    console.error('export-for-kronvo supabase errors', {
      settled: settledRes.error?.message,
      recurring: recurringRes.error?.message,
      orders: ordersRes.error?.message,
      clients: clientsRes.error?.message,
    });
  }

  const clientsDecoded = new Map<string, { name: string; email: string | null; nip: string | null }>();
  for (const c of clientsRes.data ?? []) {
    clientsDecoded.set(c.id, {
      name: decryptString(c.name, dek) || c.name,
      email: c.email ? decryptString(c.email, dek) : null,
      nip: c.nip ? decryptString(c.nip, dek) : null,
    });
  }

  const ordersDecoded = new Map<string, { title: string; clientId: string }>();
  for (const o of ordersRes.data ?? []) {
    ordersDecoded.set(o.id, {
      title: decryptString(o.title, dek) || o.title,
      clientId: o.client_id,
    });
  }

  const expandFrom = '2020-01-01T00:00:00';
  const expandTo = new Date().toISOString().slice(0, 19);
  const recurringSource = (recurringRes.data ?? []).filter(
    (e) => e.recurrence_rule !== 'EXCLUDED' && e.event_type !== 'personal',
  );
  const expanded = expandRecurringEvents(recurringSource, expandFrom, expandTo);

  const oneShot = (settledRes.data ?? []).filter((e) => !e.is_recurring);
  const combined = [...oneShot, ...expanded];

  type RawEvent = (typeof oneShot)[number];
  const entries = combined.map((e: RawEvent) => {
    const order = e.order_id ? ordersDecoded.get(e.order_id) : null;
    const client = order?.clientId ? clientsDecoded.get(order.clientId) : null;
    return {
      startTime: warsawLocalToUtcIso(e.start_time),
      endTime: warsawLocalToUtcIso(e.end_time),
      hourlyRatePln: e.hourly_rate ? decryptNumber(e.hourly_rate, dek) : 0,
      title: decryptString(e.title, dek) || '',
      orderTitle: order?.title ?? null,
      clientName: client?.name ?? null,
      clientNip: client?.nip ?? null,
      clientEmail: client?.email ?? null,
      eventType: (e.event_type as 'work' | 'personal' | undefined) ?? 'work',
    };
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    userEmail: user.email,
    entriesCount: entries.length,
    entries,
  };

  return htmlOr('ok', payload);
}
