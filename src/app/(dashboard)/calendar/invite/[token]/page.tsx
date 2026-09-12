import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/cached';
import { getScheduleInviteByToken } from '@/app/schedule-share-actions';
import { InviteAcceptCard } from '@/components/InviteAcceptCard';

export const metadata: Metadata = {
  title: 'Zaproszenie do wspólnego grafiku',
  robots: { index: false, follow: false },
};

interface Props {
  // Next 16: params jest asynchroniczne.
  params: Promise<{ token: string }>;
}

export default async function ScheduleInvitePage({ params }: Props) {
  const { token } = await params;

  // Middleware przekierowuje niezalogowanych z zachowaniem ?next=, ale gdyby sesja
  // wygasła między middleware a renderem — wróć na login z tym samym celem.
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/calendar/invite/${token}`)}`);

  const lookup = await getScheduleInviteByToken(token);

  return (
    <div className="px-4 lg:px-0 max-w-lg mx-auto">
      <InviteAcceptCard token={token} lookup={lookup} />
    </div>
  );
}
