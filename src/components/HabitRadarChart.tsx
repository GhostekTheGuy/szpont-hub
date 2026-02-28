'use client';

import { useId } from 'react';
import type { Habit, HabitEntry } from '@/hooks/useFinanceStore';

interface Props {
  habits: Habit[];
  entries: HabitEntry[];
}

export function HabitRadarChart({ habits, entries }: Props) {
  if (habits.length < 3) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Dodaj min. 3 nawyki aby zobaczyć wykres
      </div>
    );
  }

  // Oblicz % completion z ostatnich 30 dni per nawyk
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const habitScores = habits.map(habit => {
    const habitEntries = entries.filter(
      e => e.habit_id === habit.id && e.completed && e.date >= thirtyDaysAgoStr
    );
    return {
      habit,
      score: Math.min(habitEntries.length / 30, 1), // 0-1
    };
  });

  const size = 336;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38;
  const levels = 4;
  const n = habitScores.length;

  // Kąty dla każdej osi (zaczynając od góry)
  const angles = habitScores.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);

  // Punkty na obwodzie dla danego promienia
  const getPoint = (angle: number, radius: number) => ({
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  });

  // Siatka (levels)
  const gridPaths = Array.from({ length: levels }, (_, l) => {
    const r = (maxRadius * (l + 1)) / levels;
    const pts = angles.map(a => getPoint(a, r));
    return pts.map(p => `${p.x},${p.y}`).join(' ');
  });

  // Dane gracza
  const dataPoints = habitScores.map((hs, i) => {
    const r = maxRadius * hs.score;
    return getPoint(angles[i], r);
  });
  const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Gradient ID — useId() avoids clashes & fixes url(#id) on mobile
  const reactId = useId();
  const gradientId = `radar-gradient-${reactId.replace(/:/g, '')}`;

  return (
    <div className="flex flex-col items-center">
      <svg className="w-full h-auto max-w-[336px]" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Siatka */}
        {gridPaths.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}

        {/* Osie */}
        {angles.map((angle, i) => {
          const p = getPoint(angle, maxRadius);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          );
        })}

        {/* Data fill */}
        <polygon
          points={dataPath}
          fill={`url(#${gradientId})`}
          stroke="#6366f1"
          strokeWidth={2}
          strokeOpacity={0.8}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={habitScores[i].habit.color}
            stroke="white"
            strokeWidth={1.5}
          />
        ))}

        {/* Labels */}
        {habitScores.map((hs, i) => {
          const labelRadius = maxRadius + 20;
          const p = getPoint(angles[i], labelRadius);
          const pct = Math.round(hs.score * 100);
          return (
            <g key={i}>
              <text
                x={p.x}
                y={p.y - 6}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-[10px] font-medium"
              >
                {hs.habit.name.length > 8 ? hs.habit.name.slice(0, 8) + '...' : hs.habit.name}
              </text>
              <text
                x={p.x}
                y={p.y + 8}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground text-[9px]"
              >
                {pct}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
