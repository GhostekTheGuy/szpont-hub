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

function timeToString(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function CalendarEventModal({ isOpen, onClose, editingEvent, prefillDate, prefillHour }: CalendarEventModalProps) {
  const { wallets } = useFinanceStore();

  const [eventType, setEventType] = useState<'work' | 'personal'>('work');
  const [title, setTitle] = useState('');
  const [walletId, setWalletId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isGoogleEvent = !!editingEvent?.google_event_id;
  const isRecurringInstance = !!(editingEvent?.is_recurring && editingEvent?.id.includes('_') && /\d{4}-\d{2}-\d{2}$/.test(editingEvent.id));
  const isPersonal = eventType === 'personal';

  useEffect(() => {
    if (editingEvent) {
      setEventType(editingEvent.event_type || 'work');
      setTitle(editingEvent.title);
      setWalletId(editingEvent.wallet_id || '');
      setHourlyRate(editingEvent.hourly_rate.toString());
      const start = new Date(editingEvent.start_time);
      const end = new Date(editingEvent.end_time);
      setDate(format(start, 'yyyy-MM-dd'));
      setStartTime(timeToString(start.getHours(), start.getMinutes()));
      setEndTime(timeToString(end.getHours(), end.getMinutes()));
      setIsRecurring(editingEvent.is_recurring);
      setRecurrenceRule(editingEvent.recurrence_rule);
    } else {
      setEventType('work');
      setTitle('');
      if (wallets.length > 0) setWalletId(wallets[0].id);
      setHourlyRate('');
      if (prefillDate) {
        setDate(format(prefillDate, 'yyyy-MM-dd'));
      } else {
        setDate(format(new Date(), 'yyyy-MM-dd'));
      }
      if (prefillHour != null) {
        setStartTime(timeToString(prefillHour, 0));
        setEndTime(prefillHour >= 23 ? '23:59' : timeToString(prefillHour + 1, 0));
      } else {
        setStartTime('09:00');
        setEndTime('10:00');
      }
      setIsRecurring(false);
      setRecurrenceRule(null);
    }
  }, [editingEvent, isOpen, wallets, prefillDate, prefillHour]);

  const timeInvalid = startTime >= endTime;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPersonal && (!walletId || !hourlyRate)) return;
    if (!title || timeInvalid) return;
    setLoading(true);

    const startDt = new Date(`${date}T${startTime}:00`);
    const endDt = new Date(`${date}T${endTime}:00`);

    const eventData = {
      title,
      wallet_id: isPersonal ? '' : walletId,
      hourly_rate: isPersonal ? 0 : parseFloat(hourlyRate),
      start_time: startDt.toISOString(),
      end_time: endDt.toISOString(),
      is_recurring: isRecurring,
      recurrence_rule: isRecurring ? recurrenceRule : null,
      event_type: eventType,
    };

    try {
      if (editingEvent) {
        // Instancje cykliczne mają ID w formacie "originalId_YYYY-MM-DD"
        const realId = editingEvent.id.includes('_') && editingEvent.is_recurring
          ? editingEvent.id.replace(/_\d{4}-\d{2}-\d{2}$/, '')
          : editingEvent.id;
        await editCalendarEvent(realId, eventData);
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
      const realId = editingEvent.id.includes('_') && editingEvent.is_recurring
        ? editingEvent.id.replace(/_\d{4}-\d{2}-\d{2}$/, '')
        : editingEvent.id;
      await deleteCalendarEvent(realId);
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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-card-foreground">
                  {editingEvent ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
                </h2>
                {isGoogleEvent && (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event type toggle */}
              <div className="flex bg-secondary rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setEventType('work')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    eventType === 'work'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Praca
                </button>
                <button
                  type="button"
                  onClick={() => setEventType('personal')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    eventType === 'personal'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Osobiste
                </button>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Nazwa wydarzenia</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isGoogleEvent}
                  className={`w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${isGoogleEvent ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder={isPersonal ? 'np. Call z klientem' : 'np. Freelance - projekt X'}
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isGoogleEvent || isRecurringInstance}
                  className={`w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${isGoogleEvent || isRecurringInstance ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Od</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isGoogleEvent || isRecurringInstance}
                    className={`w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${isGoogleEvent || isRecurringInstance ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Do</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isGoogleEvent || isRecurringInstance}
                    className={`w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${isGoogleEvent || isRecurringInstance ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {timeInvalid && (
                <p className="text-xs text-destructive">Czas zakończenia musi być po czasie rozpoczęcia</p>
              )}

              {!isPersonal && (
                <>
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
                </>
              )}

              {!isGoogleEvent && !isRecurringInstance && (
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
              )}

              {isRecurringInstance && (
                <p className="text-xs text-muted-foreground">
                  To jest instancja cyklicznego wydarzenia. Zmiany tytułu, portfela i stawki dotyczą wszystkich instancji.
                </p>
              )}

              {isGoogleEvent && (
                <p className="text-xs text-muted-foreground">
                  Tytuł i czas są synchronizowane z Google Calendar. Możesz edytować portfel, stawkę i typ.
                </p>
              )}

              <div className="flex gap-2 mt-6">
                {editingEvent && !isGoogleEvent && (
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
                  disabled={loading || (!isPersonal && wallets.length === 0) || timeInvalid}
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
