'use client';

import { useMemo, memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/hooks/useFinanceStore';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates } from '@/lib/exchange-rates';

const COLORS = [
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

interface ExpensePieChartProps {
  transactions: Transaction[];
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
}

export const ExpensePieChart = memo(function ExpensePieChart({ transactions, displayCurrency, exchangeRates }: ExpensePieChartProps) {
  const chartData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    transactions
      .filter(t => t.type === 'outcome')
      .forEach(t => {
        const amount = Math.abs(convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates));
        const cat = t.category || 'Inne';
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + amount);
      });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, displayCurrency, exchangeRates]);

  if (chartData.length === 0) return null;

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border rounded-lg p-3 backdrop-blur-sm">
          <p className="text-foreground text-sm font-medium">{data.name}</p>
          <p className="text-muted-foreground text-sm">
            {formatCurrency(data.value, displayCurrency)} ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-4 py-4 lg:px-6 lg:py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-card-foreground mb-1">Wydatki wg kategorii</h2>
        <p className="text-muted-foreground text-sm">Rozkład wydatków w wybranym portfelu</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="w-[200px] h-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          {chartData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-xs text-muted-foreground truncate">
                {item.name}
              </span>
              <span className="text-xs text-foreground font-medium ml-auto whitespace-nowrap">
                {formatCurrency(item.value, displayCurrency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
