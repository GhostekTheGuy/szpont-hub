'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '@/hooks/useFinanceStore';

export function WeeklyReportModal() {
  const show = useFinanceStore(s => s.showWeeklyReport);
  const setShow = useFinanceStore(s => s.setShowWeeklyReport);

  const [report, setReport] = useState<string | null>(null);
  const [weekLabel, setWeekLabel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ type: 'limit' | 'generic'; message: string } | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch('/api/weekly-report', { method: 'POST' });

      if (res.status === 403) {
        const json = await res.json();
        if (json.error === 'limit') {
          setError({
            type: 'limit',
            message: 'Raport dostępny 1x/tydzień. Przejdź na Pro dla nielimitowanego dostępu.',
          });
          return;
        }
      }

      if (!res.ok) {
        setError({ type: 'generic', message: 'Wystąpił błąd podczas generowania raportu.' });
        return;
      }

      const json = await res.json();
      setReport(json.report);
      setWeekLabel(json.weekLabel || '');
    } catch {
      setError({ type: 'generic', message: 'Nie udało się połączyć z serwerem.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchReport();
    }
  }, [show]);

  const handleClose = () => setShow(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-card-foreground">Raport tygodniowy</h2>
                {weekLabel && (
                  <span className="text-sm text-muted-foreground">({weekLabel})</span>
                )}
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analizuję Twój tydzień...</span>
              </div>
            )}

            {error && error.type === 'limit' && (
              <div className="py-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <a
                  href="/settings"
                  className="inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
                >
                  Przejdź na Pro
                </a>
              </div>
            )}

            {error && error.type === 'generic' && (
              <div className="py-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <button
                  onClick={fetchReport}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-colors text-sm font-medium border border-border"
                >
                  <RefreshCw className="w-4 h-4" />
                  Spróbuj ponownie
                </button>
              </div>
            )}

            {report && (
              <div className="bg-secondary/50 border border-border rounded-lg p-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{report}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-colors text-sm font-medium border border-border"
              >
                Zamknij
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
