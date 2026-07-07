'use client';

import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { useFinanceStore, pick, type Wallet, type CalendarEvent, type Order } from '@/hooks/useFinanceStore';
import { getCalendarEvents, toggleEventConfirmed, moveCalendarEvent, moveRecurringEvent, getUnsettledCount, settleAllUnsettledAction } from '@/app/actions';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { TimerWidget } from '@/components/TimerWidget';
import { MonthlySummaryBlock } from '@/components/MonthlySummaryBlock';
import { useToast } from '@/components/Toast';
import { Check, Timer, Loader2 } from 'lucide-react';

const CalendarEventModal = lazy(() => import('@/components/CalendarEventModal').then(m => ({ default: m.CalendarEventModal })));
const InvoiceModal = lazy(() => import('@/components/InvoiceModal').then(m => ({ default: m.InvoiceModal })));
const ScanTogglModal = lazy(() => import('@/components/ScanTogglModal').then(m => ({ default: m.ScanTogglModal })));
const GoogleCalendarSettings = lazy(() => import('@/components/GoogleCalendarSettings').then(m => ({ default: m.GoogleCalendarSettings })));
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isAfter,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { pl } from 'date-fns/locale';
import { formatLocalDateTime } from '@/lib/calendar-utils';

interface GoogleConnection {
  id: string;
  email: string;
  connected: boolean;
  connectedAt: string;
}

