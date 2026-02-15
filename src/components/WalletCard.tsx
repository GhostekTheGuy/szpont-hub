'use client';

import { Wallet } from '@/hooks/useFinanceStore';
import { Edit2, Trash2, Banknote, Bitcoin, TrendingUp, Wallet as WalletIcon, CreditCard, PiggyBank } from 'lucide-react';
import dynamic from 'next/dynamic';

const Plasma = dynamic(() => import('@/components/Plasma').then(m => m.Plasma), { ssr: false });
const Grainient = dynamic(() => import('@/components/Grainient'), { ssr: false });

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  banknote: Banknote,
  bitcoin: Bitcoin,
  trending: TrendingUp,
  wallet: WalletIcon,
  card: CreditCard,
  piggy: PiggyBank,
};

const typeLabels: Record<string, string> = {
  fiat: 'Waluta',
  crypto: 'Crypto',
  stock: 'Giełda',
};

export type CardEffect = 'gradient' | 'plasma' | 'grainient';

export function parseWalletColor(color: string): {
  effect: CardEffect;
  gradient?: string;
  plasmaColor?: string;
  grainientColors?: [string, string, string];
} {
  if (color.startsWith('plasma:')) {
    return { effect: 'plasma', plasmaColor: color.slice(7) };
  }
  if (color.startsWith('grainient:')) {
    const parts = color.slice(10).split(':') as [string, string, string];
    return { effect: 'grainient', grainientColors: parts };
  }
  return { effect: 'gradient', gradient: color };
}

interface WalletCardProps {
  wallet: Wallet;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (id: string) => void;
}

export function WalletCard({ wallet, onEdit, onDelete }: WalletCardProps) {
  const IconComponent = iconMap[wallet.icon] || WalletIcon;
  const parsed = parseWalletColor(wallet.color);

  const renderBackground = () => {
    switch (parsed.effect) {
      case 'plasma':
        return (
          <div className="absolute inset-0">
            <Plasma
              color={parsed.plasmaColor}
              speed={0.3}
              scale={1.2}
              opacity={0.6}
              mouseInteractive={false}
            />
          </div>
        );
      case 'grainient':
        return (
          <div className="absolute inset-0">
            <Grainient
              color1={parsed.grainientColors![0]}
              color2={parsed.grainientColors![1]}
              color3={parsed.grainientColors![2]}
              timeSpeed={0.15}
              grainAmount={0.08}
              contrast={1.3}
              zoom={0.8}
            />
          </div>
        );
      default:
        return (
          <>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.07] rounded-full -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/[0.06] rounded-full translate-y-10 -translate-x-10" />
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/[0.04] rounded-full blur-xl" />
            <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`grid-${wallet.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${wallet.id})`} />
            </svg>
          </>
        );
    }
  };

  const outerClass = parsed.effect === 'gradient'
    ? `relative overflow-hidden rounded-2xl bg-gradient-to-br ${parsed.gradient} p-[1px] group transition-all duration-300 hover:scale-[1.03] hover:shadow-xl`
    : 'relative overflow-hidden rounded-2xl p-[1px] group transition-all duration-300 hover:scale-[1.03] hover:shadow-xl';

  const innerClass = parsed.effect === 'gradient'
    ? `relative rounded-[calc(1rem-1px)] bg-gradient-to-br ${parsed.gradient} p-5 h-full`
    : 'relative rounded-[calc(1rem-1px)] overflow-hidden p-5 h-full bg-black';

  return (
    <div className={outerClass}>
      {parsed.effect === 'gradient' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        </div>
      )}

      <div className={innerClass}>
        {renderBackground()}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-20">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(wallet); }}
              className="p-1.5 bg-white/15 hover:bg-white/30 rounded-lg backdrop-blur-md transition-colors"
              title="Edytuj"
            >
              <Edit2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(wallet.id); }}
              className="p-1.5 bg-white/15 hover:bg-red-500/70 rounded-lg backdrop-blur-md transition-colors"
              title="Usuń"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full min-h-[140px]">
          <div className="flex items-start justify-between mb-auto">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 shadow-lg shadow-black/5">
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-white/70 uppercase tracking-[0.15em] bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
              {typeLabels[wallet.type] || wallet.type}
            </span>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-white/70 mb-0.5 truncate">{wallet.name}</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {wallet.balance.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <span className="text-sm font-medium text-white/60">PLN</span>
            </div>
          </div>

          <div className="flex gap-1.5 mt-3">
            <div className="flex gap-[3px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[5px] h-[5px] rounded-full bg-white/25" />
              ))}
            </div>
            <div className="flex gap-[3px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[5px] h-[5px] rounded-full bg-white/25" />
              ))}
            </div>
            <div className="flex gap-[3px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[5px] h-[5px] rounded-full bg-white/15" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
