'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { type RecurringExpense } from '@/hooks/useFinanceStore';
import { payRecurringExpense, skipRecurringExpense } from '@/app/actions';
import { formatCurrency } from '@/lib/exchange-rates';
import { motion, AnimatePresence } from 'framer-motion';

interface PayExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: RecurringExpense | null;
}

export function PayExpenseModal({ isOpen, onClose, expense }: PayExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default amount when expense changes
  if (expense && amount === '') {
    setAmount(expense.amount.toString());
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;
    setLoading(true);
    try {
      await payRecurringExpense(expense.id, parseFloat(amount));
      setAmount('');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!expense) return;
    setLoading(true);
    try {
      await skipRecurringExpense(expense.id);
      setAmount('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && expense && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-card-foreground">
                {expense.icon} {expense.name}
              </h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              <p>Planowana kwota: <span className="text-foreground font-medium">{formatCurrency(expense.amount, expense.currency)}</span></p>
              {expense.walletName && <p>Portfel: <span className="text-foreground font-medium">{expense.walletName}</span></p>}
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Kwota do zapłaty</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                    placeholder="0.00"
                  />
                  <span className="flex items-center px-3 text-sm font-medium text-muted-foreground">{expense.currency}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg transition-colors"
                >
                  Pomiń
                </button>
                <button
                  type="submit"
                  disabled={loading || !amount}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Zapisywanie...' : 'Opłać'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
