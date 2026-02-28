'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { Asset } from '@/hooks/useFinanceStore';
import { addAssetAction, editAssetAction, searchYahooFinance } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CoinResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

interface StockResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

type AssetType = 'crypto' | 'stock';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAsset?: Asset | null;
  onDelete?: (id: string) => void;
}

export function AssetModal({ isOpen, onClose, editingAsset, onDelete }: AssetModalProps) {
  const router = useRouter();

  const [assetType, setAssetType] = useState<AssetType>('crypto');
  const [query, setQuery] = useState('');
  const [coinResults, setCoinResults] = useState<CoinResult[]>([]);
  const [stockResults, setStockResults] = useState<StockResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinResult | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [costCurrency, setCostCurrency] = useState<'PLN' | 'USD'>('PLN');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (editingAsset) {
      setAssetType(editingAsset.asset_type || 'crypto');
      if (editingAsset.asset_type === 'stock') {
        setSelectedStock({
          symbol: editingAsset.symbol,
          name: editingAsset.name,
          exchange: '',
          type: 'EQUITY',
        });
        setSelectedCoin(null);
      } else {
        setSelectedCoin({
          id: editingAsset.coingecko_id,
          name: editingAsset.name,
          symbol: editingAsset.symbol,
          thumb: '',
        });
        setSelectedStock(null);
      }
      setQuantity(editingAsset.quantity.toString());
      setCostBasis(editingAsset.cost_basis > 0 ? editingAsset.cost_basis.toString() : '');
      setCostCurrency('PLN');
      setQuery('');
      setCoinResults([]);
      setStockResults([]);
    } else {
      setSelectedCoin(null);
      setSelectedStock(null);
      setQuantity('');
      setCostBasis('');
      setCostCurrency('PLN');
      setQuery('');
      setCoinResults([]);
      setStockResults([]);
    }
  }, [editingAsset, isOpen]);

  // Crypto search (CoinGecko, client-side)
  useEffect(() => {
    if (assetType !== 'crypto' || !query || query.length < 2 || editingAsset) {
      setCoinResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setCoinResults(
            (data.coins || []).slice(0, 8).map((c: { id: string; name: string; symbol: string; thumb: string }) => ({
              id: c.id,
              name: c.name,
              symbol: c.symbol,
              thumb: c.thumb,
            }))
          );
        }
      } catch {
        // Ignoruj błędy
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, editingAsset, assetType]);

  // Stock search (Yahoo Finance, server action)
  useEffect(() => {
    if (assetType !== 'stock' || !query || query.length < 2 || editingAsset) {
      setStockResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchYahooFinance(query);
        setStockResults(results);
      } catch {
        // Ignoruj błędy
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, editingAsset, assetType]);

  const handleSelectCoin = (coin: CoinResult) => {
    setSelectedCoin(coin);
    setQuery('');
    setCoinResults([]);
  };

  const handleSelectStock = (stock: StockResult) => {
    setSelectedStock(stock);
    setQuery('');
    setStockResults([]);
  };

  const handleTypeChange = (type: AssetType) => {
    if (editingAsset) return;
    setAssetType(type);
    setSelectedCoin(null);
    setSelectedStock(null);
    setQuery('');
    setCoinResults([]);
    setStockResults([]);
  };

  const hasSelection = assetType === 'crypto' ? !!selectedCoin : !!selectedStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSelection || !quantity) return;
    setLoading(true);

    try {
      let costBasisPLN: number | undefined;
      if (costBasis) {
        const parsed = parseFloat(costBasis);
        if (costCurrency === 'USD') {
          const rateRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=pln');
          let usdToPln = 4.0;
          if (rateRes.ok) {
            const rateData = await rateRes.json();
            usdToPln = rateData?.usd?.pln || 4.0;
          }
          costBasisPLN = parsed * usdToPln;
        } else {
          costBasisPLN = parsed;
        }
      }

      if (editingAsset) {
        await editAssetAction(editingAsset.id, {
          quantity: parseFloat(quantity),
          cost_basis: costBasisPLN,
        });
      } else if (assetType === 'crypto' && selectedCoin) {
        await addAssetAction({
          name: selectedCoin.name,
          symbol: selectedCoin.symbol.toUpperCase(),
          coingecko_id: selectedCoin.id,
          quantity: parseFloat(quantity),
          cost_basis: costBasisPLN,
          asset_type: 'crypto',
        });
      } else if (assetType === 'stock' && selectedStock) {
        await addAssetAction({
          name: selectedStock.name,
          symbol: selectedStock.symbol,
          coingecko_id: '',
          quantity: parseFloat(quantity),
          cost_basis: costBasisPLN,
          asset_type: 'stock',
        });
      }
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert(`Błąd: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const costBasisHint = assetType === 'crypto'
    ? 'puste = cena z CoinGecko'
    : 'puste = cena z Yahoo Finance';

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
                {editingAsset ? 'Edytuj aktywo' : 'Dodaj aktywo'}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Asset type toggle */}
              {!editingAsset && (
                <div className="flex rounded-lg bg-muted p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('crypto')}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                      assetType === 'crypto'
                        ? 'bg-card text-card-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Krypto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('stock')}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                      assetType === 'stock'
                        ? 'bg-card text-card-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Akcje & Surowce
                  </button>
                </div>
              )}

              {/* Search / selected asset */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {assetType === 'crypto' ? 'Kryptowaluta' : 'Akcja / ETF / Surowiec'}
                </label>

                {/* Crypto selected */}
                {assetType === 'crypto' && selectedCoin ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                    {selectedCoin.thumb && (
                      <img src={selectedCoin.thumb} alt="" className="w-6 h-6 rounded-full" />
                    )}
                    <div className="flex-1">
                      <span className="text-card-foreground font-medium">{selectedCoin.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{selectedCoin.symbol.toUpperCase()}</span>
                    </div>
                    {!editingAsset && (
                      <button
                        type="button"
                        onClick={() => setSelectedCoin(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : assetType === 'stock' && selectedStock ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                    <div className="flex-1">
                      <span className="text-card-foreground font-medium">{selectedStock.symbol}</span>
                      <span className="text-xs text-muted-foreground ml-2">{selectedStock.name}</span>
                      {selectedStock.exchange && (
                        <span className="text-xs text-muted-foreground ml-1">· {selectedStock.exchange}</span>
                      )}
                    </div>
                    {!editingAsset && (
                      <button
                        type="button"
                        onClick={() => setSelectedStock(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                      placeholder={assetType === 'crypto' ? 'Szukaj kryptowaluty...' : 'Szukaj akcji, ETF, surowców...'}
                      autoFocus
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                    )}
                  </div>
                )}

                {/* Crypto search results */}
                {assetType === 'crypto' && coinResults.length > 0 && !selectedCoin && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
                    {coinResults.map((coin) => (
                      <button
                        key={coin.id}
                        type="button"
                        onClick={() => handleSelectCoin(coin)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      >
                        {coin.thumb && (
                          <img src={coin.thumb} alt="" className="w-6 h-6 rounded-full" />
                        )}
                        <span className="text-card-foreground font-medium text-sm">{coin.name}</span>
                        <span className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Stock search results */}
                {assetType === 'stock' && stockResults.length > 0 && !selectedStock && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
                    {stockResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        type="button"
                        onClick={() => handleSelectStock(stock)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="text-card-foreground font-semibold text-sm">{stock.symbol}</span>
                        <span className="text-xs text-muted-foreground truncate flex-1">{stock.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{stock.exchange}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Ilość</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Cost basis */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Cena zakupu za sztukę
                  <span className="text-xs ml-1 opacity-60">— {costBasisHint}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={costBasis}
                    onChange={(e) => setCostBasis(e.target.value)}
                    className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                    placeholder="Automatyczna"
                  />
                  <select
                    value={costCurrency}
                    onChange={(e) => setCostCurrency(e.target.value as 'PLN' | 'USD')}
                    className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="PLN">PLN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className={`flex gap-2 mt-6 ${editingAsset && onDelete ? '' : ''}`}>
                {editingAsset && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Czy na pewno chcesz usunąć to aktywo?')) {
                        onDelete(editingAsset.id);
                        onClose();
                      }
                    }}
                    className="px-4 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium rounded-lg transition-colors"
                  >
                    Usuń
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !hasSelection || !quantity}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Zapisywanie...' : (editingAsset ? 'Zapisz zmiany' : 'Dodaj aktywo')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
