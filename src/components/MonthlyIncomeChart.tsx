'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '@/hooks/useFinanceStore';
import { subMonths, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates } from '@/lib/exchange-rates';

interface MonthlyIncomeChartProps {
  transactions: Transaction[];
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
}

export function MonthlyIncomeChart({ transactions, displayCurrency, exchangeRates }: MonthlyIncomeChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const months: { key: string; label: string }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = subMonths(today, i);
      months.push({
        key: format(d, 'yyyy-MM'),
        label: format(d, 'LLL', { locale: pl }),
      });
    }

    return months.map(({ key, label }) => {
      const monthTx = transactions.filter(t => t.date.startsWith(key));

      const income = monthTx
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates), 0);

      const outcome = monthTx
        .filter(t => t.type === 'outcome')
        .reduce((sum, t) => sum + Math.abs(convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates)), 0);

      return { month: label, income, outcome };
    });
  }, [transactions, displayCurrency, exchangeRates]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 backdrop-blur-sm">
          <p className="text-muted-foreground text-sm mb-2">{payload[0].payload.month}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-green-500 text-sm">
                Przychody: {formatCurrency(payload[0].value, displayCurrency)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-red-500 text-sm">
                Wydatki: {formatCurrency(payload[1].value, displayCurrency)}
              </p>
            </div>
            <div className="border-t border-border mt-2 pt-2">
              <p className="text-card-foreground font-medium text-sm">
                Zysk: {formatCurrency(payload[0].value - payload[1].value, displayCurrency)}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-card-foreground mb-1">Miesięczny Cashflow</h2>
        <p className="text-muted-foreground text-sm">Porównanie przychodów i wydatków</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
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
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value: string) => (
              <span className="text-muted-foreground text-sm">
                {value === 'income' ? 'Przychody' : 'Wydatki'}
              </span>
            )}
          />
          <Bar
            dataKey="income"
            fill="#22c55e"
            radius={[8, 8, 0, 0]}
            name="income"
          />
          <Bar
            dataKey="outcome"
            fill="#ef4444"
            radius={[8, 8, 0, 0]}
            name="outcome"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
