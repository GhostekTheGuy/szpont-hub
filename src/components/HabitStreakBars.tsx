'use client';

import type { Habit, HabitEntry } from '@/hooks/useFinanceStore';
import { ICON_OPTIONS } from '@/components/HabitModal';
import { Flame } from 'lucide-react';

interface Props {
  habits: Habit[];
  entries: HabitEntry[];
}

export function HabitStreakBars({ habits, entries }: Props) {
  if (habits.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
        Brak nawyków
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streaks = habits.map(habit => {
    let streak = 0;
    const d = new Date(today);

    // Count consecutive days backwards from today
    while (true) {
      const dateStr = d.toISOString().split('T')[0];
      const completed = entries.some(
        e => e.habit_id === habit.id && e.date === dateStr && e.completed
      );
      if (!completed) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }

    return { habit, streak };
  });

  const maxStreak = Math.max(...streaks.map(s => s.streak), 1);

  const getIconComponent = (iconName: string) => {
    const found = ICON_OPTIONS.find(o => o.name === iconName);
    return found ? found.Icon : ICON_OPTIONS[0].Icon;
  };

  return (
    <div className="space-y-3">
      {streaks.map(({ habit, streak }) => {
        const IconComp = getIconComponent(habit.icon);
        const pct = maxStreak > 0 ? (streak / maxStreak) * 100 : 0;

        return (
          <div key={habit.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: habit.color + '20', color: habit.color }}
                >
                  <IconComp className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium text-foreground truncate">
                  {habit.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {streak > 0 && <Flame className="w-3 h-3" style={{ color: habit.color }} />}
                <span className="text-xs font-semibold tabular-nums" style={{ color: streak > 0 ? habit.color : undefined }}>
                  {streak}d
                </span>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: habit.color,
                  opacity: streak > 0 ? 1 : 0.3,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
