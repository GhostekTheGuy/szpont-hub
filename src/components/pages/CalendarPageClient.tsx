'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFinanceStore, type Wallet, type CalendarEvent } from '@/hooks/useFinanceStore';
import { getCalendarEvents, toggleEventConfirmed, moveCalendarEvent, moveRecurringEvent, getUnsettledCount, settleAllUnsettledAction } from '@/app/actions';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { CalendarEventModal } from '@/components/CalendarEventModal';
import { InvoiceModal } from '@/components/InvoiceModal';
import { ScanTogglModal } from '@/components/ScanTogglModal';
import { TimerWidget } from '@/components/TimerWidget';
import { GoogleCalendarSettings } from '@/components/GoogleCalendarSettings';
import { WorkSummaryPanel } from '@/components/WorkSummaryPanel';
import { useToast } from '@/components/Toast';
import { Check, Timer, AlertTriangle, Loader2, BarChart3 } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isAfter,
  endOfDay,
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
  const { confirm, toast } = useToast();
  const { calendarEvents, setCalendarEvents, setWallets, wallets } = useFinanceStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isScanTogglOpen, setIsScanTogglOpen] = useState(false);
  const [unsettledCount, setUnsettledCount] = useState(0);
  const [settling, setSettling] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isGoogleSettingsOpen, setIsGoogleSettingsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [prefillDate, setPrefillDate] = useState<Date | null>(null);
  const [prefillHour, setPrefillHour] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [futureWarning, setFutureWarning] = useState(false);
  const futureWarningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [googleConn, setGoogleConn] = useState<GoogleConnection | null>(googleConnection || null);
  const [recurringMoveData, setRecurringMoveData] = useState<{ event: CalendarEvent; newStart: string; newEnd: string } | null>(null);
  const lastSyncRef = useRef<number>(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const syncErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const refreshUnsettledCount = useCallback(async () => {
    const count = await getUnsettledCount();
    setUnsettledCount(count);
  }, []);

  useEffect(() => {
    setWallets(initialWallets);
    setCalendarEvents(initialEvents);
    refreshUnsettledCount();
  }, [initialWallets, initialEvents, setWallets, setCalendarEvents, refreshUnsettledCount]);

  const loadMonth = useCallback(async (date: Date) => {
    setLoading(true);
    const ms = startOfWeek(startOfMonth(date), { weekStartsOn: 1 }).toISOString();
    const me = endOfWeek(endOfMonth(date), { weekStartsOn: 1 }).toISOString();
    try {
      const data = await getCalendarEvents(ms, me);
      if (data) {
        setCalendarEvents(data.events);
      }
      refreshUnsettledCount();
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  }, [setCalendarEvents, refreshUnsettledCount]);

  const [autoSyncing, setAutoSyncing] = useState(false);

  const showSyncError = useCallback((msg: string, duration = 5000) => {
    if (syncErrorTimer.current) clearTimeout(syncErrorTimer.current);
    setSyncError(msg);
    syncErrorTimer.current = setTimeout(() => setSyncError(null), duration);
  }, []);

  const syncGoogleCalendar = useCallback(async ({ silent = false } = {}): Promise<{ error?: string }> => {
    if (silent) setAutoSyncing(true);
    try {
      const res = await fetch('/api/google-calendar/sync', { method: 'POST' });

      if (res.status === 429) {
        const msg = 'Zbyt wiele synchronizacji. Spróbuj ponownie za kilka minut.';
        if (!silent) showSyncError(msg);
        return { error: 'rate_limited' };
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (data.error === 'RECONNECT_REQUIRED') {
          showSyncError('Połączenie z Google wygasło. Połącz konto ponownie.');
          setGoogleConn(null);
          return { error: 'RECONNECT_REQUIRED' };
        }

        if (data.error === 'encryption_expired') {
          window.location.href = '/login';
          return { error: 'encryption_expired' };
        }

        if (!silent) showSyncError('Synchronizacja nie powiodła się. Spróbuj ponownie.');
        return { error: data.error || 'unknown' };
      }

      const data = await res.json();
      lastSyncRef.current = Date.now();
      await loadMonth(currentMonth);

      if (data.errors?.length > 0) {
        showSyncError(`Zsynchronizowano ${data.synced} wydarzeń, ale ${data.errors.length} kalendarz(y) miał(y) błędy.`);
      }

      return {};
    } catch (err) {
      console.error('Google Calendar sync error:', err);
      if (!silent) showSyncError('Błąd połączenia z serwerem.');
      return { error: 'network' };
    } finally {
      if (silent) setAutoSyncing(false);
    }
  }, [currentMonth, loadMonth, showSyncError]);

  // Auto-sync on mount if Google connected (with cooldown)
  useEffect(() => {
    if (googleConn?.connected) {
      const now = Date.now();
      if (now - lastSyncRef.current >= SYNC_COOLDOWN_MS) {
        syncGoogleCalendar({ silent: true });
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
    // Block confirming future events
    if (confirmed && isAfter(new Date(event.start_time), endOfDay(new Date()))) {
      if (futureWarningTimer.current) clearTimeout(futureWarningTimer.current);
      setFutureWarning(true);
      futureWarningTimer.current = setTimeout(() => setFutureWarning(false), 3500);
      return;
    }

    // When unchecking a settled work event, ask about reversing the transaction
    if (!confirmed && event.is_settled && event.event_type !== 'personal') {
      const shouldReverse = await confirm({
        title: 'Wydarzenie rozliczone',
        description: `To wydarzenie zostało już rozliczone — kwota została dodana do portfela "${event.walletName}". Czy chcesz odjąć tę kwotę z portfela i odznaczyć wydarzenie?`,
        variant: 'danger',
        confirmLabel: 'Tak, odjąć kwotę',
      });
      if (!shouldReverse) return; // Anuluj — nic nie rób
    }

    const reverseTransaction = !confirmed && event.is_settled && event.event_type !== 'personal';

    const snapshot = useFinanceStore.getState().calendarEvents;
    setCalendarEvents(
      snapshot.map(e => e.id === event.id ? { ...e, is_confirmed: confirmed, is_settled: !confirmed ? false : e.is_settled } : e)
    );
    try {
      await toggleEventConfirmed(event.id, confirmed, reverseTransaction);
    } catch {
      setCalendarEvents(snapshot);
    }
  }, [setCalendarEvents]);

  const handleEventMove = useCallback(async (event: CalendarEvent, newStart: string, newEnd: string) => {
    if (event.is_recurring) {
      setRecurringMoveData({ event, newStart, newEnd });
      return;
    }
    // Optimistic update
    const snapshot = useFinanceStore.getState().calendarEvents;
    setCalendarEvents(
      snapshot.map(e => e.id === event.id ? { ...e, start_time: newStart, end_time: newEnd } : e)
    );
    try {
      await moveCalendarEvent(event.id, newStart, newEnd);
    } catch {
      setCalendarEvents(snapshot);
    }
  }, [setCalendarEvents]);

  const handleRecurringMoveChoice = useCallback(async (mode: 'all' | 'this') => {
    if (!recurringMoveData) return;
    const { event, newStart, newEnd } = recurringMoveData;
    setRecurringMoveData(null);
    try {
      await moveRecurringEvent(event.id, newStart, newEnd, mode);
      await loadMonth(currentMonth);
    } catch (err) {
      console.error('Error moving recurring event:', err);
    }
  }, [recurringMoveData, currentMonth, loadMonth]);

  const handleModalClose = (didChange?: boolean) => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setPrefillDate(null);
    setPrefillHour(null);
    if (didChange) loadMonth(currentMonth);
  };

  const handleSettle = useCallback(async () => {
    if (unsettledCount === 0 || settling) return;
    setSettling(true);
    try {
      const result = await settleAllUnsettledAction();
      if (result.settled > 0) {
        toast(`Zatwierdzono ${result.settled} wydarzeń`, 'success');
        await loadMonth(currentMonth);
      }
    } catch {
      toast('Wystąpił błąd przy zatwierdzaniu', 'error');
    } finally {
      setSettling(false);
    }
  }, [unsettledCount, settling, currentMonth, loadMonth]);

  const handleGoogleConnect = () => {
    window.location.href = '/api/google-calendar/auth';
  };

  const invoiceWorkEvents = useMemo(() => {
    const msStart = monthStart.toISOString();
    const meEnd = monthEnd.toISOString();
    return calendarEvents
      .filter(
        (e) =>
          e.event_type === 'work' &&
          e.is_confirmed &&
          e.start_time >= msStart &&
          e.start_time <= meEnd
      )
      .map((e) => {
        const start = new Date(e.start_time);
        const end = new Date(e.end_time);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return {
          title: e.title,
          hours,
          hourlyRate: e.hourly_rate,
        };
      });
  }, [calendarEvents, monthStart, monthEnd]);

  // For WorkSummaryPanel: derive week from selectedDate
  const summaryDate = selectedDate || new Date();
  const weekStart = startOfWeek(summaryDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(summaryDate, { weekStartsOn: 1 });

  return (
    <>
      {/* Future event warning popup */}
      {futureWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3 shadow-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="text-sm text-foreground">Nie można zatwierdzić wydarzenia z przyszłości</span>
            <button onClick={() => setFutureWarning(false)} className="text-muted-foreground hover:text-foreground ml-2 text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      {/* Sync error popup */}
      {syncError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 bg-card border border-destructive/30 rounded-lg px-4 py-3 shadow-lg">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <span className="text-sm text-foreground">{syncError}</span>
            <button onClick={() => setSyncError(null)} className="text-muted-foreground hover:text-foreground ml-2 text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      {/* Auto-sync indicator */}
      {autoSyncing && (
        <div className="fixed top-4 right-4 z-[90] animate-in fade-in duration-200">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Synchronizacja Google...</span>
          </div>
        </div>
      )}

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
          onEventMove={handleEventMove}
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
                  Google
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
                onClick={handleSettle}
                disabled={unsettledCount === 0 || settling}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                  unsettledCount > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
                }`}
                title={unsettledCount === 0 ? 'Brak transakcji do zatwierdzenia' : `${unsettledCount} do zatwierdzenia`}
              >
                {settling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Zatwierdź transakcje
                {unsettledCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unsettledCount}
                  </span>
                )}
              </button>
            </>
          }
        />

        {/* Summary panel below calendar */}
        <WorkSummaryPanel
          weekStart={weekStart.toISOString()}
          weekEnd={weekEnd.toISOString()}
          monthStart={monthStart.toISOString()}
          monthEnd={monthEnd.toISOString()}
          monthLabel={format(currentMonth, 'LLLL yyyy', { locale: pl })}
          onGenerateInvoice={() => setIsInvoiceModalOpen(true)}
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

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        workEvents={invoiceWorkEvents}
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

      {/* Sticky scroll-to-summary button */}
      <button
        onClick={() => document.getElementById('work-summary-panel')?.scrollIntoView({ behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg transition-all hover:scale-105"
        title="Podsumowanie"
      >
        <BarChart3 className="w-5 h-5" />
      </button>

      {/* Recurring event move dialog */}
      {recurringMoveData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-card-foreground mb-2">Przenieś wydarzenie cykliczne</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Czy chcesz zmienić godzinę we wszystkich wystąpieniach, czy tylko wyjątkowo w tym tygodniu?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleRecurringMoveChoice('all')}
                className="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
              >
                Zmień we wszystkich
              </button>
              <button
                onClick={() => handleRecurringMoveChoice('this')}
                className="w-full px-4 py-2.5 bg-secondary hover:bg-accent text-secondary-foreground font-medium rounded-lg transition-colors"
              >
                Tylko w tym tygodniu
              </button>
              <button
                onClick={() => setRecurringMoveData(null)}
                className="w-full px-4 py-2.5 text-muted-foreground hover:text-foreground font-medium rounded-lg transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
