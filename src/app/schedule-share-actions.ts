'use server';

import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/cached';
import { getTransporter, EMAIL_FROM } from '@/lib/mailer';
import { rateLimit } from '@/lib/rate-limit';
import { SITE_URL } from '@/lib/site';
import { revalidatePages, isValidISODate } from '@/lib/server-internals';
import { expandRecurringEvents, mergeWithExpanded, type RawCalendarEvent } from '@/lib/calendar-utils';
import { maskEmail, type BusyBlock, type BusyType } from '@/lib/schedule-share-utils';

// --- UDOSTĘPNIANIE GRAFIKU (FREE/BUSY) ---
//
// Druga strona widzi wyłącznie bloki czasu (start, koniec, praca/prywatne).
// Tytuły, stawki i portfele są szyfrowane DEK-iem właściciela i nie są nawet pobierane.

const INVITE_TTL_DAYS = 7;
const INVITES_PER_HOUR = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SchedulePartner {
  id: string;
  name: string;
  email: string;
  since: string;
}

export interface SentInvite {
  id: string;
  email: string;
  expiresAt: string;
  createdAt: string;
}

export interface ReceivedInvite {
  id: string;
  inviterName: string;
  inviterEmail: string;
  expiresAt: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Kanoniczna kolejność pary — CHECK (user_a < user_b) w bazie. */
function orderPair(a: string, b: string): { user_a: string; user_b: string } {
  return a < b ? { user_a: a, user_b: b } : { user_a: b, user_b: a };
}

async function requireUser() {
  const user = await getUser();
  if (!user?.id || !user.email) throw new Error('Sesja wygasła — zaloguj się ponownie');
  return { id: user.id, email: user.email.toLowerCase() };
}

async function findShare(userId: string, otherId: string) {
  const { user_a, user_b } = orderPair(userId, otherId);
  const { data } = await supabaseAdmin
    .from('schedule_shares')
    .select('id')
    .eq('user_a', user_a)
    .eq('user_b', user_b)
    .maybeSingle();
  return data;
}

interface ProfileRow {
  id: string;
  name: string | null;
  email: string;
}

async function getProfiles(ids: string[]): Promise<Map<string, { name: string; email: string }>> {
  if (ids.length === 0) return new Map();
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, name, email')
    .in('id', ids);
  return new Map(
    ((data || []) as ProfileRow[]).map(u => [u.id, { name: u.name || u.email.split('@')[0], email: u.email }]),
  );
}

export async function getScheduleSharing(): Promise<{
  partners: SchedulePartner[];
  sentInvites: SentInvite[];
  receivedInvites: ReceivedInvite[];
}> {
  // Bez sesji zwracamy pustki (layout i tak przekieruje na /login) — jak pozostałe gettery w actions.ts.
  const user = await getUser();
  if (!user?.id || !user.email) return { partners: [], sentInvites: [], receivedInvites: [] };
  const me = { id: user.id, email: user.email.toLowerCase() };
  const nowIso = new Date().toISOString();

  const [{ data: shares }, { data: sent }, { data: received }] = await Promise.all([
    supabaseAdmin
      .from('schedule_shares')
      .select('id, user_a, user_b, created_at')
      .or(`user_a.eq.${me.id},user_b.eq.${me.id}`)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('schedule_share_invites')
      .select('id, invitee_email, expires_at, created_at')
      .eq('inviter_id', me.id)
      .eq('status', 'pending')
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('schedule_share_invites')
      .select('id, inviter_id, expires_at')
      .eq('invitee_email', me.email)
      .eq('status', 'pending')
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: false }),
  ]);

  const partnerIds = (shares || []).map(s => (s.user_a === me.id ? s.user_b : s.user_a) as string);
  const inviterIds = (received || []).map(r => r.inviter_id as string);
  const profiles = await getProfiles(Array.from(new Set([...partnerIds, ...inviterIds])));

  const partners: SchedulePartner[] = (shares || []).map(s => {
    const pid = (s.user_a === me.id ? s.user_b : s.user_a) as string;
    const p = profiles.get(pid);
    return { id: pid, name: p?.name || 'Użytkownik', email: p?.email || '', since: s.created_at };
  });

  const sentInvites: SentInvite[] = (sent || []).map(i => ({
    id: i.id,
    email: i.invitee_email,
    expiresAt: i.expires_at,
    createdAt: i.created_at,
  }));

  const receivedInvites: ReceivedInvite[] = (received || []).map(i => {
    const p = profiles.get(i.inviter_id);
    return { id: i.id, inviterName: p?.name || 'Użytkownik', inviterEmail: p?.email || '', expiresAt: i.expires_at };
  });

  return { partners, sentInvites, receivedInvites };
}

