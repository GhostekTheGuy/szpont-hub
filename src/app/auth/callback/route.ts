import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Akceptuj wyłącznie ścieżki wewnętrzne — zapobiega open redirect
  // (np. next=@evil.com albo //evil.com wyprowadziłoby użytkownika na obcą domenę).
  const rawNext = searchParams.get('next') || '/';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Coś poszło nie tak — wróć na login
  return NextResponse.redirect(`${origin}/login`);
}
