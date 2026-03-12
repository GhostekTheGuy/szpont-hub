'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, X } from 'lucide-react';
import { addCalendarEvent } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import type { Wallet } from '@/hooks/useFinanceStore';

interface TimerState {
  originalStartTime: number;
  resumeTime: number;
  accumulatedMs: number;
  isPaused: boolean;
  title: string;
  walletId: string;
  walletName: string;
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

function formatEarnings(ms: number, hourlyRate: number): string {
  const hours = ms / 3_600_000;
  const earnings = hours * hourlyRate;
  return `~${earnings.toFixed(0)} PLN`;
}

interface TimerWidgetProps {
  wallets: Wallet[];
  onStop: () => void;
}

type ViewState = 'idle' | 'form' | 'running';

export function TimerWidget({ wallets, onStop }: TimerWidgetProps) {
  const { toast, confirm } = useToast();
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
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (timerState) {
      if (timerState.isPaused) {
        setElapsed(timerState.accumulatedMs);
      } else {
        const tick = () =>
          setElapsed(timerState.accumulatedMs + (Date.now() - timerState.resumeTime));
        tick();
        intervalRef.current = setInterval(tick, 1000);
        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      }
    } else {
      setElapsed(0);
    }
  }, [timerState]);

  useEffect(() => {
    if (showForm && wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [showForm, wallets, walletId]);

  useEffect(() => {
    if (showForm && titleInputRef.current) {
      const t = setTimeout(() => titleInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [showForm]);

  const handleStart = useCallback(() => {
    if (!title.trim() || !walletId || !hourlyRate) return;
    const wallet = wallets.find(w => w.id === walletId);
    const now = Date.now();
    const state: TimerState = {
      originalStartTime: now,
      resumeTime: now,
      accumulatedMs: 0,
      isPaused: false,
      title: title.trim(),
      walletId,
      walletName: wallet?.name ?? '',
      hourlyRate: parseFloat(hourlyRate),
    };
    saveTimerState(state);
    setTimerState(state);
    setShowForm(false);
  }, [title, walletId, hourlyRate, wallets]);

  const handlePauseResume = useCallback(() => {
    if (!timerState) return;
    if (timerState.isPaused) {
      const updated: TimerState = {
        ...timerState,
        resumeTime: Date.now(),
        isPaused: false,
      };
      saveTimerState(updated);
      setTimerState(updated);
    } else {
      const now = Date.now();
      const updated: TimerState = {
        ...timerState,
        accumulatedMs: timerState.accumulatedMs + (now - timerState.resumeTime),
        isPaused: true,
      };
      saveTimerState(updated);
      setTimerState(updated);
    }
  }, [timerState]);

  const handleStop = useCallback(async () => {
    if (!timerState) return;
    setSaving(true);
    try {
      await addCalendarEvent({
        title: timerState.title,
        wallet_id: timerState.walletId,
        hourly_rate: timerState.hourlyRate,
        start_time: new Date(timerState.originalStartTime).toISOString(),
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
      toast('Błąd zapisu wydarzenia', 'error');
    } finally {
      setSaving(false);
    }
  }, [timerState, onStop]);

  const handleCancel = useCallback(async () => {
    if (!await confirm({ title: 'Anulować timer?', description: 'Czas nie zostanie zapisany.', variant: 'danger', confirmLabel: 'Anuluj timer' })) return;
    clearTimerState();
    setTimerState(null);
  }, [confirm]);

  const view: ViewState = timerState ? 'running' : showForm ? 'form' : 'idle';
  const isPaused = timerState?.isPaused ?? false;

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
          className="relative rounded-xl p-[2px] overflow-hidden"
        >
          {/* Snake border – rotating conic gradient */}
          <div
            className={`absolute inset-[-50%] transition-colors duration-500 ${
              isPaused ? 'animate-[snake-spin_4s_linear_infinite]' : 'animate-[snake-spin_2.5s_linear_infinite]'
            }`}
            style={{
              background: isPaused
                ? 'conic-gradient(from 0deg, transparent 60%, oklch(from var(--primary) l c h / 0.5) 78%, var(--primary) 85%, oklch(from var(--primary) l c h / 0.5) 92%, transparent 100%)'
                : 'conic-gradient(from 0deg, transparent 60%, oklch(from var(--primary) l c h / 0.7) 78%, var(--primary) 85%, oklch(from var(--primary) l c h / 0.7) 92%, transparent 100%)',
            }}
          />

          {/* Card content */}
          <div className="relative bg-card rounded-[10px] z-10">
            {/* Header: dot + title + wallet */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isPaused
                      ? 'bg-amber-500'
                      : 'bg-green-500 animate-pulse'
                  }`}
                />
                <span
                  className="text-sm font-medium text-foreground truncate"
                  title={timerState!.title}
                >
                  {timerState!.title}
                </span>
              </div>
              {timerState!.walletName && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0 ml-2">
                  {timerState!.walletName}
                </span>
              )}
            </div>

            {/* Timer + earnings */}
            <div className="flex flex-col items-center py-3">
              <span
                className={`text-3xl font-mono tabular-nums font-semibold ${
                  isPaused ? 'text-amber-400' : 'text-foreground'
                }`}
              >
                {formatElapsed(elapsed)}
              </span>
              <span className="text-sm text-muted-foreground mt-0.5">
                {formatEarnings(elapsed, timerState!.hourlyRate)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2 px-4 pb-3">
              <button
                onClick={handlePauseResume}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isPaused
                    ? 'bg-green-600/15 text-green-400 hover:bg-green-600/25'
                    : 'bg-amber-600/15 text-amber-400 hover:bg-amber-600/25'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Wznów
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pauza
                  </>
                )}
              </button>
              <button
                onClick={handleStop}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors disabled:opacity-50"
              >
                <Square className="w-3.5 h-3.5" />
                Zapisz
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600/15 text-red-400 hover:bg-red-600/25 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Anuluj
              </button>
            </div>
          </div>
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
          <div className="bg-card border border-border rounded-xl px-3 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tytuł..."
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring flex-1 min-w-0"
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring flex-1 min-w-0"
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
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring w-24 shrink-0"
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />
              <button
                onClick={handleStart}
                disabled={!title.trim() || !walletId || !hourlyRate}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Rozpocznij"
              >
                <Play className="w-4 h-4" />
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
