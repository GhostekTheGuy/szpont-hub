'use client';

import { useMemo, useEffect, useRef } from 'react';
import { format, isSameDay, isToday, addDays, startOfWeek, differenceInMinutes, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { CalendarEvent } from '@/hooks/useFinanceStore';

const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 6;
const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const DAY_LABELS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'];

interface WeeklyCalendarProps {
  weekStart: Date;
  events: CalendarEvent[];
  onSlotClick: (date: Date, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function getEventColor(walletColor: string): string {
  if (!walletColor) return 'bg-primary/80';
  if (walletColor.startsWith('plasma:')) {
    const hex = walletColor.slice(7);
    return '';
  }
  if (walletColor.startsWith('grainient:')) {
    const hex = walletColor.slice(10).split(':')[0];
    return '';
  }
  // Gradient - extract first tailwind color
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

export function WeeklyCalendar({ weekStart, events, onSlotClick, onEventClick }: WeeklyCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Scroll to current hour on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const scrollTo = (now.getHours() - START_HOUR - 2) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, []);

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
  const nowTop = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const showNowLine = nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-card border border-border rounded-xl overflow-hidden">
      {/* Header with day names */}
      <div className="flex border-b border-border shrink-0">
        <div className="w-16 shrink-0" />
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

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="flex" style={{ minHeight: HOURS.length * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="w-16 shrink-0 relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-xs text-muted-foreground -translate-y-1/2"
                style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
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
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border/50 cursor-pointer hover:bg-accent/30 transition-colors"
                    style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    onClick={() => onSlotClick(day, hour)}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const start = parseISO(event.start_time);
                  const end = parseISO(event.end_time);
                  const startMin = start.getHours() * 60 + start.getMinutes();
                  const endMin = end.getHours() * 60 + end.getMinutes();
                  const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 20);
                  const hours = (endMin - startMin) / 60;
                  const earnings = hours * event.hourly_rate;

                  const colorClass = getEventColor(event.walletColor);
                  const colorStyle = getEventStyle(event.walletColor);
                  const useStyle = !!colorStyle.backgroundColor;

                  return (
                    <div
                      key={event.id}
                      className={`absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 cursor-pointer overflow-hidden transition-opacity hover:opacity-90 z-10 ${
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
                      <div className="text-[11px] font-semibold text-white truncate leading-tight">
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