export async function sendScheduleInvite(rawEmail: string): Promise<{ ok: true }> {
  const me = await requireUser();

  const email = (rawEmail || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) throw new Error('Nieprawidłowy adres e-mail');
  if (email === me.email) throw new Error('Nie możesz zaprosić samego siebie');

  const rl = rateLimit(`schedule-invite:${me.id}`, { limit: INVITES_PER_HOUR, windowSeconds: 3600 });
  if (!rl.success) throw new Error('Zbyt wiele zaproszeń. Spróbuj ponownie za godzinę.');

  // Jeśli adres ma konto i już jesteśmy połączeni — nie wysyłaj ponownie.
  // Gdy konta nie ma, NIE ujawniamy tego nadawcy (mail i tak wychodzi — patrz szablon).
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existingUser && (await findShare(me.id, existingUser.id))) {
    throw new Error('Już jesteście połączeni');
  }

  const { data: pending } = await supabaseAdmin
    .from('schedule_share_invites')
    .select('id')
    .eq('inviter_id', me.id)
    .eq('invitee_email', email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (pending) throw new Error('Zaproszenie do tego adresu już czeka na akceptację');

  const token = crypto.randomBytes(32).toString('base64url');
  const id = nanoid();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await supabaseAdmin.from('schedule_share_invites').insert({
    id,
    inviter_id: me.id,
    invitee_email: email,
    token_hash: hashToken(token),
    status: 'pending',
    expires_at: expiresAt.toISOString(),
  });
  if (error) {
    console.error('Error creating schedule invite:', error);
    throw new Error('Nie udało się utworzyć zaproszenia');
  }

  const profiles = await getProfiles([me.id]);
  const inviterName = profiles.get(me.id)?.name || me.email.split('@')[0];
  const link = `${SITE_URL}/calendar/invite/${token}`;

  try {
    await getTransporter().sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: `${inviterName} zaprasza Cię do wspólnego grafiku w Szpont Hub`,
      html: buildInviteEmail({ inviterName, inviterEmail: me.email, link, expiresAt }),
    });
  } catch (sendError) {
    console.error('Failed to send schedule invite:', sendError);
    await supabaseAdmin.from('schedule_share_invites').delete().eq('id', id);
    throw new Error('Nie udało się wysłać wiadomości. Spróbuj ponownie.');
  }

  revalidatePages('calendar');
  return { ok: true };
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => HTML_ESCAPES[c]);
}

function buildInviteEmail(p: { inviterName: string; inviterEmail: string; link: string; expiresAt: Date }): string {
  const name = escapeHtml(p.inviterName);
  const email = escapeHtml(p.inviterEmail);
  const until = p.expiresAt.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  return `
    <!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px;border-radius:12px 12px 0 0;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${SITE_URL}/logo-icon.png" alt="Szpont Hub" width="40" height="40" style="display:block;border-radius:8px;" />
          <div>
            <h1 style="color:#fff;margin:0;font-size:20px;">Szpont Hub</h1>
            <p style="color:#e0e7ff;margin:4px 0 0;font-size:14px;">Zaproszenie do wspólnego grafiku</p>
          </div>
        </div>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <p style="margin:0 0 16px;"><strong>${name}</strong> (${email}) chce połączyć z Tobą grafik w Szpont Hub.</p>
        <p style="margin:0 0 16px;font-size:14px;color:#4b5563;">Po akceptacji oboje zobaczycie nawzajem, <strong>kiedy jesteście zajęci, a kiedy wolni</strong>. Widoczne są tylko bloki czasu — bez tytułów wydarzeń, stawek i kwot. Połączenie można w każdej chwili zakończyć.</p>
        <div style="margin:24px 0;text-align:center;">
          <a href="${p.link}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;">Zobacz zaproszenie</a>
        </div>
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Zaproszenie jest przypisane do tego adresu e-mail — zaloguj się na konto Szpont Hub założone na ten adres. Jeśli nie masz jeszcze konta, zarejestruj się na ten sam adres i kliknij link ponownie.</p>
        <p style="margin:0;font-size:13px;color:#6b7280;">Link wygasa ${until}. Jeśli nie znasz tej osoby, po prostu zignoruj tę wiadomość.</p>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;text-align:center;">Ta wiadomość została wysłana automatycznie przez Szpont Hub.</p>
      </div>
    </body>
    </html>
  `;
}

