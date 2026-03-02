import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { getUser } from '@/lib/supabase/cached';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { decryptFromCookie, encryptString } from '@/lib/crypto';
import { exchangeCode, listCalendars } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/calendar?google_error=access_denied', request.url));
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const cookieStore = await cookies();

  // Verify OAuth state nonce to prevent CSRF
  const savedState = cookieStore.get('oauth_state')?.value;
  cookieStore.delete('oauth_state');
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL('/calendar?google_error=invalid_state', request.url));
  }

  const encryptedCookie = cookieStore.get('encryption_dek')?.value;
  if (!encryptedCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const dek = decryptFromCookie(encryptedCookie);

  try {
    // Exchange code for tokens
    const tokens = await exchangeCode(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(new URL('/calendar?google_error=no_tokens', request.url));
    }

    // Get user's Google email via tokeninfo
    let googleEmail = 'unknown';
    try {
      const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        googleEmail = data.email || 'unknown';
      }
    } catch {
      // fallback — email stays 'unknown'
    }

    // Encrypt tokens
    const encryptedAccessToken = encryptString(tokens.access_token, dek);
    const encryptedRefreshToken = encryptString(tokens.refresh_token, dek);

    // Check if connection already exists (preserve ID to avoid orphaning mappings)
    const { data: existingConn } = await supabaseAdmin
      .from('google_calendar_connections')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const connectionId = existingConn?.id || nanoid();

    const { error: connError } = await supabaseAdmin
      .from('google_calendar_connections')
      .upsert({
        id: connectionId,
        user_id: user.id,
        google_email: googleEmail,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (connError) {
      console.error('Error saving Google connection:', connError);
      return NextResponse.redirect(new URL('/calendar?google_error=save_failed', request.url));
    }

    const actualConnectionId = connectionId;

    // Fetch calendars and save as mappings
    const calendars = await listCalendars(tokens.access_token, tokens.refresh_token);

    for (const cal of calendars) {
      const { error: mappingError } = await supabaseAdmin
        .from('google_calendar_mappings')
        .upsert({
          id: nanoid(),
          connection_id: actualConnectionId,
          user_id: user.id,
          google_calendar_id: cal.id,
          calendar_name: cal.summary,
          is_enabled: cal.primary || false,
        }, {
          onConflict: 'user_id,google_calendar_id',
          ignoreDuplicates: false,
        });

      if (mappingError) {
        console.error(`Error saving calendar mapping for ${cal.id}:`, mappingError);
      }
    }

    return NextResponse.redirect(new URL('/calendar?google_connected=true', request.url));
  } catch (err) {
    console.error('Google Calendar callback error:', err);
    return NextResponse.redirect(new URL('/calendar?google_error=callback_failed', request.url));
  }
}
