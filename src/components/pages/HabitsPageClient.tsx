'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFinanceStore, type Habit, type HabitEntry } from '@/hooks/useFinanceStore';
import { getHabits } from '@/app/actions';
import { HabitTracker } from '@/components/HabitTracker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isThisWeek } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Props {
  initialHabits: Habit[];
  initialHabitEntries: HabitEntry[];
}

export function HabitsPageClient({ initialHabits, initialHabitEntries }: Props) {
  const { setHabits, setHabitEntries } = useFinanceStore();
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
      <div className="mb-4 space-y-3 px-4 lg:px-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nawyki</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {format(weekStart, 'd MMM', { locale: pl })} — {format(weekEnd, 'd MMM yyyy', { locale: pl })}
            </p>
          </div>

          <div className="flex items-center bg-secondary rounded-lg">
            <button
              onClick={goToPrevWeek}
              className="p-2 hover:bg-accent rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isCurrent ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Dziś
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-accent rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <HabitTracker weekStart={weekStart} />
    </>
  );
}
