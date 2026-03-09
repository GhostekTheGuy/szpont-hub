'use client';

import { useMemo, useCallback, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Wallet, Asset } from '@/hooks/useFinanceStore';
import { subMonths, addMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates } from '@/lib/exchange-rates';

interface ProjectedNetWorthChartProps {
  transactions: Transaction[];
  wallets: Wallet[];
  assets: Asset[];
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
  workEarningsByDate?: Record<string, number>;
}

export const ProjectedNetWorthChart = memo(function ProjectedNetWorthChart({
  transactions,
  wallets,
  assets,
  displayCurrency,
  exchangeRates,
  workEarningsByDate,
}: ProjectedNetWorthChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const currentNetWorthPLN =
      wallets.reduce((sum, w) => sum + w.balance, 0) +
      assets.reduce((sum, a) => sum + (a.total_value || 0), 0);
    const currentNetWorth = convertAmount(currentNetWorthPLN, 'PLN', displayCurrency, exchangeRates);

    // Odfiltruj transakcje "Praca" — zamiast nich użyjemy workEarningsByDate
    const nonWorkTx = transactions.filter(t =>
      (t.type === 'income' || t.type === 'outcome') && t.category !== 'Praca'
    );

    // Funkcja: signed amount z obsługą legacy 'expense'
    function getSignedAmount(t: Transaction) {
      const converted = convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates);
      if ((t.type as string) === 'expense' && converted > 0) return -converted;
      return converted;
    }

    // Oblicz net worth na koniec każdego z ostatnich 12 miesięcy
    // Podejście: liczymy wstecz od currentNetWorth
    const months: { key: string; label: string; endDate: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(today, i);
      const end = i === 0 ? today : endOfMonth(d);
      months.push({
        key: format(d, 'yyyy-MM'),
        label: format(d, 'LLL', { locale: pl }),
        endDate: format(end, 'yyyy-MM-dd'),
      });
    }

    // Dla każdego miesiąca: netWorth = currentNetWorth - (suma zmian po końcu tego miesiąca)
    const actualPoints: { month: string; actual: number; projected: number | null }[] = [];

    for (const { label, endDate } of months) {
      // Suma nie-pracowych transakcji po endDate
      const futureTxSum = nonWorkTx
        .filter(t => t.date > endDate)
        .reduce((acc, t) => acc + getSignedAmount(t), 0);

      // Suma zarobków z kalendarza po endDate
      let futureWorkSum = 0;
      if (workEarningsByDate) {
        for (const [evDate, earnings] of Object.entries(workEarningsByDate)) {
          if (evDate > endDate) {
            futureWorkSum += convertAmount(earnings, 'PLN', displayCurrency, exchangeRates);
          }
        }
      }

      const netWorth = currentNetWorth - futureTxSum - futureWorkSum;
      actualPoints.push({ month: label, actual: netWorth, projected: null });
    }

    // Oblicz średni miesięczny zysk (skumulowany przyrost)
    const monthlyGains: number[] = [];
    for (let i = 1; i < actualPoints.length; i++) {
      monthlyGains.push(actualPoints[i].actual - actualPoints[i - 1].actual);
    }
    const avgMonthlyGain = monthlyGains.length > 0
      ? monthlyGains.reduce((a, b) => a + b, 0) / monthlyGains.length
      : 0;

    // Prognoza na 6 miesięcy w przód
    const projectedPoints: { month: string; actual: number | null; projected: number }[] = [];
    let lastValue = currentNetWorth;

    for (let i = 1; i <= 6; i++) {
      const d = addMonths(today, i);
      lastValue += avgMonthlyGain;
      projectedPoints.push({
        month: format(d, 'LLL', { locale: pl }),
        actual: null,
        projected: lastValue,
      });
    }

    // Połącz ostatni punkt aktualny z prognozą
    if (actualPoints.length > 0) {
      const last = actualPoints[actualPoints.length - 1];
      last.projected = last.actual;
    }

    return [...actualPoints, ...projectedPoints];
  }, [transactions, wallets, assets, displayCurrency, exchangeRates, workEarningsByDate]);

  const yDomain = useMemo(() => {
    const values = chartData.map((d) => d.actual ?? d.projected ?? 0);
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
      const data = payload[0].payload;
      const value = data.actual ?? data.projected;
      const isProjected = data.actual === null;
      return (
        <div className="bg-card border border-primary/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-muted-foreground text-sm mb-1">
            {data.month} {isProjected ? '(prognoza)' : ''}
          </p>
          <p className="text-card-foreground font-bold text-lg">
            {formatCurrency(value, displayCurrency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-4 py-4 lg:px-6 lg:py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-card-foreground mb-1">Prognozowany Net Worth</h2>
        <p className="text-muted-foreground text-sm">Prognoza na 6 miesięcy (średni miesięczny zysk)</p>
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
            dataKey="actual"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeDasharray="5 5"
            opacity={0.5}
            dot={{ fill: 'var(--primary)', strokeWidth: 1, r: 3, opacity: 0.5 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
