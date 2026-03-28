'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useFinanceStore, type CalendarEvent } from '@/hooks/useFinanceStore';
import {
  addCalendarEvent,
  editCalendarEvent,
  deleteCalendarEvent,
  editRecurringInstance,
  deleteRecurringInstance,
  deleteRecurringFromDate,
  deleteAllRecurring,
  getRecurringSettledInfo,
} from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { format } from 'date-fns';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: (didChange?: boolean) => void;
  editingEvent?: CalendarEvent | null;
  prefillDate?: Date | null;
  prefillHour?: number | null;
}

type RecurringDeleteMode = 'this' | 'this_and_future' | 'all';

function timeToString(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function extractParentId(instanceId: string): string {
  const match = instanceId.match(/_(\d{4}-\d{2}-\d{2})$/);
  if (!match) return instanceId;
  return instanceId.slice(0, match.index!);
}

export function CalendarEventModal({ isOpen, onClose, editingEvent, prefillDate, prefillHour }: CalendarEventModalProps) {
  const { toast, confirm } = useToast();
  const wallets = useFinanceStore(s => s.wallets);
  const orders = useFinanceStore(s => s.orders);
  const hourlyOrders = orders.filter(o => o.billing_type === 'hourly' && o.status !== 'settled' && o.hourly_rate);

  const [eventType, setEventType] = useState<'work' | 'personal'>('work');
  const [title, setTitle] = useState('');
  const [walletId, setWalletId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isGoogleEvent = !!editingEvent?.google_event_id;
  const isRecurringInstance = !!(editingEvent && /_\d{4}-\d{2}-\d{2}$/.test(editingEvent.id));
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
      setOrderId(editingEvent.order_id || '');
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
      setOrderId('');
    }
    setShowDeleteOptions(false);
    setErrors({});
  }, [editingEvent, isOpen, wallets, prefillDate, prefillHour]);

  const timeInvalid = startTime === endTime;
  const isOvernight = startTime > endTime;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Nazwa wydarzenia jest wymagana';
    if (!date) errs.date = 'Data jest wymagana';
    if (!isPersonal) {
      if (!walletId) errs.walletId = 'Wybierz portfel';
      if (!hourlyRate || parseFloat(hourlyRate) <= 0) errs.hourlyRate = 'Stawka godzinowa musi być większa od 0';
    }
    return errs;
  };

  const blurValidate = (field: string) => {
    const all = validate();
    if (all[field]) {
      setErrors(prev => ({ ...prev, [field]: all[field] }));
    } else {
      setErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (timeInvalid) return;
    setLoading(true);

    const startDt = new Date(`${date}T${startTime}:00`);
    const endDt = new Date(`${date}T${endTime}:00`);
    if (isOvernight) endDt.setDate(endDt.getDate() + 1);

    const eventData = {
      title,
      wallet_id: isPersonal ? '' : walletId,
      hourly_rate: isPersonal ? 0 : parseFloat(hourlyRate),
      start_time: startDt.toISOString(),
      end_time: endDt.toISOString(),
      is_recurring: isRecurring,
      recurrence_rule: isRecurring ? recurrenceRule : null,
      event_type: eventType,
      order_id: orderId || null,
    };

    try {
      if (editingEvent) {
        if (isRecurringInstance) {
          await editRecurringInstance(editingEvent.id, {
            title: eventData.title,
            wallet_id: eventData.wallet_id,
            hourly_rate: eventData.hourly_rate,
            event_type: eventData.event_type,
          });
        } else {
          await editCalendarEvent(editingEvent.id, eventData);
        }
      } else {
        await addCalendarEvent(eventData);
      }
      onClose(true);
    } catch (error) {
      console.error(error);
      toast('Wystąpił błąd zapisu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegular = async () => {
    if (!editingEvent) return;

    let reverseTransaction = false;

    if (editingEvent.is_settled && editingEvent.event_type !== 'personal') {
      const choice = await confirm({
        title: 'Wydarzenie rozliczone',
        description: 'To wydarzenie zostało już rozliczone. Czy chcesz również odjąć przydzieloną kwotę z portfela?',
        variant: 'danger',
        confirmLabel: 'Tak, odjąć kwotę',
        cancelLabel: 'Nie',
      });
      reverseTransaction = choice;
      if (!await confirm({ title: 'Usunąć wydarzenie?', variant: 'danger', confirmLabel: 'Usuń' })) return;
    } else {
      if (!await confirm({ title: 'Usunąć wydarzenie?', variant: 'danger', confirmLabel: 'Usuń' })) return;
    }

    setLoading(true);
    try {
      await deleteCalendarEvent(editingEvent.id, reverseTransaction);
      onClose(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecurring = async (mode: RecurringDeleteMode) => {
    if (!editingEvent) return;
    setShowDeleteOptions(false);
    setLoading(true);

    try {
      if (mode === 'this') {
        // Single instance — check if settled
        if (editingEvent.is_settled && editingEvent.event_type !== 'personal') {
          const choice = await confirm({
            title: 'Wydarzenie rozliczone',
            description: 'To wydarzenie zostało już rozliczone. Czy chcesz również odjąć przydzieloną kwotę z portfela?',
            variant: 'danger',
            confirmLabel: 'Tak, odjąć kwotę',
            cancelLabel: 'Nie, zostaw transakcję',
          });
          if (choice) {
            await deleteCalendarEvent(editingEvent.id, true);
          } else {
            await deleteRecurringInstance(editingEvent.id);
          }
        } else {
          await deleteRecurringInstance(editingEvent.id);
        }
        onClose(true);
      } else if (mode === 'this_and_future') {
        if (!await confirm({
          title: 'Usunąć to i przyszłe wydarzenia?',
          description: 'Wszystkie przyszłe wystąpienia tego cyklicznego wydarzenia zostaną usunięte.',
          variant: 'danger',
          confirmLabel: 'Usuń',
        })) {
          setLoading(false);
          return;
        }
        await deleteRecurringFromDate(editingEvent.id);
        onClose(true);
      } else if (mode === 'all') {
        const parentId = extractParentId(editingEvent.id);

        // Check for settled instances
        const settledInfo = await getRecurringSettledInfo(parentId);

        if (settledInfo.count > 0) {
          const reverseChoice = await confirm({
            title: 'Rozliczone wydarzenia',
            description: `${settledInfo.count} wydarzeń zostało rozliczonych (łącznie ${settledInfo.totalAmount.toFixed(2)} PLN). Czy chcesz cofnąć transakcje z portfela?`,
            variant: 'danger',
            confirmLabel: 'Usuń i cofnij transakcje',
            cancelLabel: 'Usuń, zostaw transakcje',
          });

          await deleteAllRecurring(parentId, reverseChoice);
        } else {
          if (!await confirm({
            title: 'Usunąć wszystkie wydarzenia?',
            description: 'Wszystkie wystąpienia tego cyklicznego wydarzenia zostaną trwale usunięte.',
            variant: 'danger',
            confirmLabel: 'Usuń wszystkie',
          })) {
            setLoading(false);
            return;
          }
          await deleteAllRecurring(parentId, false);
        }
        onClose(true);
      }
    } catch (error) {
      console.error(error);
      toast('Wystąpił błąd usuwania', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!editingEvent) return;

    if (isRecurringInstance) {
      setShowDeleteOptions(true);
    } else {
      handleDeleteRegular();
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
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90dvh] overflow-y-auto"
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
              <button onClick={() => onClose()} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recurring delete options overlay */}
            <AnimatePresence>
              {showDeleteOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-xl space-y-2"
                >
                  <p className="text-sm font-medium text-card-foreground mb-3">Jak chcesz usunąć to wydarzenie?</p>
                  <button
                    type="button"
                    onClick={() => handleDeleteRecurring('this')}
                    disabled={loading}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 text-foreground transition-colors disabled:opacity-50"
                  >
                    Tylko to wydarzenie
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRecurring('this_and_future')}
                    disabled={loading}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 text-foreground transition-colors disabled:opacity-50"
                  >
                    To i przyszłe wydarzenia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRecurring('all')}
                    disabled={loading}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 text-foreground transition-colors disabled:opacity-50"
                  >
                    Wszystkie wydarzenia
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteOptions(false)}
                    disabled={loading}
                    className="w-full text-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    Anuluj
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

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
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors(prev => { const {title: _, ...rest} = prev; return rest; }); }}
                  onBlur={() => blurValidate('title')}
                  disabled={isGoogleEvent}
                  className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.title ? 'border-destructive' : 'border-border'} ${isGoogleEvent ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder={isPersonal ? 'np. Call z klientem' : 'np. Freelance - projekt X'}
                />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); if (errors.date) setErrors(prev => { const {date: _, ...rest} = prev; return rest; }); }}
                  onBlur={() => blurValidate('date')}
                  disabled={isGoogleEvent || isRecurringInstance}
                  className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.date ? 'border-destructive' : 'border-border'} ${isGoogleEvent || isRecurringInstance ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
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
                <p className="text-xs text-destructive">Czas rozpoczęcia i zakończenia nie mogą być takie same</p>
              )}
              {isOvernight && (
                <p className="text-xs text-muted-foreground">Wydarzenie przechodzi przez północ (kończy się następnego dnia)</p>
              )}

              {!isPersonal && (
                <>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Portfel</label>
                    <select
                      value={walletId}
                      onChange={(e) => { setWalletId(e.target.value); if (errors.walletId) setErrors(prev => { const {walletId: _, ...rest} = prev; return rest; }); }}
                      onBlur={() => blurValidate('walletId')}
                      className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.walletId ? 'border-destructive' : 'border-border'}`}
                    >
                      {wallets.length === 0 && <option value="">Brak portfeli</option>}
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    {errors.walletId && <p className="text-xs text-destructive mt-1">{errors.walletId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Stawka / godzinę (PLN)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => { setHourlyRate(e.target.value); if (errors.hourlyRate) setErrors(prev => { const {hourlyRate: _, ...rest} = prev; return rest; }); }}
                      onBlur={() => blurValidate('hourlyRate')}
                      className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.hourlyRate ? 'border-destructive' : 'border-border'}`}
                      placeholder="0.00"
                    />
                    {errors.hourlyRate && <p className="text-xs text-destructive mt-1">{errors.hourlyRate}</p>}
                  </div>
                </>
              )}

              {!isPersonal && hourlyOrders.length > 0 && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Zlecenie godzinowe</label>
                  <select
                    value={orderId}
                    onChange={(e) => {
                      const oid = e.target.value;
                      setOrderId(oid);
                      const order = hourlyOrders.find(o => o.id === oid);
                      if (order) {
                        setTitle(order.title);
                        if (order.wallet_id) setWalletId(order.wallet_id);
                        if (order.hourly_rate) setHourlyRate(order.hourly_rate.toString());
                      }
                    }}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                  >
                    <option value="">Brak (reczny wpis)</option>
                    {hourlyOrders.map(o => (
                      <option key={o.id} value={o.id}>{o.title} ({o.hourly_rate} PLN/h)</option>
                    ))}
                  </select>
                </div>
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
                  To jest instancja cyklicznego wydarzenia. Zmiany dotyczą tylko tej instancji.
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
