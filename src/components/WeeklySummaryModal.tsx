'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Minus, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { settleWeekAction, getWeeklySummary } from '@/app/actions';

interface WalletBreakdown {
  id: string;
  name: string;
  color: string;
  earnings: number;
  hours: number;
}

interface SummaryData {
  totalEarnings: number;
  totalHours: number;
  byWallet: WalletBreakdown[];
  previousWeekEarnings: number;
  previousWeekHours: number;
  unsettledCount: number;
  eventCount: number;
}

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: string;
  weekEnd: string;
}

export function WeeklySummaryModal({ isOpen, onClose, weekStart, weekEnd }: WeeklySummaryModalProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setAiInsight(null);
      getWeeklySummary(weekStart, weekEnd)
        .then((data) => {
          setSummary(data);
          // Fetch AI insight
          if (data && data.eventCount > 0) {
            fetchAiInsight(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, weekStart, weekEnd]);

  const fetchAiInsight = async (data: SummaryData) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/calendar-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalEarnings: data.totalEarnings,
          totalHours: data.totalHours,
          byWallet: data.byWallet,
          previousWeekEarnings: data.previousWeekEarnings,
          previousWeekHours: data.previousWeekHours,
          eventCount: data.eventCount,
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

  const handleSettle = async () => {
    if (!summary || summary.unsettledCount === 0) return;
    setSettling(true);
    try {
      const result = await settleWeekAction(weekStart, weekEnd);
      if (result) {
        // Refresh summary
        const data = await getWeeklySummary(weekStart, weekEnd);
        setSummary(data);
      }
    } catch (error) {
      console.error(error);
      alert('Wystąpił błąd');
    } finally {
      setSettling(false);
    }
  };

  const earningsDiff = summary
    ? summary.totalEarnings - summary.previousWeekEarnings
    : 0;
  const earningsPct = summary?.previousWeekEarnings
    ? ((earningsDiff / summary.previousWeekEarnings) * 100).toFixed(0)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-card-foreground">Podsumowanie tygodnia</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : summary ? (
              <div className="space-y-5">
                {/* Total earnings */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Zarobki w tym tygodniu</div>
                  <div className="text-3xl font-bold text-foreground">
                    {summary.totalEarnings.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {summary.totalHours.toFixed(1)}h pracy / {summary.eventCount} wydarzeń
                  </div>
                </div>

                {/* Comparison */}
                {summary.previousWeekEarnings > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    {earningsDiff > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : earningsDiff < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={earningsDiff > 0 ? 'text-green-500' : earningsDiff < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                      {earningsDiff > 0 ? '+' : ''}{earningsDiff.toFixed(2)} PLN
                      {earningsPct && ` (${earningsDiff > 0 ? '+' : ''}${earningsPct}%)`}
                    </span>
                    <span className="text-muted-foreground">vs poprzedni tydzień</span>
                  </div>
                )}

                {/* Wallet breakdown */}
                {summary.byWallet.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Zarobki per portfel</div>
                    <div className="space-y-2">
                      {summary.byWallet.map(w => (
                        <div key={w.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            <span className="text-sm text-foreground">{w.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-foreground">
                              {w.earnings.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                            </div>
                            <div className="text-xs text-muted-foreground">{w.hours.toFixed(1)}h</div>
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

                {/* Settle button */}
                {summary.unsettledCount > 0 && (
                  <button
                    onClick={handleSettle}
                    disabled={settling}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {settling
                      ? 'Zatwierdzanie...'
                      : `Zatwierdź i dodaj transakcje (${summary.unsettledCount} wydarzeń)`}
                  </button>
                )}

                {summary.unsettledCount === 0 && summary.eventCount > 0 && (
                  <div className="text-center text-sm text-green-500 py-2">
                    Wszystkie wydarzenia zatwierdzone
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Brak danych za ten tydzień
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
