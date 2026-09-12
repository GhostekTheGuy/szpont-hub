/**
 * Czyste helpery współdzielenia grafiku (free/busy) — bez zależności serwerowych,
 * używane zarówno w server actions, jak i w komponentach klienckich.
 *
 * Czasy bloków są "floating local" (YYYY-MM-DDTHH:mm:ss), tak jak calendar_events.
 */

export type BusyType = 'work' | 'personal';

/** Minimalna informacja, jaką widzi druga strona: tylko kiedy i jaki typ zajętości. */
export interface BusyBlock {
  id: string;
  start_time: string;
  end_time: string;
  event_type: BusyType;
}

export interface FreeWindow {
  /** YYYY-MM-DD */
  date: string;
  /** minuty od północy */
  startMin: number;
  endMin: number;
}

function minutesOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Wspólne wolne okna dla listy dni: przedziały w [dayStartMin, dayEndMin],
 * w których NIKT z podanych zestawów bloków nie jest zajęty, o długości >= minLengthMin.
 * Bloki wychodzące poza dany dzień są przycinane do jego granic.
 */
export function computeCommonFreeWindows(
  days: string[],
  blockSets: BusyBlock[][],
  opts: { dayStartMin?: number; dayEndMin?: number; minLengthMin?: number } = {},
): FreeWindow[] {
  const dayStartMin = opts.dayStartMin ?? 8 * 60;
  const dayEndMin = opts.dayEndMin ?? 20 * 60;
  const minLengthMin = opts.minLengthMin ?? 60;
  const result: FreeWindow[] = [];

  for (const date of days) {
    const dayStart = new Date(`${date}T00:00:00`).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const busy: { s: number; e: number }[] = [];
    for (const set of blockSets) {
      for (const b of set) {
        const s = new Date(b.start_time).getTime();
        const e = new Date(b.end_time).getTime();
        if (e <= dayStart || s >= dayEnd) continue;
        const sMin = s <= dayStart ? 0 : minutesOfDay(b.start_time);
        const eMin = e >= dayEnd ? 24 * 60 : minutesOfDay(b.end_time);
        // Bloki całkowicie poza oknem dnia pomijamy — inaczej przycięcie dałoby odwrócony przedział.
        if (eMin <= dayStartMin || sMin >= dayEndMin) continue;
        busy.push({ s: Math.max(sMin, dayStartMin), e: Math.min(eMin, dayEndMin) });
      }
    }
    busy.sort((a, b) => a.s - b.s);

    let cursor = dayStartMin;
    for (const b of busy) {
      if (b.e <= cursor) continue;
      if (b.s - cursor >= minLengthMin) result.push({ date, startMin: cursor, endMin: b.s });
      cursor = Math.max(cursor, b.e);
    }
    if (dayEndMin - cursor >= minLengthMin) result.push({ date, startMin: cursor, endMin: dayEndMin });
  }

  return result;
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Maskuje adres e-mail do postaci j***@domena.pl — do komunikatów o cudzym zaproszeniu. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 1)}***@${domain}`;
}
