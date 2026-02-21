'use client';

import { useState, useCallback, useMemo } from 'react';
import { useFinanceStore, type Habit, type HabitEntry } from '@/hooks/useFinanceStore';
import { toggleHabitEntry } from '@/app/actions';
import { HabitModal, ICON_OPTIONS } from '@/components/HabitModal';
import { HabitRadarChart } from '@/components/HabitRadarChart';
import { Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Props {
  weekStart: Date;
}

type ViewMode = 'today' | 'weekly' | 'overall';

function getFrequencyLabel(frequency: string): string {
  switch (frequency) {
    case 'daily': return 'Everyday';
    case 'weekdays': return 'Weekdays';
    case '5_per_week': return '5 days per week';
    case '4_per_week': return '4 days per week';
    case '3_per_week': return '3 days per week';
    case '2_per_week': return '2 days per week';
    default: return 'Everyday';
  }
}

export function HabitTracker({ weekStart }: Props) {
  const { habits, habitEntries, setHabitEntries } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showRadar, setShowRadar] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  // 7 dni tygodnia
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date().toISOString().split('T')[0];

  const isCompleted = useCallback((habitId: string, date: string) => {
    return habitEntries.some(e => e.habit_id === habitId && e.date === date && e.completed);
  }, [habitEntries]);

  const handleToggle = useCallback(async (habitId: string, date: string) => {
    const entries = useFinanceStore.getState().habitEntries;
    const current = entries.some(e => e.habit_id === habitId && e.date === date && e.completed);
    const newCompleted = !current;

    // Optimistic update
    if (newCompleted) {
      setHabitEntries([
        ...useFinanceStore.getState().habitEntries,
        { id: `temp-${habitId}-${date}`, habit_id: habitId, date, completed: true },
      ]);
    } else {
      setHabitEntries(
        useFinanceStore.getState().habitEntries.filter(
          e => !(e.habit_id === habitId && e.date === date)
        )
      );
    }

    try {
      await toggleHabitEntry(habitId, date, newCompleted);
    } catch {
      // Revert
      if (newCompleted) {
        setHabitEntries(
          useFinanceStore.getState().habitEntries.filter(
            e => !(e.habit_id === habitId && e.date === date && e.id.startsWith('temp-'))
          )
        );
      } else {
        setHabitEntries([
          ...useFinanceStore.getState().habitEntries,
          { id: `revert-${habitId}-${date}`, habit_id: habitId, date, completed: true },
        ]);
      }
    }
  }, [setHabitEntries]);

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  const getIconComponent = (iconName: string) => {
    const found = ICON_OPTIONS.find(o => o.name === iconName);
    return found ? found.Icon : ICON_OPTIONS[0].Icon;
  };

  // Overall view: last 182 days (26 weeks)
  const overallDays = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const result: Date[] = [];
    for (let i = 181; i >= 0; i--) {
      result.push(subDays(todayDate, i));
    }
    return result;
  }, []);

  // Group overall days by week (columns) with day-of-week rows
  const overallGrid = useMemo(() => {
    // Create a 7×26 grid: rows = day of week (Mon=0..Sun=6), cols = weeks
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (const day of overallDays) {
      const dow = (day.getDay() + 6) % 7; // Mon=0, Sun=6
      if (dow === 0 && currentWeek.length > 0) {
        // Pad the previous week if needed
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
        currentWeek = [];
      }
      // Pad start of first week
      while (currentWeek.length < dow) currentWeek.push(null);
      currentWeek.push(day);
    }
    // Push last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return weeks;
  }, [overallDays]);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 w-fit">
        {(['today', 'weekly', 'overall'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === mode
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {mode === 'today' ? 'Today' : mode === 'weekly' ? 'Weekly' : 'Overall'}
          </button>
        ))}
      </div>

      {/* ===== TODAY VIEW ===== */}
      {viewMode === 'today' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {habits.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="mb-2">Brak nawyków</p>
              <p className="text-sm">Kliknij + aby dodać pierwszy nawyk</p>
            </div>
          ) : (
            habits.map(habit => {
              const IconComp = getIconComponent(habit.icon);
              const completed = isCompleted(habit.id, today);
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors"
                >
                  <button
                    onClick={() => handleEditHabit(habit)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: habit.color + '20', color: habit.color }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground block truncate">
                        {habit.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getFrequencyLabel(habit.frequency)}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleToggle(habit.id, today)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      completed
                        ? 'scale-100'
                        : 'border-2 border-border hover:border-foreground/30 scale-95 hover:scale-100'
                    }`}
                    style={completed ? { backgroundColor: habit.color, color: 'white' } : undefined}
                  >
                    {completed && <Check className="w-4 h-4" strokeWidth={3} />}
                  </button>
                </div>
              );
            })
          )}

          {/* Add button */}
          <button
            onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
            className="w-full p-3 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Dodaj nawyk</span>
          </button>
        </div>
      )}

      {/* ===== WEEKLY VIEW ===== */}
      {viewMode === 'weekly' && (
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
              <p className="mb-2">Brak nawyków</p>
              <p className="text-sm">Kliknij + aby dodać pierwszy nawyk</p>
            </div>
          ) : (
            habits.map(habit => {
              const IconComp = getIconComponent(habit.icon);
              return (
                <div key={habit.id} className="bg-card border border-border rounded-xl p-4">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: habit.color + '20', color: habit.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{habit.name}</span>
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {getFrequencyLabel(habit.frequency)}
                    </span>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-border mb-3" />

                  {/* 7 day checkboxes */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const isToday = dateStr === today;
                      const completed = isCompleted(habit.id, dateStr);
                      const isSunday = idx === 6;
                      return (
                        <div key={dateStr} className="flex flex-col items-center gap-1.5">
                          <span className={`text-xs font-medium ${
                            isSunday ? 'text-primary' : isToday ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {format(day, 'EEEEE', { locale: pl }).toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleToggle(habit.id, dateStr)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              completed
                                ? 'scale-100'
                                : 'border-2 border-border hover:border-foreground/30 scale-95 hover:scale-100'
                            }`}
                            style={completed ? { backgroundColor: habit.color, color: 'white' } : undefined}
                          >
                            {completed && <Check className="w-4 h-4" strokeWidth={3} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Add button */}
          <button
            onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
            className="w-full p-3 bg-card border border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Dodaj nawyk</span>
          </button>
        </div>
      )}

      {/* ===== OVERALL VIEW (dot matrix) ===== */}
      {viewMode === 'overall' && (
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
              <p className="mb-2">Brak nawyków</p>
              <p className="text-sm">Kliknij + aby dodać pierwszy nawyk</p>
            </div>
          ) : (
            habits.map(habit => {
              const IconComp = getIconComponent(habit.icon);
              return (
                <div key={habit.id} className="bg-card border border-border rounded-xl p-4">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: habit.color + '20', color: habit.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{habit.name}</span>
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {getFrequencyLabel(habit.frequency)}
                    </span>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-border mb-3" />

                  {/* Dot matrix */}
                  <div className="overflow-x-auto">
                    <div
                      className="grid w-full"
                      style={{
                        gridTemplateColumns: `16px repeat(${overallGrid.length}, 1fr)`,
                        gap: '3px',
                      }}
                    >
                      {/* Render row by row (day of week) */}
                      {dayLabels.map((label, rowIdx) => (
                        <>
                          {/* Day label */}
                          <div
                            key={`label-${rowIdx}`}
                            className="flex items-center justify-center"
                          >
                            <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                          </div>
                          {/* Dots for this row across all weeks */}
                          {overallGrid.map((week, weekIdx) => {
                            const day = week[rowIdx];
                            if (!day) {
                              return <div key={`${rowIdx}-${weekIdx}`} className="aspect-square rounded-sm" />;
                            }
                            const dateStr = day.toISOString().split('T')[0];
                            const completed = isCompleted(habit.id, dateStr);
                            return (
                              <div
                                key={`${rowIdx}-${weekIdx}`}
                                className={`aspect-square rounded-sm ${
                                  completed ? '' : 'bg-secondary'
                                }`}
                                style={completed ? { backgroundColor: habit.color } : undefined}
                                title={format(day, 'd MMM yyyy', { locale: pl })}
                              />
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Add button */}
          <button
            onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
            className="w-full p-3 bg-card border border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Dodaj nawyk</span>
          </button>
        </div>
      )}

      {/* Radar chart (collapsible) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowRadar(!showRadar)}
          className="w-full p-3 flex items-center justify-between hover:bg-accent/30 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Radar nawyków (30 dni)</span>
          {showRadar ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {showRadar && (
          <div className="p-4 pt-0">
            <HabitRadarChart habits={habits} entries={habitEntries} />
          </div>
        )}
      </div>

      {/* Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        editingHabit={editingHabit}
      />
    </div>
  );
}
