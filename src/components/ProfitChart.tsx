'use client';

import { useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/hooks/useFinanceStore';
import { subMonths, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates } from '@/lib/exchange-rates';

interface ProfitChartProps {
  transactions: Transaction[];
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
}

export function ProfitChart({ transactions, displayCurrency, exchangeRates }: ProfitChartProps) {
  const { chartData, totalProfit } = useMemo(() => {
    const today = new Date();
    const months: { key: string; label: string }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = subMonths(today, i);
      months.push({
        key: format(d, 'yyyy-MM'),
        label: format(d, 'LLL', { locale: pl }),
      });
    }

    let cumulative = 0;
    // Oblicz skumulowany zysk sprzed 12 miesięcy (transakcje wcześniejsze)
    const startKey = months[0].key;
    const priorTransactions = transactions.filter(t => t.date < startKey);
    cumulative = priorTransactions.reduce((acc, t) => {
      if (t.type === 'transfer') return acc;
      return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates);
    }, 0);

    const data = months.map(({ key, label }, idx) => {
      const monthTx = transactions.filter(t => t.date.startsWith(key));
      const monthProfit = monthTx.reduce((acc, t) => {
        if (t.type === 'transfer') return acc;
        return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates);
      }, 0);

      const previousCumulative = cumulative;
      cumulative += monthProfit;

      return { month: label, profit: cumulative, previous: previousCumulative };
    });

    return { chartData: data, totalProfit: cumulative };
  }, [transactions, displayCurrency, exchangeRates]);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const values = chartData.map(d => d.profit);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range > 0 ? range * 0.1 : Math.abs(max) * 0.05 || 100;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  const formatYTick = useCallback((value: number) => {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return `${value}`;
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const prev = payload[0].payload.previous || 0;
      const change = prev ? ((value - prev) / Math.abs(prev)) * 100 : 0;

      return (
        <div className="bg-card border border-primary/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-muted-foreground text-sm mb-1">{payload[0].payload.month}</p>
          <p className="text-card-foreground font-bold text-lg mb-1">
            {formatCurrency(value, displayCurrency)}
          </p>
          {change !== 0 && (
            <p className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}% vs poprzedni
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-card-foreground mb-1">Skumulowany Zysk</h2>
        <p className="text-muted-foreground text-sm">Trend zysków w czasie</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={formatYTick}
            axisLine={false}
            tickLine={false}
            domain={yDomain}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Całkowity Zysk</span>
          <span className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-primary' : 'text-red-500'}`}>
            {formatCurrency(totalProfit, displayCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
}
