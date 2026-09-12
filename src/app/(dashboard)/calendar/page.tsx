import { getCalendarEvents, getWallets, getGoogleCalendarConnection, getClients, getOrders } from "@/app/actions";
import { CalendarPageClient } from "@/components/pages/CalendarPageClient";
import { ProjectsPageClient } from "@/components/pages/ProjectsPageClient";
import { WorkPageShell, type View } from "@/components/pages/WorkPageShell";
import { TeamPageClient } from "@/components/pages/TeamPageClient";
import { getScheduleSharing } from "@/app/schedule-share-actions";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { formatLocalDateTime } from "@/lib/calendar-utils";

interface Props {
  // Next 16: searchParams jest asynchroniczne.
  searchParams: Promise<{ view?: string; partner?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialView: View = params.view === 'team' ? 'team' : params.view === 'projects' ? 'projects' : 'calendar';
  const now = new Date();
  const rangeStart = formatLocalDateTime(startOfWeek(startOfMonth(now), { weekStartsOn: 1 }));
  const rangeEnd = formatLocalDateTime(endOfWeek(endOfMonth(now), { weekStartsOn: 1 }));

  const [calendarData, walletsData, googleConnection, clientsData, ordersData, sharing] = await Promise.all([
    getCalendarEvents(rangeStart, rangeEnd),
    getWallets(),
    getGoogleCalendarConnection(),
    getClients(),
    getOrders(),
    getScheduleSharing(),
  ]);

  if (!calendarData || !walletsData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground text-center">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <WorkPageShell
      initialView={initialView}
      pendingInvites={sharing.receivedInvites.length}
      calendarView={
        <CalendarPageClient
          initialEvents={calendarData.events}
          initialWallets={walletsData.wallets}
          initialOrders={ordersData.orders}
          googleConnection={googleConnection}
        />
      }
      projectsView={
        <ProjectsPageClient
          initialClients={clientsData.clients}
          initialOrders={ordersData.orders}
          initialWallets={walletsData.wallets}
        />
      }
      teamView={
        <TeamPageClient
          initialPartners={sharing.partners}
          initialSentInvites={sharing.sentInvites}
          initialReceivedInvites={sharing.receivedInvites}
          initialPartnerId={params.partner ?? null}
        />
      }
    />
  );
}
