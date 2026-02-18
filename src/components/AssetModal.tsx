'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { Asset } from '@/hooks/useFinanceStore';
import { addAssetAction, editAssetAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CoinResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAsset?: Asset | null;
}

export function AssetModal({ isOpen, onClose, editingAsset }: AssetModalProps) {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (editingAsset) {
      setSelectedCoin({
        id: editingAsset.coingecko_id,
        name: editingAsset.name,
        symbol: editingAsset.symbol,
        thumb: '',
      });
      setQuantity(editingAsset.quantity.toString());
      setCostBasis(editingAsset.cost_basis > 0 ? editingAsset.cost_basis.toString() : '');
      setQuery('');
      setResults([]);
    } else {
      setSelectedCoin(null);
      setQuantity('');
      setCostBasis('');
      setQuery('');
      setResults([]);
    }
  }, [editingAsset, isOpen]);

  useEffect(() => {
    if (!query || query.length < 2 || editingAsset) {
      setResults([]);
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
          setResults(
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
  }, [query, editingAsset]);

  const handleSelectCoin = (coin: CoinResult) => {
    setSelectedCoin(coin);
    setQuery('');
    setResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !quantity) return;
    setLoading(true);

    try {
      if (editingAsset) {
        await editAssetAction(editingAsset.id, {
          quantity: parseFloat(quantity),
          cost_basis: costBasis ? parseFloat(costBasis) : undefined,
        });
      } else {
        await addAssetAction({
          name: selectedCoin.name,
          symbol: selectedCoin.symbol.toUpperCase(),
          coingecko_id: selectedCoin.id,
          quantity: parseFloat(quantity),
          cost_basis: costBasis ? parseFloat(costBasis) : undefined,
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
              {/* Wyszukiwarka / wybrany coin */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Kryptowaluta</label>
                {selectedCoin ? (
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
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                      placeholder="Szukaj kryptowaluty..."
                      autoFocus
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                    )}
                  </div>
                )}

                {/* Wyniki wyszukiwania */}
                {results.length > 0 && !selectedCoin && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
                    {results.map((coin) => (
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
              </div>

              {/* Ilość */}
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

              {/* Cena zakupu */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Cena zakupu (PLN/szt.)
                  <span className="text-xs ml-1 opacity-60">— puste = cena z CoinGecko</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={costBasis}
                  onChange={(e) => setCostBasis(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Automatyczna"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedCoin || !quantity}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Zapisywanie...' : (editingAsset ? 'Zapisz zmiany' : 'Dodaj aktywo')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
