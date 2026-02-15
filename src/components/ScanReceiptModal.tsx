'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, Camera, Loader2, Check, Trash2 } from 'lucide-react';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { addTransactionAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'idle' | 'analyzing' | 'results' | 'saving';

interface ScannedTransaction {
  amount: string;
  type: 'income' | 'outcome';
  category: string;
  date: string;
  description: string;
  selected: boolean;
}

export function ScanReceiptModal({ isOpen, onClose }: ScanReceiptModalProps) {
  const { wallets } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ModalState>('idle');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [transactions, setTransactions] = useState<ScannedTransaction[]>([]);
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const resetState = useCallback(() => {
    setState('idle');
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setDragOver(false);
    setTransactions([]);
    setWalletId(wallets[0]?.id || '');
    setEditingIndex(null);
    setSavedCount(0);
  }, [wallets]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Wybierz plik obrazu (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Plik jest za duży (max 10MB)');
      return;
    }
    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
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

      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Błąd analizy');
        setState('idle');
        return;
      }

      const scanned: ScannedTransaction[] = data.transactions.map(
        (t: Omit<ScannedTransaction, 'selected' | 'amount'> & { amount: number }) => ({
          ...t,
          amount: t.amount.toString(),
          selected: true,
        })
      );

      setTransactions(scanned);
      if (wallets.length > 0 && !walletId) setWalletId(wallets[0].id);
      setState('results');
    } catch {
      setError('Błąd połączenia z serwerem');
      setState('idle');
    }
  };

  const updateTransaction = (index: number, field: keyof ScannedTransaction, value: string | boolean) => {
    setTransactions(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const removeTransaction = (index: number) => {
    setTransactions(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleSaveAll = async () => {
    if (!walletId) {
      setError('Wybierz portfel');
      return;
    }

    const selected = transactions.filter(t => t.selected);
    if (selected.length === 0) {
      setError('Zaznacz przynajmniej jedną transakcję');
      return;
    }

    setState('saving');
    setError(null);
    setSavedCount(0);

    try {
      for (let i = 0; i < selected.length; i++) {
        const t = selected[i];
        const numericAmount = parseFloat(t.amount);
        const finalAmount = t.type === 'outcome' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

        await addTransactionAction({
          amount: finalAmount,
          category: t.category,
          description: t.description,
          wallet: walletId,
          date: t.date,
          type: t.type,
        });
        setSavedCount(i + 1);
      }
      handleClose();
    } catch {
      setError('Błąd zapisu transakcji');
      setState('results');
    }
  };

  const selectedCount = transactions.filter(t => t.selected).length;
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
            <Camera className="w-5 h-5" />
            Skanuj rachunek
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={state === 'analyzing' || state === 'saving'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                  Przeciągnij zdjęcie rachunku
                </p>
                <p className="text-sm text-muted-foreground">
                  lub kliknij aby wybrać plik
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img
                    src={imagePreview}
                    alt="Podgląd rachunku"
                    className="w-full max-h-64 object-contain bg-black/20"
                  />
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
                      <Camera className="w-4 h-4" />
                      Analizuj
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Results - transaction list */}
        {(state === 'results' || state === 'saving') && (
          <div className="space-y-4">
            {/* Wallet selector */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Portfel dla wszystkich transakcji</label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className={inputClass}
              >
                {wallets.length === 0 && <option value="">Brak portfeli</option>}
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.balance.toLocaleString()} PLN)</option>
                ))}
              </select>
            </div>

            {/* Transaction count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Znaleziono <span className="text-foreground font-medium">{transactions.length}</span> transakcji
                {selectedCount < transactions.length && (
                  <> (zaznaczono <span className="text-foreground font-medium">{selectedCount}</span>)</>
                )}
              </p>
              <button
                onClick={() => {
                  const allSelected = transactions.every(t => t.selected);
                  setTransactions(prev => prev.map(t => ({ ...t, selected: !allSelected })));
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {transactions.every(t => t.selected) ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
              </button>
            </div>

            {/* Transaction list */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {transactions.map((t, i) => (
                <div
                  key={i}
                  className={`border rounded-lg transition-all ${
                    t.selected ? 'border-border bg-card' : 'border-border/50 bg-card/50 opacity-60'
                  }`}
                >
                  {/* Compact row */}
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => updateTransaction(i, 'selected', !t.selected)}
                      className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        t.selected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {t.selected && <Check className="w-3 h-3" />}
                    </button>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            t.type === 'income'
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-red-600/20 text-red-400'
                          }`}>
                            {t.type === 'income' ? '+' : '-'}
                          </span>
                          <span className="text-sm text-foreground font-medium truncate">
                            {t.description || t.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-sm font-semibold ${
                            t.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {t.type === 'income' ? '+' : '-'}{parseFloat(t.amount).toFixed(2)} PLN
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{t.date}</span>
                        <span className="text-xs text-muted-foreground/60">|</span>
                        <span className="text-xs text-muted-foreground">{t.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeTransaction(i)}
                      className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expanded edit form */}
                  {editingIndex === i && (
                    <div className="border-t border-border p-3 space-y-3 bg-accent/20">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateTransaction(i, 'type', 'income')}
                          className={`py-1.5 rounded-lg text-center text-sm font-medium transition-colors ${
                            t.type === 'income'
                              ? 'bg-green-600 text-white'
                              : 'bg-secondary text-secondary-foreground hover:bg-accent'
                          }`}
                        >
                          Przychód
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTransaction(i, 'type', 'outcome')}
                          className={`py-1.5 rounded-lg text-center text-sm font-medium transition-colors ${
                            t.type === 'outcome'
                              ? 'bg-red-600 text-white'
                              : 'bg-secondary text-secondary-foreground hover:bg-accent'
                          }`}
                        >
                          Wydatek
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Kwota</label>
                          <input
                            type="number"
                            step="0.01"
                            value={t.amount}
                            onChange={(e) => updateTransaction(i, 'amount', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Data</label>
                          <input
                            type="date"
                            value={t.date}
                            onChange={(e) => updateTransaction(i, 'date', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Kategoria</label>
                          <input
                            type="text"
                            value={t.category}
                            onChange={(e) => updateTransaction(i, 'category', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Opis</label>
                          <input
                            type="text"
                            value={t.description}
                            onChange={(e) => updateTransaction(i, 'description', e.target.value)}
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
                onClick={() => { setState('idle'); setTransactions([]); setEditingIndex(null); }}
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
                  <>Dodaj {selectedCount} {selectedCount === 1 ? 'transakcję' : selectedCount < 5 ? 'transakcje' : 'transakcji'}</>
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
