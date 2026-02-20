'use client';

import { useMemo, useCallback, memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, useFinanceStore } from '@/hooks/useFinanceStore';
import { format, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates, type HistoricalRates } from '@/lib/exchange-rates';

interface FinancialChartProps {
  transactions: Transaction[];
  range: '1W' | '1M' | '3M' | '1Y';
  setRange: (range: '1W' | '1M' | '3M' | '1Y') => void;
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
  historicalRates?: HistoricalRates;
}

export const FinancialChart = memo(function FinancialChart({ transactions, range, setRange, displayCurrency, exchangeRates, historicalRates }: FinancialChartProps) {
  const balanceMasked = useFinanceStore(s => s.balanceMasked);

  const chartData = useMemo(() => {
    const days = range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : 365;
    const today = new Date();
    const startDate = subDays(today, days);

    // Sort transactions by date once, then accumulate — O(n log n + n + days) instead of O(n * days)
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    // Pre-compute balance from all transactions BEFORE the range start
    let runningBalance = 0;
    let txIndex = 0;
    const startDateStr = format(startDate, 'yyyy-MM-dd');

    for (; txIndex < sorted.length; txIndex++) {
      const t = sorted[txIndex];
      if (t.date > startDateStr) break;
      const ratesForDay = historicalRates?.[t.date.slice(0, 10)] || exchangeRates;
      runningBalance += convertAmount(t.amount, t.currency || 'PLN', displayCurrency, ratesForDay);
    }

    // Walk day-by-day, only adding transactions for that day
    const data = [];
    for (let i = days; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      for (; txIndex < sorted.length; txIndex++) {
        const t = sorted[txIndex];
        if (t.date.slice(0, 10) > dateStr) break;
        const ratesForDay = historicalRates?.[t.date.slice(0, 10)] || exchangeRates;
        runningBalance += convertAmount(t.amount, t.currency || 'PLN', displayCurrency, ratesForDay);
      }

      data.push({
        date: format(date, 'dd MMM', { locale: pl }),
        value: runningBalance,
        fullDate: dateStr
      });
    }

    return data;
  }, [transactions, range, displayCurrency, exchangeRates, historicalRates]);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range > 0 ? range * 0.1 : Math.abs(max) * 0.05 || 100;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  const formatYTick = useCallback((value: number) => {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return value.toFixed(0);
  }, []);

  return (
    <div className="px-4 py-4 lg:px-6 lg:py-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-card-foreground">Wartość Portfela</h3>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {(['1W', '1M', '3M', '1Y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                range === r
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-card-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className={balanceMasked ? 'blur-lg select-none pointer-events-none' : ''}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={yDomain}
            tickFormatter={formatYTick}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '0.5rem',
              color: 'var(--card-foreground)'
            }}
            itemStyle={{ color: 'var(--card-foreground)' }}
            formatter={(value: number) => [formatCurrency(value, displayCurrency), 'Wartość']}
            labelStyle={{ color: 'var(--muted-foreground)' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
});
