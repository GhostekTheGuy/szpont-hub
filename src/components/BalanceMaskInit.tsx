'use client';

import { useEffect } from 'react';
import { useFinanceStore } from '@/hooks/useFinanceStore';

// Module-level flag — survives component remounts (PageTransition key change),
// resets only on full page reload.
let initialized = false;

export function BalanceMaskInit({ value }: { value: boolean }) {
  const setBalanceMasked = useFinanceStore(s => s.setBalanceMasked);

  useEffect(() => {
    if (!initialized) {
      setBalanceMasked(value);
      initialized = true;
    }
  }, [value, setBalanceMasked]);

  return null;
}
