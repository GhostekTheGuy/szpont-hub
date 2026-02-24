'use client';

import { useEffect, useRef } from 'react';
import { useFinanceStore } from '@/hooks/useFinanceStore';

export function BalanceMaskInit({ value }: { value: boolean }) {
  const setBalanceMasked = useFinanceStore(s => s.setBalanceMasked);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setBalanceMasked(value);
      initialized.current = true;
    }
  }, [value, setBalanceMasked]);

  return null;
}
