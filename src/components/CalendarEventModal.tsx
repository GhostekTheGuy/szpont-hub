'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useFinanceStore, type CalendarEvent } from '@/hooks/useFinanceStore';
import { addCalendarEvent, editCalendarEvent, deleteCalendarEvent } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent?: CalendarEvent | null;
  prefillDate?: Date | null;
  prefillHour?: number | null;
}

const HOUR_OPTIONS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6;
  return { value: hour, label: `${String(hour).padStart(2, '0')}:00` };
});

const MINUTE_OPTIONS = [
  { value: 0, label: '00' },
  { value: 15, label: '15' },
  { value: 30, label: '30' },
  { value: 45, label: '45' },
];

export function CalendarEventModal({ isOpen, onClose, editingEvent, prefillDate, prefillHour }: CalendarEventModalProps) {
  const { wallets } = useFinanceStore();

  const [title, setTitle] = useState('');
  const [walletId, setWalletId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setWalletId(editingEvent.wallet_id || '');
      setHourlyRate(editingEvent.hourly_rate.toString());
      const start = new Date(editingEvent.start_time);
      const end = new Date(editingEvent.end_time);
      setDate(format(start, 'yyyy-MM-dd'));
      setStartHour(start.getHours());
      setStartMinute(start.getMinutes());
      setEndHour(end.getHours());
      setEndMinute(end.getMinutes());
      setIsRecurring(editingEvent.is_recurring);
      setRecurrenceRule(editingEvent.recurrence_rule);
    } else {
      setTitle('');
      if (wallets.length > 0) setWalletId(wallets[0].id);
      setHourlyRate('');
      if (prefillDate) {
        setDate(format(prefillDate, 'yyyy-MM-dd'));
      } else {
        setDate(format(new Date(), 'yyyy-MM-dd'));
      }
      if (prefillHour != null) {
        setStartHour(prefillHour);
        setStartMinute(0);
        setEndHour(Math.min(prefillHour + 1, 23));
        setEndMinute(0);
      } else {
        setStartHour(9);
        setStartMinute(0);
        setEndHour(10);
        setEndMinute(0);
      }
      setIsRecurring(false);
      setRecurrenceRule(null);
    }
  }, [editingEvent, isOpen, wallets, prefillDate, prefillHour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || !title || !hourlyRate) return;
    setLoading(true);

    const startTime = new Date(`${date}T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`);
    const endTime = new Date(`${date}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`);

    const eventData = {
      title,
      wallet_id: walletId,
      hourly_rate: parseFloat(hourlyRate),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      is_recurring: isRecurring,
      recurrence_rule: isRecurring ? recurrenceRule : null,
    };

    try {
      if (editingEvent) {
        await editCalendarEvent(editingEvent.id, eventData);
      } else {
        await addCalendarEvent(eventData);
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
    if (!editingEvent || !confirm('Usunąć wydarzenie?')) return;
    setLoading(true);
    try {
      await deleteCalendarEvent(editingEvent.id);
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
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-card-foreground">
                {editingEvent ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Nazwa wydarzenia</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="np. Freelance - projekt X"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Od</label>
                  <div className="flex gap-1">
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(Number(e.target.value))}
                      className="flex-1 bg-input border border-border rounded-lg px-2 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                    >
                      {HOUR_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label.split(':')[0]}</option>
                      ))}
                    </select>
                    <select
                      value={startMinute}
                      onChange={(e) => setStartMinute(Number(e.target.value))}
                      className="w-16 bg-input border border-border rounded-lg px-2 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                    >
                      {MINUTE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Do</label>
                  <div className="flex gap-1">
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(Number(e.target.value))}
                      className="flex-1 bg-input border border-border rounded-lg px-2 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                    >
                      {HOUR_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label.split(':')[0]}</option>
                      ))}
                    </select>
                    <select
                      value={endMinute}
                      onChange={(e) => setEndMinute(Number(e.target.value))}
                      className="w-16 bg-input border border-border rounded-lg px-2 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                    >
                      {MINUTE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
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
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Stawka / godzinę (PLN)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => {
                      setIsRecurring(e.target.checked);
                      if (!e.target.checked) setRecurrenceRule(null);
                      else setRecurrenceRule('weekly');
                    }}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Cykliczne</span>
                </label>
                {isRecurring && (
                  <select
                    value={recurrenceRule || 'weekly'}
                    onChange={(e) => setRecurrenceRule(e.target.value)}
                    className="bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                  >
                    <option value="daily">Codziennie</option>
                    <option value="weekly">Co tydzień</option>
                    <option value="monthly">Co miesiąc</option>
                  </select>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors disabled:opacity-50"
                  >
                    Usuń
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || wallets.length === 0}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Zapisywanie...' : (editingEvent ? 'Zapisz zmiany' : 'Dodaj wydarzenie')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
