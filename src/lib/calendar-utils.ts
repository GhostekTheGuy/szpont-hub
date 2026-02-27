/**
 * Shared helpers for expanding recurring calendar events.
 * Used by both getCalendarEvents and summary functions in actions.ts.
 *
 * All date operations use UTC methods to avoid server-timezone dependency.
 */

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
      for (let d = new Date(wsDate); d <= weDate && instanceCount < MAX_INSTANCES_PER_EVENT; d.setUTCDate(d.getUTCDate() + 1)) {
        const instanceStart = new Date(d);
        instanceStart.setUTCHours(origStart.getUTCHours(), origStart.getUTCMinutes(), origStart.getUTCSeconds(), 0);
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);
        if (instanceStart >= wsDate && instanceStart < weDate && instanceStart > origStart) {
          expanded.push({
            ...event,
            id: `${event.id}_${instanceStart.toISOString().split('T')[0]}`,
            start_time: instanceStart.toISOString(),
            end_time: instanceEnd.toISOString(),
            is_settled: false,
            is_confirmed: false,
          });
          instanceCount++;
        }
      }
    } else if (rule === 'weekly') {
      const origDay = origStart.getUTCDay();
      const wsDay = wsDate.getUTCDay();
      let diff = origDay - wsDay;
      if (diff < 0) diff += 7;
      const firstInstance = new Date(wsDate);
      firstInstance.setUTCDate(firstInstance.getUTCDate() + diff);

      for (let d = new Date(firstInstance); d <= weDate && instanceCount < MAX_INSTANCES_PER_EVENT; d.setUTCDate(d.getUTCDate() + 7)) {
        const instanceStart = new Date(d);
        instanceStart.setUTCHours(origStart.getUTCHours(), origStart.getUTCMinutes(), origStart.getUTCSeconds(), 0);
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);
        if (instanceStart >= wsDate && instanceStart < weDate && instanceStart > origStart) {
          expanded.push({
            ...event,
            id: `${event.id}_${instanceStart.toISOString().split('T')[0]}`,
            start_time: instanceStart.toISOString(),
            end_time: instanceEnd.toISOString(),
            is_settled: false,
            is_confirmed: false,
          });
          instanceCount++;
        }
      }
    } else if (rule === 'monthly') {
      const origDayOfMonth = origStart.getUTCDate();
      const startMonth = wsDate.getUTCFullYear() * 12 + wsDate.getUTCMonth();
      const endMonth = weDate.getUTCFullYear() * 12 + weDate.getUTCMonth();
      for (let m = startMonth; m <= endMonth && instanceCount < MAX_INSTANCES_PER_EVENT; m++) {
        const year = Math.floor(m / 12);
        const month = m % 12;
        const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        const day = Math.min(origDayOfMonth, lastDay);
        const instanceStart = new Date(Date.UTC(year, month, day,
          origStart.getUTCHours(), origStart.getUTCMinutes(), origStart.getUTCSeconds()));
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);
        if (instanceStart >= wsDate && instanceStart < weDate && instanceStart > origStart) {
          expanded.push({
            ...event,
            id: `${event.id}_${instanceStart.toISOString().split('T')[0]}`,
            start_time: instanceStart.toISOString(),
            end_time: instanceEnd.toISOString(),
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