export async function cancelScheduleInvite(inviteId: string) {
  const me = await requireUser();
  const { error } = await supabaseAdmin
    .from('schedule_share_invites')
    .update({ status: 'cancelled', responded_at: new Date().toISOString() })
    .eq('id', inviteId)
    .eq('inviter_id', me.id)
    .eq('status', 'pending');
  if (error) throw new Error('Nie udało się anulować zaproszenia');
  revalidatePages('calendar');
}

export type InviteLookup =
  | { state: 'invalid' }
  | { state: 'expired' }
  | { state: 'already_responded'; status: 'accepted' | 'declined' | 'cancelled' }
  | { state: 'wrong_account'; maskedEmail: string }
  | { state: 'self' }
  | { state: 'ok'; id: string; inviterName: string; inviterEmail: string; expiresAt: string; alreadyConnected: boolean };

/** Dane zaproszenia pod stronę /calendar/invite/[token] — tylko dla zalogowanego. */
export async function getScheduleInviteByToken(token: string): Promise<InviteLookup> {
  const me = await requireUser();
  if (!token || token.length > 128) return { state: 'invalid' };

  const { data: inv } = await supabaseAdmin
    .from('schedule_share_invites')
    .select('id, inviter_id, invitee_email, status, expires_at')
    .eq('token_hash', hashToken(token))
    .maybeSingle();
  if (!inv) return { state: 'invalid' };

  if (inv.status !== 'pending') return { state: 'already_responded', status: inv.status };
  if (new Date(inv.expires_at).getTime() < Date.now()) return { state: 'expired' };
  if (inv.inviter_id === me.id) return { state: 'self' };
  if (inv.invitee_email !== me.email) return { state: 'wrong_account', maskedEmail: maskEmail(inv.invitee_email) };

  const [profiles, share] = await Promise.all([getProfiles([inv.inviter_id]), findShare(me.id, inv.inviter_id)]);
  const p = profiles.get(inv.inviter_id);
  return {
    state: 'ok',
    id: inv.id,
    inviterName: p?.name || 'Użytkownik',
    inviterEmail: p?.email || '',
    expiresAt: inv.expires_at,
    alreadyConnected: !!share,
  };
}

