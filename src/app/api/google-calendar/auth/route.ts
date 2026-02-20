import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/cached';
import { getAuthUrl } from '@/lib/google-calendar';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = getAuthUrl(user.id);
  return NextResponse.redirect(url);
}
