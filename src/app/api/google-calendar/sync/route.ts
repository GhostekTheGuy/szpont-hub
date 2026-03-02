import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { getUser } from '@/lib/supabase/cached';
import { isProUser } from '@/app/actions';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { decryptFromCookie, encryptString, decryptString, encryptNumber } from '@/lib/crypto';
import { fetchEvents, getRefreshedTokens } from '@/lib/google-calendar';
import { rateLimit } from '@/lib/rate-limit';

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = rateLimit(`google-sync:${user.id}`, { limit: 5, windowSeconds: 300 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!(await isProUser())) {
    return NextResponse.json({ error: 'Wymagany Plan Pro' }, { status: 403 });
  }

  const cookieStore = await cookies();
  const encryptedCookie = cookieStore.get('encryption_dek')?.value;
  if (!encryptedCookie) {
    return NextResponse.json({ error: 'encryption_expired' }, { status: 401 });
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
      const { error: tokenSaveError } = await supabaseAdmin
        .from('google_calendar_connections')
        .update({
          access_token: encryptString(refreshed.accessToken, dek),
          refresh_token: encryptString(refreshed.refreshToken, dek),
          token_expiry: refreshed.expiry?.toISOString() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);

      if (tokenSaveError) {
        console.error('[Google Sync] Failed to save refreshed tokens:', tokenSaveError);
        return NextResponse.json({ error: 'Failed to save refreshed tokens' }, { status: 500 });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith('REVOKED:')) {
      console.error('[Google Sync] Token revoked:', message);
      return NextResponse.json({ error: 'RECONNECT_REQUIRED' }, { status: 401 });
    }
    console.error('[Google Sync] Token refresh failed:', err);
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
    return NextResponse.json({ synced: 0, errors: [], message: 'No enabled calendars' });
  }

  let totalSynced = 0;
  const errors: Array<{ calendarId: string; error: string }> = [];

  for (const mapping of mappings) {
    console.log(`[Google Sync] Syncing calendar, syncToken: ${mapping.sync_token ? 'yes' : 'no'}`);

    const syncCalendar = async (): Promise<boolean> => {
      // Use syncToken for incremental sync, or time range for full sync
      const now = new Date();
      const threeMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, 1));
      const threeMonthsAhead = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 4, 0, 23, 59, 59, 999));

      const result = await fetchEvents(accessToken, refreshToken, mapping.google_calendar_id, {
        syncToken: mapping.sync_token || null,
        timeMin: mapping.sync_token ? undefined : threeMonthsAgo.toISOString(),
        timeMax: mapping.sync_token ? undefined : threeMonthsAhead.toISOString(),
      });

      // Default hourly rate: use mapping rate if set, otherwise encrypted 0
      const defaultRate = mapping.hourly_rate || encryptNumber(0, dek);

      console.log(`[Google Sync] Fetched ${result.events.length} events`);

      // Separate cancelled vs active events
      const cancelledIds = result.events
        .filter(e => e.status === 'cancelled')
        .map(e => e.id);
      const activeEvents = result.events.filter(e => e.status !== 'cancelled');

      // Batch delete cancelled events
      if (cancelledIds.length > 0) {
        const { error: deleteError } = await supabaseAdmin
          .from('calendar_events')
          .delete()
          .eq('user_id', user.id)
          .in('google_event_id', cancelledIds);

        if (deleteError) {
          console.error('[Google Sync] Failed to delete cancelled events:', deleteError);
        }
      }

      if (activeEvents.length > 0) {
        // Batch check which events already exist
        const googleEventIds = activeEvents.map(e => e.id);
        const { data: existingEvents } = await supabaseAdmin
          .from('calendar_events')
          .select('id, google_event_id')
          .eq('user_id', user.id)
          .in('google_event_id', googleEventIds);

        const existingMap = new Map(
          (existingEvents || []).map(e => [e.google_event_id, e.id])
        );

        const toInsert: Array<Record<string, unknown>> = [];

        for (const event of activeEvents) {
          if (existingMap.has(event.id)) {
            // Update existing — must be individual (different fields per row)
            const { error: updateError } = await supabaseAdmin
              .from('calendar_events')
              .update({
                title: encryptString(event.summary, dek),
                start_time: event.start,
                end_time: event.end,
              })
              .eq('id', existingMap.get(event.id)!);

            if (updateError) {
              console.error('[Google Sync] Failed to update event:', updateError);
            }
          } else {
            toInsert.push({
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
        }

        // Batch insert new events
        if (toInsert.length > 0) {
          const { error: insertError } = await supabaseAdmin
            .from('calendar_events')
            .insert(toInsert);

          if (insertError) {
            console.error('[Google Sync] Failed to insert events:', insertError);
          }
        }

        totalSynced += activeEvents.length;
      }

      // Save sync token and last synced time
      const { error: syncTokenError } = await supabaseAdmin
        .from('google_calendar_mappings')
        .update({
          sync_token: result.nextSyncToken || mapping.sync_token,
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', mapping.id);

      if (syncTokenError) {
        console.error('[Google Sync] Failed to save sync token:', syncTokenError);
      }

      return true;
    };

    // Try with 1 retry for transient Google API errors
    try {
      await syncCalendar();
    } catch (err) {
      console.error('[Google Sync] First attempt failed for calendar:', err);
      try {
        await syncCalendar();
      } catch (retryErr) {
        console.error('[Google Sync] Retry also failed for calendar:', retryErr);
        errors.push({
          calendarId: mapping.google_calendar_id,
          error: retryErr instanceof Error ? retryErr.message : 'Sync failed',
        });
      }
    }
  }

  return NextResponse.json({ synced: totalSynced, errors });
}
