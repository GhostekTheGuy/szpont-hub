'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Timer, Loader2, Check, Trash2, FileText, Sparkles } from 'lucide-react';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { addCalendarEvent, getScansRemaining } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanTogglModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'idle' | 'analyzing' | 'results' | 'saving';

interface ScannedEntry {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  hourly_rate: string;
  wallet_id: string;
  selected: boolean;
}

export function ScanTogglModal({ isOpen, onClose }: ScanTogglModalProps) {
  const { wallets } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ModalState>('idle');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [entries, setEntries] = useState<ScannedEntry[]>([]);
  const [globalWalletId, setGlobalWalletId] = useState(wallets[0]?.id || '');
  const [globalRate, setGlobalRate] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  const [scansPro, setScansPro] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getScansRemaining().then(({ remaining, isPro }) => {
        setScansRemaining(remaining);
        setScansPro(isPro);
      });
    }
  }, [isOpen]);

  const resetState = useCallback(() => {
    setState('idle');
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setDragOver(false);
    setEntries([]);
    setGlobalWalletId(wallets[0]?.id || '');
    setGlobalRate('');
    setEditingIndex(null);
    setSavedCount(0);
  }, [wallets]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const isPdf = imageFile?.type === 'application/pdf' || imageFile?.name?.toLowerCase().endsWith('.pdf');

  const handleFile = (file: File) => {
    const isFilePdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
    if (!file.type.startsWith('image/') && !isFilePdf) {
      setError('Wybierz plik obrazu (JPG, PNG) lub PDF');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Plik jest za duży (max 20MB)');
      return;
    }
    setError(null);
    setImageFile(file);
    if (isFilePdf) {
      setImagePreview('pdf');
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setState('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch('/api/scan-toggl', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Błąd analizy');
        setState('idle');
        return;
      }

      const scanned: ScannedEntry[] = data.entries.map(
        (e: Omit<ScannedEntry, 'selected' | 'hourly_rate' | 'wallet_id'>) => ({
          ...e,
          hourly_rate: globalRate,
          wallet_id: globalWalletId,
          selected: true,
        })
      );

      setEntries(scanned);
      if (wallets.length > 0 && !globalWalletId) setGlobalWalletId(wallets[0].id);
      setState('results');
    } catch {
      setError('Błąd połączenia z serwerem');
      setState('idle');
    }
  };

  const updateEntry = (index: number, field: keyof ScannedEntry, value: string | boolean | number) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);
  };



  const handleSaveAll = async () => {
    const selected = entries.filter(e => e.selected);
    if (selected.length === 0) {
      setError('Zaznacz przynajmniej jeden wpis');
      return;
    }

    const missingRate = selected.some(e => !e.hourly_rate || parseFloat(e.hourly_rate) <= 0);
    if (missingRate) {
      setError('Uzupełnij stawkę godzinową dla wszystkich wpisów');
      return;
    }

    const missingWallet = selected.some(e => !e.wallet_id);
    if (missingWallet) {
      setError('Wybierz portfel dla wszystkich wpisów');
      return;
    }

    setState('saving');
    setError(null);
    setSavedCount(0);

    try {
      for (let i = 0; i < selected.length; i++) {
        const e = selected[i];
        const startDt = new Date(`${e.date}T${e.start_time}:00`);
        const endDt = new Date(`${e.date}T${e.end_time}:00`);
        if (endDt <= startDt) endDt.setDate(endDt.getDate() + 1);

        await addCalendarEvent({
          title: e.title,
          wallet_id: e.wallet_id,
          hourly_rate: parseFloat(e.hourly_rate),
          start_time: startDt.toISOString(),
          end_time: endDt.toISOString(),
          is_recurring: false,
          recurrence_rule: null,
          event_type: 'work',
        });
        setSavedCount(i + 1);
      }
      handleClose();
    } catch {
      setError('Błąd zapisu wydarzeń');
      setState('results');
    }
  };

  const selectedCount = entries.filter(e => e.selected).length;
  const totalHours = entries.filter(e => e.selected).reduce((sum, e) => sum + e.duration_hours, 0);
  const inputClass = "w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all text-sm";

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
            className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Importuj z Toggl Track
              </h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={state === 'analyzing' || state === 'saving'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!scansPro && scansRemaining !== null && (
              <div className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-between ${
                scansRemaining === 0
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-violet-500/10 border border-violet-500/30 text-violet-300'
              }`}>
                <span>
                  {scansRemaining === 0
                    ? 'Wykorzystano limit skanów w tym tygodniu'
                    : `Pozostało ${scansRemaining}/3 skanów w tym tygodniu`}
                </span>
                {scansRemaining === 0 && (
                  <a href="/settings" className="flex items-center gap-1 text-violet-400 hover:underline text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Przejdź na Pro
                  </a>
                )}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Upload area */}
            {(state === 'idle' || state === 'analyzing') && (
              <>
                {!imagePreview ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-accent/30'
                    }`}
                  >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-foreground font-medium mb-1">
                      Przeciągnij screenshot lub PDF z Toggl Track
                    </p>
                    <p className="text-sm text-muted-foreground">
                      lub kliknij aby wybrać plik
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                        e.target.value = '';
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      {isPdf ? (
                        <div className="flex items-center gap-3 p-6 bg-black/20">
                          <FileText className="w-10 h-10 text-red-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-foreground font-medium truncate">{imageFile?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              PDF ({((imageFile?.size || 0) / 1024).toFixed(0)} KB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={imagePreview!}
                          alt="Podgląd screenshota"
                          className="w-full max-h-64 object-contain bg-black/20"
                        />
                      )}
                      {state !== 'analyzing' && (
                        <button
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={state === 'analyzing'}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {state === 'analyzing' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analizowanie...
                        </>
                      ) : (
                        <>
                          <Timer className="w-4 h-4" />
                          Odczytaj przedziały
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Results */}
            {(state === 'results' || state === 'saving') && (
              <div className="space-y-4">
                {/* Global settings */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Portfel (dla wszystkich)</label>
                    <select
                      value={globalWalletId}
                      onChange={(e) => {
                        setGlobalWalletId(e.target.value);
                        setEntries(prev => prev.map(en => ({ ...en, wallet_id: e.target.value })));
                      }}
                      className={inputClass}
                    >
                      {wallets.length === 0 && <option value="">Brak portfeli</option>}
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Stawka/h PLN (dla wszystkich)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={globalRate}
                      onChange={(e) => {
                        setGlobalRate(e.target.value);
                        setEntries(prev => prev.map(en => ({ ...en, hourly_rate: e.target.value })));
                      }}
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Count & totals */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Znaleziono <span className="text-foreground font-medium">{entries.length}</span> wpisów
                    {selectedCount < entries.length && (
                      <> (zaznaczono <span className="text-foreground font-medium">{selectedCount}</span>)</>
                    )}
                    {totalHours > 0 && (
                      <> &middot; <span className="text-foreground font-medium">{totalHours.toFixed(1)}h</span></>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      const allSelected = entries.every(e => e.selected);
                      setEntries(prev => prev.map(e => ({ ...e, selected: !allSelected })));
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {entries.every(e => e.selected) ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                  </button>
                </div>

                {/* Entry list */}
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {entries.map((entry, i) => (
                    <div
                      key={i}
                      className={`border rounded-lg transition-all ${
                        entry.selected ? 'border-border bg-card' : 'border-border/50 bg-card/50 opacity-60'
                      }`}
                    >
                      {/* Compact row */}
                      <div className="flex items-center gap-3 p-3">
                        <button
                          onClick={() => updateEntry(i, 'selected', !entry.selected)}
                          className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                            entry.selected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-card-foreground hover:border-primary/70'
                          }`}
                        >
                          {entry.selected && <Check className="w-3 h-3" />}
                        </button>

                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-foreground font-medium truncate">
                              {entry.title}
                            </span>
                            <span className="text-sm font-semibold text-primary flex-shrink-0">
                              {entry.duration_hours.toFixed(1)}h
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{entry.date}</span>
                            <span className="text-xs text-muted-foreground/60">|</span>
                            <span className="text-xs text-muted-foreground">
                              {entry.start_time} — {entry.end_time}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeEntry(i)}
                          className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Expanded edit */}
                      {editingIndex === i && (
                        <div className="border-t border-border p-3 space-y-3 bg-accent/20">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Nazwa</label>
                            <input
                              type="text"
                              value={entry.title}
                              onChange={(e) => updateEntry(i, 'title', e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Data</label>
                              <input
                                type="date"
                                value={entry.date}
                                onChange={(e) => updateEntry(i, 'date', e.target.value)}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Od</label>
                              <input
                                type="time"
                                value={entry.start_time}
                                onChange={(e) => {
                                  updateEntry(i, 'start_time', e.target.value);
                                  // Recalc duration (handle overnight)
                                  const [sh, sm] = e.target.value.split(':').map(Number);
                                  const [eh, em] = entry.end_time.split(':').map(Number);
                                  let dur = (eh * 60 + em - sh * 60 - sm) / 60;
                                  if (dur <= 0) dur += 24;
                                  updateEntry(i, 'duration_hours', Math.round(dur * 100) / 100);
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Do</label>
                              <input
                                type="time"
                                value={entry.end_time}
                                onChange={(e) => {
                                  updateEntry(i, 'end_time', e.target.value);
                                  const [sh, sm] = entry.start_time.split(':').map(Number);
                                  const [eh, em] = e.target.value.split(':').map(Number);
                                  let dur2 = (eh * 60 + em - sh * 60 - sm) / 60;
                                  if (dur2 <= 0) dur2 += 24;
                                  updateEntry(i, 'duration_hours', Math.round(dur2 * 100) / 100);
                                }}
                                className={inputClass}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Portfel</label>
                              <select
                                value={entry.wallet_id}
                                onChange={(e) => updateEntry(i, 'wallet_id', e.target.value)}
                                className={inputClass}
                              >
                                {wallets.length === 0 && <option value="">Brak portfeli</option>}
                                {wallets.map(w => (
                                  <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Stawka/h PLN</label>
                              <input
                                type="number"
                                step="0.01"
                                value={entry.hourly_rate}
                                onChange={(e) => updateEntry(i, 'hourly_rate', e.target.value)}
                                placeholder="0.00"
                                className={inputClass}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setState('idle'); setEntries([]); setEditingIndex(null); }}
                    disabled={state === 'saving'}
                    className="flex-1 bg-secondary hover:bg-accent text-secondary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Skanuj ponownie
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={state === 'saving' || wallets.length === 0 || selectedCount === 0}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {state === 'saving' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Zapisywanie ({savedCount}/{selectedCount})...
                      </>
                    ) : (
                      <>Dodaj {selectedCount} {selectedCount === 1 ? 'wydarzenie' : selectedCount < 5 ? 'wydarzenia' : 'wydarzeń'}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
