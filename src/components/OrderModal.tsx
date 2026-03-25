'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Clock, Banknote } from 'lucide-react';
import { addOrder, editOrder } from '@/app/actions';
import { useFinanceStore, type Order, type OrderStatus, type BillingType } from '@/hooks/useFinanceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';

interface OrderModalProps {
  isOpen: boolean;
  onClose: (didChange?: boolean) => void;
  editingOrder?: Order | null;
  preselectedClientId?: string | null;
}

const inputClass =
  'w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all';
const selectClass =
  'w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all appearance-none';
const labelClass = 'block text-sm font-medium text-foreground mb-1.5';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Oczekujace',
  in_progress: 'W trakcie',
  completed: 'Wykonane',
  settled: 'Rozliczone',
};

const COMMON_TAGS = ['design', 'development', 'konsultacja', 'marketing', 'foto', 'video', 'social media', 'copywriting'];

export function OrderModal({ isOpen, onClose, editingOrder, preselectedClientId }: OrderModalProps) {
  const { toast } = useToast();
  const wallets = useFinanceStore(s => s.wallets);
  const clients = useFinanceStore(s => s.clients);

  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [billingType, setBillingType] = useState<BillingType>('flat');
  const [amount, setAmount] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [walletId, setWalletId] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isHourly = billingType === 'hourly';

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!clientId) errs.clientId = 'Wybierz klienta';
    if (!title.trim()) errs.title = 'Tytuł zlecenia jest wymagany';
    if (billingType === 'flat' && (!amount || parseFloat(amount) <= 0)) errs.amount = 'Kwota musi być większa od 0';
    if (billingType === 'hourly' && (!hourlyRate || parseFloat(hourlyRate) <= 0)) errs.hourlyRate = 'Stawka godzinowa musi być większa od 0';
    return errs;
  };

  useEffect(() => {
    if (editingOrder) {
      setClientId(editingOrder.client_id);
      setTitle(editingOrder.title);
      setDescription(editingOrder.description || '');
      setBillingType(editingOrder.billing_type);
      setAmount(editingOrder.billing_type === 'flat' ? editingOrder.amount.toString() : '');
      setHourlyRate(editingOrder.hourly_rate?.toString() || '');
      setWalletId(editingOrder.wallet_id || '');
      setStatus(editingOrder.status);
      setTags(editingOrder.tags);
      setCompletionDate(editingOrder.completion_date || '');
    } else {
      setClientId(preselectedClientId || '');
      setTitle('');
      setDescription('');
      setBillingType('flat');
      setAmount('');
      setHourlyRate('');
      setWalletId(wallets.length > 0 ? wallets[0].id : '');
      setStatus('pending');
      setTags([]);
      setTagInput('');
      setCompletionDate('');
    }
    setErrors({});
  }, [editingOrder, isOpen, wallets, preselectedClientId]);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);

    try {
      const data = {
        client_id: clientId,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: isHourly ? 0 : parseFloat(amount),
        billing_type: billingType,
        hourly_rate: isHourly ? parseFloat(hourlyRate) : undefined,
        wallet_id: walletId || undefined,
        status,
        tags,
        completion_date: completionDate || undefined,
      };

      if (editingOrder) {
        await editOrder(editingOrder.id, data);
        toast('Zlecenie zaktualizowane', 'success');
      } else {
        await addOrder(data);
        toast('Zlecenie dodane', 'success');
      }
      onClose(true);
    } catch (err) {
      console.error('OrderModal error:', err);
      toast('Wystapil blad', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fiatWallets = wallets.filter(w => w.type === 'fiat');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-card-foreground">
                {editingOrder ? 'Edytuj zlecenie' : 'Nowe zlecenie'}
              </h2>
              <button onClick={() => onClose()} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Client selection */}
              <div>
                <label className={labelClass}>Klient *</label>
                <select
                  value={clientId}
                  onChange={e => { setClientId(e.target.value); if (errors.clientId) setErrors(prev => { const {clientId: _, ...rest} = prev; return rest; }); }}
                  className={`${selectClass}${errors.clientId ? ' border-destructive' : ''}`}
                >
                  <option value="">Wybierz klienta...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-xs text-destructive mt-1">{errors.clientId}</p>}
              </div>

              <div>
                <label className={labelClass}>Tytul zlecenia *</label>
                <input type="text" value={title} onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => { const {title: _, ...rest} = prev; return rest; }); }} className={`${inputClass}${errors.title ? ' border-destructive' : ''}`} placeholder="np. Projekt logo" />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>

              {/* Billing type toggle */}
              <div>
                <label className={labelClass}>Typ rozliczenia</label>
                <div className="flex bg-secondary rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setBillingType('flat')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      !isHourly
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    Kwota stala
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingType('hourly')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isHourly
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Godzinowe
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {isHourly ? (
                  <div>
                    <label className={labelClass}>Stawka /h (PLN) *</label>
                    <input type="number" step="0.01" min="0" value={hourlyRate} onChange={e => { setHourlyRate(e.target.value); if (errors.hourlyRate) setErrors(prev => { const {hourlyRate: _, ...rest} = prev; return rest; }); }} className={`${inputClass}${errors.hourlyRate ? ' border-destructive' : ''}`} placeholder="0.00" />
                    {errors.hourlyRate && <p className="text-xs text-destructive mt-1">{errors.hourlyRate}</p>}
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Kwota (PLN) *</label>
                    <input type="number" step="0.01" min="0" value={amount} onChange={e => { setAmount(e.target.value); if (errors.amount) setErrors(prev => { const {amount: _, ...rest} = prev; return rest; }); }} className={`${inputClass}${errors.amount ? ' border-destructive' : ''}`} placeholder="0.00" />
                    {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
                  </div>
                )}
                <div>
                  <label className={labelClass}>Portfel</label>
                  <select value={walletId} onChange={e => setWalletId(e.target.value)} className={selectClass}>
                    <option value="">Brak</option>
                    {fiatWallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isHourly && editingOrder && editingOrder.tracked_hours > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-sm">
                  <span className="text-blue-400 font-medium">{editingOrder.tracked_hours.toFixed(1)}h</span>
                  <span className="text-muted-foreground"> zatrackowane = </span>
                  <span className="text-foreground font-medium">{editingOrder.amount.toFixed(2)} PLN</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className={selectClass}>
                    {Array.from(Object.entries(STATUS_LABELS)).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Data realizacji</label>
                  <input type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={labelClass}>Tagi</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-md"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className={inputClass}
                    placeholder="Wpisz tag i nacisnij Enter..."
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim()}
                    className="px-3 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* Quick tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {COMMON_TAGS.filter(t => !tags.includes(t)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2 py-0.5 text-xs bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground rounded transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Opis</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Szczegoly zlecenia..." />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Zapisywanie...' : editingOrder ? 'Zapisz zmiany' : 'Dodaj zlecenie'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
