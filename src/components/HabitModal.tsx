'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, Zap, Flame, Droplets, BookOpen, Dumbbell, Moon, Sun, Coffee } from 'lucide-react';
import { addHabit, editHabit, deleteHabit } from '@/app/actions';
import type { Habit } from '@/hooks/useFinanceStore';

const ICON_OPTIONS = [
  { name: 'star', Icon: Star },
  { name: 'heart', Icon: Heart },
  { name: 'zap', Icon: Zap },
  { name: 'flame', Icon: Flame },
  { name: 'droplets', Icon: Droplets },
  { name: 'book-open', Icon: BookOpen },
  { name: 'dumbbell', Icon: Dumbbell },
  { name: 'moon', Icon: Moon },
  { name: 'sun', Icon: Sun },
  { name: 'coffee', Icon: Coffee },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Codziennie' },
  { value: 'weekdays', label: 'Dni robocze (Pon-Pt)' },
  { value: '5_per_week', label: '5 dni w tygodniu' },
  { value: '4_per_week', label: '4 dni w tygodniu' },
  { value: '3_per_week', label: '3 dni w tygodniu' },
  { value: '2_per_week', label: '2 dni w tygodniu' },
];

const COLOR_PRESETS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#a855f7',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingHabit: Habit | null;
}

export function HabitModal({ isOpen, onClose, editingHabit }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('star');
  const [frequency, setFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nazwa nawyku jest wymagana';
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

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setColor(editingHabit.color);
      setIcon(editingHabit.icon);
      setFrequency(editingHabit.frequency || 'daily');
    } else {
      setName('');
      setColor('#6366f1');
      setIcon('star');
      setFrequency('daily');
    }
    if (isOpen) setErrors({});
  }, [editingHabit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (editingHabit) {
        await editHabit(editingHabit.id, { name: name.trim(), color, icon, frequency });
      } else {
        await addHabit({ name: name.trim(), color, icon, frequency });
      }
      onClose();
    } catch (err) {
      console.error('Error saving habit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingHabit) return;
    setLoading(true);
    try {
      await deleteHabit(editingHabit.id);
      onClose();
    } catch (err) {
      console.error('Error deleting habit:', err);
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = ICON_OPTIONS.find(o => o.name === icon)?.Icon || Star;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: color + '20', color }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground">
                  {editingHabit ? 'Edytuj nawyk' : 'Nowy nawyk'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Nazwa</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(prev => { const {name: _, ...rest} = prev; return rest; }); }}
                  onBlur={() => blurValidate('name')}
                  className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.name ? 'border-destructive' : 'border-border'}`}
                  placeholder="np. Medytacja, Ćwiczenia..."
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Częstotliwość</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  {FREQUENCY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Kolor</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        color === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-card scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Ikona</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {ICON_OPTIONS.map(opt => (
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
                      <opt.Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-6">
                {editingHabit && (
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
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Zapisywanie...' : editingHabit ? 'Zapisz' : 'Dodaj'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { ICON_OPTIONS };
