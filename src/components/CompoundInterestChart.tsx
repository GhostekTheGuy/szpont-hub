'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinanceStore, Transaction } from '@/hooks/useFinanceStore';
import { formatCurrency } from '@/lib/exchange-rates';
import { TrendingUp, Coins, PiggyBank, Sparkles } from 'lucide-react';

interface CompoundInterestChartProps {
  initialCapital: number;
  transactions: Transaction[];
}

const YEAR_OPTIONS = [5, 10, 15, 20, 30] as const;

export function CompoundInterestChart({ initialCapital, transactions }: CompoundInterestChartProps) {
  const balanceMasked = useFinanceStore(s => s.balanceMasked);

  const avgMonthlyIncome = useMemo(() => {
    const incomes = transactions.filter(t => t.type === 'income');
    if (incomes.length === 0) return 0;

    // Group by month
    const byMonth = new Map<string, number>();
    for (const t of incomes) {
      const key = t.date.slice(0, 7); // yyyy-MM
      byMonth.set(key, (byMonth.get(key) || 0) + t.amount);
    }

    if (byMonth.size === 0) return 0;
    const total = Array.from(byMonth.values()).reduce((a, b) => a + b, 0);
    return Math.round(total / byMonth.size);
  }, [transactions]);

  const [annualRate, setAnnualRate] = useState(10);
  const [years, setYears] = useState(10);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && avgMonthlyIncome > 0) {
      setMonthlyContribution(avgMonthlyIncome);
      setInitialized(true);
    }
  }, [avgMonthlyIncome, initialized]);

  const chartData = useMemo(() => {
    const monthlyRate = annualRate / 100 / 12;
    const data = [];

    for (let year = 0; year <= years; year++) {
      const months = year * 12;
      let portfolioValue: number;
      let totalContributions: number;

      if (monthlyRate === 0) {
        portfolioValue = initialCapital + monthlyContribution * months;
        totalContributions = initialCapital + monthlyContribution * months;
      } else {
        const compoundedCapital = initialCapital * Math.pow(1 + monthlyRate, months);
        const compoundedContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        portfolioValue = compoundedCapital + compoundedContributions;
        totalContributions = initialCapital + monthlyContribution * months;
      }

      const totalInterest = portfolioValue - totalContributions;

      data.push({
        year: `${year} lat`,
        yearNum: year,
        contributions: totalContributions,
        interest: Math.max(0, totalInterest),
        total: portfolioValue,
      });
    }

    return data;
  }, [initialCapital, annualRate, years, monthlyContribution]);

  const finalData = chartData[chartData.length - 1];

  const formatYTick = useCallback((value: number) => {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return `${value}`;
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 backdrop-blur-sm">
          <p className="text-muted-foreground text-sm mb-2">Rok {data.yearNum}</p>
          <p className="text-card-foreground font-bold text-base">
            {formatCurrency(data.total)}
          </p>
          <p className="text-green-500 text-sm">
            Odsetki: {formatCurrency(data.interest)}
          </p>
          <p className="text-muted-foreground text-sm">
            Wpłaty: {formatCurrency(data.contributions)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-6 bg-card border border-border rounded-xl p-3 lg:p-6">
      <h2 className="text-lg lg:text-xl font-bold text-card-foreground mb-3 lg:mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Predykcja procentu składanego
      </h2>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Roczna stopa zwrotu (%)</label>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
            step={0.5}
            min={0}
            className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Horyzont czasowy (lata)</label>
          <div className="flex gap-1">
            {YEAR_OPTIONS.map((y) => (
              <button
                key={y}
                onClick={() => setYears(y)}
                className={`flex-1 px-2 py-2 text-sm rounded-lg border transition-colors ${
                  years === y
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-muted-foreground border-border hover:text-card-foreground'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted-foreground">Miesięczna dopłata (PLN)</label>
            {avgMonthlyIncome > 0 && (
              <button
                type="button"
                onClick={() => setMonthlyContribution(avgMonthlyIncome)}
                className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Śr. przychód: {formatCurrency(avgMonthlyIncome)}</span>
                <span className="sm:hidden">Śr. przychód</span>
              </button>
            )}
          </div>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
            step={100}
            min={0}
            className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Chart */}
      <div className={`-mx-1 ${balanceMasked ? 'blur-lg select-none pointer-events-none' : ''}`}>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--muted-foreground)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--muted-foreground)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="var(--muted-foreground)"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYTick}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="contributions"
              stackId="1"
              stroke="var(--muted-foreground)"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorContributions)"
            />
            <Area
              type="monotone"
              dataKey="interest"
              stackId="1"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInterest)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      {finalData && (
        <div className={`grid grid-cols-3 gap-2 lg:gap-4 mt-4 lg:mt-6 ${balanceMasked ? 'blur-lg select-none' : ''}`}>
          <div className="p-2 lg:p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-[10px] lg:text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 shrink-0" /> <span className="truncate">Wartość końcowa</span>
            </p>
            <p className="text-sm lg:text-lg font-bold text-card-foreground truncate">{formatCurrency(finalData.total)}</p>
          </div>
          <div className="p-2 lg:p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-[10px] lg:text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3 shrink-0" /> <span className="truncate">Łączne odsetki</span>
            </p>
            <p className="text-sm lg:text-lg font-bold text-green-500 truncate">{formatCurrency(finalData.interest)}</p>
          </div>
          <div className="p-2 lg:p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-[10px] lg:text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <PiggyBank className="w-3 h-3 shrink-0" /> <span className="truncate">Łączne wpłaty</span>
            </p>
            <p className="text-sm lg:text-lg font-bold text-card-foreground truncate">{formatCurrency(finalData.contributions)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
