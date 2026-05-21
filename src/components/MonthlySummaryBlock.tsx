'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2, Sparkles, FileText, Calculator, X } from 'lucide-react';
import { getMonthlySummary } from '@/app/actions';
import { useFinanceStore, pick } from '@/hooks/useFinanceStore';
import { calculatePIT } from '@/lib/tax-calculator';
import { generatePITPDF } from '@/lib/invoice-pdf';
import { formatLocalDate } from '@/lib/calendar-utils';

interface WalletBreakdown {
  id: string;
  name: string;
  color: string;
  earnings: number;
  hours: number;
}

interface WeekBreakdown {
  week: string;
  earnings: number;
}

interface SummaryData {
  totalEarnings: number;
  totalHours: number;
  byWallet: WalletBreakdown[];
  weeklyBreakdown?: WeekBreakdown[];
  previousPeriodEarnings: number;
  previousPeriodHours: number;
  unsettledCount: number;
  confirmedCount: number;
  eventCount: number;
}

// Previous-period numbers come from the server (we don't have prior months in
// the client store). They rarely change from current-month actions, so cache
// them per month with a generous TTL. Current-period totals are derived
// client-side from the live store — no cache there.
const prevCache = new Map<string, { earnings: number; hours: number; timestamp: number }>();
const PREV_CACHE_TTL = 5 * 60 * 1000;

function getISOWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `Tydzień ${weekNum}`;
}

interface Props {
  monthStart: string;
  monthEnd: string;
  monthLabel: string;
  onGenerateInvoice?: () => void;
  refreshKey?: number;
}

