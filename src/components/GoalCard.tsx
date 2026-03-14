'use client';

import { memo } from 'react';
import { Target, Wallet, TrendingUp, ShoppingBag, Shield, Pencil, Trash2 } from 'lucide-react';
import type { Goal } from '@/hooks/useFinanceStore';
import { formatCurrency, type Currency } from '@/lib/exchange-rates';

const ICONS: Record<string, typeof Target> = {
  target: Target,
  wallet: Wallet,
  trending: TrendingUp,
  shopping: ShoppingBag,
  shield: Shield,
};

interface GoalCardProps {
  goal: Goal;
  displayCurrency: Currency;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export const GoalCard = memo(function GoalCard({ goal, displayCurrency, onEdit, onDelete }: GoalCardProps) {
  const Icon = ICONS[goal.icon] || Target;
  const progress = goal.target_amount > 0
    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    : 0;
  const isComplete = progress >= 100;

  const daysRemaining = goal.target_date
    ? Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="bg-secondary/50 border border-border rounded-lg p-3 group">
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-md ${isComplete ? 'bg-green-500/20' : 'bg-primary/10'}`}>
          <Icon className={`w-4 h-4 ${isComplete ? 'text-green-500' : 'text-primary'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground truncate">{goal.name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(goal)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDelete(goal.id)}
                className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${Math.max(progress, 2)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {formatCurrency(goal.current_amount, displayCurrency)} / {formatCurrency(goal.target_amount, displayCurrency)}
            </span>
            <span className={`text-xs font-medium ${isComplete ? 'text-green-500' : 'text-primary'}`}>
              {progress.toFixed(0)}%
            </span>
          </div>

          {daysRemaining !== null && !isComplete && (
            <span className="text-xs text-muted-foreground mt-0.5 block">
              {daysRemaining > 0 ? `${daysRemaining} dni pozostało` : 'Termin minął'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
