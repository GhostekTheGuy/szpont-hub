'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Loader2, Sparkles, FileText, Calculator, ExternalLink, ClipboardCheck } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getWeeklySummary, getMonthlySummary } from '@/app/actions';
import { calculatePIT } from '@/lib/tax-calculator';
import { generatePITPDF } from '@/lib/invoice-pdf';

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

type SummaryMode = 'week' | 'month';

interface WorkSummaryPanelProps {
  weekStart: string;
  weekEnd: string;
  monthStart: string;
  monthEnd: string;
  monthLabel: string;
  onGenerateInvoice?: () => void;
}

export function WorkSummaryPanel({ weekStart, weekEnd, monthStart, monthEnd, monthLabel, onGenerateInvoice }: WorkSummaryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState<SummaryMode>('week');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showTaxCalc, setShowTaxCalc] = useState(false);
  const [kugaruCopied, setKugaruCopied] = useState(false);

  const loadSummary = useCallback(async (m: SummaryMode) => {
    setLoading(true);
    setSummary(null);
    setAiInsight(null);

    try {
      let data: SummaryData | null;
      if (m === 'week') {
        const raw = await getWeeklySummary(weekStart, weekEnd);
        data = raw ? { ...raw, previousPeriodEarnings: raw.previousWeekEarnings, previousPeriodHours: raw.previousWeekHours } : null;
      } else {
        data = await getMonthlySummary(monthStart, monthEnd);
      }
      setSummary(data);
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd, monthStart, monthEnd]);

  useEffect(() => {
    if (!collapsed) {
      loadSummary(mode);
    }
  }, [collapsed, weekStart, weekEnd, monthStart, monthEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchMode = (m: SummaryMode) => {
    setMode(m);
    setShowTaxCalc(false);
    loadSummary(m);
  };

  const fetchAiInsight = async (data: SummaryData, m: SummaryMode) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/calendar-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalEarnings: data.totalEarnings,
          totalHours: data.totalHours,
          byWallet: data.byWallet,
          previousWeekEarnings: data.previousPeriodEarnings,
          previousWeekHours: data.previousPeriodHours,
          eventCount: data.eventCount,
          confirmedCount: data.confirmedCount,
          period: m === 'week' ? 'tydzień' : 'miesiąc',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setAiInsight(json.insight);
      }
    } catch {
      // AI insight is optional
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenKugaru = async () => {
    if (!summary) return;

    const lines = summary.byWallet.map(w => {
      const rate = w.hours > 0 ? w.earnings / w.hours : 0;
      return `- ${w.name}: ${w.hours.toFixed(1)}h × ${rate.toFixed(2)} PLN/h = ${w.earnings.toFixed(2)} PLN`;
    }).join('\n');

    const text = [
      `Wartość zlecenia: ${summary.totalEarnings.toFixed(2)} PLN`,
      '',
      'Opis dzieła:',
      lines,
      '',
      `Łącznie: ${summary.totalHours.toFixed(1)}h, ${summary.totalEarnings.toFixed(2)} PLN`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setKugaruCopied(true);
      setTimeout(() => setKugaruCopied(false), 4000);
    } catch {
      // clipboard may fail silently
    }

    window.open('https://kugaru.com/wystaw-fakture/#rozliczprace', '_blank', 'noopener,noreferrer');
  };

  const earningsDiff = summary
    ? summary.totalEarnings - summary.previousPeriodEarnings
    : 0;
  const earningsPct = summary?.previousPeriodEarnings
    ? ((earningsDiff / summary.previousPeriodEarnings) * 100).toFixed(0)
    : null;

  const hoursDiff = summary
    ? summary.totalHours - summary.previousPeriodHours
    : 0;

  const avgRate = summary && summary.totalHours > 0
    ? summary.totalEarnings / summary.totalHours
    : 0;

  const periodLabel = mode === 'week' ? 'tygodniu' : 'miesiącu';
  const prevPeriodLabel = mode === 'week' ? 'poprzedni tydzień' : 'poprzedni miesiąc';

  return (
    <div id="work-summary-panel" className="mt-4 border border-border rounded-xl bg-card overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <span className="text-sm font-medium text-card-foreground">Podsumowanie</span>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Tab switcher */}
              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  onClick={() => switchMode('week')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'week'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Tydzień
                </button>
                <button
                  onClick={() => switchMode('month')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'month'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Miesiąc
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : summary ? (
                <div className="space-y-4">
                  {/* Key metrics row */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Earnings */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Zarobki</div>
                      <div className="text-lg font-bold text-foreground">
                        {summary.totalEarnings.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        <span className="text-xs font-normal text-muted-foreground ml-1">PLN</span>
                      </div>
                      {summary.previousPeriodEarnings > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {earningsDiff > 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : earningsDiff < 0 ? (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          ) : (
                            <Minus className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span className={`text-xs ${earningsDiff > 0 ? 'text-green-500' : earningsDiff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {earningsPct && `${earningsDiff > 0 ? '+' : ''}${earningsPct}%`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hours */}
                    <div className="bg-secondary/50 border border-border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Godziny</div>
                      <div className="text-lg font-bold text-foreground">
                        {summary.totalHours.toFixed(1)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">h</span>
                      </div>
                      {summary.previousPeriodHours > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {hoursDiff > 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : hoursDiff < 0 ? (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          ) : (
                            <Minus className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span className={`text-xs ${hoursDiff > 0 ? 'text-green-500' : hoursDiff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {hoursDiff > 0 ? '+' : ''}{hoursDiff.toFixed(1)}h
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Avg rate */}
                    <div className="bg-secondary/50 border border-border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Śr. stawka</div>
                      <div className="text-lg font-bold text-foreground">
                        {avgRate.toFixed(0)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">PLN/h</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {summary.confirmedCount}/{summary.eventCount} potw.
                      </div>
                    </div>
                  </div>

                  {/* Weekly breakdown (month mode only) */}
                  {mode === 'month' && summary.weeklyBreakdown && summary.weeklyBreakdown.length > 1 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Rozbicie tygodniowe</div>
                      <div className="space-y-1.5">
                        {summary.weeklyBreakdown.map(wb => {
                          const pct = summary.totalEarnings > 0
                            ? (wb.earnings / summary.totalEarnings) * 100
                            : 0;
                          return (
                            <div key={wb.week} className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground w-20 shrink-0">{wb.week}</span>
                              <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary/70 rounded-full transition-all"
                                  style={{ width: `${Math.max(pct, 2)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-foreground w-16 text-right shrink-0">
                                {wb.earnings.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} PLN
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Wallet breakdown */}
                  {summary.byWallet.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Per portfel</div>
                      <div className="space-y-1.5">
                        {summary.byWallet.map(w => (
                          <div key={w.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color || 'var(--primary)' }} />
                              <span className="text-sm text-foreground">{w.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-foreground">
                                {w.earnings.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">{w.hours.toFixed(1)}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insight */}
                  {(aiLoading || aiInsight) && (
                    <div className="bg-secondary/50 border border-border rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Insight
                      </div>
                      {aiLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analizuję...
                        </div>
                      ) : (
                        <p className="text-sm text-foreground leading-relaxed">{aiInsight}</p>
                      )}
                    </div>
                  )}

                  {!aiInsight && !aiLoading && summary.eventCount > 0 && (
                    <button
                      onClick={() => fetchAiInsight(summary, mode)}
                      className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground text-sm py-2 rounded-lg transition-colors border border-border"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Wygeneruj AI Insight
                    </button>
                  )}

                  {/* Action buttons row */}
                  {summary.totalEarnings > 0 && (
                    <div className="flex gap-2">
                      {mode === 'month' && onGenerateInvoice && (
                        <button
                          onClick={onGenerateInvoice}
                          className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground text-sm py-2 rounded-lg transition-colors border border-border"
                        >
                          <FileText className="w-4 h-4" />
                          Dokument
                        </button>
                      )}
                      {mode === 'month' && (
                        <button
                          onClick={handleOpenKugaru}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a2e] hover:bg-[#252542] text-white text-sm py-2 rounded-lg transition-colors border border-[#333]"
                        >
                          <Image src="/kugaru_logo.svg" alt="Kugaru" width={80} height={16} className="h-4 w-auto" />
                          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowTaxCalc(!showTaxCalc)}
                        className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground text-sm py-2 rounded-lg transition-colors border border-border"
                      >
                        <Calculator className="w-4 h-4" />
                        {showTaxCalc ? 'Ukryj podatek' : 'Podatek'}
                      </button>
                    </div>
                  )}

                  {/* Tax section */}
                  {showTaxCalc && summary.totalEarnings > 0 && (() => {
                    const tax = calculatePIT(summary.totalEarnings);
                    return (
                      <div>
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
                            const today = new Date().toISOString().split('T')[0];
                            generatePITPDF({
                              periodLabel: mode === 'week' ? 'Tydzień' : monthLabel,
                              grossIncome: tax.grossIncome,
                              pitTax: tax.pitTax,
                              healthInsurance: tax.healthInsurance,
                              netIncome: tax.netIncome,
                              effectiveRate: tax.effectiveRate,
                              issueDate: today,
                            });
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground text-sm py-2 rounded-lg transition-colors border border-border mt-3"
                        >
                          <FileText className="w-4 h-4" />
                          Generuj PIT
                        </button>
                      </div>
                    );
                  })()}

                  {summary.confirmedCount < summary.eventCount && (
                    <div className="text-center text-xs text-muted-foreground py-1">
                      {summary.eventCount - summary.confirmedCount} wydarzeń niepotwierdzone
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-6 text-sm">
                  Brak danych za ten {mode === 'week' ? 'tydzień' : 'miesiąc'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kugaru copy toast */}
      <AnimatePresence>
        {kugaruCopied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium"
          >
            <ClipboardCheck className="w-4 h-4" />
            Dane skopiowane — wklej je na stronie Kugaru
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
