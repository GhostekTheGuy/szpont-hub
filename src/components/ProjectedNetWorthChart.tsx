'use client';

import { useMemo, useCallback, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Wallet, Asset } from '@/hooks/useFinanceStore';
import { subMonths, addMonths, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates } from '@/lib/exchange-rates';

interface ProjectedNetWorthChartProps {
  transactions: Transaction[];
  wallets: Wallet[];
  assets: Asset[];
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export const ProjectedNetWorthChart = memo(function ProjectedNetWorthChart({
  transactions,
  wallets,
  assets,
  displayCurrency,
  exchangeRates,
}: ProjectedNetWorthChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const baseNetWorth =
      wallets.reduce((sum, w) => sum + w.balance, 0) +
      assets.reduce((sum, a) => sum + (a.total_value || 0), 0);
    const baseConverted = convertAmount(baseNetWorth, 'PLN', displayCurrency, exchangeRates);

    // Calculate net worth at end of each of last 12 months
    const months: { key: string; label: string; monthIdx: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(today, i);
      months.push({
        key: format(d, 'yyyy-MM'),
        label: format(d, 'LLL', { locale: pl }),
        monthIdx: 12 - i,
      });
    }

    // Calculate cumulative profit per month (same pattern as ProfitChart)
    let cumulative = 0;
    const startKey = months[0].key;
    const priorTransactions = transactions.filter((t) => t.date < startKey);
    cumulative = priorTransactions.reduce((acc, t) => {
      if (t.type === 'transfer') return acc;
      return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates);
    }, 0);

    const actualPoints: { month: string; actual: number; projected: number | null; monthIdx: number }[] = [];
    const regressionInput: { x: number; y: number }[] = [];

    months.forEach(({ key, label, monthIdx }) => {
      const monthTx = transactions.filter((t) => t.date.startsWith(key));
      const monthProfit = monthTx.reduce((acc, t) => {
        if (t.type === 'transfer') return acc;
        return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates);
      }, 0);
      cumulative += monthProfit;

      // Net worth = base + cumulative change (relative approach)
      // We approximate: current net worth adjusted by profit diff from latest month
      const netWorth = baseConverted + (cumulative - (priorTransactions.reduce((acc, t) => {
        if (t.type === 'transfer') return acc;
        return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates);
      }, 0) + transactions.filter(t => t.date.startsWith(format(today, 'yyyy-MM')) === false && t.date >= startKey && t.date < format(today, 'yyyy-MM')).reduce((acc, t) => {
        if (t.type === 'transfer') return acc;
        return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates);
      }, 0) + transactions.filter(t => t.date.startsWith(format(today, 'yyyy-MM'))).reduce((acc, t) => {
        if (t.type === 'transfer') return acc;
        return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates);
      }, 0)));

      actualPoints.push({ month: label, actual: netWorth, projected: null, monthIdx });
      regressionInput.push({ x: monthIdx, y: netWorth });
    });

    // Simpler approach: just use cumulative profit relative to current
    // net worth at month i = currentNetWorth - (profit from month i+1 to now)
    const actualSimple: { month: string; actual: number; projected: number | null; monthIdx: number }[] = [];
    const regInput: { x: number; y: number }[] = [];

    // Compute initial_balance baseline and earliest track_from
    const initialBalanceSum = wallets.reduce((sum, w) => sum + (w.initial_balance || 0), 0);
    const initialBaselineConverted = convertAmount(initialBalanceSum, 'PLN', displayCurrency, exchangeRates);

    // Find earliest track_from across all wallets
    const trackFromDates = wallets
      .filter(w => w.track_from)
      .map(w => w.track_from!);
    const earliestTrackFrom = trackFromDates.length > 0
      ? trackFromDates.sort()[0].substring(0, 7) // yyyy-MM format
      : null;

    // Cumulative profit from each month to now
    const reversedMonths = [...months].reverse();
    const profitPerMonth = new Map<string, number>();

    for (const { key } of reversedMonths) {
      const monthTx = transactions.filter((t) => t.date.startsWith(key));
      const monthProfit = monthTx.reduce((acc, t) => {
        if (t.type === 'transfer') return acc;
        return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates);
      }, 0);
      profitPerMonth.set(key, monthProfit);
    }

    // Net worth at end of month[i] = currentNetWorth - sum of profits from month[i+1] to now
    // For months before earliest track_from, clamp to initial_balance baseline
    let profitAfter = 0;
    for (let i = months.length - 1; i >= 0; i--) {
      let nw = baseConverted - profitAfter;

      // If this month is before the earliest track_from, use initial_balance as floor
      if (earliestTrackFrom && months[i].key < earliestTrackFrom) {
        nw = initialBaselineConverted;
      }

      actualSimple.unshift({
        month: months[i].label,
        actual: nw,
        projected: null,
        monthIdx: months[i].monthIdx,
      });
      regInput.unshift({ x: months[i].monthIdx, y: nw });
      profitAfter += profitPerMonth.get(months[i].key) || 0;
    }

    // Linear regression on actual data
    const { slope, intercept } = linearRegression(regInput);

    // Project 6 months into the future
    const projectedPoints: { month: string; actual: number | null; projected: number; monthIdx: number }[] = [];
    for (let i = 1; i <= 6; i++) {
      const d = addMonths(today, i);
      const mIdx = 12 + i;
      projectedPoints.push({
        month: format(d, 'LLL', { locale: pl }),
        actual: null,
        projected: slope * mIdx + intercept,
        monthIdx: mIdx,
      });
    }

    // Last actual point also gets projected value for continuous line
    if (actualSimple.length > 0) {
      const last = actualSimple[actualSimple.length - 1];
      last.projected = last.actual;
    }

    return [...actualSimple, ...projectedPoints];
  }, [transactions, wallets, assets, displayCurrency, exchangeRates]);

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
        <p className="text-muted-foreground text-sm">Regresja liniowa na 6 miesięcy</p>
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
