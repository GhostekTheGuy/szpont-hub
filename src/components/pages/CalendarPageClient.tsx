'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFinanceStore, type Wallet, type CalendarEvent, type Habit, type HabitEntry } from '@/hooks/useFinanceStore';
import { getCalendarEvents, toggleEventConfirmed, getHabits } from '@/app/actions';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { CalendarEventModal } from '@/components/CalendarEventModal';
import { WeeklySummaryModal } from '@/components/WeeklySummaryModal';
import { ScanTogglModal } from '@/components/ScanTogglModal';
import { TimerWidget } from '@/components/TimerWidget';
import { HabitTracker } from '@/components/HabitTracker';
import { ChevronLeft, ChevronRight, BarChart3, Timer, Calendar, Target } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, isThisWeek, isSunday } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Props {
  initialEvents: CalendarEvent[];
  initialWallets: Wallet[];
  initialHabits?: Habit[];
  initialHabitEntries?: HabitEntry[];
}

export function CalendarPageClient({ initialEvents, initialWallets, initialHabits, initialHabitEntries }: Props) {
  const { calendarEvents, setCalendarEvents, setWallets, wallets, setHabits, setHabitEntries } = useFinanceStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'habits'>('calendar');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isScanTogglOpen, setIsScanTogglOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [prefillDate, setPrefillDate] = useState<Date | null>(null);
  const [prefillHour, setPrefillHour] = useState<number | null>(null);
  const [loadingWeek, setLoadingWeek] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  useEffect(() => {
    setWallets(initialWallets);
    setCalendarEvents(initialEvents);
    if (initialHabits) setHabits(initialHabits);
    if (initialHabitEntries) setHabitEntries(initialHabitEntries);
  }, [initialWallets, initialEvents, initialHabits, initialHabitEntries, setWallets, setCalendarEvents, setHabits, setHabitEntries]);

  const loadWeek = useCallback(async (date: Date) => {
    setLoadingWeek(true);
    const ws = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
    const we = endOfWeek(date, { weekStartsOn: 1 }).toISOString();
    try {
      const data = await getCalendarEvents(ws, we);
      if (data) {
        setCalendarEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoadingWeek(false);
    }
  }, [setCalendarEvents]);

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

  const handleViewModeChange = (mode: 'calendar' | 'habits') => {
    setViewMode(mode);
    if (mode === 'habits') {
      loadHabits();
    }
  };

  const goToPrevWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    setCurrentDate(newDate);
    if (viewMode === 'calendar') loadWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = addWeeks(currentDate, 1);
    setCurrentDate(newDate);
    if (viewMode === 'calendar') loadWeek(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    if (viewMode === 'calendar') loadWeek(new Date());
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setEditingEvent(null);
    setPrefillDate(date);
    setPrefillHour(hour);
    setIsEventModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setPrefillDate(null);
    setPrefillHour(null);
    setIsEventModalOpen(true);
  };

  const handleToggleConfirmed = useCallback(async (event: CalendarEvent, confirmed: boolean) => {
    // Optimistic update — read current state to avoid stale closure
    const current = () => useFinanceStore.getState().calendarEvents;
    setCalendarEvents(
      current().map(e => e.id === event.id ? { ...e, is_confirmed: confirmed } : e)
    );
    try {
      await toggleEventConfirmed(event.id, confirmed);
    } catch {
      // Revert on error
      setCalendarEvents(
        current().map(e => e.id === event.id ? { ...e, is_confirmed: !confirmed } : e)
      );
    }
  }, [setCalendarEvents]);

  const handleModalClose = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setPrefillDate(null);
    setPrefillHour(null);
    // Reload events for current week
    loadWeek(currentDate);
  };

  const handleSummaryClose = () => {
    setIsSummaryModalOpen(false);
    loadWeek(currentDate);
  };

  const isCurrent = isThisWeek(currentDate, { weekStartsOn: 1 });
  const isSundayToday = isSunday(new Date());

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {viewMode === 'calendar' ? 'Kalendarz' : 'Nawyki'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(weekStart, 'd MMM', { locale: pl })} — {format(weekEnd, 'd MMM yyyy', { locale: pl })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => handleViewModeChange('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Praca</span>
            </button>
            <button
              onClick={() => handleViewModeChange('habits')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'habits'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Nawyki</span>
            </button>
          </div>

          {viewMode === 'calendar' && (
            <>
              <TimerWidget wallets={wallets} onStop={() => loadWeek(currentDate)} />

              <button
                onClick={() => setIsScanTogglOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-all"
              >
                <Timer className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </button>

              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isSundayToday
                    ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                    : 'bg-secondary hover:bg-accent text-secondary-foreground'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Podsumowanie</span>
              </button>
            </>
          )}

          <div className="flex items-center bg-secondary rounded-lg">
            <button
              onClick={goToPrevWeek}
              className="p-2 hover:bg-accent rounded-l-lg transition-colors"
              disabled={loadingWeek}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isCurrent ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
              disabled={loadingWeek}
            >
              Dziś
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-accent rounded-r-lg transition-colors"
              disabled={loadingWeek}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={loadingWeek ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
        {viewMode === 'calendar' ? (
          <WeeklyCalendar
            weekStart={weekStart}
            events={calendarEvents}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
            onToggleConfirmed={handleToggleConfirmed}
          />
        ) : (
          <HabitTracker weekStart={weekStart} />
        )}
      </div>

      {/* Modals */}
      <CalendarEventModal
        isOpen={isEventModalOpen}
        onClose={handleModalClose}
        editingEvent={editingEvent}
        prefillDate={prefillDate}
        prefillHour={prefillHour}
      />

      <WeeklySummaryModal
        isOpen={isSummaryModalOpen}
        onClose={handleSummaryClose}
        weekStart={weekStart.toISOString()}
        weekEnd={weekEnd.toISOString()}
        monthStart={monthStart.toISOString()}
        monthEnd={monthEnd.toISOString()}
        monthLabel={format(currentDate, 'LLLL yyyy', { locale: pl })}
      />

      <ScanTogglModal
        isOpen={isScanTogglOpen}
        onClose={() => { setIsScanTogglOpen(false); loadWeek(currentDate); }}
      />
    </>
  );
}
