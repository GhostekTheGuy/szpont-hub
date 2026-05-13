'use client';

import { useMemo, useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  format,
  isToday,
  isSameMonth,
  isSameDay,
  parseISO,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { pl } from 'date-fns/locale';
import { formatLocalDateTime } from '@/lib/calendar-utils';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent, Order } from '@/hooks/useFinanceStore';

const HOUR_HEIGHT = 56;
// Default visible window — covers ~99% of realistic schedules (gym at 6, late client at 22).
// Expanded automatically if any event in the displayed week falls outside.
const DEFAULT_DAY_START_HOUR = 6;
const DEFAULT_DAY_END_HOUR = 23;
const RANGE_BUFFER_HOURS = 1;
const SNAP_MINUTES = 10;

function isDraggableEvent(event: CalendarEvent): boolean {
  return !event.google_event_id;
}

interface DragInfo {
  eventId: string;
  event: CalendarEvent;
  startY: number;
  originalStartMin: number;
  currentStartMin: number;
  durationMin: number;
  active: boolean;
  originalDayIndex: number;
  currentDayIndex: number;
}

function useEventDrag(
  onEventMove?: (event: CalendarEvent, newStart: string, newEnd: string) => void,
  gridRef?: React.RefObject<HTMLDivElement | null>,
  weekDaysRef?: React.MutableRefObject<Date[]>,
) {
  const dragRef = useRef<DragInfo | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didDragRef = useRef(false);
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick(t => t + 1), []);

  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    event: CalendarEvent,
    startMin: number,
    durationMin: number,
    dayIndex: number = 0,
  ) => {
    if (!isDraggableEvent(event) || e.button !== 0 || e.pointerType === 'touch') return;
    dragRef.current = {
      eventId: event.id,
      event,
      startY: e.clientY,
      originalStartMin: startMin,
      currentStartMin: startMin,
      durationMin,
      active: false,
      originalDayIndex: dayIndex,
      currentDayIndex: dayIndex,
    };
    didDragRef.current = false;
    longPressRef.current = setTimeout(() => {
      if (!dragRef.current) return;
      dragRef.current.active = true;
      didDragRef.current = true;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      rerender();
    }, 300);
  }, [rerender]);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const info = dragRef.current;
      if (!info) return;
      if (!info.active) {
        if (Math.abs(e.clientY - info.startY) > 15) {
          if (longPressRef.current) clearTimeout(longPressRef.current);
          longPressRef.current = null;
          dragRef.current = null;
        }
        return;
      }
      e.preventDefault();
      const dy = e.clientY - info.startY;
      const deltaMin = Math.round((dy / HOUR_HEIGHT) * 60 / SNAP_MINUTES) * SNAP_MINUTES;
      const newMin = Math.max(0, Math.min(24 * 60 - info.durationMin, info.originalStartMin + deltaMin));

      let dayChanged = false;
      if (gridRef?.current && weekDaysRef?.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const colWidth = rect.width / weekDaysRef.current.length;
        const colIndex = Math.max(0, Math.min(weekDaysRef.current.length - 1, Math.floor(relX / colWidth)));
        if (colIndex !== info.currentDayIndex) {
          info.currentDayIndex = colIndex;
          dayChanged = true;
        }
      }

      if (newMin !== info.currentStartMin || dayChanged) {
        info.currentStartMin = newMin;
        setTick(t => t + 1);
      }
    };

    const handleUp = (e: PointerEvent) => {
      const info = dragRef.current;
      if (longPressRef.current) {
        clearTimeout(longPressRef.current);
        longPressRef.current = null;
      }
      if (info?.active && onEventMove) {
        // Recalculate column from final pointer position to avoid stale currentDayIndex
        if (gridRef?.current && weekDaysRef?.current) {
          const rect = gridRef.current.getBoundingClientRect();
          const relX = e.clientX - rect.left;
          const colWidth = rect.width / weekDaysRef.current.length;
          info.currentDayIndex = Math.max(0, Math.min(weekDaysRef.current.length - 1, Math.floor(relX / colWidth)));
        }

        const timeChanged = info.currentStartMin !== info.originalStartMin;
        const dayChanged = info.currentDayIndex !== info.originalDayIndex;

        if (timeChanged || dayChanged) {
          const durationMs = parseISO(info.event.end_time).getTime() - parseISO(info.event.start_time).getTime();
          const hours = Math.floor(info.currentStartMin / 60);
          const mins = info.currentStartMin % 60;

          let dateStr: string;
          if (weekDaysRef?.current) {
            dateStr = format(weekDaysRef.current[info.currentDayIndex], 'yyyy-MM-dd');
          } else {
            dateStr = format(parseISO(info.event.start_time), 'yyyy-MM-dd');
          }
          // Construct local date-time string and parse as local time (same approach as CalendarEventModal)
          const pad = (n: number) => String(n).padStart(2, '0');
          const newStart = new Date(`${dateStr}T${pad(hours)}:${pad(mins)}:00`);
          const newEnd = new Date(newStart.getTime() + durationMs);

          onEventMove(info.event, formatLocalDateTime(newStart), formatLocalDateTime(newEnd));
        }
      }
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      dragRef.current = null;
      setTick(t => t + 1);
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [onEventMove, gridRef, weekDaysRef]);

  return {
    handlePointerDown,
    activeDrag: dragRef.current?.active ? dragRef.current : null,
    didDragRef,
  };
}

