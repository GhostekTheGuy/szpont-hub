import { getCalendarEvents, getWallets, getGoogleCalendarConnection, getClients, getOrders } from "@/app/actions";
import { CalendarPageClient } from "@/components/pages/CalendarPageClient";
import { ProjectsPageClient } from "@/components/pages/ProjectsPageClient";
import { WorkPageShell } from "@/components/pages/WorkPageShell";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { formatLocalDateTime } from "@/lib/calendar-utils";

export default async function CalendarPage() {
  const now = new Date();
  const rangeStart = formatLocalDateTime(startOfWeek(startOfMonth(now), { weekStartsOn: 1 }));
  const rangeEnd = formatLocalDateTime(endOfWeek(endOfMonth(now), { weekStartsOn: 1 }));

  const [calendarData, walletsData, googleConnection, clientsData, ordersData] = await Promise.all([
    getCalendarEvents(rangeStart, rangeEnd),
    getWallets(),
    getGoogleCalendarConnection(),
    getClients(),
    getOrders(),
  ]);

  if (!calendarData || !walletsData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground text-center">Ladowanie danych...</div>
      </div>
    );
  }

  return (
    <WorkPageShell
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
    />
  );
}