export function MonthlySummaryBlock({ monthStart, monthEnd, monthLabel, onGenerateInvoice, refreshKey }: Props) {
  const { calendarEvents, orders, wallets } = useFinanceStore(pick('calendarEvents', 'orders', 'wallets'));
  const [prevData, setPrevData] = useState<{ earnings: number; hours: number } | null>(null);
  const [ai, setAi] = useState<{ open: boolean; text: string | null; loading: boolean }>({
    open: false,
    text: null,
    loading: false,
  });
  const [taxOpen, setTaxOpen] = useState(false);

  // Current-period summary derived from the live store. Recomputes on every
  // optimistic update (toggle confirmed, settle, drag/move, etc.) so the
  // numbers track the calendar grid in lockstep — no server roundtrip in the
  // hot path. Date strings are local YYYY-MM-DDTHH:mm:ss; lexicographic
  // comparison matches chronological order.
  const currentSummary = useMemo(() => {
    const walletMap = new Map(wallets.map(w => [w.id, { name: w.name, color: w.color }]));
    const monthStartDate = monthStart.split('T')[0];
    const monthEndDate = monthEnd.split('T')[0];

    let total = 0;
    let totalHours = 0;
    let workEventCount = 0;
    let confirmedCount = 0;
    let unsettledCount = 0;
    const byWallet = new Map<string, { name: string; color: string; earnings: number; hours: number }>();
    const weeklyBreakdown = new Map<string, number>();

    for (const e of calendarEvents) {
      if (e.start_time < monthStart || e.start_time > monthEnd) continue;
      if ((e.event_type || 'work') !== 'work') continue;
      workEventCount++;
      if (!e.is_confirmed) continue;
      confirmedCount++;
      if (!e.is_settled) unsettledCount++;

      const hours = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / 3_600_000;
      const earnings = hours * e.hourly_rate;
      total += earnings;
      totalHours += hours;

      const weekNum = getISOWeekLabel(new Date(e.start_time));
      weeklyBreakdown.set(weekNum, (weeklyBreakdown.get(weekNum) || 0) + earnings);

      if (e.wallet_id) {
        const wallet = walletMap.get(e.wallet_id);
        const existing = byWallet.get(e.wallet_id) || {
          name: wallet?.name || e.walletName || '',
          color: wallet?.color || e.walletColor || '',
          earnings: 0,
          hours: 0,
        };
        existing.earnings += earnings;
        existing.hours += hours;
        byWallet.set(e.wallet_id, existing);
      }
    }

    let orderCount = 0;
    let orderUnsettled = 0;
    for (const o of orders) {
      if (o.billing_type !== 'flat') continue;
      if (!o.completion_date) continue;
      const date = o.completion_date.split('T')[0];
      if (date < monthStartDate || date > monthEndDate) continue;
      orderCount++;
      if (!o.is_settled) orderUnsettled++;
      const amount = o.amount;
      if (amount <= 0) continue;
      total += amount;

      const weekNum = getISOWeekLabel(new Date(o.completion_date));
      weeklyBreakdown.set(weekNum, (weeklyBreakdown.get(weekNum) || 0) + amount);

      if (o.wallet_id) {
        const wallet = walletMap.get(o.wallet_id);
        const existing = byWallet.get(o.wallet_id) || {
          name: wallet?.name || o.walletName || '',
          color: wallet?.color || '',
          earnings: 0,
          hours: 0,
        };
        existing.earnings += amount;
        byWallet.set(o.wallet_id, existing);
      }
    }

    return {
      totalEarnings: total,
      totalHours,
      byWallet: Array.from(byWallet.entries()).map(([id, data]) => ({ id, ...data })),
      weeklyBreakdown: Array.from(weeklyBreakdown.entries())
        .map(([week, earnings]) => ({ week, earnings }))
        .sort((a, b) => a.week.localeCompare(b.week)),
      unsettledCount: unsettledCount + orderUnsettled,
      confirmedCount: confirmedCount + orderCount,
      eventCount: workEventCount + orderCount,
    };
  }, [calendarEvents, orders, wallets, monthStart, monthEnd]);

  const summary: SummaryData = {
    ...currentSummary,
    previousPeriodEarnings: prevData?.earnings ?? 0,
    previousPeriodHours: prevData?.hours ?? 0,
  };

  // Whether we have any signal to display. With store-driven current-period
  // we essentially always do (empty store → zeros), but we still gate the
  // "Brak danych" message on whether anything exists in the month.
  const hasData = currentSummary.eventCount > 0;

  const lastRefreshKeyRef = useRef<number | undefined>(refreshKey);
  useEffect(() => {
    const cacheKey = `${monthStart}|${monthEnd}`;
    const cached = prevCache.get(cacheKey);
    const refreshKeyChanged = lastRefreshKeyRef.current !== refreshKey;
    lastRefreshKeyRef.current = refreshKey;

    if (cached && !refreshKeyChanged && Date.now() - cached.timestamp < PREV_CACHE_TTL) {
      setPrevData({ earnings: cached.earnings, hours: cached.hours });
      return;
    }
    if (cached) {
      setPrevData({ earnings: cached.earnings, hours: cached.hours });
    }

    let cancelled = false;
    getMonthlySummary(monthStart, monthEnd).then(data => {
      if (cancelled || !data) return;
      const prev = { earnings: data.previousPeriodEarnings, hours: data.previousPeriodHours };
      prevCache.set(cacheKey, { ...prev, timestamp: Date.now() });
      setPrevData(prev);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [monthStart, monthEnd, refreshKey]);

  useEffect(() => {
    if (!ai.open && !taxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAi(a => ({ ...a, open: false }));
        setTaxOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ai.open, taxOpen]);

  const openInsight = async () => {
    setAi({ open: true, text: null, loading: true });
    try {
      const res = await fetch('/api/calendar-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalEarnings: summary.totalEarnings,
          totalHours: summary.totalHours,
          byWallet: summary.byWallet,
          previousWeekEarnings: summary.previousPeriodEarnings,
          previousWeekHours: summary.previousPeriodHours,
          eventCount: summary.eventCount,
          confirmedCount: summary.confirmedCount,
          period: 'miesiąc',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setAi({ open: true, text: json.insight, loading: false });
      } else {
        setAi({ open: true, text: 'Nie udało się wygenerować podsumowania.', loading: false });
      }
    } catch {
      setAi({ open: true, text: 'Błąd połączenia. Spróbuj ponownie.', loading: false });
    }
  };

  const earningsDiff = summary.totalEarnings - summary.previousPeriodEarnings;
  const earningsPct = summary.previousPeriodEarnings
    ? ((earningsDiff / summary.previousPeriodEarnings) * 100).toFixed(0)
    : null;
  const avgRate = summary.totalHours > 0 ? summary.totalEarnings / summary.totalHours : 0;
  const deltaColor =
    earningsDiff > 0 ? 'text-green-500' : earningsDiff < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-3 h-full min-w-0">
        {hasData ? (
          <>
            {/* Hero — total earnings */}
            <section>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Zarobki</div>
              <div className="text-3xl font-bold tabular-nums text-foreground leading-tight mt-0.5">
                {summary.totalEarnings.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                <span className="text-base font-medium text-muted-foreground ml-1">PLN</span>
              </div>
              {summary.previousPeriodEarnings > 0 && (
                <div className={`flex items-center gap-1 text-xs tabular-nums mt-1 ${deltaColor}`}>
                  {earningsDiff > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : earningsDiff < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                  <span className="font-semibold">
                    {earningsPct !== null && `${earningsDiff > 0 ? '+' : ''}${earningsPct}%`}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    ({earningsDiff >= 0 ? '+' : ''}{earningsDiff.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN)
                  </span>
                </div>
              )}
            </section>

            {/* Meta — hours, rate, confirmed ratio */}
            <section className="border-t border-border pt-3 space-y-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Godziny</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {summary.totalHours.toFixed(1)}h
                </span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Śr. stawka</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {avgRate.toFixed(0)} PLN/h
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Potwierdzone</span>
                <span className="text-muted-foreground tabular-nums">
                  {summary.confirmedCount}/{summary.eventCount}
                </span>
              </div>
            </section>

            {/* Wallet breakdown */}
            {summary.byWallet.length > 0 && (
              <section className="border-t border-border pt-3 space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Per portfel</div>
                {summary.byWallet.map(w => (
                  <div key={w.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: w.color || 'var(--primary)' }} />
                      <span className="text-sm text-foreground truncate">{w.name}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-foreground shrink-0">
                      {w.earnings.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </section>
            )}

            {/* Actions — 2x2 grid at the bottom */}
            <section className="border-t border-border pt-3 grid grid-cols-2 gap-1.5 mt-auto">
              {summary.eventCount > 0 && (
                <button
                  onClick={openInsight}
                  className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-border"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Insight
                </button>
              )}
              <a
                href="/invoices"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                Faktura
              </a>
              {onGenerateInvoice && summary.totalEarnings > 0 && (
                <button
                  onClick={onGenerateInvoice}
                  className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-border"
                >
                  <FileText className="w-4 h-4" />
                  Dokument
                </button>
              )}
              {summary.totalEarnings > 0 && (
                <button
                  onClick={() => setTaxOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-border"
                >
                  <Calculator className="w-4 h-4" />
                  Podatek
                </button>
              )}
            </section>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground text-sm">
            Brak danych za ten miesiąc
          </div>
        )}
      </div>

      {ai.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setAi(a => ({ ...a, open: false }))}
        >
          <div
            className="bg-card border border-border rounded-xl max-w-md w-full p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold text-card-foreground">AI Insight</h3>
              </div>
              <button
                onClick={() => setAi(a => ({ ...a, open: false }))}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Zamknij"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {ai.loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analizuję...
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{ai.text}</p>
            )}
            <button
              onClick={() => setAi(a => ({ ...a, open: false }))}
              className="mt-4 w-full bg-secondary hover:bg-accent text-secondary-foreground text-sm py-2 rounded-lg transition-colors border border-border"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {taxOpen && summary.totalEarnings > 0 && (() => {
        const tax = calculatePIT(summary.totalEarnings);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setTaxOpen(false)}
          >
            <div
              className="bg-card border border-border rounded-xl max-w-md w-full p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-card-foreground">Kalkulator podatku</h3>
                </div>
                <button
                  onClick={() => setTaxOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Zamknij"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground">Brutto</span>
                  <span className="text-sm font-medium text-foreground">
                    {tax.grossIncome.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                  </span>
                </div>
                <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground">PIT</span>
                  <span className="text-sm font-medium text-red-500">
                    -{tax.pitTax.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                  </span>
                </div>
                <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground">Składka zdrowotna</span>
                  <span className="text-sm font-medium text-red-500">
                    -{tax.healthInsurance.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                  </span>
                </div>
                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-foreground">Netto</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">
                      {tax.netIncome.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5">
                      ({tax.effectiveRate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const today = formatLocalDate(new Date());
                  generatePITPDF({
                    periodLabel: monthLabel,
                    grossIncome: tax.grossIncome,
                    pitTax: tax.pitTax,
                    healthInsurance: tax.healthInsurance,
                    netIncome: tax.netIncome,
                    effectiveRate: tax.effectiveRate,
                    issueDate: today,
                  });
                }}
                className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground text-sm py-2 rounded-lg transition-colors border border-border mt-4"
              >
                <FileText className="w-4 h-4" />
                Generuj PIT
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}
