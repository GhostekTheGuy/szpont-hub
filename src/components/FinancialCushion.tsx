'use client';

import { useMemo, memo } from 'react';
import { Shield } from 'lucide-react';
import { Transaction } from '@/hooks/useFinanceStore';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates } from '@/lib/exchange-rates';
import { subMonths, format } from 'date-fns';

interface FinancialCushionProps {
  transactions: Transaction[];
  walletBalance: number;
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
}

export const FinancialCushion = memo(function FinancialCushion({
  transactions,
  walletBalance,
  displayCurrency,
  exchangeRates,
}: FinancialCushionProps) {
  const data = useMemo(() => {
    const today = new Date();
    const sixMonthsAgo = subMonths(today, 6);
    const sixMonthsAgoKey = format(sixMonthsAgo, 'yyyy-MM-dd');

    const outcomes = transactions.filter(
      (t) => t.type === 'outcome' && t.date >= sixMonthsAgoKey
    );

    if (outcomes.length === 0) return null;

    const totalOutcome = outcomes.reduce((sum, t) => {
      return sum + Math.abs(convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates));
    }, 0);

    const avgMonthlyOutcome = totalOutcome / 6;
    if (avgMonthlyOutcome <= 0) return null;

    const balance = convertAmount(walletBalance, 'PLN', displayCurrency, exchangeRates);
    const cushionMonths = balance / avgMonthlyOutcome;

    return { cushionMonths, avgMonthlyOutcome, balance };
  }, [transactions, walletBalance, displayCurrency, exchangeRates]);

  if (!data) return null;

  const { cushionMonths, avgMonthlyOutcome } = data;

  const color =
    cushionMonths < 3
      ? 'text-red-500'
      : cushionMonths < 6
        ? 'text-yellow-500'
        : 'text-green-500';

  const bgColor =
    cushionMonths < 3
      ? 'bg-red-500/10 border-red-500/20'
      : cushionMonths < 6
        ? 'bg-yellow-500/10 border-yellow-500/20'
        : 'bg-green-500/10 border-green-500/20';

  return (
    <div className="px-4 py-4 lg:px-6 lg:py-6">
      <div className="mb-3">
        <h2 className="text-xl font-bold text-card-foreground mb-1">Poduszka finansowa</h2>
        <p className="text-muted-foreground text-sm">Na ile miesięcy wystarczy Twoje saldo</p>
      </div>

      <div className={`${bgColor} border rounded-lg p-4`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${cushionMonths < 3 ? 'bg-red-500/20' : cushionMonths < 6 ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
            <Shield className={`w-5 h-5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-2xl font-bold ${color}`}>
              {cushionMonths.toFixed(1)} mies.
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Średni wydatek: {formatCurrency(avgMonthlyOutcome, displayCurrency)}/mies.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
