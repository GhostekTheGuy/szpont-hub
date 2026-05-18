import { createClient } from '@/lib/supabase/server';
import LandingPageClient from '@/components/pages/LandingPageClient';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isLoggedIn = !!data.user;

  return <LandingPageClient isLoggedIn={isLoggedIn} />;
}
