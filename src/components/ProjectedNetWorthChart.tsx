'use client';

import { useMemo, useCallback, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Wallet, Asset } from '@/hooks/useFinanceStore';
import { subMonths, addMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates } from '@/lib/exchange-rates';
import { getNiceYTicks } from '@/lib/chart-utils';

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

    // Znajdź najwcześniejszą datę aktywności (transakcja, wydarzenie kalendarza lub track_from portfela)
    const allDates: string[] = [];
    for (const t of nonWorkTx) { if (t.date) allDates.push(t.date); }
    if (workEarningsByDate) {
      for (const d of Object.keys(workEarningsByDate)) allDates.push(d);
    }
    for (const w of wallets) {
      if (w.track_from) allDates.push(w.track_from);
    }
    allDates.sort();
    const earliestDate = allDates.length > 0 ? allDates[0] : format(today, 'yyyy-MM-dd');
    const earliestMonth = earliestDate.substring(0, 7); // yyyy-MM

    // Buduj listę miesięcy od najwcześniejszego do obecnego
    const months: { key: string; label: string; endDate: string }[] = [];
    let cursor = new Date(earliestMonth + '-01');
    while (format(cursor, 'yyyy-MM') <= format(today, 'yyyy-MM')) {
      const isCurrentMonth = format(cursor, 'yyyy-MM') === format(today, 'yyyy-MM');
      months.push({
        key: format(cursor, 'yyyy-MM'),
        label: format(cursor, 'LLL', { locale: pl }),
        endDate: isCurrentMonth ? format(today, 'yyyy-MM-dd') : format(endOfMonth(cursor), 'yyyy-MM-dd'),
      });
      cursor = addMonths(cursor, 1);
    }

    // Dla każdego miesiąca: netWorth = currentNetWorth - (suma zmian po końcu tego miesiąca)
    const actualPoints: { month: string; actual: number; projected: number | null }[] = [];

    for (const { label, endDate } of months) {
      const futureTxSum = nonWorkTx
        .filter(t => t.date > endDate)
        .reduce((acc, t) => acc + getSignedAmount(t), 0);

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

    // Oblicz średni miesięczny zysk
    // Jeśli mamy 1 miesiąc lub jesteśmy w trakcie pierwszego:
    // zysk = zmiana od początku do teraz (currentNetWorth - netWorth pierwszego miesiąca)
    let avgMonthlyGain: number;
    if (actualPoints.length <= 1) {
      // Pierwszy miesiąc — zysk = currentNetWorth - initial balance
      const initialBalancePLN = wallets.reduce((sum, w) => sum + (w.initial_balance || 0), 0);
      const initialBalance = convertAmount(initialBalancePLN, 'PLN', displayCurrency, exchangeRates);
      avgMonthlyGain = currentNetWorth - initialBalance;
    } else {
      // Mamy kilka miesięcy — średnia ze zmian między miesiącami
      const monthlyGains: number[] = [];
      for (let i = 1; i < actualPoints.length; i++) {
        monthlyGains.push(actualPoints[i].actual - actualPoints[i - 1].actual);
      }
      avgMonthlyGain = monthlyGains.reduce((a, b) => a + b, 0) / monthlyGains.length;
    }

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

  const yTicks = useMemo(() => {
    const values = chartData.map((d) => d.actual ?? d.projected ?? 0);
    return getNiceYTicks(Math.min(...values), Math.max(...values));
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
        <p className="text-muted-foreground text-sm">Prognoza na 6 miesięcy na podstawie średniego miesięcznego zysku</p>
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
            domain={[yTicks[0], yTicks[yTicks.length - 1]]}
            ticks={yTicks}
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
