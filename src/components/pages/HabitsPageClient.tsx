'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFinanceStore, type Habit, type HabitEntry } from '@/hooks/useFinanceStore';
import { getHabits } from '@/app/actions';
import { HabitTracker } from '@/components/HabitTracker';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isThisWeek } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Props {
  initialHabits: Habit[];
  initialHabitEntries: HabitEntry[];
}

export function HabitsPageClient({ initialHabits, initialHabitEntries }: Props) {
  const setHabits = useFinanceStore(s => s.setHabits);
  const setHabitEntries = useFinanceStore(s => s.setHabitEntries);
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  useEffect(() => {
    setHabits(initialHabits);
    setHabitEntries(initialHabitEntries);
  }, [initialHabits, initialHabitEntries, setHabits, setHabitEntries]);

  const loadHabits = useCallback(async () => {
    try {
      const data = await getHabits();
      if (data) {
        setHabits(data.habits);
        setHabitEntries(data.entries);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  }, [setHabits, setHabitEntries]);

  const goToPrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    loadHabits();
  };

  const isCurrent = isThisWeek(currentDate, { weekStartsOn: 1 });

  return (
    <>
      {/* Header */}
      <div className="mb-4 px-4 lg:px-0">
        <h1 className="text-3xl font-bold text-foreground">Nawyki</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(weekStart, 'd MMM', { locale: pl })} — {format(weekEnd, 'd MMM yyyy', { locale: pl })}
        </p>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-0">
        <HabitTracker
          weekStart={weekStart}
          onPrevWeek={goToPrevWeek}
          onNextWeek={goToNextWeek}
          onToday={goToToday}
          isCurrentWeek={isCurrent}
        />
      </div>
    </>
  );
}
