'use client';

import { useState, useEffect, useTransition, useMemo, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { getWalletChartData } from '@/app/actions';
import { formatCurrency, type Currency } from '@/lib/exchange-rates';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { Loader2 } from 'lucide-react';

interface WalletChartProps {
  walletId: string;
  walletName: string;
  displayCurrency: Currency;
}

export function WalletChart({ walletId, walletName, displayCurrency }: WalletChartProps) {
  const balanceMasked = useFinanceStore(s => s.balanceMasked);
  const [range, setRange] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getWalletChartData(walletId, range, displayCurrency);
      if (result) {
        setChartData(result.data);
        setCurrentBalance(result.currentBalance);
      }
    });
  }, [walletId, range, displayCurrency]);

  const formattedData = chartData.map(d => ({
    date: format(new Date(d.date), 'dd MMM', { locale: pl }),
    value: d.value,
    fullDate: d.date,
  }));

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
    <AnimatePresence mode="wait">
      <motion.div
        key={walletId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="card-responsive mb-3"
      >
        <div className="px-4 py-4 lg:px-6 lg:py-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-card-foreground">{walletName}</h3>
              <div className="text-2xl font-bold text-foreground mt-1">
                {isPending ? (
                  <span className="text-muted-foreground text-lg">...</span>
                ) : (
                  <span className={balanceMasked ? 'blur-md select-none' : ''}>{formatCurrency(currentBalance, displayCurrency)}</span>
                )}
              </div>
            </div>
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

          {isPending ? (
            <div className="flex items-center justify-center h-[250px]">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className={balanceMasked ? 'blur-lg select-none pointer-events-none' : ''}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={formattedData}>
                <defs>
                  <linearGradient id="walletColorValue" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#walletColorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
