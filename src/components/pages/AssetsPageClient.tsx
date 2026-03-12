'use client';

import { useEffect, useState } from 'react';
import { AssetList } from '@/components/AssetList';
import { AssetModal } from '@/components/AssetModal';
import { SellAssetModal } from '@/components/SellAssetModal';
import { useFinanceStore, Asset, AssetSale, Wallet, Transaction } from '@/hooks/useFinanceStore';
import { deleteAssetAction, refreshAssetPricesAction } from '@/app/actions';
import { formatCurrency } from '@/lib/exchange-rates';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Receipt, TrendingUp, TrendingDown, Landmark, Calculator, BadgeDollarSign } from 'lucide-react';
import { CompoundInterestChart } from '@/components/CompoundInterestChart';

interface TaxSummary {
  totalProceeds: number;
  totalCost: number;
  totalProfit: number;
  totalTax: number;
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

          {/* Historia sprzedaży */}
          {assetSales.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Historia sprzedaży</h3>
              <div className="space-y-2">
                {assetSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border text-sm">
                    <div>
                      <span className="text-card-foreground font-medium">{sale.asset_name}</span>
                      <span className="text-muted-foreground ml-2">{sale.quantity_sold} {sale.asset_symbol}</span>
                      <span className="text-muted-foreground ml-2">· {sale.sale_date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={sale.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {sale.profit >= 0 ? '+' : ''}{formatCurrency(sale.profit)}
                      </span>
                      <span className="text-muted-foreground">
                        Podatek: {formatCurrency(sale.tax_amount)}
                      </span>
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
