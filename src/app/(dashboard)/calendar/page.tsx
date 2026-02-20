import { getCalendarEvents, getWalletsWithTransactions, getHabits } from "@/app/actions";
import { CalendarPageClient } from "@/components/pages/CalendarPageClient";
import { startOfWeek, endOfWeek } from "date-fns";

export default async function CalendarPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

  const [calendarData, walletsData, habitsData] = await Promise.all([
    getCalendarEvents(weekStart, weekEnd),
    getWalletsWithTransactions(),
    getHabits(),
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
      initialHabits={habitsData?.habits || []}
      initialHabitEntries={habitsData?.entries || []}
    />
  );
}
