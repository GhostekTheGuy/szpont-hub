'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFinanceStore, type Wallet, type CalendarEvent } from '@/hooks/useFinanceStore';
import { getCalendarEvents, toggleEventConfirmed } from '@/app/actions';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { CalendarEventModal } from '@/components/CalendarEventModal';
import { WeeklySummaryModal } from '@/components/WeeklySummaryModal';
import { ScanTogglModal } from '@/components/ScanTogglModal';
import { TimerWidget } from '@/components/TimerWidget';
import { BarChart3, Timer } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSunday,
} from 'date-fns';
import { pl } from 'date-fns/locale';

interface Props {
  initialEvents: CalendarEvent[];
  initialWallets: Wallet[];
}

export function CalendarPageClient({ initialEvents, initialWallets }: Props) {
  const { calendarEvents, setCalendarEvents, setWallets, wallets } = useFinanceStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isScanTogglOpen, setIsScanTogglOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [prefillDate, setPrefillDate] = useState<Date | null>(null);
  const [prefillHour, setPrefillHour] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  useEffect(() => {
    setWallets(initialWallets);
    setCalendarEvents(initialEvents);
  }, [initialWallets, initialEvents, setWallets, setCalendarEvents]);

  const loadMonth = useCallback(async (date: Date) => {
    setLoading(true);
    const ms = startOfWeek(startOfMonth(date), { weekStartsOn: 1 }).toISOString();
    const me = endOfWeek(endOfMonth(date), { weekStartsOn: 1 }).toISOString();
    try {
      const data = await getCalendarEvents(ms, me);
      if (data) {
        setCalendarEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  }, [setCalendarEvents]);

  const goToPrevMonth = () => {
    const newDate = subMonths(currentMonth, 1);
    setCurrentMonth(newDate);
    loadMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = addMonths(currentMonth, 1);
    setCurrentMonth(newDate);
    loadMonth(newDate);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
    loadMonth(now);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
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
    const current = () => useFinanceStore.getState().calendarEvents;
    setCalendarEvents(
      current().map(e => e.id === event.id ? { ...e, is_confirmed: confirmed } : e)
    );
    try {
      await toggleEventConfirmed(event.id, confirmed);
    } catch {
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
    loadMonth(currentMonth);
  };

  const handleSummaryClose = () => {
    setIsSummaryModalOpen(false);
    loadMonth(currentMonth);
  };

  const isSundayToday = isSunday(new Date());

  // For WeeklySummaryModal: derive week from selectedDate
  const summaryDate = selectedDate || new Date();
  const weekStart = startOfWeek(summaryDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(summaryDate, { weekStartsOn: 1 });

  return (
    <>
      {/* Header */}
      <div className="mb-4 px-4 lg:px-0">
        <h1 className="text-3xl font-bold text-foreground">Praca</h1>
      </div>

      {/* Content */}
      <div className={`px-4 lg:px-0 ${loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}`}>
        <WeeklyCalendar
          events={calendarEvents}
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onEventClick={handleEventClick}
          onSlotClick={handleSlotClick}
          onToggleConfirmed={handleToggleConfirmed}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
          loading={loading}
          topWidget={<TimerWidget wallets={wallets} onStop={() => loadMonth(currentMonth)} />}
          actionButtons={
            <>
              <button
                onClick={() => setIsScanTogglOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-all text-sm"
              >
                <Timer className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                  isSundayToday
                    ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                    : 'bg-secondary hover:bg-accent text-secondary-foreground'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Podsumowanie
              </button>
            </>
          }
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
        monthLabel={format(currentMonth, 'LLLL yyyy', { locale: pl })}
      />

      <ScanTogglModal
        isOpen={isScanTogglOpen}
        onClose={() => { setIsScanTogglOpen(false); loadMonth(currentMonth); }}
      />
    </>
  );
}
