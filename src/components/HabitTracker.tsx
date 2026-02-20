'use client';

import { useState, useCallback } from 'react';
import { useFinanceStore, type Habit, type HabitEntry } from '@/hooks/useFinanceStore';
import { toggleHabitEntry } from '@/app/actions';
import { HabitModal, ICON_OPTIONS } from '@/components/HabitModal';
import { HabitRadarChart } from '@/components/HabitRadarChart';
import { Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Props {
  weekStart: Date;
}

export function HabitTracker({ weekStart }: Props) {
  const { habits, habitEntries, setHabitEntries } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showRadar, setShowRadar] = useState(true);

  // 7 dni tygodnia
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date().toISOString().split('T')[0];

  const isCompleted = (habitId: string, date: string) => {
    return habitEntries.some(e => e.habit_id === habitId && e.date === date && e.completed);
  };

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

  // Progress per nawyk (tydzień)
  const getWeeklyProgress = (habitId: string) => {
    const dayStrs = days.map(d => d.toISOString().split('T')[0]);
    const completed = dayStrs.filter(d => isCompleted(habitId, d)).length;
    return completed / 7;
  };

  // Progress per dzień (% wszystkich nawyków)
  const getDailyProgress = (date: string) => {
    if (habits.length === 0) return 0;
    const completed = habits.filter(h => isCompleted(h.id, date)).length;
    return completed / habits.length;
  };

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

  return (
    <div className="space-y-4">
      {/* Tabela nawyków */}
      <div className="card-responsive">

        {/* ===== DESKTOP: nawyki w wierszach, dni w kolumnach ===== */}
        <div className="hidden md:block">
          {/* Nagłówek z dniami */}
          <div className="flex border-b border-border">
            <div className="w-48 shrink-0 p-3 flex items-end">
              <span className="text-xs text-muted-foreground uppercase font-medium">Nawyk</span>
            </div>
            {days.map(day => {
              const dateStr = day.toISOString().split('T')[0];
              const isToday = dateStr === today;
              const progress = getDailyProgress(dateStr);
              return (
                <div
                  key={dateStr}
                  className={`flex-1 p-2 text-center flex flex-col items-center gap-1 ${
                    isToday ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress * 100}%`,
                        backgroundColor: progress === 1 ? '#22c55e' : '#6366f1',
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day, 'EEE', { locale: pl })}
                  </span>
                  <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
            <div className="w-24 shrink-0 p-2 flex items-end justify-center">
              <span className="text-xs text-muted-foreground uppercase font-medium">Tydzień</span>
            </div>
          </div>

          {/* Wiersze nawyków */}
          {habits.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="mb-2">Brak nawyków</p>
              <p className="text-sm">Kliknij + aby dodać pierwszy nawyk</p>
            </div>
          ) : (
            habits.map(habit => {
              const IconComp = getIconComponent(habit.icon);
              const weeklyProgress = getWeeklyProgress(habit.id);
              return (
                <div key={habit.id} className="flex border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
                  <button
                    onClick={() => handleEditHabit(habit)}
                    className="w-48 shrink-0 p-3 flex items-center gap-2 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: habit.color + '20', color: habit.color }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">
                      {habit.name}
                    </span>
                  </button>

                  {days.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const isToday = dateStr === today;
                    const completed = isCompleted(habit.id, dateStr);
                    return (
                      <div
                        key={dateStr}
                        className={`flex-1 flex items-center justify-center ${isToday ? 'bg-primary/5' : ''}`}
                      >
                        <button
                          onClick={() => handleToggle(habit.id, dateStr)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            completed
                              ? 'scale-100'
                              : 'bg-secondary hover:bg-accent scale-95 hover:scale-100'
                          }`}
                          style={completed ? { backgroundColor: habit.color, color: 'white' } : undefined}
                        >
                          {completed && <Check className="w-4 h-4" strokeWidth={3} />}
                        </button>
                      </div>
                    );
                  })}

                  <div className="w-24 shrink-0 flex items-center px-3">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {Math.round(weeklyProgress * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${weeklyProgress * 100}%`,
                            backgroundColor: habit.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===== MOBILE: dni w wierszach, nawyki w kolumnach (scroll poziomy) ===== */}
        <div className="md:hidden overflow-x-auto habit-scroll">
          <div style={{ minWidth: habits.length > 3 ? `${80 + habits.length * 52}px` : undefined }}>
            {/* Nagłówek z ikonkami nawyków */}
            <div className="flex border-b border-border">
              <div className="w-20 shrink-0 p-2 flex items-end sticky left-0 bg-background lg:bg-card z-10">
                <span className="text-xs text-muted-foreground uppercase font-medium">Dzień</span>
              </div>
              {habits.length === 0 ? (
                <div className="flex-1 p-3 text-center text-muted-foreground text-sm">
                  Brak nawyków
                </div>
              ) : (
                habits.map(habit => {
                  const IconComp = getIconComponent(habit.icon);
                  const weeklyProgress = getWeeklyProgress(habit.id);
                  return (
                    <div key={habit.id} className="w-[52px] shrink-0 flex flex-col items-center gap-1 p-2">
                      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${weeklyProgress * 100}%`,
                            backgroundColor: habit.color,
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleEditHabit(habit)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-accent/50"
                        style={{ backgroundColor: habit.color + '20', color: habit.color }}
                        title={habit.name}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {Math.round(weeklyProgress * 100)}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Wiersze dni */}
            {habits.length > 0 && days.map(day => {
              const dateStr = day.toISOString().split('T')[0];
              const isToday = dateStr === today;
              const dailyProgress = getDailyProgress(dateStr);
              return (
                <div
                  key={dateStr}
                  className={`flex border-b border-border last:border-b-0 ${isToday ? 'bg-primary/5' : ''}`}
                >
                  <div className={`w-20 shrink-0 p-2 flex flex-col justify-center gap-0.5 sticky left-0 z-10 ${isToday ? 'bg-primary/5' : 'bg-background lg:bg-card'}`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {format(day, 'EEE', { locale: pl })}
                      </span>
                      <span className={`text-xs ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${dailyProgress * 100}%`,
                          backgroundColor: dailyProgress === 1 ? '#22c55e' : '#6366f1',
                        }}
                      />
                    </div>
                  </div>

                  {habits.map(habit => {
                    const completed = isCompleted(habit.id, dateStr);
                    return (
                      <div
                        key={habit.id}
                        className="w-[52px] shrink-0 flex items-center justify-center py-2"
                      >
                        <button
                          onClick={() => handleToggle(habit.id, dateStr)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            completed
                              ? 'scale-100'
                              : 'bg-secondary hover:bg-accent scale-95 hover:scale-100'
                          }`}
                          style={completed ? { backgroundColor: habit.color, color: 'white' } : undefined}
                        >
                          {completed && <Check className="w-4 h-4" strokeWidth={3} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Przycisk dodaj */}
        <button
          onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
          className="w-full p-3 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Dodaj nawyk</span>
        </button>
      </div>

      {/* Radar chart (collapsible) */}
      <div className="card-responsive">
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
