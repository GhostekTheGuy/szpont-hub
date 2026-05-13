'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2, Sparkles, FileText, Calculator, X } from 'lucide-react';
import { getMonthlySummary } from '@/app/actions';
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

const summaryCache = new Map<string, { data: SummaryData; timestamp: number }>();
const SUMMARY_CACHE_TTL = 5 * 60 * 1000;

interface Props {
  monthStart: string;
  monthEnd: string;
  monthLabel: string;
  onGenerateInvoice?: () => void;
  refreshKey?: number;
}

function Metric({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${valueColor || 'text-foreground'}`}>{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function MonthlySummaryBlock({ monthStart, monthEnd, monthLabel, onGenerateInvoice, refreshKey }: Props) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [ai, setAi] = useState<{ open: boolean; text: string | null; loading: boolean }>({
    open: false,
    text: null,
    loading: false,
  });
  const [taxOpen, setTaxOpen] = useState(false);

  const loadSummary = useCallback(async () => {
    const cacheKey = `${monthStart}|${monthEnd}`;
    const cached = summaryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < SUMMARY_CACHE_TTL) {
      setSummary(cached.data);
      setLoading(false);
      return;
    }
    if (cached) {
      setSummary(cached.data);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const data = await getMonthlySummary(monthStart, monthEnd);
      if (data) summaryCache.set(cacheKey, { data, timestamp: Date.now() });
      setSummary(data);
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  const lastRefreshKeyRef = useRef<number | undefined>(refreshKey);
  useEffect(() => {
    if (lastRefreshKeyRef.current !== refreshKey) {
      summaryCache.clear();
      lastRefreshKeyRef.current = refreshKey;
    }
    loadSummary();
  }, [monthStart, monthEnd, refreshKey, loadSummary]);

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
    if (!summary) return;
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

  const earningsDiff = summary ? summary.totalEarnings - summary.previousPeriodEarnings : 0;
  const earningsPct = summary?.previousPeriodEarnings
    ? ((earningsDiff / summary.previousPeriodEarnings) * 100).toFixed(0)
    : null;
  const hoursDiff = summary ? summary.totalHours - summary.previousPeriodHours : 0;
  const avgRate = summary && summary.totalHours > 0 ? summary.totalEarnings / summary.totalHours : 0;
  const deltaColor =
    earningsDiff > 0 ? 'text-green-500' : earningsDiff < 0 ? 'text-red-500' : 'text-muted-foreground';
  const hoursDeltaColor =
    hoursDiff > 0 ? 'text-green-500' : hoursDiff < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <>
      <div className="bg-card border border-border rounded-xl px-4 py-3">
        {loading && !summary ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : summary ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Zarobki — total + delta as one self-contained metric */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Zarobki</span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {summary.totalEarnings.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN
              </span>
              {summary.previousPeriodEarnings > 0 && (
                <span className={`text-[10px] flex items-center gap-0.5 tabular-nums ${deltaColor}`}>
                  {earningsDiff > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : earningsDiff < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                  {earningsPct !== null && `${earningsDiff > 0 ? '+' : ''}${earningsPct}%`}
                  <span className="text-muted-foreground ml-1">
                    ({earningsDiff >= 0 ? '+' : ''}{earningsDiff.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN)
                  </span>
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Godziny</span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {summary.totalHours.toFixed(1)}h
              </span>
              {summary.previousPeriodHours > 0 && (
                <span className={`text-[10px] flex items-center gap-0.5 ${hoursDeltaColor}`}>
                  {hoursDiff > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : hoursDiff < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                  {hoursDiff > 0 ? '+' : ''}{hoursDiff.toFixed(1)}h
                </span>
              )}
            </div>
            <Metric
              label="Śr. stawka"
              value={`${avgRate.toFixed(0)} PLN/h`}
              sub={`${summary.confirmedCount}/${summary.eventCount} potw.`}
            />

            {/* Wallet breakdown — compact inline */}
            {summary.byWallet.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l border-border pl-4">
                {summary.byWallet.map(w => (
                  <div key={w.id} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: w.color || 'var(--primary)' }} />
                    <span className="text-xs text-foreground truncate max-w-[110px]">{w.name}</span>
                    <span className="text-xs font-medium text-foreground tabular-nums">
                      {w.earnings.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions — pushed right */}
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {summary.eventCount > 0 && (
                <button
                  onClick={openInsight}
                  className="flex items-center gap-1.5 bg-secondary hover:bg-accent text-secondary-foreground text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-border"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Insight
                </button>
              )}
              {onGenerateInvoice && summary.totalEarnings > 0 && (
                <button
                  onClick={onGenerateInvoice}
                  className="flex items-center gap-1.5 bg-secondary hover:bg-accent text-secondary-foreground text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-border"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Dokument
                </button>
              )}
              <a
                href="/invoices"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Faktura
              </a>
              {summary.totalEarnings > 0 && (
                <button
                  onClick={() => setTaxOpen(true)}
                  className="flex items-center gap-1.5 bg-secondary hover:bg-accent text-secondary-foreground text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-border"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Podatek
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-2 text-sm">
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

      {taxOpen && summary && summary.totalEarnings > 0 && (() => {
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
