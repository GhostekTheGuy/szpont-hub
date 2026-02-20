import { getHabits } from "@/app/actions";
import { HabitsPageClient } from "@/components/pages/HabitsPageClient";

export default async function HabitsPage() {
  const habitsData = await getHabits();

  return (
    <HabitsPageClient
      initialHabits={habitsData?.habits || []}
      initialHabitEntries={habitsData?.entries || []}
    />
  );
}
