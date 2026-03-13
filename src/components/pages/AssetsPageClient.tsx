'use client';

import { useEffect, useState, useMemo } from 'react';
import { AssetList } from '@/components/AssetList';
import { AssetModal } from '@/components/AssetModal';
import { SellAssetModal } from '@/components/SellAssetModal';
import { useFinanceStore, Asset, AssetSale, Wallet, Transaction } from '@/hooks/useFinanceStore';
import { deleteAssetAction, refreshAssetPricesAction, payTaxAction } from '@/app/actions';
import { formatCurrency } from '@/lib/exchange-rates';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Receipt, TrendingUp, TrendingDown, Landmark, Calculator, BadgeDollarSign, Check, CheckCheck } from 'lucide-react';
import { CompoundInterestChart } from '@/components/CompoundInterestChart';

interface TaxSummary {
  totalProceeds: number;
  totalCost: number;
  totalProfit: number;
  totalTax: number;
  unpaidTax: number;
  salesCount: number;
}

interface Props {
  initialAssets: Asset[];
  initialWallets: Wallet[];
  initialTransactions: Transaction[];
  initialSales: AssetSale[];
  initialTaxSummary: TaxSummary | null;
}

export function AssetsPageClient({ initialAssets, initialWallets, initialTransactions, initialSales, initialTaxSummary }: Props) {
  const { assets, setAssets, wallets, setWallets, assetSales, setAssetSales } = useFinanceStore();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellingAsset, setSellingAsset] = useState<Asset | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [payingTax, setPayingTax] = useState(false);
  const [taxPayWalletId, setTaxPayWalletId] = useState('');
  const [taxPayMode, setTaxPayMode] = useState<{ type: 'single'; saleId: string } | { type: 'all' } | null>(null);
  const taxSummary = initialTaxSummary;

  useEffect(() => {
    setAssets(initialAssets);
    setWallets(initialWallets);
    setAssetSales(initialSales);
  }, [initialAssets, initialWallets, initialSales, setAssets, setWallets, setAssetSales]);

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, revertTransaction?: boolean) => {
    try {
      await deleteAssetAction(id, revertTransaction);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSell = (asset: Asset) => {
    setSellingAsset(asset);
    setSellModalOpen(true);
  };

  const handlePayTax = async (saleIds: string[], walletId: string) => {
    setPayingTax(true);
    try {
      await payTaxAction({ saleIds, walletId });
      setTaxPayMode(null);
      setTaxPayWalletId('');
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setPayingTax(false);
    }
  };

  const unpaidSales = useMemo(() => {
    return assetSales.filter(s => !s.tax_paid && s.tax_amount > 0);
  }, [assetSales]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAssetPricesAction();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 px-4 lg:px-0">
        <h1 className="text-3xl font-bold text-foreground">Aktywa</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-accent rounded-lg border border-border transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Odśwież ceny</span>
          </button>
          <button
            onClick={() => { setSellingAsset(null); setSellModalOpen(true); }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-accent rounded-lg border border-border transition-colors"
          >
            <BadgeDollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Dodaj sprzedaż</span>
          </button>
          <button
            onClick={() => { setEditingAsset(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Dodaj aktywo</span>
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-0">
        <AssetList
          assets={assets}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSell={handleSell}
          standalone
        />
      </div>

      <div className="px-4 lg:px-0">
        <CompoundInterestChart initialCapital={assets.reduce((sum, a) => sum + a.total_value, 0)} transactions={initialTransactions} />
      </div>

      {/* Podsumowanie podatkowe */}
      {taxSummary && taxSummary.salesCount > 0 && (
        <div className="mt-6 mx-4 lg:mx-0 bg-card border border-border rounded-xl p-4 lg:p-6">
          <h2 className="text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Podsumowanie podatkowe ({new Date().getFullYear()})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Receipt className="w-3 h-3" /> Przychody
              </p>
              <p className="text-lg font-bold text-card-foreground">{formatCurrency(taxSummary.totalProceeds)}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Koszty</p>
              <p className="text-lg font-bold text-card-foreground">{formatCurrency(taxSummary.totalCost)}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                {taxSummary.totalProfit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                Zysk/Strata
              </p>
              <p className={`text-lg font-bold ${taxSummary.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {taxSummary.totalProfit >= 0 ? '+' : ''}{formatCurrency(taxSummary.totalProfit)}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Landmark className="w-3 h-3" /> Podatek Belki
              </p>
              <p className="text-lg font-bold text-card-foreground">{formatCurrency(taxSummary.totalTax)}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Transakcje</p>
              <p className="text-lg font-bold text-card-foreground">{taxSummary.salesCount}</p>
            </div>
          </div>

          {/* Opłać wszystkie nieopłacone */}
          {unpaidSales.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              {taxPayMode?.type === 'all' ? (
                <div className="flex items-center gap-3">
                  <select
                    value={taxPayWalletId}
                    onChange={(e) => setTaxPayWalletId(e.target.value)}
                    className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Wybierz portfel...</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => taxPayWalletId && handlePayTax(unpaidSales.map(s => s.id), taxPayWalletId)}
                    disabled={!taxPayWalletId || payingTax}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    {payingTax ? 'Opłacanie...' : 'Potwierdź'}
                  </button>
                  <button
                    onClick={() => { setTaxPayMode(null); setTaxPayWalletId(''); }}
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Anuluj
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-yellow-500 font-medium">Nieopłacony podatek:</span>
                    <span className="text-card-foreground font-bold ml-2">{formatCurrency(taxSummary!.unpaidTax)}</span>
                    <span className="text-muted-foreground ml-2">({unpaidSales.length} {unpaidSales.length === 1 ? 'transakcja' : 'transakcje'})</span>
                  </div>
                  <button
                    onClick={() => setTaxPayMode({ type: 'all' })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Opłać wszystkie
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Historia sprzedaży */}
          {assetSales.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Historia sprzedaży</h3>
              <div className="space-y-2">
                {assetSales.map((sale) => (
                  <div key={sale.id} className={`flex items-center justify-between p-3 rounded-lg border text-sm ${sale.tax_paid ? 'bg-muted/20 border-border' : 'bg-muted/30 border-border'}`}>
                    <div className="flex items-center gap-2">
                      {sale.tax_paid && <Check className="w-4 h-4 text-green-500 shrink-0" />}
                      <div>
                        <span className="text-card-foreground font-medium">{sale.asset_name}</span>
                        <span className="text-muted-foreground ml-2">{sale.quantity_sold} {sale.asset_symbol}</span>
                        <span className="text-muted-foreground ml-2">· {sale.sale_date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={sale.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {sale.profit >= 0 ? '+' : ''}{formatCurrency(sale.profit)}
                      </span>
                      <span className={sale.tax_paid ? 'text-green-500' : 'text-muted-foreground'}>
                        {sale.tax_paid ? 'Opłacony' : `Podatek: ${formatCurrency(sale.tax_amount)}`}
                      </span>
                      {!sale.tax_paid && sale.tax_amount > 0 && taxPayMode?.type === 'single' && (taxPayMode as { type: 'single'; saleId: string }).saleId === sale.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={taxPayWalletId}
                            onChange={(e) => setTaxPayWalletId(e.target.value)}
                            className="bg-input border border-border rounded px-2 py-1 text-foreground text-xs outline-none"
                          >
                            <option value="">Portfel...</option>
                            {wallets.map((w) => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => taxPayWalletId && handlePayTax([sale.id], taxPayWalletId)}
                            disabled={!taxPayWalletId || payingTax}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                          >
                            {payingTax ? '...' : 'OK'}
                          </button>
                          <button
                            onClick={() => { setTaxPayMode(null); setTaxPayWalletId(''); }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            ✕
                          </button>
                        </div>
                      ) : !sale.tax_paid && sale.tax_amount > 0 ? (
                        <button
                          onClick={() => { setTaxPayMode({ type: 'single', saleId: sale.id }); setTaxPayWalletId(''); }}
                          className="text-xs text-green-500 hover:text-green-400 transition-colors"
                        >
                          Opłać
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AssetModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingAsset(null); }}
        editingAsset={editingAsset}
        onDelete={handleDelete}
        wallets={wallets}
      />

      <SellAssetModal
        isOpen={sellModalOpen}
        onClose={() => { setSellModalOpen(false); setSellingAsset(null); }}
        asset={sellingAsset}
        wallets={wallets}
      />
    </>
  );
}
