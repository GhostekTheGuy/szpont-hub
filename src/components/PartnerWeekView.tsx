'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, format, isToday, parseISO, startOfWeek } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2, Layers } from 'lucide-react';
import { getSharedWeek } from '@/app/schedule-share-actions';
import { formatLocalDateTime } from '@/lib/calendar-utils';
import {
  computeCommonFreeWindows,
  formatMinutes,
  type BusyBlock,
} from '@/lib/schedule-share-utils';

const HOUR_HEIGHT = 40;
const DEFAULT_START_HOUR = 6;
const DEFAULT_END_HOUR = 23;
const DAY_LABELS = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.'];

interface Props {
  partnerId: string;
  partnerName: string;
}

function minutesOf(iso: string): number {
  const d = parseISO(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** Rozbija blok na fragmenty per dzień (blok może przechodzić przez północ). */
function splitByDay(blocks: BusyBlock[], weekDays: Date[]): Map<string, { block: BusyBlock; startMin: number; endMin: number }[]> {
  const map = new Map<string, { block: BusyBlock; startMin: number; endMin: number }[]>();
  for (const day of weekDays) map.set(format(day, 'yyyy-MM-dd'), []);

  for (const b of blocks) {
    const s = parseISO(b.start_time);
    const e = parseISO(b.end_time);
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = addDays(dayStart, 1);
      if (e <= dayStart || s >= dayEnd) continue;
      const startMin = s <= dayStart ? 0 : minutesOf(b.start_time);
      const endMin = e >= dayEnd ? 24 * 60 : Math.max(minutesOf(b.end_time), startMin + 15);
      map.get(key)!.push({ block: b, startMin, endMin });
    }
  }
  return map;
}

export function PartnerWeekView({ partnerId, partnerName }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [data, setData] = useState<{ partner: BusyBlock[]; mine: BusyBlock[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overlayMine, setOverlayMine] = useState(true);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rangeStart = formatLocalDateTime(weekStart);
      const rangeEnd = formatLocalDateTime(addDays(weekStart, 7));
      const res = await getSharedWeek(partnerId, rangeStart, rangeEnd);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się pobrać grafiku');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [partnerId, weekStart]);

  useEffect(() => { load(); }, [load]);

  const partnerByDay = useMemo(() => splitByDay(data?.partner ?? [], weekDays), [data, weekDays]);
  const mineByDay = useMemo(() => splitByDay(overlayMine ? (data?.mine ?? []) : [], weekDays), [data, weekDays, overlayMine]);

  // Zakres godzin: domyślnie 6–23, rozszerzany gdy cokolwiek wypada poza.
  const range = useMemo(() => {
    let min = DEFAULT_START_HOUR;
    let max = DEFAULT_END_HOUR;
    const all = [...Array.from(partnerByDay.values()), ...Array.from(mineByDay.values())].flat();
    for (const f of all) {
      const sh = Math.floor(f.startMin / 60);
      const eh = Math.ceil(f.endMin / 60);
      if (sh < min) min = Math.max(0, sh);
      if (eh > max) max = Math.min(24, eh);
    }
    return { start: min, end: max };
  }, [partnerByDay, mineByDay]);

  const hours = useMemo(
    () => Array.from({ length: range.end - range.start }, (_, i) => range.start + i),
    [range],
  );

  const freeWindows = useMemo(() => {
    if (!data) return [];
    const days = weekDays.map(d => format(d, 'yyyy-MM-dd'));
    const sets = overlayMine ? [data.partner, data.mine] : [data.partner];
    return computeCommonFreeWindows(days, sets);
  }, [data, weekDays, overlayMine]);

  const freeByDay = useMemo(() => {
    const map = new Map<string, typeof freeWindows>();
    for (const w of freeWindows) {
      if (!map.has(w.date)) map.set(w.date, []);
      map.get(w.date)!.push(w);
    }
    return map;
  }, [freeWindows]);

  const toTop = (min: number) => ((min - range.start * 60) / 60) * HOUR_HEIGHT;

  return (
    <div className="bg-card border border-border rounded-xl p-3 lg:p-4 flex flex-col gap-4">
      {/* Nagłówek: tydzień + przełącznik nałożenia */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-0.5 bg-secondary/60 border border-border rounded-full p-1 shadow-sm">
          <button
            onClick={() => setWeekStart(w => addDays(w, -7))}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-full text-foreground/70 hover:text-foreground hover:bg-background active:scale-95 transition-all disabled:opacity-50"
            aria-label="Poprzedni tydzień"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            disabled={loading}
            className="px-4 h-9 text-sm font-semibold text-foreground hover:text-primary transition-colors min-w-[170px] disabled:opacity-50"
          >
            {format(weekStart, 'd MMM', { locale: pl })} – {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: pl })}
          </button>
          <button
            onClick={() => setWeekStart(w => addDays(w, 7))}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-full text-foreground/70 hover:text-foreground hover:bg-background active:scale-95 transition-all disabled:opacity-50"
            aria-label="Następny tydzień"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-w-0 text-sm text-muted-foreground truncate">
          Grafik: <span className="font-medium text-foreground">{partnerName}</span>
        </div>

        <button
          onClick={() => setOverlayMine(v => !v)}
          className={`flex items-center gap-2 px-3 h-9 rounded-full text-sm font-medium border transition-colors ${
            overlayMine
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-secondary/60 border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          Nałóż mój grafik
        </button>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/80" /> {partnerName} — praca</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-muted-foreground/50" /> {partnerName} — prywatne</span>
        {overlayMine && (
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border-2 border-dashed border-amber-500/80 bg-amber-500/15" /> moje zajęte</span>
        )}
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50" /> {overlayMine ? 'wspólne wolne' : 'wolne'} (≥ 1 h, 8–20)</span>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>
      )}

      {/* Siatka */}
      <div className="relative overflow-x-auto">
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-card/60 backdrop-blur-[1px] rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="min-w-[640px]">
          <div className="flex border-b border-border bg-card">
            <div className="w-12 shrink-0" />
            {weekDays.map((day, i) => {
              const today = isToday(day);
              return (
                <div key={i} className={`flex-1 text-center py-2 border-l border-border ${today ? 'bg-primary/5' : ''}`}>
                  <div className="text-xs text-muted-foreground">{DAY_LABELS[i]}</div>
                  <div className={`text-sm font-semibold mx-auto w-7 h-7 flex items-center justify-center rounded-full ${today ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative flex" style={{ height: hours.length * HOUR_HEIGHT }}>
            <div className="w-12 shrink-0 relative">
              {hours.map(h => (
                <div key={h} className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground" style={{ top: (h - range.start) * HOUR_HEIGHT }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {weekDays.map((day, i) => {
              const key = format(day, 'yyyy-MM-dd');
              const partnerFrags = partnerByDay.get(key) || [];
              const mineFrags = mineByDay.get(key) || [];
              const free = freeByDay.get(key) || [];
              return (
                <div key={i} className={`flex-1 relative border-l border-border ${isToday(day) ? 'bg-primary/[0.03]' : ''}`}>
                  {hours.map(h => (
                    <div key={h} className="absolute left-0 right-0 border-t border-border/60" style={{ top: (h - range.start) * HOUR_HEIGHT }} />
                  ))}

                  {free.map((w, idx) => (
                    <div
                      key={`f${idx}`}
                      className="absolute left-0.5 right-0.5 rounded-sm bg-emerald-500/15 border border-emerald-500/40"
                      style={{ top: toTop(w.startMin), height: Math.max(4, toTop(w.endMin) - toTop(w.startMin)) }}
                      title={`Wolne ${formatMinutes(w.startMin)}–${formatMinutes(w.endMin)}`}
                    />
                  ))}

                  {partnerFrags.map((f, idx) => (
                    <div
                      key={`p${f.block.id}_${idx}`}
                      className={`absolute left-1 right-1 rounded-md px-1.5 py-0.5 text-[10px] leading-tight overflow-hidden ${
                        f.block.event_type === 'work'
                          ? 'bg-primary/80 text-primary-foreground'
                          : 'bg-muted-foreground/50 text-background'
                      }`}
                      style={{ top: toTop(f.startMin), height: Math.max(14, toTop(f.endMin) - toTop(f.startMin) - 2) }}
                      title={`${f.block.event_type === 'work' ? 'Praca' : 'Prywatne'} ${formatMinutes(f.startMin)}–${formatMinutes(f.endMin)}`}
                    >
                      {f.endMin - f.startMin >= 40 && (
                        <span className="font-medium">{formatMinutes(f.startMin)}–{formatMinutes(f.endMin)}</span>
                      )}
                    </div>
                  ))}

                  {mineFrags.map((f, idx) => (
                    <div
                      key={`m${f.block.id}_${idx}`}
                      className="absolute left-2 right-2 rounded-md border-2 border-dashed border-amber-500/80 bg-amber-500/15 pointer-events-none"
                      style={{ top: toTop(f.startMin), height: Math.max(14, toTop(f.endMin) - toTop(f.startMin) - 2) }}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista wolnych okien */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">
          {overlayMine ? 'Wspólne wolne okna' : `Wolne okna — ${partnerName}`}
          <span className="ml-2 text-xs font-normal text-muted-foreground">8:00–20:00, co najmniej godzina</span>
        </h4>
        {!loading && freeWindows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak wolnych okien w tym tygodniu.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const key = format(day, 'yyyy-MM-dd');
              const list = freeByDay.get(key) || [];
              return (
                <div key={i} className="rounded-lg border border-border bg-secondary/40 p-2">
                  <div className="text-xs font-medium text-foreground mb-1">{DAY_LABELS[i]} {format(day, 'd.MM')}</div>
                  {list.length === 0 ? (
                    <div className="text-xs text-muted-foreground">—</div>
                  ) : (
                    list.map((w, idx) => (
                      <div key={idx} className="text-xs text-emerald-600 dark:text-emerald-400">
                        {formatMinutes(w.startMin)}–{formatMinutes(w.endMin)}
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
