'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
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
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '@/hooks/useFinanceStore';

const HOUR_HEIGHT = 56;
const DAY_START_HOUR = 0;
const DAY_END_HOUR = 24;
const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);

const DAY_LABELS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'];
const DAY_LABELS_FULL = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.'];

type DesktopViewMode = 'day' | 'week';

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  currentMonth: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date, hour: number) => void;
  onToggleConfirmed?: (event: CalendarEvent, confirmed: boolean) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  loading?: boolean;
  topWidget?: React.ReactNode;
  actionButtons?: React.ReactNode;
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

function getIndicatorColor(walletColor: string): string {
  if (!walletColor) return 'hsl(var(--primary))';
  if (walletColor.startsWith('plasma:')) return walletColor.slice(7);
  if (walletColor.startsWith('grainient:')) return walletColor.slice(10).split(':')[0];
  // Try to extract a hex-like or tailwind color — fallback to primary
  const hexMatch = walletColor.match(/#[0-9a-fA-F]{3,8}/);
  if (hexMatch) return hexMatch[0];
  return 'hsl(var(--primary))';
}

export function WeeklyCalendar({
  events,
  currentMonth,
  selectedDate,
  onSelectDate,
  onEventClick,
  onSlotClick,
  onToggleConfirmed,
  onPrevMonth,
  onNextMonth,
  onToday,
  loading,
  topWidget,
  actionButtons,
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

  // Events for selected day
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    const dayEvents = eventsByDay.get(key) || [];
    return [...dayEvents].sort(
      (a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
    );
  }, [selectedDate, eventsByDay]);

  // Desktop view mode
  const [desktopView, setDesktopView] = useState<DesktopViewMode>('day');

  // Week days derived from selectedDate for week view
  const weekDays = useMemo(() => {
    const base = selectedDate || new Date();
    const ws = startOfWeek(base, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  }, [selectedDate]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Month grid */}
      <div className="lg:w-[340px] shrink-0">
        {/* Timer widget above calendar */}
        {topWidget && <div className="mb-3">{topWidget}</div>}

        <div className="bg-card border border-border rounded-xl p-3">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onPrevMonth}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors"
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              className="text-sm font-semibold text-foreground capitalize hover:text-primary transition-colors"
              disabled={loading}
            >
              {format(currentMonth, 'LLLL yyyy', { locale: pl })}
            </button>
            <button
              onClick={onNextMonth}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors"
              disabled={loading}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-[11px] font-medium text-muted-foreground py-1"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
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
                  className={`relative flex flex-col items-center py-1.5 rounded-lg transition-colors ${
                    !inMonth ? 'opacity-40' : ''
                  } ${selected ? '' : 'hover:bg-accent/50'}`}
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
                        style={{ backgroundColor: getIndicatorColor(ev.walletColor) }}
                      />
                    ))}
                    {overflow > 0 && (
                      <span className="text-[8px] leading-[5px] text-muted-foreground font-medium">
                        +{overflow}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons below calendar */}
        {actionButtons && (
          <div className="mt-3 flex items-center gap-2">
            {actionButtons}
          </div>
        )}
      </div>

      {/* Day detail panel */}
      <div className="flex-1 min-w-0">
        {selectedDate ? (
          <>
            {/* ===== DESKTOP: day/week grid ===== */}
            <div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden">
              {/* Header with view toggle */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold text-foreground capitalize">
                    {desktopView === 'day'
                      ? format(selectedDate, 'd MMMM yyyy', { locale: pl })
                      : format(currentMonth, 'LLLL yyyy', { locale: pl })}
                  </h2>
                  {desktopView === 'day' && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {format(selectedDate, 'EEEE', { locale: pl })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* View toggle */}
                  <div className="flex bg-secondary rounded-lg p-0.5">
                    <button
                      onClick={() => setDesktopView('day')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        desktopView === 'day'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Dzień
                    </button>
                    <button
                      onClick={() => setDesktopView('week')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        desktopView === 'week'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Tydzień
                    </button>
                  </div>
                  <button
                    onClick={() => onSlotClick(selectedDate, new Date().getHours())}
                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day or Week grid */}
              {desktopView === 'day' ? (
                <DayTimeGrid
                  selectedDate={selectedDate}
                  events={selectedDayEvents}
                  onSlotClick={onSlotClick}
                  onEventClick={onEventClick}
                  onToggleConfirmed={onToggleConfirmed}
                />
              ) : (
                <WeekTimeGrid
                  weekDays={weekDays}
                  eventsByDay={eventsByDay}
                  selectedDate={selectedDate}
                  onSlotClick={onSlotClick}
                  onEventClick={onEventClick}
                  onSelectDate={onSelectDate}
                  onToggleConfirmed={onToggleConfirmed}
                />
              )}
            </div>

            {/* ===== MOBILE: event list ===== */}
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
                    const startMin = start.getHours() * 60 + start.getMinutes();
                    const endMin = end.getHours() * 60 + end.getMinutes();
                    const eventHours = (endMin - startMin) / 60;
                    const earnings = eventHours * event.hourly_rate;
                    const indicatorColor = getIndicatorColor(event.walletColor);

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
                            <span className="mx-1.5">·</span>
                            {earnings.toFixed(0)} PLN
                          </div>
                        </div>
                        {onToggleConfirmed && (
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
          </>
        ) : (
          <div className="bg-card border border-border rounded-xl flex items-center justify-center py-16 text-sm text-muted-foreground">
            Wybierz dzień, aby zobaczyć wydarzenia
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Desktop day time grid (Apple Calendar style) ── */

function DayTimeGrid({
  selectedDate,
  events,
  onSlotClick,
  onEventClick,
  onToggleConfirmed,
}: {
  selectedDate: Date;
  events: CalendarEvent[];
  onSlotClick: (date: Date, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  onToggleConfirmed?: (event: CalendarEvent, confirmed: boolean) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to first event or current hour on mount / date change
  useEffect(() => {
    if (!scrollRef.current) return;
    let scrollToHour: number;
    if (events.length > 0) {
      const firstStart = parseISO(events[0].start_time);
      scrollToHour = Math.max(0, firstStart.getHours() - 1);
    } else if (isToday(selectedDate)) {
      scrollToHour = Math.max(0, new Date().getHours() - 2);
    } else {
      scrollToHour = 7;
    }
    scrollRef.current.scrollTop = scrollToHour * HOUR_HEIGHT;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Current time indicator
  const now = new Date();
  const showNowLine = isToday(selectedDate);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      <div className="relative flex" style={{ height: HOURS.length * HOUR_HEIGHT }}>
        {/* Time labels */}
        <div className="w-14 shrink-0 relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute right-3 text-xs text-muted-foreground -translate-y-1/2"
              style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Grid + events column */}
        <div className="flex-1 relative border-l border-border">
          {/* Hour lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full border-t border-border/40 cursor-pointer hover:bg-accent/20 transition-colors"
              style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              onClick={() => onSlotClick(selectedDate, hour)}
            />
          ))}

          {/* Events */}
          {events.map((event) => {
            const start = parseISO(event.start_time);
            const end = parseISO(event.end_time);
            const startMin = start.getHours() * 60 + start.getMinutes();
            const endMin = end.getHours() * 60 + end.getMinutes();
            const top = ((startMin - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
            const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24);
            const eventHours = (endMin - startMin) / 60;
            const earnings = eventHours * event.hourly_rate;
            const color = getIndicatorColor(event.walletColor);

            return (
              <div
                key={event.id}
                className={`absolute left-1 right-2 px-3 py-1.5 cursor-pointer overflow-hidden transition-opacity hover:opacity-90 z-10 ${
                  event.is_settled ? 'opacity-60' : ''
                }`}
                style={{
                  top,
                  height,
                  backgroundColor: color + '22',
                  borderLeft: `3px solid ${color}`,
                }}
                onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                      {event.google_event_id && <GoogleIcon className="w-3 h-3 flex-shrink-0" />}
                      {event.title}
                    </div>
                    {height > 36 && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                        <span className="mx-1">·</span>
                        {earnings.toFixed(0)} PLN
                      </div>
                    )}
                  </div>
                  {onToggleConfirmed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleConfirmed(event, !event.is_confirmed);
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
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
              </div>
            );
          })}

          {/* Current time line */}
          {showNowLine && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: nowTop }}
            >
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
                <div className="flex-1 h-[2px] bg-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Desktop week time grid (Apple Calendar week view) ── */

function WeekTimeGrid({
  weekDays,
  eventsByDay,
  selectedDate,
  onSlotClick,
  onEventClick,
  onSelectDate,
  onToggleConfirmed,
}: {
  weekDays: Date[];
  eventsByDay: Map<string, CalendarEvent[]>;
  selectedDate: Date | null;
  onSlotClick: (date: Date, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
  onToggleConfirmed?: (event: CalendarEvent, confirmed: boolean) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Collect all events for this week to determine scroll position
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

  useEffect(() => {
    if (!scrollRef.current) return;
    let scrollToHour: number;
    if (allWeekEvents.length > 0) {
      const firstStart = parseISO(allWeekEvents[0].start_time);
      scrollToHour = Math.max(0, firstStart.getHours() - 1);
    } else {
      const today = weekDays.find(d => isToday(d));
      scrollToHour = today ? Math.max(0, new Date().getHours() - 2) : 7;
    }
    scrollRef.current.scrollTop = scrollToHour * HOUR_HEIGHT;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDays]);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;

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
        style={{ maxHeight: 'calc(100vh - 260px)' }}
      >
        <div className="relative flex" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="w-14 shrink-0 relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-3 text-xs text-muted-foreground -translate-y-1/2"
                style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(key) || [];
            const today = isToday(day);

            return (
              <div
                key={dayIndex}
                className={`flex-1 relative border-l border-border ${today ? 'bg-primary/5' : ''}`}
              >
                {/* Hour grid lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border/40 cursor-pointer hover:bg-accent/20 transition-colors"
                    style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    onClick={() => onSlotClick(day, hour)}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const start = parseISO(event.start_time);
                  const end = parseISO(event.end_time);
                  const startMin = start.getHours() * 60 + start.getMinutes();
                  const endMin = end.getHours() * 60 + end.getMinutes();
                  const top = ((startMin - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 20);
                  const eventHours = (endMin - startMin) / 60;
                  const earnings = eventHours * event.hourly_rate;
                  const color = getIndicatorColor(event.walletColor);

                  return (
                    <div
                      key={event.id}
                      className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 cursor-pointer overflow-hidden transition-opacity hover:opacity-90 z-10 ${
                        event.is_settled ? 'opacity-60' : ''
                      }`}
                      style={{
                        top,
                        height,
                        backgroundColor: color + '33',
                        borderLeft: `3px solid ${color}`,
                      }}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    >
                      <div className="flex items-start justify-between gap-0.5">
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-foreground truncate leading-tight flex items-center gap-0.5">
                            {event.google_event_id && <GoogleIcon className="w-2.5 h-2.5 flex-shrink-0" />}
                            {event.title}
                          </div>
                          {height > 30 && (
                            <div className="text-[10px] text-muted-foreground truncate">
                              {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                              <span className="mx-0.5">·</span>
                              {earnings.toFixed(0)} PLN
                            </div>
                          )}
                        </div>
                        {onToggleConfirmed && (
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
  );
}
