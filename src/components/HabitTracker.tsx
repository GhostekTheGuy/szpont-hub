'use client';

import { useState, useCallback, useMemo } from 'react';
import { useFinanceStore, type Habit, type HabitEntry } from '@/hooks/useFinanceStore';
import { toggleHabitEntry } from '@/app/actions';
import { HabitModal, ICON_OPTIONS } from '@/components/HabitModal';
import { HabitRadarChart } from '@/components/HabitRadarChart';
import { HabitStreakBars } from '@/components/HabitStreakBars';
import { Plus, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CircleDot } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Props {
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  isCurrentWeek: boolean;
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

export function HabitTracker({ weekStart, onPrevWeek, onNextWeek, onToday, isCurrentWeek }: Props) {
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

  // Overall view: 26 full weeks (Mon-Sun), ending on this Sunday
  const overallGrid = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    // Find this week's Sunday (end of week)
    const todayDow = (todayDate.getDay() + 6) % 7; // Mon=0, Sun=6
    const endDate = addDays(todayDate, 6 - todayDow);
    // Go back 26 weeks from that Sunday to get the start Monday
    const startDate = subDays(endDate, 26 * 7 - 1);

    const weeks: Date[][] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(current));
        current = addDays(current, 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, []);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-4">
      <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-4">
        {/* Left column: tabs + tracker views */}
        <div className="space-y-4">
          {/* Tab navigation + date nav */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              {(['today', 'weekly', 'overall'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === mode
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode === 'today' ? 'Dziś' : mode === 'weekly' ? 'Tydzień' : 'Ogólne'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-0.5">
              <button
                onClick={onPrevWeek}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onToday}
                title="Bieżący tydzień"
                className={`p-2 hover:bg-accent rounded-md transition-colors ${
                  isCurrentWeek ? 'text-primary' : 'text-foreground'
                }`}
              >
                <CircleDot className="w-4 h-4" />
              </button>
              <button
                onClick={onNextWeek}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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
                                isToday ? 'text-foreground' : 'text-muted-foreground'
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
              <p className="text-xs text-muted-foreground">
                Ostatnie 6 miesięcy aktywności (26 tygodni)
              </p>
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

                      {/* Dot matrix */}
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
                              const dateStr = day.toISOString().split('T')[0];
                              const completed = isCompleted(habit.id, dateStr);
                              return (
                                <div
                                  key={`${rowIdx}-${weekIdx}`}
                                  className={`aspect-square rounded-full ${
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
        </div>

        {/* Right column: Radar + Streaks */}
        <div className="mt-4 lg:mt-0 lg:w-[360px]">
          {/* Desktop: always visible, sticky */}
          <div className="hidden lg:block lg:sticky lg:top-4 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <span className="text-sm font-medium text-foreground block mb-3">Radar nawyków (30 dni)</span>
              <HabitRadarChart habits={habits} entries={habitEntries} />
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <span className="text-sm font-medium text-foreground block mb-3">Aktualne serie</span>
              <HabitStreakBars habits={habits} entries={habitEntries} />
            </div>
          </div>
          {/* Mobile: collapsible */}
          <div className="lg:hidden space-y-3">
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
            <div className="bg-card border border-border rounded-xl p-4">
              <span className="text-sm font-medium text-foreground block mb-3">Aktualne serie</span>
              <HabitStreakBars habits={habits} entries={habitEntries} />
            </div>
          </div>
        </div>
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
