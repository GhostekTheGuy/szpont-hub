'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, X } from 'lucide-react';
import { addCalendarEvent } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import type { Wallet } from '@/hooks/useFinanceStore';

interface TimerState {
  startTime: number;
  title: string;
  walletId: string;
  hourlyRate: number;
}

const STORAGE_KEY = 'calendar-timer';

function loadTimerState(): TimerState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveTimerState(state: TimerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearTimerState() {
  localStorage.removeItem(STORAGE_KEY);
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface TimerWidgetProps {
  wallets: Wallet[];
  onStop: () => void;
}

type ViewState = 'idle' | 'form' | 'running';

export function TimerWidget({ wallets, onStop }: TimerWidgetProps) {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [walletId, setWalletId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = loadTimerState();
    if (saved) setTimerState(saved);
  }, []);

  useEffect(() => {
    if (timerState) {
      const tick = () => setElapsed(Date.now() - timerState.startTime);
      tick();
      intervalRef.current = setInterval(tick, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    } else {
      setElapsed(0);
    }
  }, [timerState]);

  useEffect(() => {
    if (showForm && wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [showForm, wallets, walletId]);

  // Focus title input when form appears
  useEffect(() => {
    if (showForm && titleInputRef.current) {
      // Small delay so the animation has started and the input is visible
      const t = setTimeout(() => titleInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [showForm]);

  const handleStart = useCallback(() => {
    if (!title.trim() || !walletId || !hourlyRate) return;
    const state: TimerState = {
      startTime: Date.now(),
      title: title.trim(),
      walletId,
      hourlyRate: parseFloat(hourlyRate),
    };
    saveTimerState(state);
    setTimerState(state);
    setShowForm(false);
  }, [title, walletId, hourlyRate]);

  const handleStop = useCallback(async () => {
    if (!timerState) return;
    setSaving(true);
    try {
      await addCalendarEvent({
        title: timerState.title,
        wallet_id: timerState.walletId,
        hourly_rate: timerState.hourlyRate,
        start_time: new Date(timerState.startTime).toISOString(),
        end_time: new Date().toISOString(),
        is_recurring: false,
        recurrence_rule: null,
      });
      clearTimerState();
      setTimerState(null);
      setTitle('');
      setHourlyRate('');
      setWalletId('');
      onStop();
    } catch (error) {
      console.error('Error saving timer event:', error);
      alert('Błąd zapisu wydarzenia');
    } finally {
      setSaving(false);
    }
  }, [timerState, onStop]);

  const handleCancel = useCallback(() => {
    if (!confirm('Anulować timer? Czas nie zostanie zapisany.')) return;
    clearTimerState();
    setTimerState(null);
  }, []);

  const view: ViewState = timerState ? 'running' : showForm ? 'form' : 'idle';

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === 'running' && (
        <motion.div
          key="running"
          layout
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center gap-2 bg-green-600/15 border border-green-600/30 rounded-lg px-3 py-1.5"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-400 truncate max-w-[120px]" title={timerState!.title}>
            {timerState!.title}
          </span>
          <span className="text-sm font-mono text-green-300 tabular-nums">
            {formatElapsed(elapsed)}
          </span>
          <button
            onClick={handleStop}
            disabled={saving}
            className="p-1 hover:bg-green-600/30 rounded transition-colors text-green-400 disabled:opacity-50"
            title="Zatrzymaj i zapisz"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-red-600/30 rounded transition-colors text-red-400"
            title="Anuluj"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {view === 'form' && (
        <motion.div
          key="form"
          layout
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="w-full"
        >
          <div className="bg-secondary border border-border rounded-lg px-3 py-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tytuł..."
                className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring flex-1 min-w-0"
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring flex-1 min-w-0"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="PLN/h"
                step="0.01"
                className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-20 shrink-0"
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />
              <button
                onClick={handleStart}
                disabled={!title.trim() || !walletId || !hourlyRate}
                className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Rozpocznij"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {view === 'idle' && (
        <motion.button
          key="idle"
          layout
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-all"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">Timer</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