function formatMinutes(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

const DAY_LABELS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'];
const DAY_LABELS_FULL = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.'];

interface LayoutedEvent {
  event: CalendarEvent;
  col: number;
  totalCols: number;
}

function layoutEvents(events: CalendarEvent[]): LayoutedEvent[] {
  if (events.length === 0) return [];

  // Compute startMin/endMin for each event
  const items = events.map(event => {
    const start = parseISO(event.start_time);
    const end = parseISO(event.end_time);
    const startMin = start.getHours() * 60 + start.getMinutes();
    const rawEndMin = end.getHours() * 60 + end.getMinutes();
    const endMin = rawEndMin <= startMin ? 24 * 60 : rawEndMin;
    return { event, startMin, endMin: Math.max(endMin, startMin + 1) };
  });

  // Sort by start time, then by duration descending
  items.sort((a, b) => a.startMin - b.startMin || (b.endMin - b.startMin) - (a.endMin - a.startMin));

  // Group into overlapping clusters
  const clusters: (typeof items)[] = [];
  let currentCluster = [items[0]];
  let clusterEnd = items[0].endMin;

  for (let i = 1; i < items.length; i++) {
    if (items[i].startMin < clusterEnd) {
      currentCluster.push(items[i]);
      clusterEnd = Math.max(clusterEnd, items[i].endMin);
    } else {
      clusters.push(currentCluster);
      currentCluster = [items[i]];
      clusterEnd = items[i].endMin;
    }
  }
  clusters.push(currentCluster);

  // Assign columns within each cluster
  const result: LayoutedEvent[] = [];
  for (const cluster of clusters) {
    const columns: number[][] = []; // columns[col] = list of endMin values
    const assignments: { item: typeof items[0]; col: number }[] = [];

    for (const item of cluster) {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (columns[c].every(end => item.startMin >= end)) {
          columns[c].push(item.endMin);
          assignments.push({ item, col: c });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([item.endMin]);
        assignments.push({ item, col: columns.length - 1 });
      }
    }

    const totalCols = columns.length;
    for (const { item, col } of assignments) {
      result.push({ event: item.event, col, totalCols });
    }
  }

  return result;
}

function useNowMinutes(): number {
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);
  return nowMinutes;
}

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  orders: Order[];
  currentMonth: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date, hour: number) => void;
  onToggleConfirmed?: (event: CalendarEvent, confirmed: boolean) => void;
  onEventMove?: (event: CalendarEvent, newStartTime: string, newEndTime: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  loading?: boolean;
  topWidget?: React.ReactNode;
  actionButtons?: React.ReactNode;
  summaryBlock?: React.ReactNode;
  confirmationBar?: React.ReactNode;
}

function GoogleIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const PERSONAL_EVENT_COLOR = '#22c55e';

const tailwindColorMap: Record<string, string> = {
  'violet-600': '#7c3aed',
  'purple-500': '#a855f7',
  'indigo-500': '#6366f1',
  'blue-600': '#2563eb',
  'blue-500': '#3b82f6',
  'cyan-500': '#06b6d4',
  'emerald-500': '#10b981',
  'teal-600': '#0d9488',
  'amber-500': '#f59e0b',
  'orange-600': '#ea580c',
  'rose-500': '#f43f5e',
  'pink-600': '#db2777',
  'fuchsia-500': '#d946ef',
  'slate-700': '#334155',
  'zinc-800': '#27272a',
};

function getIndicatorColor(walletColor: string): string {
  if (!walletColor) return 'hsl(var(--primary))';
  if (walletColor.startsWith('plasma:')) return walletColor.slice(7);
  if (walletColor.startsWith('grainient:')) return walletColor.slice(10).split(':')[0];
  const hexMatch = walletColor.match(/#[0-9a-fA-F]{3,8}/);
  if (hexMatch) return hexMatch[0];
  // Extract first Tailwind color from gradient class (e.g. "from-violet-600 to-purple-500")
  const twMatch = walletColor.match(/from-([a-z]+-\d+)/);
  if (twMatch && tailwindColorMap[twMatch[1]]) return tailwindColorMap[twMatch[1]];
  return 'hsl(var(--primary))';
}

function getEventColor(event: CalendarEvent): string {
  if (event.event_type === 'personal') return PERSONAL_EVENT_COLOR;
  return getIndicatorColor(event.walletColor);
}

export function WeeklyCalendar({
  events,
  orders,
  currentMonth,
  selectedDate,
  onSelectDate,
  onEventClick,
  onSlotClick,
  onToggleConfirmed,
  onEventMove,
  onPrevMonth,
  onNextMonth,
  onToday,
  loading,
  topWidget,
  actionButtons,
  summaryBlock,
  confirmationBar,
}: WeeklyCalendarProps) {
  // Build the grid of days: from Monday before month start to Sunday after month end
  const gridDays = useMemo(() => {
    const monthS = startOfMonth(currentMonth);
    const monthE = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthS, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthE, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  // Map events by date
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = format(parseISO(event.start_time), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [events]);

  // Daily earnings from settled work events + settled flat-billed orders.
  // Hourly-billed orders contribute via their linked calendar events, so
  // counting them again would double-count — mirrors the rule used by
  // getMonthlySummary on the server.
  const earningsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const ev of events) {
      if (!ev.is_settled) continue;
      if (ev.event_type === 'personal') continue;
      const key = ev.start_time.split('T')[0];
      const hours = (parseISO(ev.end_time).getTime() - parseISO(ev.start_time).getTime()) / 3_600_000;
      map.set(key, (map.get(key) || 0) + hours * ev.hourly_rate);
    }
    for (const o of orders) {
      if (!o.is_settled) continue;
      if (o.billing_type !== 'flat') continue;
      if (!o.completion_date) continue;
      const key = o.completion_date.split('T')[0];
      map.set(key, (map.get(key) || 0) + o.amount);
    }
    return map;
  }, [events, orders]);

  // Max earning across days of the currently displayed month — drives the
  // color tier of each day's earnings label. Computed only over the month's
  // own days (not the leading/trailing days from neighbouring months).
  const monthMaxEarning = useMemo(() => {
    let max = 0;
    const monthS = startOfMonth(currentMonth);
    const monthE = endOfMonth(currentMonth);
    for (const day of eachDayOfInterval({ start: monthS, end: monthE })) {
      const key = format(day, 'yyyy-MM-dd');
      const v = earningsByDay.get(key) || 0;
      if (v > max) max = v;
    }
    return max;
  }, [currentMonth, earningsByDay]);

  // Sum of earnings across in-month days — drives the "Total" pill in the top bar.
  const totalMonthEarnings = useMemo(() => {
    let sum = 0;
    const monthS = startOfMonth(currentMonth);
    const monthE = endOfMonth(currentMonth);
    for (const day of eachDayOfInterval({ start: monthS, end: monthE })) {
      sum += earningsByDay.get(format(day, 'yyyy-MM-dd')) || 0;
    }
    return sum;
  }, [currentMonth, earningsByDay]);

  // Per-week earnings aligned to the monthly grid rows. Computed locally from
  // earningsByDay so leading/trailing days fall in the correct visual row
  // (ISO-week numbers from the server would mis-bucket them).
  const weekChunks = useMemo(() => {
    const chunks: { start: Date; total: number }[] = [];
    for (let i = 0; i < gridDays.length; i += 7) {
      const week = gridDays.slice(i, i + 7);
      const total = week.reduce(
        (s, d) => s + (earningsByDay.get(format(d, 'yyyy-MM-dd')) || 0),
        0,
      );
      chunks.push({ start: week[0], total });
    }
    return chunks;
  }, [gridDays, earningsByDay]);

  const weekMaxEarning = useMemo(
    () => weekChunks.reduce((m, c) => (c.total > m ? c.total : m), 0),
    [weekChunks],
  );

  // Events for selected day
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    const dayEvents = eventsByDay.get(key) || [];
    return [...dayEvents].sort(
      (a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
    );
  }, [selectedDate, eventsByDay]);

  // Week days derived from selectedDate for week view
  const weekDays = useMemo(() => {
    const base = selectedDate || new Date();
    const ws = startOfWeek(base, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  }, [selectedDate]);

  // Click a week row in the right column → jump the week view to that week.
  // Pick today if it falls inside the clicked week, otherwise its Monday.
  const handleWeekSelect = useCallback((weekStart: Date) => {
    const today = new Date();
    const weekEnd = addDays(weekStart, 6);
    const target = today >= weekStart && today <= weekEnd ? today : weekStart;
    onSelectDate(target);
  }, [onSelectDate]);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Top bar: month nav + TimerWidget + action buttons + add event */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-0.5 bg-secondary/60 border border-border rounded-full p-1 shadow-sm">
          <button
            onClick={onPrevMonth}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-full text-foreground/70 hover:text-foreground hover:bg-background active:scale-95 transition-all disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onToday}
            disabled={loading}
            className="px-4 h-9 text-base font-bold text-foreground capitalize hover:text-primary transition-colors min-w-[150px] disabled:opacity-50"
          >
            {format(currentMonth, 'LLLL yyyy', { locale: pl })}
          </button>
          <button
            onClick={onNextMonth}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-full text-foreground/70 hover:text-foreground hover:bg-background active:scale-95 transition-all disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div
          className="hidden md:flex items-center h-9 px-4 bg-secondary/60 border border-border rounded-full shadow-sm"
          title="Suma zarobków w bieżącym miesiącu"
        >
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Total</span>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(totalMonthEarnings)}
            <span className="text-xs font-normal text-muted-foreground ml-1">PLN</span>
          </span>
        </div>
        {topWidget && <div className="flex-1 min-w-0">{topWidget}</div>}
        {(actionButtons || selectedDate) && (
          <div className="flex items-center gap-2">
            {actionButtons}
            <button
              onClick={() => selectedDate && onSlotClick(selectedDate, new Date().getHours())}
              disabled={!selectedDate}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Dodaj wydarzenie"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Month grid (left) + week-nav + week view (right) */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="bg-card border border-border rounded-xl p-2.5">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-1.5"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {gridDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDay.get(key) || [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const selected = selectedDate ? isSameDay(day, selectedDate) : false;
              const indicators = dayEvents.slice(0, 3);
              const overflow = dayEvents.length - 3;

              return (
                <button
                  key={key}
                  onClick={() => onSelectDate(day)}
                  className={`relative flex flex-col items-center gap-0.5 py-2 min-h-[76px] rounded-lg transition-colors ${
                    !inMonth ? 'opacity-40' : ''
                  } ${selected ? 'bg-accent' : 'hover:bg-accent/50'}`}
                >
                  {/* Day number */}
                  <span
                    className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full transition-colors ${
                      selected
                        ? 'bg-foreground text-background'
                        : today
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Event indicators */}
                  <div className="flex gap-0.5 mt-0.5 h-[5px]">
                    {indicators.map((ev, i) => (
                      <div
                        key={i}
                        className="w-[6px] h-[4px] rounded-full"
                        style={{ backgroundColor: getEventColor(ev) }}
                      />
                    ))}
                    {overflow > 0 && (
                      <span className="text-[8px] leading-[5px] text-muted-foreground font-medium">
                        +{overflow}
                      </span>
                    )}
                  </div>

                  {/* Daily earnings — color tier based on % of month's max. Future days: invisible placeholder keeps row heights equal */}
                  {(() => {
                    const isFuture = day.getTime() > Date.now() && !today;
                    if (isFuture) {
                      return <span className="text-xs mt-1 leading-tight invisible">+0 PLN</span>;
                    }
                    const amount = Math.round(earningsByDay.get(key) || 0);
                    const pct = monthMaxEarning > 0 ? amount / monthMaxEarning : 0;

                    let colorClass: string;
                    if (amount === 0) {
                      colorClass = 'text-muted-foreground/60';
                    } else if (pct >= 0.9) {
                      colorClass = 'text-emerald-600 dark:text-emerald-400 font-bold';
                    } else if (pct >= 0.6) {
                      colorClass = 'text-emerald-500 font-semibold';
                    } else if (pct >= 0.3) {
                      colorClass = 'text-emerald-400';
                    } else {
                      colorClass = 'text-amber-500';
                    }

                    return (
                      <span className={`text-xs mt-1 leading-tight ${colorClass}`}>
                        +{amount} PLN
                      </span>
                    );
                  })()}
                </button>
              );
            })}
          </div>
      </div>

        {/* Right column on lg — clickable week list + week time grid (or
            mobile event list on smaller screens). Falls below the monthly
            card on <lg by grid auto-flow. */}
        <aside className="flex flex-col gap-3 min-w-0">
          {/* Clickable week navigation */}
          <nav className="bg-card border border-border rounded-xl p-2 flex flex-col gap-0.5">
            {weekChunks.map(({ start, total }, idx) => {
              const weekEnd = addDays(start, 6);
              const isActive = !!(selectedDate && selectedDate >= start && selectedDate <= weekEnd);
              const amount = Math.round(total);
              const pct = weekMaxEarning > 0 ? amount / weekMaxEarning : 0;
              let colorClass: string;
              if (amount === 0) colorClass = 'text-muted-foreground/60';
              else if (pct >= 0.9) colorClass = 'text-emerald-600 dark:text-emerald-400 font-bold';
              else if (pct >= 0.6) colorClass = 'text-emerald-500 font-semibold';
              else if (pct >= 0.3) colorClass = 'text-emerald-400';
              else colorClass = 'text-amber-500';
              return (
                <button
                  key={start.toISOString()}
                  onClick={() => handleWeekSelect(start)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    isActive ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground shrink-0">
                      Tydzień {idx + 1}
                    </span>
                    <span className="text-xs text-muted-foreground/80 truncate">
                      {format(start, 'd MMM', { locale: pl })} – {format(weekEnd, 'd MMM', { locale: pl })}
                    </span>
                  </div>
                  <span className={`text-sm tabular-nums shrink-0 ${colorClass}`}>
                    +{amount.toLocaleString('pl-PL')} PLN
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Desktop week time grid */}
          {selectedDate ? (
            <div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden">
              <WeekTimeGrid
                weekDays={weekDays}
                eventsByDay={eventsByDay}
                selectedDate={selectedDate}
                onSlotClick={onSlotClick}
                onEventClick={onEventClick}
                onSelectDate={onSelectDate}
                onToggleConfirmed={onToggleConfirmed}
                onEventMove={onEventMove}
              />
            </div>
          ) : (
            <div className="hidden lg:flex bg-card border border-border rounded-xl items-center justify-center py-16 text-sm text-muted-foreground">
              Wybierz dzień, aby zobaczyć wydarzenia
            </div>
          )}

          {/* Mobile event list */}
          {selectedDate && (
            <div className="lg:hidden bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="text-base font-semibold text-foreground capitalize">
                  {format(selectedDate, 'EEEE, d MMMM', { locale: pl })}
                </h2>
                <button
                  onClick={() => onSlotClick(selectedDate, new Date().getHours())}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                {selectedDayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Brak wydarzeń
                  </p>
                ) : (
                  selectedDayEvents.map((event) => {
                    const start = parseISO(event.start_time);
                    const end = parseISO(event.end_time);
                    const eventHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    const earnings = eventHours * event.hourly_rate;
                    const indicatorColor = getEventColor(event);

                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={`flex items-stretch gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
                          event.is_settled ? 'opacity-60' : ''
                        }`}
                      >
                        <div
                          className="w-1 rounded-full shrink-0"
                          style={{ backgroundColor: indicatorColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate flex items-center gap-1">
                            {event.google_event_id && <GoogleIcon className="w-3 h-3 flex-shrink-0" />}
                            {event.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                            <span className="mx-1.5">·</span>
                            {eventHours.toFixed(1)}h
                            {event.event_type !== 'personal' && (
                              <>
                                <span className="mx-1.5">·</span>
                                {earnings.toFixed(0)} PLN
                              </>
                            )}
                          </div>
                        </div>
                        {onToggleConfirmed && event.event_type !== 'personal' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleConfirmed(event, !event.is_confirmed);
                            }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 self-center transition-colors ${
                              event.is_confirmed
                                ? 'bg-primary border-primary'
                                : 'hover:border-primary/70'
                            }`}
                            style={{ borderColor: event.is_confirmed ? '' : 'var(--card-foreground)' }}
                          >
                            {event.is_confirmed && (
                              <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {confirmationBar}
      {summaryBlock}
    </div>
  );
}

/* ── Desktop week time grid (Apple Calendar week view) ── */

const WeekTimeGrid = memo(function WeekTimeGrid({
  weekDays,
  eventsByDay,
  selectedDate,
  onSlotClick,
  onEventClick,
  onSelectDate,
  onToggleConfirmed,
  onEventMove,
}: {
  weekDays: Date[];
  eventsByDay: Map<string, CalendarEvent[]>;
  selectedDate: Date | null;
  onSlotClick: (date: Date, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
  onToggleConfirmed?: (event: CalendarEvent, confirmed: boolean) => void;
  onEventMove?: (event: CalendarEvent, newStart: string, newEnd: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayColumnsRef = useRef<HTMLDivElement>(null);
  const weekDaysRef = useRef(weekDays);
  weekDaysRef.current = weekDays;
  const { handlePointerDown, activeDrag, didDragRef } = useEventDrag(onEventMove, dayColumnsRef, weekDaysRef);

  // Collect all events for this week to determine scroll position and adaptive range
  const allWeekEvents = useMemo(() => {
    const result: CalendarEvent[] = [];
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      const dayEvts = eventsByDay.get(key) || [];
      result.push(...dayEvts);
    }
    return result.sort(
      (a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
    );
  }, [weekDays, eventsByDay]);

  // Adaptive visible range: default 6:00–23:00, expand with ±1h buffer when any
  // event in the displayed week falls outside. Clamped to [0, 24].
  const visibleRange = useMemo(() => {
    let min = DEFAULT_DAY_START_HOUR;
    let max = DEFAULT_DAY_END_HOUR;
    for (const ev of allWeekEvents) {
      const start = parseISO(ev.start_time);
      const end = parseISO(ev.end_time);
      const startH = start.getHours();
      // Round end up to the next hour if it spills past the hour mark
      const endH = end.getHours() + (end.getMinutes() > 0 ? 1 : 0);
      if (startH < min) min = Math.max(0, startH - RANGE_BUFFER_HOURS);
      if (endH > max) max = Math.min(24, endH + RANGE_BUFFER_HOURS);
    }
    return { start: min, end: max };
  }, [allWeekEvents]);

  const hours = useMemo(
    () => Array.from({ length: visibleRange.end - visibleRange.start }, (_, i) => visibleRange.start + i),
    [visibleRange]
  );

  useEffect(() => {
    if (!scrollRef.current) return;
    let scrollToHour: number;
    if (allWeekEvents.length > 0) {
      const firstStart = parseISO(allWeekEvents[0].start_time);
      scrollToHour = Math.max(visibleRange.start, firstStart.getHours() - 1);
    } else {
      const today = weekDays.find(d => isToday(d));
      scrollToHour = today ? Math.max(visibleRange.start, new Date().getHours() - 2) : Math.max(visibleRange.start, 8);
    }
    // Offset relative to visible range start
    scrollRef.current.scrollTop = (scrollToHour - visibleRange.start) * HOUR_HEIGHT;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDays, visibleRange.start]);

  // Memoize layout computation per day
  const layoutByDay = useMemo(() => {
    const map = new Map<string, LayoutedEvent[]>();
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      const dayEvents = eventsByDay.get(key) || [];
      map.set(key, layoutEvents(dayEvents));
    }
    return map;
  }, [weekDays, eventsByDay]);

  const nowMinutes = useNowMinutes();
  const nowTop = ((nowMinutes - visibleRange.start * 60) / 60) * HOUR_HEIGHT;

  return (
    <div>
      {/* Day column headers */}
      <div className="flex border-b border-border sticky top-0 z-10 bg-card">
        <div className="w-14 shrink-0" />
        {weekDays.map((day, i) => {
          const today = isToday(day);
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;
          return (
            <div
              key={i}
              className={`flex-1 text-center py-2 border-l border-border cursor-pointer hover:bg-accent/30 transition-colors ${
                today ? 'bg-primary/5' : ''
              }`}
              onClick={() => onSelectDate(day)}
            >
              <div className="text-xs text-muted-foreground">
                {DAY_LABELS_FULL[i]},
              </div>
              <div className={`text-base font-semibold mx-auto w-8 h-8 flex items-center justify-center rounded-full ${
                selected
                  ? 'bg-foreground text-background'
                  : today
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        <div className="relative flex" style={{ height: hours.length * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="w-14 shrink-0 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute right-3 text-xs text-muted-foreground -translate-y-1/2"
                style={{ top: (hour - visibleRange.start) * HOUR_HEIGHT }}
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div ref={dayColumnsRef} className="flex-1 flex relative">
          {weekDays.map((day, dayIndex) => {
            const key = format(day, 'yyyy-MM-dd');
            const today = isToday(day);
            const isDragTarget = activeDrag && activeDrag.currentDayIndex === dayIndex && activeDrag.originalDayIndex !== dayIndex;

            return (
              <div
                key={dayIndex}
                className={`flex-1 relative border-l border-border ${today ? 'bg-primary/5' : ''}`}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border/40 cursor-pointer hover:bg-accent/20 transition-colors"
                    style={{ top: (hour - visibleRange.start) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    onClick={() => onSlotClick(day, hour)}
                  />
                ))}

                {/* Drag overlay (per-column to stay in stacking context) */}
                {activeDrag && (
                  <div className="fixed inset-0 z-20 cursor-grabbing" />
                )}

                {/* Events */}
                {(layoutByDay.get(key) || []).map(({ event, col, totalCols }) => {
                  const start = parseISO(event.start_time);
                  const end = parseISO(event.end_time);
                  const startMin = start.getHours() * 60 + start.getMinutes();
                  const endMin = end.getHours() * 60 + end.getMinutes();
                  const effectiveEndMin = endMin <= startMin ? 24 * 60 : endMin;
                  const durationMin = effectiveEndMin - startMin;
                  const dragged = activeDrag?.eventId === event.id;
                  const draggedAway = dragged && activeDrag.currentDayIndex !== dayIndex;
                  const displayStartMin = dragged && !draggedAway ? activeDrag.currentStartMin : startMin;
                  const displayEndMin = displayStartMin + durationMin;
                  const top = ((displayStartMin - visibleRange.start * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max((durationMin / 60) * HOUR_HEIGHT, 20);
                  const eventHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  const earnings = eventHours * event.hourly_rate;
                  const color = getEventColor(event);
                  const draggable = isDraggableEvent(event);

                  return (
                    <div
                      key={event.id}
                      className={`absolute rounded px-1.5 py-0.5 transition-opacity hover:opacity-90 ${
                        dragged && !draggedAway ? 'overflow-visible' : 'overflow-hidden'
                      } ${event.is_settled ? 'opacity-60' : ''
                      } ${dragged && !draggedAway ? 'z-30 shadow-lg ring-2 ring-primary/30' : 'z-10'} ${draggable ? 'cursor-grab' : 'cursor-pointer'} ${draggedAway ? 'opacity-20' : ''}`}
                      style={{
                        top,
                        height,
                        left: `calc(${(col / totalCols) * 100}% + 2px)`,
                        width: `calc(${(1 / totalCols) * 100}% - 4px)`,
                        backgroundColor: color + '33',
                        borderLeft: `3px solid ${color}`,
                        transition: dragged ? 'box-shadow 0.2s' : undefined,
                      }}
                      onPointerDown={(e) => handlePointerDown(e, event, startMin, durationMin, dayIndex)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (didDragRef.current) { didDragRef.current = false; return; }
                        onEventClick(event);
                      }}
                    >
                      {/* Drag time tooltip */}
                      {dragged && !draggedAway && (
                        <div className="absolute -top-6 left-0 bg-foreground text-background text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap z-40 pointer-events-none">
                          {formatMinutes(displayStartMin)} – {formatMinutes(displayEndMin)}
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-0.5">
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-foreground truncate leading-tight flex items-center gap-0.5">
                            {event.google_event_id && <GoogleIcon className="w-2.5 h-2.5 flex-shrink-0" />}
                            {event.title}
                          </div>
                          {height > 30 && (
                            <div className="text-[10px] text-muted-foreground truncate">
                              {dragged && !draggedAway
                                ? `${formatMinutes(displayStartMin)} – ${formatMinutes(displayEndMin)}`
                                : `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`}
                              {event.event_type !== 'personal' && (
                                <>
                                  <span className="mx-0.5">·</span>
                                  {earnings.toFixed(0)} PLN
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        {onToggleConfirmed && event.event_type !== 'personal' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleConfirmed(event, !event.is_confirmed);
                            }}
                            className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              event.is_confirmed
                                ? 'bg-primary border-primary'
                                : 'hover:border-primary/70'
                            }`}
                            style={{ borderColor: event.is_confirmed ? '' : 'var(--card-foreground)' }}
                          >
                            {event.is_confirmed && (
                              <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Cross-day drag ghost */}
                {isDragTarget && (() => {
                  const ev = activeDrag.event;
                  const ghostColor = getEventColor(ev);
                  const ghostTop = ((activeDrag.currentStartMin - visibleRange.start * 60) / 60) * HOUR_HEIGHT;
                  const ghostHeight = Math.max((activeDrag.durationMin / 60) * HOUR_HEIGHT, 20);
                  const ghostEndMin = activeDrag.currentStartMin + activeDrag.durationMin;
                  return (
                    <div
                      className="absolute rounded px-1.5 py-0.5 z-30 shadow-lg ring-2 ring-primary/30 overflow-visible"
                      style={{
                        top: ghostTop,
                        height: ghostHeight,
                        left: '2px',
                        right: '2px',
                        backgroundColor: ghostColor + '33',
                        borderLeft: `3px solid ${ghostColor}`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-foreground text-background text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap z-40 pointer-events-none">
                        {formatMinutes(activeDrag.currentStartMin)} – {formatMinutes(ghostEndMin)}
                      </div>
                      <div className="text-[11px] font-semibold text-foreground truncate leading-tight">
                        {ev.title}
                      </div>
                    </div>
                  );
                })()}

                {/* Current time line */}
                {today && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: nowTop }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                      <div className="flex-1 h-[2px] bg-red-500" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
});
