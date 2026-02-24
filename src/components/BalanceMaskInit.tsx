'use client';

import { useEffect } from 'react';
import { useFinanceStore } from '@/hooks/useFinanceStore';

export function BalanceMaskInit({ value }: { value: boolean }) {
  const setBalanceMasked = useFinanceStore(s => s.setBalanceMasked);

  useEffect(() => {
    setBalanceMasked(value);
  }, [value, setBalanceMasked]);

  return null;
}
