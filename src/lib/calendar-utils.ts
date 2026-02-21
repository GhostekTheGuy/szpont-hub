/**
 * Shared helpers for expanding recurring calendar events.
 * Used by both getCalendarEvents and summary functions in actions.ts.
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

    if (rule === 'daily') {
      for (let d = new Date(wsDate); d <= weDate; d.setDate(d.getDate() + 1)) {
        const instanceStart = new Date(d);
        instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), 0);
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);
        if (instanceStart >= wsDate && instanceEnd <= weDate && instanceStart > origStart) {
          expanded.push({
            ...event,
            id: `${event.id}_${instanceStart.toISOString().split('T')[0]}`,
            start_time: instanceStart.toISOString(),
            end_time: instanceEnd.toISOString(),
            is_settled: false,
            is_confirmed: false,
          });
        }
      }
    } else if (rule === 'weekly') {
      const origDay = origStart.getDay();
      const wsDay = wsDate.getDay();
      let diff = origDay - wsDay;
      if (diff < 0) diff += 7;
      const firstInstance = new Date(wsDate);
      firstInstance.setDate(firstInstance.getDate() + diff);

      for (let d = new Date(firstInstance); d <= weDate; d.setDate(d.getDate() + 7)) {
        const instanceStart = new Date(d);
        instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), 0);
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);
        if (instanceStart >= wsDate && instanceEnd <= weDate && instanceStart > origStart) {
          expanded.push({
            ...event,
            id: `${event.id}_${instanceStart.toISOString().split('T')[0]}`,
            start_time: instanceStart.toISOString(),
            end_time: instanceEnd.toISOString(),
            is_settled: false,
            is_confirmed: false,
          });
        }
      }
    } else if (rule === 'monthly') {
      const origDayOfMonth = origStart.getDate();
      for (let d = new Date(wsDate); d <= weDate; d.setDate(d.getDate() + 1)) {
        if (d.getDate() === origDayOfMonth && d > origStart) {
          const instanceStart = new Date(d);
          instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), 0);
          const instanceEnd = new Date(instanceStart.getTime() + durationMs);
          if (instanceStart >= wsDate && instanceEnd <= weDate) {
            expanded.push({
              ...event,
              id: `${event.id}_${instanceStart.toISOString().split('T')[0]}`,
              start_time: instanceStart.toISOString(),
              end_time: instanceEnd.toISOString(),
              is_settled: false,
              is_confirmed: false,
            });
          }
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
