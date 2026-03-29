/**
 * Shared helpers for expanding recurring calendar events.
 * Used by both getCalendarEvents and summary functions in actions.ts.
 *
 * Calendar event times are stored as LOCAL time strings (no trailing Z)
 * to avoid DST shift issues. The format is YYYY-MM-DDTHH:mm:ss.
 */

/**
 * Format a Date as a local ISO string without timezone suffix.
 * This ensures "14:00" always stays "14:00" regardless of DST changes.
 */
export function formatLocalDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export interface RawCalendarEvent {
  id: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  is_settled: boolean;
  is_confirmed: boolean;
  [key: string]: unknown;
}

/**
 * Expand recurring events into individual instances within a date range.
 * Supports daily, weekly, and monthly recurrence rules.
 */
const MAX_INSTANCES_PER_EVENT = 366;

export function expandRecurringEvents<T extends RawCalendarEvent>(
  recurringEvents: T[],
  rangeStart: string,
  rangeEnd: string,
): T[] {
  const wsDate = new Date(rangeStart);
  const weDate = new Date(rangeEnd);
  const expanded: T[] = [];

  for (const event of recurringEvents) {
    const origStart = new Date(event.start_time);
    const origEnd = new Date(event.end_time);
    const durationMs = origEnd.getTime() - origStart.getTime();
    const rule = event.recurrence_rule;

    let instanceCount = 0;

    if (rule === 'daily') {
      for (let d = new Date(wsDate); d <= weDate && instanceCount < MAX_INSTANCES_PER_EVENT; d.setDate(d.getDate() + 1)) {
        const instanceStart = new Date(d);
        instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), 0);
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);
        if (instanceStart >= wsDate && instanceStart < weDate && instanceStart > origStart) {
          const dateStr = formatLocalDateTime(instanceStart).split('T')[0];
          expanded.push({
            ...event,
            id: `${event.id}_${dateStr}`,
            start_time: formatLocalDateTime(instanceStart),
            end_time: formatLocalDateTime(instanceEnd),
            is_settled: false,
            is_confirmed: false,
          });
          instanceCount++;
        }
      }
    } else if (rule === 'weekly') {
      const origDay = origStart.getDay();
      const wsDay = wsDate.getDay();
      let diff = origDay - wsDay;
      if (diff < 0) diff += 7;
      const firstInstance = new Date(wsDate);
      firstInstance.setDate(firstInstance.getDate() + diff);

      for (let d = new Date(firstInstance); d <= weDate && instanceCount < MAX_INSTANCES_PER_EVENT; d.setDate(d.getDate() + 7)) {
        const instanceStart = new Date(d);
        instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), 0);
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);
        if (instanceStart >= wsDate && instanceStart < weDate && instanceStart > origStart) {
          const dateStr = formatLocalDateTime(instanceStart).split('T')[0];
          expanded.push({
            ...event,
            id: `${event.id}_${dateStr}`,
            start_time: formatLocalDateTime(instanceStart),
            end_time: formatLocalDateTime(instanceEnd),
            is_settled: false,
            is_confirmed: false,
          });
          instanceCount++;
        }
      }
    } else if (rule === 'monthly') {
      const origDayOfMonth = origStart.getDate();
      const startMonth = wsDate.getFullYear() * 12 + wsDate.getMonth();
      const endMonth = weDate.getFullYear() * 12 + weDate.getMonth();
      for (let m = startMonth; m <= endMonth && instanceCount < MAX_INSTANCES_PER_EVENT; m++) {
        const year = Math.floor(m / 12);
        const month = m % 12;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const day = Math.min(origDayOfMonth, lastDay);
        const instanceStart = new Date(year, month, day,
          origStart.getHours(), origStart.getMinutes(), origStart.getSeconds());
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);
        if (instanceStart >= wsDate && instanceStart < weDate && instanceStart > origStart) {
          const dateStr = formatLocalDateTime(instanceStart).split('T')[0];
          expanded.push({
            ...event,
            id: `${event.id}_${dateStr}`,
            start_time: formatLocalDateTime(instanceStart),
            end_time: formatLocalDateTime(instanceEnd),
            is_settled: false,
            is_confirmed: false,
          });
          instanceCount++;
        }
      }
    }
  }

  return expanded;
}

/**
 * Merge DB events with expanded recurring instances, deduplicating by ID.
 */
export function mergeWithExpanded<T extends { id: string }>(
  dbEvents: T[],
  expanded: T[],
): T[] {
  const existingIds = new Set(dbEvents.map(e => e.id));
  return [
    ...dbEvents,
    ...expanded.filter(e => !existingIds.has(e.id)),
  ];
}
