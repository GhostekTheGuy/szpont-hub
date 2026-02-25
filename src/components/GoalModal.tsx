'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addGoalAction, editGoalAction } from '@/app/actions';
import type { Goal, Wallet } from '@/hooks/useFinanceStore';

const CATEGORIES = [
  { value: 'savings', label: 'Oszczędności' },
  { value: 'investment', label: 'Inwestycja' },
  { value: 'purchase', label: 'Zakup' },
  { value: 'emergency', label: 'Fundusz awaryjny' },
];

const ICONS = [
  { value: 'target', label: 'Cel' },
  { value: 'wallet', label: 'Portfel' },
  { value: 'trending', label: 'Trend' },
  { value: 'shopping', label: 'Zakupy' },
  { value: 'shield', label: 'Tarcza' },
];

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal: Goal | null;
  wallets: Wallet[];
}

export function GoalModal({ isOpen, onClose, editingGoal, wallets }: GoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('savings');
  const [icon, setIcon] = useState('target');
  const [walletId, setWalletId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && editingGoal) {
      setName(editingGoal.name);
      setTargetAmount(String(editingGoal.target_amount));
      setCurrentAmount(String(editingGoal.current_amount));
      setTargetDate(editingGoal.target_date || '');
      setCategory(editingGoal.category);
      setIcon(editingGoal.icon);
      setWalletId(editingGoal.wallet_id || '');
    } else if (isOpen) {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      setCategory('savings');
      setIcon('target');
      setWalletId('');
    }
  }, [isOpen, editingGoal]);

  const handleSubmit = async () => {
    if (!name.trim() || !targetAmount) return;
    setLoading(true);

    try {
      const data = {
        name: name.trim(),
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        target_date: targetDate || null,
        category,
        icon,
        wallet_id: walletId || null,
      };

      if (editingGoal) {
        await editGoalAction(editingGoal.id, data);
      } else {
        await addGoalAction(data);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert('Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring";

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-card-foreground">
                {editingGoal ? 'Edytuj cel' : 'Nowy cel'}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Nazwa</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Fundusz awaryjny"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Kwota docelowa (PLN)</label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="10000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Kwota aktualna (PLN)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Data docelowa (opcjonalna)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Kategoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClass}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ikona</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className={inputClass}
                  >
                    {ICONS.map(i => (
                      <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {wallets.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground">Powiązany portfel (opcjonalnie)</label>
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Brak</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !name.trim() || !targetAmount}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Zapisywanie...' : editingGoal ? 'Zapisz zmiany' : 'Dodaj cel'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
