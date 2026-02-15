'use client';

import { useEffect, useState, ChangeEvent, ChangeEventHandler } from 'react';
import { X, Camera, CalendarIcon } from 'lucide-react';
import { useFinanceStore, Transaction } from '@/hooks/useFinanceStore';
import { addTransactionAction, editTransactionAction } from '@/app/actions';
import type { Currency } from '@/lib/exchange-rates';
import { ScanReceiptModal } from '@/components/ScanReceiptModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { DropdownNavProps, DropdownProps } from 'react-day-picker';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, editingTransaction }: TransactionModalProps) {
  const { wallets } = useFinanceStore();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [type, setType] = useState<'income' | 'outcome'>('outcome');
  const [currency, setCurrency] = useState<Currency>('PLN');
  const [loading, setLoading] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setAmount(Math.abs(editingTransaction.amount).toString());
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description || '');
      setWalletId(editingTransaction.wallet);
      setDate(parseISO(editingTransaction.date));
      setType(editingTransaction.type);
      setCurrency(editingTransaction.currency || 'PLN');
    } else {
      setAmount('');
      setCategory('');
      setDescription('');
      if (wallets.length > 0) setWalletId(wallets[0].id);
      setDate(new Date());
      setType('outcome');
      setCurrency('PLN');
    }
  }, [editingTransaction, isOpen, wallets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId) return;
    setLoading(true);

    const numericAmount = parseFloat(amount);
    const finalAmount = type === 'outcome' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    const transactionData = {
      amount: finalAmount,
      category,
      description,
      wallet: walletId,
      date: format(date, 'yyyy-MM-dd'),
      type,
      currency,
    };

    try {
      if (editingTransaction) {
        await editTransactionAction(editingTransaction.id, transactionData);
      } else {
        await addTransactionAction(transactionData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert('Wystąpił błąd zapisu');
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
          <h2 className="text-xl font-bold text-card-foreground">
            {editingTransaction ? 'Edytuj Transakcję' : 'Nowa Transakcja'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {!editingTransaction && (
          <button
            type="button"
            onClick={() => { setIsScanOpen(true); onClose(); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <Camera className="w-4 h-4" />
            Skanuj rachunek
          </button>
        )}

        <ScanReceiptModal
          isOpen={isScanOpen}
          onClose={() => setIsScanOpen(false)}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-lg text-center font-medium transition-colors ${
                type === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              Przychód
            </button>
            <button
              type="button"
              onClick={() => setType('outcome')}
              className={`py-2.5 rounded-lg text-center font-medium transition-colors ${
                type === 'outcome'
                  ? 'bg-red-600 text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              Wydatek
            </button>
          </div>

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

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Kategoria</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="np. Jedzenie"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Opis (opcjonalnie)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
              placeholder="Dodatkowy opis..."
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Portfel</label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {wallets.length === 0 && <option value="">Brak portfeli</option>}
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.balance.toLocaleString()} PLN)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Data</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all flex items-center justify-between"
                >
                  <span>{format(date, 'd MMMM yyyy', { locale: pl })}</span>
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                <Calendar
                  captionLayout="dropdown"
                  classNames={{ month_caption: 'mx-0' }}
                  components={{
                    Dropdown: (props: DropdownProps) => {
                      const handleChange = (_value: string | number, _e: ChangeEventHandler<HTMLSelectElement>) => {
                        const event = { target: { value: String(_value) } } as ChangeEvent<HTMLSelectElement>;
                        _e(event);
                      };
                      return (
                        <Select
                          onValueChange={(value) => {
                            if (props.onChange && value !== null) handleChange(value, props.onChange);
                          }}
                          value={String(props.value)}
                        >
                          <SelectTrigger className="first:grow">
                            <SelectValue>
                              {props.options?.find((o) => o.value === props.value)?.label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent align="start">
                            {props.options?.map((option) => (
                              <SelectItem disabled={option.disabled} key={option.value} value={String(option.value)}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    },
                    DropdownNav: (props: DropdownNavProps) => (
                      <div className="flex w-full items-center gap-2">{props.children}</div>
                    ),
                  }}
                  defaultMonth={date}
                  hideNavigation
                  mode="single"
                  selected={date}
                  onSelect={(d) => { if (d) { setDate(d); setCalendarOpen(false); } }}
                  locale={pl}
                  startMonth={new Date(2020, 0)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <button
            type="submit"
            disabled={loading || wallets.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Zapisywanie...' : (editingTransaction ? 'Zapisz zmiany' : 'Dodaj transakcję')}
          </button>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
