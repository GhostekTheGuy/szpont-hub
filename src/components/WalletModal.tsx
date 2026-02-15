'use client';

import { useState, useEffect } from 'react';
import { X, Wallet as WalletIcon, Banknote, Bitcoin, TrendingUp, CreditCard, PiggyBank, Sparkles, Waves, Palette } from 'lucide-react';
import { addWalletAction, editWalletAction } from '@/app/actions';
import { Wallet } from '@/hooks/useFinanceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { parseWalletColor, type CardEffect } from '@/components/WalletCard';

const iconOptions = [
  { name: 'wallet', icon: WalletIcon },
  { name: 'banknote', icon: Banknote },
  { name: 'bitcoin', icon: Bitcoin },
  { name: 'trending', icon: TrendingUp },
  { name: 'card', icon: CreditCard },
  { name: 'piggy', icon: PiggyBank },
];

const gradientOptions = [
  'from-violet-600 to-purple-500',
  'from-indigo-500 to-blue-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-fuchsia-500 to-violet-600',
  'from-slate-700 to-zinc-800',
];

const effectOptions: { value: CardEffect; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'gradient', label: 'Gradient', icon: Palette },
  { value: 'plasma', label: 'Plasma', icon: Waves },
  { value: 'grainient', label: 'Grainient', icon: Sparkles },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWallet?: Wallet | null;
}

export function WalletModal({ isOpen, onClose, editingWallet }: WalletModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'fiat' | 'crypto' | 'stock'>('fiat');
  const [icon, setIcon] = useState('wallet');
  const [loading, setLoading] = useState(false);

  const [effect, setEffect] = useState<CardEffect>('gradient');
  const [gradient, setGradient] = useState('from-violet-600 to-purple-500');
  const [plasmaColor, setPlasmaColor] = useState('#8b5cf6');
  const [grainColor1, setGrainColor1] = useState('#FF9FFC');
  const [grainColor2, setGrainColor2] = useState('#5227FF');
  const [grainColor3, setGrainColor3] = useState('#B19EEF');

  useEffect(() => {
    if (editingWallet) {
      setName(editingWallet.name);
      setType(editingWallet.type);
      setIcon(editingWallet.icon || 'wallet');

      const parsed = parseWalletColor(editingWallet.color);
      setEffect(parsed.effect);
      if (parsed.effect === 'gradient') setGradient(parsed.gradient || 'from-violet-600 to-purple-500');
      if (parsed.effect === 'plasma') setPlasmaColor(parsed.plasmaColor || '#8b5cf6');
      if (parsed.effect === 'grainient' && parsed.grainientColors) {
        setGrainColor1(parsed.grainientColors[0]);
        setGrainColor2(parsed.grainientColors[1]);
        setGrainColor3(parsed.grainientColors[2]);
      }
    } else {
      setName('');
      setType('fiat');
      setIcon('wallet');
      setEffect('gradient');
      setGradient('from-violet-600 to-purple-500');
      setPlasmaColor('#8b5cf6');
      setGrainColor1('#FF9FFC');
      setGrainColor2('#5227FF');
      setGrainColor3('#B19EEF');
    }
  }, [editingWallet, isOpen]);

  const buildColor = (): string => {
    switch (effect) {
      case 'plasma': return `plasma:${plasmaColor}`;
      case 'grainient': return `grainient:${grainColor1}:${grainColor2}:${grainColor3}`;
      default: return gradient;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const color = buildColor();

    try {
      if (editingWallet) {
        await editWalletAction(editingWallet.id, { name, type, color, icon });
      } else {
        await addWalletAction({ name, type, color, icon });
      }
      onClose();
    } catch (error) {
      alert('Błąd zapisu portfela');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-primary" />
            {editingWallet ? 'Edytuj Portfel' : 'Dodaj Portfel'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Nazwa</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="np. Oszczędności"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Typ</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              <option value="fiat">Waluta (PLN/USD)</option>
              <option value="crypto">Kryptowaluty</option>
              <option value="stock">Giełda / Akcje</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Ikona</label>
            <div className="flex gap-2">
              {iconOptions.map((opt) => {
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setIcon(opt.name)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      icon === opt.name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Efekt karty</label>
            <div className="flex gap-2 mb-3">
              {effectOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEffect(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      effect === opt.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {effect === 'gradient' && (
              <div className="flex gap-2 flex-wrap">
                {gradientOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setGradient(c)}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} transition-transform ${gradient === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-card scale-110' : 'hover:scale-105'}`}
                  />
                ))}
              </div>
            )}

            {effect === 'plasma' && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">Kolor</label>
                <input
                  type="color"
                  value={plasmaColor}
                  onChange={(e) => setPlasmaColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <span className="text-xs text-muted-foreground font-mono">{plasmaColor}</span>
              </div>
            )}

            {effect === 'grainient' && (
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Kolor 1', value: grainColor1, set: setGrainColor1 },
                  { label: 'Kolor 2', value: grainColor2, set: setGrainColor2 },
                  { label: 'Kolor 3', value: grainColor3, set: setGrainColor3 },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground w-16">{c.label}</label>
                    <input
                      type="color"
                      value={c.value}
                      onChange={(e) => c.set(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-muted-foreground font-mono">{c.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'Zapisywanie...' : (editingWallet ? 'Zapisz zmiany' : 'Utwórz portfel')}
          </button>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
