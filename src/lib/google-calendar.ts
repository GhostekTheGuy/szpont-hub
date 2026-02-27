import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function createOAuth2Client(accessToken: string, refreshToken: string) {
  const client = getOAuth2Client();
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return client;
}

export function getAuthUrl(state?: string) {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  });
}

export async function exchangeCode(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function listCalendars(accessToken: string, refreshToken: string) {
  const client = createOAuth2Client(accessToken, refreshToken);
  const calendar = google.calendar({ version: 'v3', auth: client });
  const res = await calendar.calendarList.list();
  return (res.data.items || []).map(c => ({
    id: c.id!,
    summary: c.summary || c.id!,
    primary: c.primary || false,
    backgroundColor: c.backgroundColor || null,
  }));
}

interface FetchEventsOptions {
  syncToken?: string | null;
  timeMin?: string;
  timeMax?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: string;    // ISO datetime
  end: string;      // ISO datetime
  status: string;   // 'confirmed' | 'tentative' | 'cancelled'
}

export interface FetchEventsResult {
  events: GoogleCalendarEvent[];
  nextSyncToken: string | null;
}

export async function fetchEvents(
  accessToken: string,
  refreshToken: string,
  calendarId: string,
  options: FetchEventsOptions = {}
): Promise<FetchEventsResult> {
  const client = createOAuth2Client(accessToken, refreshToken);
  const calendar = google.calendar({ version: 'v3', auth: client });

  const allEvents: GoogleCalendarEvent[] = [];
  let pageToken: string | undefined;
  let nextSyncToken: string | null = null;

  try {
    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        calendarId,
        singleEvents: true,
        maxResults: 250,
        pageToken,
      };

      if (options.syncToken) {
        params.syncToken = options.syncToken;
      } else {
        if (options.timeMin) params.timeMin = options.timeMin;
        if (options.timeMax) params.timeMax = options.timeMax;
      }

      const res = await calendar.events.list(params);
      const items = res.data.items || [];

      for (const item of items) {
        // Skip all-day events (not billable)
        if (!item.start?.dateTime || !item.end?.dateTime) continue;

        allEvents.push({
          id: item.id!,
          summary: item.summary || '(bez tytułu)',
          start: item.start.dateTime,
          end: item.end.dateTime,
          status: item.status || 'confirmed',
        });
      }

      pageToken = res.data.nextPageToken || undefined;
      if (res.data.nextSyncToken) {
        nextSyncToken = res.data.nextSyncToken;
      }
    } while (pageToken);
  } catch (error: unknown) {
    // SyncToken 410 Gone → need full re-sync
    const err = error as { code?: number };
    if (err.code === 410) {
      // Fallback to full sync with sensible time bounds
      const now = new Date();
      const defaultMin = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, 1)).toISOString();
      const defaultMax = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 4, 0, 23, 59, 59, 999)).toISOString();
      return fetchEvents(accessToken, refreshToken, calendarId, {
        timeMin: options.timeMin || defaultMin,
        timeMax: options.timeMax || defaultMax,
      });
    }
    throw error;
  }

  return { events: allEvents, nextSyncToken };
}

export async function getRefreshedTokens(accessToken: string, refreshToken: string) {
  const client = createOAuth2Client(accessToken, refreshToken);

  let newAccessToken = accessToken;
  let newRefreshToken = refreshToken;
  let newExpiry: Date | null = null;

  client.on('tokens', (tokens) => {
    if (tokens.access_token) newAccessToken = tokens.access_token;
    if (tokens.refresh_token) newRefreshToken = tokens.refresh_token;
    if (tokens.expiry_date) newExpiry = new Date(tokens.expiry_date);
  });

  // Force token refresh
  try {
    await client.getAccessToken();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('invalid_grant') || message.includes('Token has been expired or revoked')) {
      throw new Error('REVOKED: Google token has been revoked. Please reconnect your account.');
    }
    throw err;
  }

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiry: newExpiry as Date | null,
    changed: newAccessToken !== accessToken || newRefreshToken !== refreshToken,
  };
}