interface Props {
  initialEvents: CalendarEvent[];
  initialWallets: Wallet[];
  initialOrders?: Order[];
  googleConnection?: GoogleConnection | null;
}

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export function CalendarPageClient({ initialEvents, initialWallets, initialOrders, googleConnection }: Props) {
  const { confirm, toast } = useToast();
  const { calendarEvents, wallets, orders } = useFinanceStore(pick('calendarEvents', 'wallets', 'orders'));
  const setCalendarEvents = useFinanceStore(s => s.setCalendarEvents);
  const setWallets = useFinanceStore(s => s.setWallets);
  const setOrders = useFinanceStore(s => s.setOrders);

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
  const [googleConn, setGoogleConn] = useState<GoogleConnection | null>(googleConnection || null);
  const [recurringMoveData, setRecurringMoveData] = useState<{ event: CalendarEvent; newStart: string; newEnd: string } | null>(null);
  const lastSyncRef = useRef<number>(0);
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const refreshUnsettledCount = useCallback(async () => {
    const count = await getUnsettledCount();
    setUnsettledCount(count);
  }, []);

  useEffect(() => {
    setWallets(initialWallets);
    setCalendarEvents(initialEvents);
    if (initialOrders) setOrders(initialOrders);
    refreshUnsettledCount();
  }, [initialWallets, initialEvents, initialOrders, setWallets, setCalendarEvents, setOrders, refreshUnsettledCount]);

  // Background refresh — does not toggle the loading flag, so the calendar
  // stays interactive (used for silent auto-sync).
  const refreshCalendarEvents = useCallback(async (date: Date) => {
    const ms = formatLocalDateTime(startOfWeek(startOfMonth(date), { weekStartsOn: 1 }));
    const me = formatLocalDateTime(endOfWeek(endOfMonth(date), { weekStartsOn: 1 }));
    const data = await getCalendarEvents(ms, me);
    if (data) setCalendarEvents(data.events);
    refreshUnsettledCount();
  }, [setCalendarEvents, refreshUnsettledCount]);

  const loadMonth = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      await refreshCalendarEvents(date);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshCalendarEvents]);

  const [autoSyncing, setAutoSyncing] = useState(false);

  // Ujednolicone z resztą aplikacji: błędy synchronizacji pokazujemy jako toast
  // (wcześniej był osobny popup top-center — dwa różne systemy powiadomień).
  const showSyncError = useCallback((msg: string) => {
    toast(msg, 'error');
  }, [toast]);

  const syncGoogleCalendar = useCallback(async ({ silent = false } = {}): Promise<{ error?: string }> => {
    if (silent) setAutoSyncing(true);

    // Abort if Google API hangs — keeps the UI from staying dimmed forever.
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 10_000);

    try {
      const res = await fetch('/api/google-calendar/sync', { method: 'POST', signal: ctrl.signal });

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
      // Silent path: refresh in background without dimming the calendar.
      if (silent) {
        await refreshCalendarEvents(currentMonth);
      } else {
        await loadMonth(currentMonth);
      }

      if (data.errors?.length > 0) {
        showSyncError(`Zsynchronizowano ${data.synced} wydarzeń, ale ${data.errors.length} kalendarz(y) miał(y) błędy.`);
      }

      return {};
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.warn('Google Calendar sync timed out after 10s');
        if (!silent) showSyncError('Synchronizacja przekroczyła limit czasu.');
        return { error: 'timeout' };
      }
      console.error('Google Calendar sync error:', err);
      if (!silent) showSyncError('Błąd połączenia z serwerem.');
      return { error: 'network' };
    } finally {
      clearTimeout(timeoutId);
      if (silent) setAutoSyncing(false);
    }
  }, [currentMonth, loadMonth, refreshCalendarEvents, showSyncError]);

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
      toast('Nie można zatwierdzić wydarzenia z przyszłości', 'warning');
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
      if (!shouldReverse) return;
    }

    const reverseTransaction = !confirmed && event.is_settled && event.event_type !== 'personal';

    // Optimistic update
    const snapshot = useFinanceStore.getState().calendarEvents;
    setCalendarEvents(
      snapshot.map(e => e.id === event.id ? { ...e, is_confirmed: confirmed, is_settled: !confirmed ? false : e.is_settled } : e)
    );
    // Optimistic unsettled count update
    if (confirmed && event.event_type !== 'personal') {
      setUnsettledCount(c => c + 1);
    } else if (!confirmed && !event.is_settled && event.event_type !== 'personal') {
      setUnsettledCount(c => Math.max(0, c - 1));
    }

    try {
      await toggleEventConfirmed(event.id, confirmed, reverseTransaction);
      setSummaryRefreshKey(k => k + 1);
    } catch {
      setCalendarEvents(snapshot);
      refreshUnsettledCount();
      toast('Nie udało się zmienić potwierdzenia', 'error');
    }
  }, [setCalendarEvents, refreshUnsettledCount]);

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
      await refreshCalendarEvents(currentMonth);
    } catch {
      toast('Nie udało się przenieść wydarzenia', 'error');
    }
  }, [recurringMoveData, currentMonth, refreshCalendarEvents, toast]);

  const handleModalClose = (didChange?: boolean) => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setPrefillDate(null);
    setPrefillHour(null);
    if (didChange) {
      // Background refresh — keeps the calendar interactive instead of dimming
      // it via setLoading(true). Same data is fetched, only the UI flag differs.
      refreshCalendarEvents(currentMonth).catch(err =>
        console.error('Error refreshing calendar after save:', err)
      );
      setSummaryRefreshKey(k => k + 1);
    }
  };

  const handleSettle = useCallback(async () => {
    if (unsettledCount === 0 || settling) return;
    setSettling(true);

    // Optimistic: mark all confirmed work events as settled in UI
    const snapshot = useFinanceStore.getState().calendarEvents;
    setCalendarEvents(
      snapshot.map(e =>
        e.is_confirmed && !e.is_settled && (e.event_type || 'work') === 'work'
          ? { ...e, is_settled: true }
          : e
      )
    );
    setUnsettledCount(0);

    try {
      const result = await settleAllUnsettledAction();
      if (result.settled > 0) {
        toast(`Zatwierdzono ${result.settled} wydarzeń`, 'success');
      }
      // Refresh count in background (don't block UI)
      refreshUnsettledCount();
      setSummaryRefreshKey(k => k + 1);
    } catch {
      // Rollback optimistic update
      setCalendarEvents(snapshot);
      refreshUnsettledCount();
      toast('Wystąpił błąd przy zatwierdzaniu', 'error');
    } finally {
      setSettling(false);
    }
  }, [unsettledCount, settling, setCalendarEvents, refreshUnsettledCount]);

  const handleGoogleConnect = useCallback(() => {
    window.location.href = '/api/google-calendar/auth';
  }, []);

  // Memoized slot props for WeeklyCalendar — keeps child element identity
  // stable across CalendarPageClient renders that don't actually change
  // these inputs (e.g. selectedDate flips do not affect summary or actions).
  const onTimerStop = useCallback(() => {
    refreshCalendarEvents(currentMonth);
  }, [refreshCalendarEvents, currentMonth]);
  const topWidget = useMemo(
    () => <TimerWidget wallets={wallets} orders={orders} onStop={onTimerStop} />,
    [wallets, orders, onTimerStop]
  );

  const monthStartStr = useMemo(() => formatLocalDateTime(monthStart), [monthStart]);
  const monthEndStr = useMemo(() => formatLocalDateTime(monthEnd), [monthEnd]);
  const monthLabel = useMemo(() => format(currentMonth, 'LLLL yyyy', { locale: pl }), [currentMonth]);
  const onGenerateInvoice = useCallback(() => setIsInvoiceModalOpen(true), []);
  const summaryBlock = useMemo(
    () => (
      <MonthlySummaryBlock
        monthStart={monthStartStr}
        monthEnd={monthEndStr}
        monthLabel={monthLabel}
        onGenerateInvoice={onGenerateInvoice}
        refreshKey={summaryRefreshKey}
      />
    ),
    [monthStartStr, monthEndStr, monthLabel, onGenerateInvoice, summaryRefreshKey]
  );

  const weekLabelActions = useMemo(
    () =>
      unsettledCount > 0 ? (
        <button
          onClick={handleSettle}
          disabled={settling}
          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 h-8 rounded-lg transition-colors disabled:opacity-60 active:scale-95"
          title={`${unsettledCount} do zatwierdzenia`}
        >
          {settling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Potwierdź wszystkie ({unsettledCount})
        </button>
      ) : null,
    [unsettledCount, settling, handleSettle]
  );

  const onGoogleSettingsClick = useCallback(() => setIsGoogleSettingsOpen(true), []);
  const onScanTogglClick = useCallback(() => setIsScanTogglOpen(true), []);
  const actionButtons = useMemo(
    () => (
      <>
        {googleConn?.connected ? (
          <button
            onClick={onGoogleSettingsClick}
            className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-all text-sm"
          >
            {autoSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
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
          onClick={onScanTogglClick}
          className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-all text-sm"
        >
          <Timer className="w-4 h-4" />
          Import
        </button>
      </>
    ),
    [googleConn?.connected, autoSyncing, handleGoogleConnect, onGoogleSettingsClick, onScanTogglClick]
  );

  const invoiceWorkEvents = useMemo(() => {
    const msStart = formatLocalDateTime(monthStart);
    const meEnd = formatLocalDateTime(monthEnd);
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

  return (
    <>
      {/* Ostrzeżenia i błędy synchronizacji pokazywane są teraz przez system toastów */}

      {/* Content */}
      <div className={`${loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}`}>
        <WeeklyCalendar
          events={calendarEvents}
          orders={orders}
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
          topWidget={topWidget}
          summaryBlock={summaryBlock}
          weekLabelActions={weekLabelActions}
          actionButtons={actionButtons}
        />

      </div>

      {/* Modals — lazy loaded */}
      {isEventModalOpen && (
        <Suspense fallback={null}>
          <CalendarEventModal
            isOpen={isEventModalOpen}
            onClose={handleModalClose}
            editingEvent={editingEvent}
            prefillDate={prefillDate}
            prefillHour={prefillHour}
          />
        </Suspense>
      )}

      {isInvoiceModalOpen && (
        <Suspense fallback={null}>
          <InvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            workEvents={invoiceWorkEvents}
            monthLabel={format(currentMonth, 'LLLL yyyy', { locale: pl })}
          />
        </Suspense>
      )}

      {isScanTogglOpen && (
        <Suspense fallback={null}>
          <ScanTogglModal
            isOpen={isScanTogglOpen}
            onClose={() => { setIsScanTogglOpen(false); loadMonth(currentMonth); }}
          />
        </Suspense>
      )}

      {googleConn?.connected && isGoogleSettingsOpen && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

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
