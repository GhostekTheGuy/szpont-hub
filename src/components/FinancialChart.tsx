'use client';

import { useMemo, useCallback, memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Asset, useFinanceStore } from '@/hooks/useFinanceStore';
import { format, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates, type HistoricalRates } from '@/lib/exchange-rates';
import { getNiceYTicks } from '@/lib/chart-utils';

interface FinancialChartProps {
  transactions: Transaction[];
  assets: Asset[];
  range: '1W' | '1M' | '3M' | '1Y';
  setRange: (range: '1W' | '1M' | '3M' | '1Y') => void;
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
  historicalRates?: HistoricalRates;
  currentNetWorth: number;
  workEarningsByDate?: Record<string, number>;
}

export const FinancialChart = memo(function FinancialChart({ transactions, assets, range, setRange, displayCurrency, exchangeRates, historicalRates, currentNetWorth, workEarningsByDate }: FinancialChartProps) {
  const balanceMasked = useFinanceStore(s => s.balanceMasked);

  const chartData = useMemo(() => {
    const days = range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : 365;
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Odfiltruj transakcje "Praca" (settle/cofnięcia) — zastąpimy je dziennymi zarobkami z kalendarza
    // Odfiltruj transakcje zakupu/sprzedaży aktywów — to konwersja cash↔aktywo, nie zmiana net worth
    const relevant = transactions.filter(t =>
      (t.type === 'income' || t.type === 'outcome') && t.category !== 'Praca' && t.category !== 'Zakup aktywa' && t.category !== 'Sprzedaż aktywa'
    );
    const sorted = [...relevant].sort((a, b) => a.date.localeCompare(b.date));

    function txDelta(t: Transaction, rates: ExchangeRates) {
      const converted = convertAmount(t.amount, t.currency || 'PLN', displayCurrency, rates);
      // Handle legacy 'expense' type with positive amounts
      if ((t.type as string) === 'expense' && converted > 0) return -converted;
      return converted;
    }

    // Liczymy wstecz od aktualnego net worth
    // Oblicz sumę przyszłych zmian dla każdego dnia
    const data = [];
    for (let i = days; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      // Suma transakcji (nie-pracowych) po tym dniu
      let futureFlow = 0;
      for (const t of sorted) {
        if (t.date.slice(0, 10) > dateStr) {
          const ratesForDay = historicalRates?.[t.date.slice(0, 10)] || exchangeRates;
          futureFlow += txDelta(t, ratesForDay);
        }
      }

      // Suma zarobków z kalendarza po tym dniu
      let futureWorkEarnings = 0;
      if (workEarningsByDate) {
        for (const [evDate, earnings] of Object.entries(workEarningsByDate)) {
          if (evDate > dateStr) {
            futureWorkEarnings += convertAmount(earnings, 'PLN', displayCurrency, exchangeRates);
          }
        }
      }

      // Korekta aktywów: dla dat przed zakupem aktywa odejmij niezrealizowany zysk/stratę
      // Bo przed zakupem aktywo nie istniało — była tylko gotówka (cost_basis)
      let assetAdjustment = 0;
      for (const asset of assets) {
        const purchaseDate = asset.created_at.slice(0, 10);
        if (purchaseDate > dateStr && asset.cost_basis > 0) {
          const unrealizedPL = asset.total_value - (asset.cost_basis * asset.quantity);
          assetAdjustment += convertAmount(unrealizedPL, 'PLN', displayCurrency, exchangeRates);
        }
      }

      data.push({
        date: format(date, 'dd MMM', { locale: pl }),
        value: currentNetWorth - futureFlow - futureWorkEarnings - assetAdjustment,
        fullDate: dateStr
      });
    }

    return data;
  }, [transactions, assets, range, displayCurrency, exchangeRates, historicalRates, currentNetWorth, workEarningsByDate]);

  const yTicks = useMemo(() => {
    if (chartData.length === 0) return [0];
    const values = chartData.map(d => d.value);
    return getNiceYTicks(Math.min(...values), Math.max(...values));
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
            domain={[yTicks[0], yTicks[yTicks.length - 1]]}
            ticks={yTicks}
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
