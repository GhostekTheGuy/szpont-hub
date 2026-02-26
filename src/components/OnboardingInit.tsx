'use client';

import { useEffect } from 'react';
import { useFinanceStore } from '@/hooks/useFinanceStore';

let initialized = false;

export function OnboardingInit({ done }: { done: boolean }) {
  const setShowOnboarding = useFinanceStore(s => s.setShowOnboarding);

  useEffect(() => {
    if (!initialized) {
      setShowOnboarding(!done);
      initialized = true;
    }
  }, [done, setShowOnboarding]);

  return null;
}
