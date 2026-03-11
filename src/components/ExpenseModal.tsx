'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useFinanceStore, type RecurringExpense } from '@/hooks/useFinanceStore';
import { addRecurringExpense, editRecurringExpense, deleteRecurringExpense } from '@/app/actions';
import type { Currency } from '@/lib/exchange-rates';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExpense?: RecurringExpense | null;
}

const CATEGORIES = [
  { value: 'subscription', label: 'Subskrypcja', icon: '🎬' },
  { value: 'utility', label: 'Rachunki', icon: '⚡' },
  { value: 'rent', label: 'Czynsz', icon: '🏠' },
  { value: 'insurance', label: 'Ubezpieczenie', icon: '🛡️' },
  { value: 'loan', label: 'Kredyt/Rata', icon: '🏦' },
  { value: 'other', label: 'Inne', icon: '📋' },
];

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Miesięcznie' },
  { value: 'quarterly', label: 'Kwartalnie' },
  { value: 'yearly', label: 'Rocznie' },
];

const ICONS = ['🎬', '🎵', '🌐', '⚡', '🏠', '🛡️', '🏦', '📱', '🎮', '☁️', '📋', '🚗', '💊', '🏋️', '📰', '🔧'];

export function ExpenseModal({ isOpen, onClose, editingExpense }: ExpenseModalProps) {
  const { wallets } = useFinanceStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('PLN');
  const [category, setCategory] = useState('subscription');
  const [walletId, setWalletId] = useState('');
  const [billingDay, setBillingDay] = useState('1');
  const [frequency, setFrequency] = useState('monthly');
  const [icon, setIcon] = useState('📋');
  const [color, setColor] = useState('#6366f1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setAmount(editingExpense.amount.toString());
      setCurrency(editingExpense.currency);
      setCategory(editingExpense.category);
      setWalletId(editingExpense.wallet_id || '');
      setBillingDay(editingExpense.billing_day.toString());
      setFrequency(editingExpense.frequency);
      setIcon(editingExpense.icon || '📋');
      setColor(editingExpense.color || '#6366f1');
      setNotes(editingExpense.notes || '');
    } else {
      setName('');
      setAmount('');
      setCurrency('PLN');
      setCategory('subscription');
      setWalletId(wallets.length > 0 ? wallets[0].id : '');
      setBillingDay('1');
      setFrequency('monthly');
      setIcon('📋');
      setColor('#6366f1');
      setNotes('');
    }
  }, [editingExpense, isOpen, wallets]);

  const computeNextDueDate = (day: number, freq: string): string => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), Math.min(day, 28));
    if (thisMonth >= today) return format(thisMonth, 'yyyy-MM-dd');
    if (freq === 'monthly') {
      const next = new Date(today.getFullYear(), today.getMonth() + 1, Math.min(day, 28));
      return format(next, 'yyyy-MM-dd');
    }
    if (freq === 'quarterly') {
      const next = new Date(today.getFullYear(), today.getMonth() + 3, Math.min(day, 28));
      return format(next, 'yyyy-MM-dd');
    }
    const next = new Date(today.getFullYear() + 1, today.getMonth(), Math.min(day, 28));
    return format(next, 'yyyy-MM-dd');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const day = parseInt(billingDay);
      const nextDue = editingExpense
        ? editingExpense.next_due_date
        : computeNextDueDate(day, frequency);

      const data = {
        name,
        amount: parseFloat(amount),
        currency,
        category,
        wallet_id: walletId || null,
        billing_day: day,
        frequency,
        next_due_date: nextDue,
        icon,
        color,
        notes,
      };

      if (editingExpense) {
        await editRecurringExpense(editingExpense.id, { ...data, is_active: true });
      } else {
        await addRecurringExpense(data);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert('Wystąpił błąd zapisu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingExpense) return;
    if (!confirm('Usunąć ten stały wydatek?')) return;
    setLoading(true);
    try {
      await deleteRecurringExpense(editingExpense.id);
      onClose();
    } catch (error) {
      console.error(error);
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
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-card-foreground">
                {editingExpense ? 'Edytuj wydatek' : 'Nowy stały wydatek'}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Icon picker */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Ikona</label>
                <div className="flex flex-wrap gap-1.5">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${
                        icon === ic ? 'bg-primary/20 ring-2 ring-primary' : 'bg-secondary hover:bg-accent'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Nazwa</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="np. Netflix, Prąd"
                />
              </div>

              {/* Amount + Currency */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Kwota</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                    placeholder="0.00"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-20 bg-input border border-border rounded-lg px-2 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all text-center font-medium"
                  >
                    <option value="PLN">PLN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Kategoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => { setCategory(cat.value); if (!editingExpense) setIcon(cat.icon); }}
                      className={`py-2 px-2 rounded-lg text-center text-sm font-medium transition-colors ${
                        category === cat.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-accent'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Cykl</label>
                <div className="grid grid-cols-3 gap-2">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFrequency(opt.value)}
                      className={`py-2 rounded-lg text-center text-sm font-medium transition-colors ${
                        frequency === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-accent'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing day */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Dzień rozliczenia</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              {/* Wallet */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Portfel</label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  <option value="">Brak (bez transakcji)</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Notatka (opcjonalnie)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Dodatkowe info..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                {editingExpense && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Usuń
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Zapisywanie...' : (editingExpense ? 'Zapisz zmiany' : 'Dodaj wydatek')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
