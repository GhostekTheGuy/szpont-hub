'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, Unplug, Loader2, Check } from 'lucide-react';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import {
  getGoogleCalendarMappings,
  updateGoogleCalendarMapping,
  disconnectGoogleCalendar,
} from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

interface GoogleCalendarSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  connectionEmail: string;
  onSync: () => Promise<void>;
  onDisconnected: () => void;
}

interface CalendarMapping {
  id: string;
  google_calendar_id: string;
  calendar_name: string;
  wallet_id: string | null;
  walletName: string;
  walletColor: string;
  hourly_rate: number;
  is_enabled: boolean;
  last_synced_at: string | null;
}

export function GoogleCalendarSettings({
  isOpen,
  onClose,
  connectionEmail,
  onSync,
  onDisconnected,
}: GoogleCalendarSettingsProps) {
  const { wallets } = useFinanceStore();
  const [mappings, setMappings] = useState<CalendarMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadMappings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGoogleCalendarMappings();
      setMappings(data);
    } catch (err) {
      console.error('Error loading mappings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadMappings();
  }, [isOpen, loadMappings]);

  const handleToggleEnabled = async (mapping: CalendarMapping) => {
    setSavingId(mapping.id);
    const newEnabled = !mapping.is_enabled;
    setMappings(prev => prev.map(m => m.id === mapping.id ? { ...m, is_enabled: newEnabled } : m));
    try {
      await updateGoogleCalendarMapping(mapping.id, { is_enabled: newEnabled });
    } catch {
      setMappings(prev => prev.map(m => m.id === mapping.id ? { ...m, is_enabled: !newEnabled } : m));
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateWallet = async (mapping: CalendarMapping, walletId: string) => {
    setSavingId(mapping.id);
    setMappings(prev => prev.map(m => m.id === mapping.id ? { ...m, wallet_id: walletId || null } : m));
    try {
      await updateGoogleCalendarMapping(mapping.id, { wallet_id: walletId || null });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateRate = async (mapping: CalendarMapping, rate: string) => {
    const numRate = parseFloat(rate) || 0;
    setSavingId(mapping.id);
    try {
      await updateGoogleCalendarMapping(mapping.id, { hourly_rate: numRate });
      setMappings(prev => prev.map(m => m.id === mapping.id ? { ...m, hourly_rate: numRate } : m));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSync();
      await loadMappings();
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Rozłączyć Google Calendar? Zsynchronizowane eventy zostaną usunięte.')) return;
    setDisconnecting(true);
    try {
      await disconnectGoogleCalendar();
      onDisconnected();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  const lastSyncTime = mappings
    .filter(m => m.last_synced_at)
    .sort((a, b) => new Date(b.last_synced_at!).getTime() - new Date(a.last_synced_at!).getTime())[0]?.last_synced_at;

  const formatLastSync = (iso: string | null | undefined) => {
    if (!iso) return 'Nigdy';
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Przed chwilą';
    if (minutes < 60) return `${minutes} min temu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h temu`;
    return `${Math.floor(hours / 24)}d temu`;
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
            className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-card-foreground">Google Calendar</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection status */}
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-foreground">{connectionEmail}</span>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unplug className="w-3 h-3" />}
                Rozłącz
              </button>
            </div>

            {/* Sync status */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-muted-foreground">
                Ostatnia synchronizacja: {formatLastSync(lastSyncTime)}
              </span>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Synchronizuj
              </button>
            </div>

            {/* Calendar mappings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Kalendarze</h3>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : mappings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak kalendarzy. Spróbuj ponownie połączyć konto.
                </p>
              ) : (
                mappings.map(mapping => (
                  <div
                    key={mapping.id}
                    className={`border rounded-lg p-3 transition-colors ${
                      mapping.is_enabled
                        ? 'border-border bg-card'
                        : 'border-border/50 bg-muted/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mapping.is_enabled}
                          onChange={() => handleToggleEnabled(mapping)}
                          className="rounded border-border"
                          disabled={savingId === mapping.id}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {mapping.calendar_name}
                        </span>
                      </label>
                      {savingId === mapping.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    {mapping.is_enabled && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Portfel</label>
                          <select
                            value={mapping.wallet_id || ''}
                            onChange={(e) => handleUpdateWallet(mapping, e.target.value)}
                            className="w-full bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                          >
                            <option value="">-- Brak --</option>
                            {wallets.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Stawka/h (PLN)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={mapping.hourly_rate || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMappings(prev => prev.map(m =>
                                m.id === mapping.id ? { ...m, hourly_rate: parseFloat(val) || 0 } : m
                              ));
                            }}
                            onBlur={(e) => handleUpdateRate(mapping, e.target.value)}
                            className="w-full bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
