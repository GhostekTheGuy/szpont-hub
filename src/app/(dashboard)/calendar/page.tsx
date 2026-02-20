import { getCalendarEvents, getWalletsWithTransactions } from "@/app/actions";
import { CalendarPageClient } from "@/components/pages/CalendarPageClient";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default async function CalendarPage() {
  const now = new Date();
  const rangeStart = startOfWeek(startOfMonth(now), { weekStartsOn: 1 }).toISOString();
  const rangeEnd = endOfWeek(endOfMonth(now), { weekStartsOn: 1 }).toISOString();

  const [calendarData, walletsData] = await Promise.all([
    getCalendarEvents(rangeStart, rangeEnd),
    getWalletsWithTransactions(),
  ]);

  if (!calendarData || !walletsData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground text-center">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <CalendarPageClient
      initialEvents={calendarData.events}
      initialWallets={walletsData.wallets}
    />
  );
}
