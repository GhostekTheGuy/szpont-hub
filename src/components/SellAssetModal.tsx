'use client';

import { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { Asset, Wallet } from '@/hooks/useFinanceStore';
import { sellAssetAction, addManualSaleAction } from '@/app/actions';
import { formatCurrency } from '@/lib/exchange-rates';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

interface SellAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  wallets: Wallet[];
}

export function SellAssetModal({ isOpen, onClose, asset, wallets }: SellAssetModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [mode, setMode] = useState<'asset' | 'manual'>(asset ? 'asset' : 'manual');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Asset mode
  const [quantity, setQuantity] = useState('');
  const [walletId, setWalletId] = useState('');
  const [loading, setLoading] = useState(false);

  // Manual mode
  const [manualName, setManualName] = useState('');
  const [manualSymbol, setManualSymbol] = useState('');
  const [manualQty, setManualQty] = useState('');
  const [manualSalePrice, setManualSalePrice] = useState('');
  const [manualCostBasis, setManualCostBasis] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setMode(asset ? 'asset' : 'manual');
      setQuantity('');
      setWalletId(asset?.wallet_id || '');
      setManualName('');
      setManualSymbol('');
      setManualQty('');
      setManualSalePrice('');
      setManualCostBasis('');
      setManualDate(new Date().toISOString().split('T')[0]);
      setErrors({});
    }
  }, [isOpen, asset]);

  // Asset mode calc
  const assetCalc = useMemo(() => {
    if (!asset || !quantity || parseFloat(quantity) <= 0) {
      return { proceeds: 0, cost: 0, profit: 0, tax: 0 };
    }
    const qty = parseFloat(quantity);
    const proceeds = qty * asset.current_price;
    const cost = qty * asset.cost_basis;
    const profit = proceeds - cost;
    const tax = Math.max(0, profit) * 0.19;
    return { proceeds, cost, profit, tax };
  }, [asset, quantity]);

  // Manual mode calc
  const manualCalc = useMemo(() => {
    const qty = parseFloat(manualQty) || 0;
    const sp = parseFloat(manualSalePrice) || 0;
    const cb = parseFloat(manualCostBasis) || 0;
    if (qty <= 0 || sp <= 0) return { proceeds: 0, cost: 0, profit: 0, tax: 0 };
    const proceeds = qty * sp;
    const cost = qty * cb;
    const profit = proceeds - cost;
    const tax = Math.max(0, profit) * 0.19;
    return { proceeds, cost, profit, tax };
  }, [manualQty, manualSalePrice, manualCostBasis]);

  const calc = mode === 'asset' ? assetCalc : manualCalc;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (mode === 'asset' && asset) {
      const qty = parseFloat(quantity);
      if (!quantity || isNaN(qty) || qty <= 0) {
        errs.quantity = 'Ilość musi być większa od 0';
      } else if (qty > asset.quantity) {
        errs.quantity = 'Nie posiadasz tylu jednostek';
      }
      if (!asset.wallet_id && !walletId) {
        errs.walletId = 'Wybierz portfel';
      }
    } else {
      if (!manualName.trim()) errs.manualName = 'Nazwa jest wymagana';
      if (!manualSymbol.trim()) errs.manualSymbol = 'Symbol jest wymagany';
      const qty = parseFloat(manualQty);
      if (!manualQty || isNaN(qty) || qty <= 0) errs.manualQty = 'Ilość musi być większa od 0';
      const sp = parseFloat(manualSalePrice);
      if (!manualSalePrice || isNaN(sp) || sp <= 0) errs.manualSalePrice = 'Cena sprzedaży musi być większa od 0';
      if (!walletId) errs.walletId = 'Wybierz portfel';
    }
    return errs;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
      if (mode === 'asset' && asset) {
        await sellAssetAction({
          assetId: asset.id,
          quantityToSell: parseFloat(quantity),
          walletId,
        });
      } else {
        await addManualSaleAction({
          assetName: manualName,
          assetSymbol: manualSymbol.toUpperCase(),
          quantitySold: parseFloat(manualQty),
          salePricePerUnit: parseFloat(manualSalePrice),
          costBasisPerUnit: parseFloat(manualCostBasis) || 0,
          walletId,
          saleDate: manualDate,
        });
      }
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast(`Błąd: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const assetValid = asset && parseFloat(quantity) > 0 && parseFloat(quantity) <= asset.quantity && walletId;
  const manualValid = manualName && manualSymbol && parseFloat(manualQty) > 0 && parseFloat(manualSalePrice) > 0 && walletId;
  const isValid = mode === 'asset' ? assetValid : manualValid;
  const showCalc = mode === 'asset' ? (parseFloat(quantity) || 0) > 0 : (parseFloat(manualQty) || 0) > 0 && (parseFloat(manualSalePrice) || 0) > 0;

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
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-card-foreground">
                {mode === 'asset' && asset ? `Sprzedaj ${asset.name}` : 'Dodaj sprzedaż'}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-4">
              {asset && (
                <button
                  type="button"
                  onClick={() => setMode('asset')}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    mode === 'asset' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-card-foreground'
                  }`}
                >
                  Z aktywa
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  mode === 'manual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-card-foreground'
                }`}
              >
                Ręcznie
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'asset' && asset ? (
                <>
                  {/* Info o aktywie */}
                  <div className="p-3 bg-muted/50 rounded-lg border border-border text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posiadane</span>
                      <span className="text-card-foreground font-medium">{asset.quantity} {asset.symbol}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted-foreground">Cena rynkowa</span>
                      <span className="text-card-foreground">{formatCurrency(asset.current_price)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted-foreground">Cena zakupu</span>
                      <span className="text-card-foreground">{formatCurrency(asset.cost_basis)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Ilość do sprzedaży</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max={asset.quantity}
                        required
                        value={quantity}
                        onChange={(e) => { setQuantity(e.target.value); clearError('quantity'); }}
                        className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all pr-16 ${errors.quantity ? 'border-destructive' : 'border-border'}`}
                        placeholder="0.00"
                      />
                      <button
                        type="button"
                        onClick={() => { setQuantity(asset.quantity.toString()); clearError('quantity'); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary/80 font-medium"
                      >
                        MAX
                      </button>
                    </div>
                    {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
                  </div>
                </>
              ) : (
                <>
                  {/* Manual fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Nazwa</label>
                      <input
                        type="text"
                        required
                        value={manualName}
                        onChange={(e) => { setManualName(e.target.value); clearError('manualName'); }}
                        className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.manualName ? 'border-destructive' : 'border-border'}`}
                        placeholder="Bitcoin"
                      />
                      {errors.manualName && <p className="text-xs text-destructive mt-1">{errors.manualName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Symbol</label>
                      <input
                        type="text"
                        required
                        value={manualSymbol}
                        onChange={(e) => { setManualSymbol(e.target.value); clearError('manualSymbol'); }}
                        className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.manualSymbol ? 'border-destructive' : 'border-border'}`}
                        placeholder="BTC"
                      />
                      {errors.manualSymbol && <p className="text-xs text-destructive mt-1">{errors.manualSymbol}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Ilość sprzedana</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={manualQty}
                      onChange={(e) => { setManualQty(e.target.value); clearError('manualQty'); }}
                      className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.manualQty ? 'border-destructive' : 'border-border'}`}
                      placeholder="0.00"
                    />
                    {errors.manualQty && <p className="text-xs text-destructive mt-1">{errors.manualQty}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Cena sprzedaży (PLN)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={manualSalePrice}
                        onChange={(e) => { setManualSalePrice(e.target.value); clearError('manualSalePrice'); }}
                        className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.manualSalePrice ? 'border-destructive' : 'border-border'}`}
                        placeholder="0.00"
                      />
                      {errors.manualSalePrice && <p className="text-xs text-destructive mt-1">{errors.manualSalePrice}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Cena zakupu (PLN)</label>
                      <input
                        type="number"
                        step="any"
                        value={manualCostBasis}
                        onChange={(e) => setManualCostBasis(e.target.value)}
                        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Data sprzedaży</label>
                    <input
                      type="date"
                      required
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                </>
              )}

              {/* Wybór portfela */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Portfel docelowy</label>
                {mode === 'asset' && asset?.wallet_id ? (
                  <div className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground text-sm">
                    {wallets.find(w => w.id === asset.wallet_id)?.name || 'Przypisany portfel'}
                    <span className="text-xs text-muted-foreground ml-2">(portfel aktywa)</span>
                  </div>
                ) : (
                  <select
                    required
                    value={walletId}
                    onChange={(e) => { setWalletId(e.target.value); clearError('walletId'); }}
                    className={`w-full bg-input border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all ${errors.walletId ? 'border-destructive' : 'border-border'}`}
                  >
                    <option value="">Wybierz portfel...</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                )}
                {errors.walletId && <p className="text-xs text-destructive mt-1">{errors.walletId}</p>}
              </div>

              {/* Live kalkulacja */}
              {showCalc && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Przychód</span>
                    <span className="text-card-foreground">{formatCurrency(calc.proceeds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Koszt nabycia</span>
                    <span className="text-card-foreground">{formatCurrency(calc.cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zysk/Strata</span>
                    <span className={calc.profit >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                      {calc.profit >= 0 ? '+' : ''}{formatCurrency(calc.profit)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-card-foreground font-bold">Podatek Belki (19%)</span>
                    <span className="text-card-foreground font-bold">{formatCurrency(calc.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Do portfela trafi</span>
                    <span className="text-card-foreground font-medium">{formatCurrency(calc.proceeds)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Zapisywanie...' : 'Sprzedaj'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
