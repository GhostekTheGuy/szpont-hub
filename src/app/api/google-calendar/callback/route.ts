import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { getUser } from '@/lib/supabase/cached';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { decryptFromCookie, encryptString } from '@/lib/crypto';
import { exchangeCode, listCalendars } from '@/lib/google-calendar';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/calendar?google_error=access_denied', request.url));
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const cookieStore = await cookies();
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

    // Get user's Google email
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: tokens.access_token });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleEmail = userInfo.data.email || 'unknown';

    // Encrypt tokens
    const encryptedAccessToken = encryptString(tokens.access_token, dek);
    const encryptedRefreshToken = encryptString(tokens.refresh_token, dek);

    // Upsert connection
    const connectionId = nanoid();
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

    // Get the actual connection ID (may differ if upserted)
    const { data: connection } = await supabaseAdmin
      .from('google_calendar_connections')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const actualConnectionId = connection?.id || connectionId;

    // Fetch calendars and save as mappings
    const calendars = await listCalendars(tokens.access_token, tokens.refresh_token);

    for (const cal of calendars) {
      await supabaseAdmin
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
    }

    return NextResponse.redirect(new URL('/calendar?google_connected=true', request.url));
  } catch (err) {
    console.error('Google Calendar callback error:', err);
    return NextResponse.redirect(new URL('/calendar?google_error=callback_failed', request.url));
  }
}
