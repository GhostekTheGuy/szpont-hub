import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { getUser } from '@/lib/supabase/cached';
import { getAuthUrl } from '@/lib/google-calendar';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nonce = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  const url = getAuthUrl(nonce);
  return NextResponse.redirect(url);
}
