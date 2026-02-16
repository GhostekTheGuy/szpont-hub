'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFinanceStore, type Wallet, type CalendarEvent } from '@/hooks/useFinanceStore';
import { getCalendarEvents } from '@/app/actions';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { CalendarEventModal } from '@/components/CalendarEventModal';
import { WeeklySummaryModal } from '@/components/WeeklySummaryModal';
import { ScanTogglModal } from '@/components/ScanTogglModal';
import { ChevronLeft, ChevronRight, BarChart3, Timer } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, isThisWeek, isSunday } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Props {
  initialEvents: CalendarEvent[];
  initialWallets: Wallet[];
}

export function CalendarPageClient({ initialEvents, initialWallets }: Props) {
  const { calendarEvents, setCalendarEvents, setWallets, wallets } = useFinanceStore();

  const [currentDate, setCurrentDate] = useState(new Date());
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
  }, [initialWallets, initialEvents, setWallets, setCalendarEvents]);

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

  const goToPrevWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    setCurrentDate(newDate);
    loadWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = addWeeks(currentDate, 1);
    setCurrentDate(newDate);
    loadWeek(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    loadWeek(new Date());
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
          <h1 className="text-3xl font-bold text-foreground">Kalendarz</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(weekStart, 'd MMM', { locale: pl })} — {format(weekEnd, 'd MMM yyyy', { locale: pl })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScanTogglOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-all"
          >
            <Timer className="w-4 h-4" />
            <span className="hidden sm:inline">Import Toggl</span>
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
            Podsumowanie
          </button>

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

      {/* Calendar */}
      <div className={loadingWeek ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <WeeklyCalendar
          weekStart={weekStart}
          events={calendarEvents}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
        />
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
