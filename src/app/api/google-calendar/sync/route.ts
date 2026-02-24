import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { getUser } from '@/lib/supabase/cached';
import { isProUser } from '@/app/actions';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { decryptFromCookie, encryptString, decryptString, encryptNumber } from '@/lib/crypto';
import { fetchEvents, getRefreshedTokens } from '@/lib/google-calendar';

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isProUser())) {
    return NextResponse.json({ error: 'Wymagany Plan Pro' }, { status: 403 });
  }

  const cookieStore = await cookies();
  const encryptedCookie = cookieStore.get('encryption_dek')?.value;
  if (!encryptedCookie) {
    return NextResponse.json({ error: 'Encryption session expired' }, { status: 401 });
  }

  const dek = decryptFromCookie(encryptedCookie);

  // Get connection
  const { data: connection, error: connError } = await supabaseAdmin
    .from('google_calendar_connections')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (connError || !connection) {
    return NextResponse.json({ error: 'No Google Calendar connection' }, { status: 404 });
  }

  // Decrypt tokens
  let accessToken = decryptString(connection.access_token, dek) || '';
  let refreshToken = decryptString(connection.refresh_token, dek) || '';

  // Refresh tokens if needed
  try {
    const refreshed = await getRefreshedTokens(accessToken, refreshToken);
    if (refreshed.changed) {
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;

      // Re-encrypt and save new tokens
      await supabaseAdmin
        .from('google_calendar_connections')
        .update({
          access_token: encryptString(refreshed.accessToken, dek),
          refresh_token: encryptString(refreshed.refreshToken, dek),
          token_expiry: refreshed.expiry?.toISOString() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);
    }
  } catch (err) {
    console.error('Token refresh failed:', err);
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
  }

  // Get enabled mappings
  const { data: mappings } = await supabaseAdmin
    .from('google_calendar_mappings')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_enabled', true);

  console.log(`[Google Sync] Found ${mappings?.length || 0} enabled mappings`);

  if (!mappings || mappings.length === 0) {
    return NextResponse.json({ synced: 0, message: 'No enabled calendars' });
  }

  let totalSynced = 0;

  for (const mapping of mappings) {
    console.log(`[Google Sync] Syncing calendar, syncToken: ${mapping.sync_token ? 'yes' : 'no'}`);
    try {
      // Use syncToken for incremental sync, or time range for full sync
      const now = new Date();
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const threeMonthsAhead = new Date(now);
      threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

      const result = await fetchEvents(accessToken, refreshToken, mapping.google_calendar_id, {
        syncToken: mapping.sync_token || null,
        timeMin: mapping.sync_token ? undefined : threeMonthsAgo.toISOString(),
        timeMax: mapping.sync_token ? undefined : threeMonthsAhead.toISOString(),
      });

      // Default hourly rate from mapping
      const defaultRate = mapping.hourly_rate
        ? encryptNumber(0, dek) // placeholder - we keep existing rate on upsert
        : encryptNumber(0, dek);

      console.log(`[Google Sync] Fetched ${result.events.length} events`);

      for (const event of result.events) {
        if (event.status === 'cancelled') {
          // Delete cancelled events
          await supabaseAdmin
            .from('calendar_events')
            .delete()
            .eq('user_id', user.id)
            .eq('google_event_id', event.id);
          continue;
        }

        // Check if event already exists
        const { data: existing } = await supabaseAdmin
          .from('calendar_events')
          .select('id')
          .eq('user_id', user.id)
          .eq('google_event_id', event.id)
          .single();

        if (existing) {
          // Update title and times, preserve wallet/rate
          await supabaseAdmin
            .from('calendar_events')
            .update({
              title: encryptString(event.summary, dek),
              start_time: event.start,
              end_time: event.end,
            })
            .eq('id', existing.id);
        } else {
          // Insert new event
          await supabaseAdmin
            .from('calendar_events')
            .insert({
              id: nanoid(),
              user_id: user.id,
              title: encryptString(event.summary, dek),
              wallet_id: mapping.wallet_id || null,
              hourly_rate: mapping.hourly_rate || defaultRate,
              start_time: event.start,
              end_time: event.end,
              is_recurring: false,
              recurrence_rule: null,
              is_settled: false,
              is_confirmed: false,
              event_type: 'work',
              google_event_id: event.id,
              google_calendar_id: mapping.google_calendar_id,
              created_at: new Date().toISOString(),
            });
        }
        totalSynced++;
      }

      // Save sync token and last synced time
      await supabaseAdmin
        .from('google_calendar_mappings')
        .update({
          sync_token: result.nextSyncToken || mapping.sync_token,
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', mapping.id);

    } catch (err) {
      console.error('[Google Sync] Sync failed for calendar:', err);
    }
  }

  return NextResponse.json({ synced: totalSynced });
}
