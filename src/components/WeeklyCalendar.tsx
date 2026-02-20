'use client';

import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { format, isToday, addDays, parseISO } from 'date-fns';
import type { CalendarEvent } from '@/hooks/useFinanceStore';

const BASE_HOUR_HEIGHT = 60;
const PADDING_HOURS = 1;
const DAY_LABELS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'];

interface WeeklyCalendarProps {
  weekStart: Date;
  events: CalendarEvent[];
  onSlotClick: (date: Date, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  onToggleConfirmed?: (event: CalendarEvent, confirmed: boolean) => void;
}

function getEventColor(walletColor: string): string {
  if (!walletColor) return 'bg-primary/80';
  if (walletColor.startsWith('plasma:')) return '';
  if (walletColor.startsWith('grainient:')) return '';
  const match = walletColor.match(/from-(\w+-\d+)/);
  if (match) return `bg-${match[1]}`;
  return 'bg-primary/80';
}

function getEventStyle(walletColor: string): React.CSSProperties {
  if (!walletColor) return {};
  if (walletColor.startsWith('plasma:')) {
    return { backgroundColor: walletColor.slice(7) + 'cc' };
  }
  if (walletColor.startsWith('grainient:')) {
    return { backgroundColor: walletColor.slice(10).split(':')[0] + 'cc' };
  }
  return {};
}

function usePinchZoom(scrollRef: React.RefObject<HTMLDivElement | null>, initialScale: number) {
  const [scale, setScale] = useState(initialScale);
  const pinchRef = useRef({ active: false, startDist: 0, startScale: 1 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const getDistance = (touches: TouchList) => {
      const [a, b] = [touches[0], touches[1]];
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = {
          active: true,
          startDist: getDistance(e.touches),
          startScale: scale,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pinchRef.current.active || e.touches.length !== 2) return;
      e.preventDefault();
      const dist = getDistance(e.touches);
      const ratio = dist / pinchRef.current.startDist;
      const newScale = Math.min(Math.max(pinchRef.current.startScale * ratio, 0.5), 3);
      setScale(newScale);
    };

    const onTouchEnd = () => {
      pinchRef.current.active = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [scrollRef, scale]);

  return scale;
}

export function WeeklyCalendar({ weekStart, events, onSlotClick, onEventClick, onToggleConfirmed }: WeeklyCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Auto-scale: compute visible hour range from events
  const { startHour, endHour, hours } = useMemo(() => {
    let minHour = 8;
    let maxHour = 18;

    if (events.length > 0) {
      minHour = 24;
      maxHour = 0;
      for (const event of events) {
        const start = parseISO(event.start_time);
        const end = parseISO(event.end_time);
        minHour = Math.min(minHour, start.getHours());
        maxHour = Math.max(maxHour, end.getHours() + (end.getMinutes() > 0 ? 1 : 0));
      }
    }

    // Include current hour if viewing current week
    const now = new Date();
    const currentHour = now.getHours();
    if (days.some(d => isToday(d))) {
      minHour = Math.min(minHour, currentHour);
      maxHour = Math.max(maxHour, currentHour + 1);
    }

    const sh = Math.max(0, minHour - PADDING_HOURS);
    const eh = Math.min(24, maxHour + PADDING_HOURS);

    return {
      startHour: sh,
      endHour: eh,
      hours: Array.from({ length: eh - sh + 1 }, (_, i) => sh + i),
    };
  }, [events, days]);

  const scale = usePinchZoom(scrollRef, 1);
  const hourHeight = BASE_HOUR_HEIGHT * scale;

  // Scroll page to current hour on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const offset = (now.getHours() - startHour - 2) * hourHeight;
      if (offset > 0) {
        const rect = scrollRef.current.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + rect.top + offset - 100, behavior: 'smooth' });
      }
    }
  }, [startHour, hourHeight]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      map.set(key, []);
    }
    for (const event of events) {
      const eventDate = format(parseISO(event.start_time), 'yyyy-MM-dd');
      const dayEvents = map.get(eventDate);
      if (dayEvents) dayEvents.push(event);
    }
    return map;
  }, [events, days]);

  // Current time indicator
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - startHour * 60) / 60) * hourHeight;
  const showNowLine = nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60;

  return (
    <div className="flex flex-col lg:bg-card lg:border lg:border-border lg:rounded-xl">
      {/* Header with day names */}
      <div className="flex border-b border-border shrink-0 sticky top-14 lg:top-0 z-20 bg-background lg:bg-card">
        <div className="w-10 shrink-0" />
        {days.map((day, i) => (
          <div
            key={i}
            className={`flex-1 text-center py-3 border-l border-border ${
              isToday(day) ? 'bg-primary/10' : ''
            }`}
          >
            <div className="text-xs text-muted-foreground uppercase">{DAY_LABELS[i]}</div>
            <div className={`text-lg font-semibold ${
              isToday(day) ? 'text-primary' : 'text-foreground'
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable grid (mobile only scroll, desktop renders fully) */}
      <div ref={scrollRef} className="relative">
        <div className="flex" style={{ minHeight: hours.length * hourHeight }}>
          {/* Time labels */}
          <div className="w-10 shrink-0 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute right-1.5 text-[10px] text-muted-foreground -translate-y-1/2"
                style={{ top: (hour - startHour) * hourHeight }}
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIndex) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(key) || [];
            const today = isToday(day);

            return (
              <div
                key={dayIndex}
                className={`flex-1 relative border-l border-border ${today ? 'bg-primary/5' : ''}`}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border/50 cursor-pointer hover:bg-accent/30 transition-colors group/slot hidden lg:block"
                    style={{ top: (hour - startHour) * hourHeight, height: hourHeight }}
                    onClick={() => onSlotClick(day, hour)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity">
                      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Mobile hour slots (no hover effect) */}
                {hours.map((hour) => (
                  <div
                    key={`m-${hour}`}
                    className="absolute w-full border-t border-border/50 cursor-pointer lg:hidden"
                    style={{ top: (hour - startHour) * hourHeight, height: hourHeight }}
                    onClick={() => onSlotClick(day, hour)}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const start = parseISO(event.start_time);
                  const end = parseISO(event.end_time);
                  const startMin = start.getHours() * 60 + start.getMinutes();
                  const endMin = end.getHours() * 60 + end.getMinutes();
                  const top = ((startMin - startHour * 60) / 60) * hourHeight;
                  const height = Math.max(((endMin - startMin) / 60) * hourHeight, 20);
                  const eventHours = (endMin - startMin) / 60;
                  const earnings = eventHours * event.hourly_rate;

                  const colorClass = getEventColor(event.walletColor);
                  const colorStyle = getEventStyle(event.walletColor);
                  const useStyle = !!colorStyle.backgroundColor;

                  return (
                    <div
                      key={event.id}
                      className={`absolute left-0.5 right-0.5 px-1.5 py-0.5 cursor-pointer overflow-hidden transition-opacity hover:opacity-90 z-10 ${
                        event.is_settled ? 'opacity-60' : ''
                      } ${useStyle ? '' : colorClass}`}
                      style={{
                        top,
                        height,
                        ...colorStyle,
                        ...(!useStyle && !colorClass.startsWith('bg-') ? { backgroundColor: 'hsl(var(--primary) / 0.8)' } : {}),
                      }}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    >
                      <div className="text-[11px] font-semibold text-white truncate leading-tight pr-5">
                        {event.title}
                      </div>
                      {height > 30 && (
                        <div className="text-[10px] text-white/80 truncate">
                          {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                        </div>
                      )}
                      {height > 48 && (
                        <div className="text-[10px] text-white/70 truncate">
                          {earnings.toFixed(0)} PLN
                        </div>
                      )}
                      {/* Confirm checkbox */}
                      {onToggleConfirmed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleConfirmed(event, !event.is_confirmed);
                          }}
                          className={`absolute top-0.5 right-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            event.is_confirmed
                              ? 'bg-white/30 border-white/50'
                              : 'bg-black/20 border-white/40 hover:border-white/70'
                          }`}
                        >
                          {event.is_confirmed && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Current time line */}
                {today && showNowLine && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: nowTop }}
                  >
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1" />
                      <div className="flex-1 h-0.5 bg-red-500" />
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
