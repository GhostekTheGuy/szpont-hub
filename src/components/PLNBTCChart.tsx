'use client';

import { useEffect, useState, memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface ChartPoint {
  date: string;
  label: string;
  price: number;
}

type Range = '1W' | '1M' | '3M' | '1Y';

const RANGE_DAYS: Record<Range, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
};

// In-memory cache so navigating away and back doesn't refetch
const dataCache = new Map<Range, { data: ChartPoint[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const PLNBTCChart = memo(function PLNBTCChart() {
  const [range, setRange] = useState<Range>('1M');
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const cached = dataCache.get(range);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const days = RANGE_DAYS[range];
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=pln&days=${days}`
        );
        if (!res.ok) throw new Error('CoinGecko API error');

        const json = await res.json();
        const prices = json.prices as [number, number][];

        if (cancelled) return;

        const step = range === '1W' ? 6 : range === '1M' ? 12 : range === '3M' ? 24 : 48;
        const sampled = prices.filter((_, i) => i % step === 0 || i === prices.length - 1);

        const points = sampled.map(([timestamp, price]) => {
          const d = new Date(timestamp);
          return {
            date: d.toISOString(),
            label: format(d, range === '1W' ? 'EEE' : 'dd MMM', { locale: pl }),
            price,
          };
        });

        dataCache.set(range, { data: points, timestamp: Date.now() });
        setData(points);
      } catch (err) {
        console.error('Error fetching BTC chart data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [range]);

  const change = data.length >= 2
    ? ((data[data.length - 1].price - data[0].price) / data[0].price) * 100
    : 0;
  const isPositive = change >= 0;
  const currentPrice = data.length > 0 ? data[data.length - 1].price : 0;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-xl font-bold text-card-foreground">PLN/BTC</h3>
            {data.length >= 2 && (
              <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${
                isPositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change).toFixed(2)}%
              </span>
            )}
          </div>
          <span className="text-xl sm:text-2xl font-bold text-foreground">
            {currentPrice.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN
          </span>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1 shrink-0">
          {(['1W', '1M', '3M', '1Y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs sm:text-sm rounded-md transition-colors ${
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

      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBTC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
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
              tickFormatter={(v) => {
                if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                return `${v}`;
              }}
              domain={[(min: number) => min - (min * 0.01), (max: number) => max + (max * 0.01)]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '0.5rem',
                color: 'var(--card-foreground)',
              }}
              itemStyle={{ color: 'var(--card-foreground)' }}
              formatter={(value: number) => [
                value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }),
                'BTC',
              ]}
              labelStyle={{ color: 'var(--muted-foreground)' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBTC)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
});
