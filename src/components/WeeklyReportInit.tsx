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

    // Backend ogranicza generowanie do 1 raportu na 7 dni (okno kroczące). Auto-popup
    // musi respektować tę samą regułę — inaczej użytkownik, który wygenerował raport np.
    // w środę, w poniedziałek dostawał popup od razu kończący się błędem limitu.
    if (!lastReport) {
      setShowWeeklyReport(true);
      return;
    }
    const daysSince = (now.getTime() - new Date(lastReport).getTime()) / 86_400_000;
    if (daysSince >= 7) {
      setShowWeeklyReport(true);
    }
  }, [lastReport, setShowWeeklyReport]);

  return null;
}
