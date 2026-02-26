'use client';

import { useEffect } from 'react';
import { useFinanceStore } from '@/hooks/useFinanceStore';

let initialized = false;

export function WeeklyReportInit({ lastReport }: { lastReport: string | null }) {
  const setShowWeeklyReport = useFinanceStore(s => s.setShowWeeklyReport);

  useEffect(() => {
    if (initialized) return;
    initialized = true;

    const now = new Date();
    const day = now.getDay(); // 0=ndz, 1=pon

    // Auto-popup tylko w poniedziałek
    if (day !== 1) return;

    // Oblicz początek bieżącego tygodnia (poniedziałek 00:00)
    const thisMonday = new Date(now);
    thisMonday.setHours(0, 0, 0, 0);

    // Jeśli brak raportu lub ostatni raport sprzed tego tygodnia
    if (!lastReport || new Date(lastReport) < thisMonday) {
      setShowWeeklyReport(true);
    }
  }, [lastReport, setShowWeeklyReport]);

  return null;
}
