'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFinanceStore, type Wallet, type CalendarEvent } from '@/hooks/useFinanceStore';
import { getCalendarEvents, toggleEventConfirmed } from '@/app/actions';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { CalendarEventModal } from '@/components/CalendarEventModal';
import { WeeklySummaryModal } from '@/components/WeeklySummaryModal';
import { ScanTogglModal } from '@/components/ScanTogglModal';
import { TimerWidget } from '@/components/TimerWidget';
import { GoogleCalendarSettings } from '@/components/GoogleCalendarSettings';
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

interface GoogleConnection {
  id: string;
  email: string;
  connected: boolean;
  connectedAt: string;
}

interface Props {
  initialEvents: CalendarEvent[];
  initialWallets: Wallet[];
  googleConnection?: GoogleConnection | null;
}

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export function CalendarPageClient({ initialEvents, initialWallets, googleConnection }: Props) {
  const { calendarEvents, setCalendarEvents, setWallets, wallets } = useFinanceStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isScanTogglOpen, setIsScanTogglOpen] = useState(false);
  const [isGoogleSettingsOpen, setIsGoogleSettingsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [prefillDate, setPrefillDate] = useState<Date | null>(null);
  const [prefillHour, setPrefillHour] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleConn, setGoogleConn] = useState<GoogleConnection | null>(googleConnection || null);
  const lastSyncRef = useRef<number>(0);

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

  const syncGoogleCalendar = useCallback(async () => {
    try {
      const res = await fetch('/api/google-calendar/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      lastSyncRef.current = Date.now();
      await loadMonth(currentMonth);
    } catch (err) {
      console.error('Google Calendar sync error:', err);
    }
  }, [currentMonth, loadMonth]);

  // Auto-sync on mount if Google connected (with cooldown)
  useEffect(() => {
    if (googleConn?.connected) {
      const now = Date.now();
      if (now - lastSyncRef.current >= SYNC_COOLDOWN_MS) {
        syncGoogleCalendar();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPrevMonth = () => {
    const newDate = subMonths(currentMonth, 1);
    setCurrentMonth(newDate);
    setSelectedDate(startOfMonth(newDate));
    loadMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = addMonths(currentMonth, 1);
    setCurrentMonth(newDate);
    setSelectedDate(startOfMonth(newDate));
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

  const handleGoogleConnect = () => {
    window.location.href = '/api/google-calendar/auth';
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
              {googleConn?.connected ? (
                <button
                  onClick={() => setIsGoogleSettingsOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-all text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
              ) : (
                <button
                  onClick={handleGoogleConnect}
                  className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-all text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Połącz Google
                </button>
              )}
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

      {googleConn?.connected && (
        <GoogleCalendarSettings
          isOpen={isGoogleSettingsOpen}
          onClose={() => setIsGoogleSettingsOpen(false)}
          connectionEmail={googleConn.email}
          onSync={syncGoogleCalendar}
          onDisconnected={() => {
            setGoogleConn(null);
            loadMonth(currentMonth);
          }}
        />
      )}
    </>
  );
}
