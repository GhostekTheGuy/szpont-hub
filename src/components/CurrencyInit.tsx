'use client';

import { useEffect } from 'react';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import type { Currency } from '@/lib/exchange-rates';

let initialized = false;

export function CurrencyInit({ value }: { value: Currency }) {
  const setDisplayCurrency = useFinanceStore(s => s.setDisplayCurrency);

  useEffect(() => {
    if (!initialized) {
      setDisplayCurrency(value);
      initialized = true;
    }
  }, [value, setDisplayCurrency]);

  return null;
}