async function respondToInvite(
  me: { id: string; email: string },
  match: { column: 'id' | 'token_hash'; value: string },
  accept: boolean,
) {
  const { data: inv } = await supabaseAdmin
    .from('schedule_share_invites')
    .select('id, inviter_id, invitee_email, status, expires_at')
    .eq(match.column, match.value)
    .maybeSingle();

  if (!inv || inv.status !== 'pending') throw new Error('Zaproszenie jest nieaktualne');
  if (new Date(inv.expires_at).getTime() < Date.now()) throw new Error('Zaproszenie wygasło');
  // Klucz całego mechanizmu: akceptować może tylko konto z adresem, na który poszedł mail.
  if (inv.invitee_email !== me.email) throw new Error('To zaproszenie zostało wysłane na inny adres e-mail');
  if (inv.inviter_id === me.id) throw new Error('Nie możesz zaakceptować własnego zaproszenia');

  if (accept) {
    const pair = orderPair(me.id, inv.inviter_id);
    const { error } = await supabaseAdmin
      .from('schedule_shares')
      .upsert({ id: nanoid(), ...pair }, { onConflict: 'user_a,user_b', ignoreDuplicates: true });
    if (error) {
      console.error('Error creating schedule share:', error);
      throw new Error('Nie udało się połączyć grafików');
    }
  }

  // Warunek na status chroni przed podwójną odpowiedzią (dwa kliknięcia / dwie karty).
  const { data: updated } = await supabaseAdmin
    .from('schedule_share_invites')
    .update({ status: accept ? 'accepted' : 'declined', responded_at: new Date().toISOString() })
    .eq('id', inv.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();
  if (!updated) throw new Error('Zaproszenie zostało już rozpatrzone');

  revalidatePages('calendar');
  return { partnerId: inv.inviter_id as string };
}

export async function acceptScheduleInvite(token: string) {
  const me = await requireUser();
  return respondToInvite(me, { column: 'token_hash', value: hashToken(token) }, true);
}

export async function declineScheduleInvite(token: string) {
  const me = await requireUser();
  return respondToInvite(me, { column: 'token_hash', value: hashToken(token) }, false);
}

/** Odpowiedź z poziomu listy „otrzymane zaproszenia” w aplikacji (bez tokenu — po id, z weryfikacją e-maila). */
export async function respondToScheduleInviteById(inviteId: string, accept: boolean) {
  const me = await requireUser();
  return respondToInvite(me, { column: 'id', value: inviteId }, accept);
}

export async function removeSchedulePartner(partnerId: string) {
  const me = await requireUser();
  const { user_a, user_b } = orderPair(me.id, partnerId);
  const { error } = await supabaseAdmin
    .from('schedule_shares')
    .delete()
    .eq('user_a', user_a)
    .eq('user_b', user_b);
  if (error) throw new Error('Nie udało się rozłączyć');
  revalidatePages('calendar');
}

// Rozszerza RawCalendarEvent (sygnatura indeksowa wymagana przez expandRecurringEvents).
interface BusyRow extends RawCalendarEvent {
  event_type: string | null;
  google_event_id: string | null;
}

// Tylko kolumny czasu i typu — bez title/hourly_rate/wallet_id.
const BUSY_COLUMNS = 'id, start_time, end_time, is_recurring, recurrence_rule, is_settled, is_confirmed, event_type, google_event_id';

async function loadBusyBlocks(userId: string, rangeStart: string, rangeEnd: string): Promise<BusyBlock[]> {
  const [{ data: events }, { data: recurring }] = await Promise.all([
    supabaseAdmin
      .from('calendar_events')
      .select(BUSY_COLUMNS)
      .eq('user_id', userId)
      .lte('start_time', rangeEnd)
      .gte('end_time', rangeStart),
    supabaseAdmin
      .from('calendar_events')
      .select(BUSY_COLUMNS)
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .lt('start_time', rangeEnd),
  ]);

  const expanded = expandRecurringEvents((recurring || []) as BusyRow[], rangeStart, rangeEnd);
  const all = mergeWithExpanded((events || []) as BusyRow[], expanded);

  return all
    .filter(e => e.recurrence_rule !== 'EXCLUDED')
    .map(e => ({
      id: e.id,
      start_time: e.start_time,
      end_time: e.end_time,
      event_type: (e.event_type || (e.google_event_id ? 'personal' : 'work')) as BusyType,
    }));
}

/** Bloki zajętości partnera + moje (do nałożenia) w zadanym zakresie. */
export async function getSharedWeek(partnerId: string, rangeStart: string, rangeEnd: string): Promise<{
  partner: BusyBlock[];
  mine: BusyBlock[];
}> {
  if (!isValidISODate(rangeStart) || !isValidISODate(rangeEnd)) throw new Error('Invalid date range');
  const me = await requireUser();

  // Autoryzacja: dane drugiej osoby tylko przy istniejącej, zaakceptowanej parze.
  const share = await findShare(me.id, partnerId);
  if (!share) throw new Error('Brak dostępu do grafiku tego użytkownika');

  const [partner, mine] = await Promise.all([
    loadBusyBlocks(partnerId, rangeStart, rangeEnd),
    loadBusyBlocks(me.id, rangeStart, rangeEnd),
  ]);
  return { partner, mine };
}
