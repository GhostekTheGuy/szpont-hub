'use client';

import { useState, useMemo, useEffect } from 'react';
import { WalletCard } from '@/components/WalletCard';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { WalletModal } from '@/components/WalletModal';
import { WalletChart } from '@/components/WalletChart';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import { FinancialCushion } from '@/components/FinancialCushion';
import { ScanReceiptModal } from '@/components/ScanReceiptModal';
import { AssetList } from '@/components/AssetList';
import { AssetModal } from '@/components/AssetModal';
import { SellAssetModal } from '@/components/SellAssetModal';
import { CompoundInterestChart } from '@/components/CompoundInterestChart';
import { SectionNav } from '@/components/SectionNav';
import { useToast } from '@/components/Toast';
import { useFinanceStore, pick, Transaction, Wallet, Asset, AssetSale } from '@/hooks/useFinanceStore';
import { Plus, Camera, ChevronDown, ChevronUp, RefreshCw, BadgeDollarSign, Receipt, TrendingUp, TrendingDown, Landmark, Calculator, Check, CheckCheck } from 'lucide-react';
import { deleteTransactionAction, deleteWalletAction, recalculateWalletBalance, deleteAssetAction, refreshAssetPricesAction, payTaxAction } from '@/app/actions';
import { formatCurrency, type ExchangeRates } from '@/lib/exchange-rates';
import { useRouter } from 'next/navigation';

interface TaxSummary {
  totalProceeds: number;
  totalCost: number;
  totalProfit: number;
  totalTax: number;
  unpaidTax: number;
  salesCount: number;
}

interface Props {
  initialWallets: Wallet[];
  initialTransactions: Transaction[];
  exchangeRates: ExchangeRates;
  initialAssets: Asset[];
  initialSales: AssetSale[];
  initialTaxSummary: TaxSummary | null;
}

export function WalletsPageClient({ initialWallets, initialTransactions, exchangeRates, initialAssets, initialSales, initialTaxSummary }: Props) {
  const { confirm, toast } = useToast();
  const router = useRouter();
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [chartRefreshKey, setChartRefreshKey] = useState(0);
  const [transactionsExpanded, setTransactionsExpanded] = useState(false);

  // Assets state
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellingAsset, setSellingAsset] = useState<Asset | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [payingTax, setPayingTax] = useState(false);
  const [taxPayWalletId, setTaxPayWalletId] = useState('');
  const [taxPayMode, setTaxPayMode] = useState<{ type: 'single'; saleId: string } | { type: 'all' } | null>(null);
  const taxSummary = initialTaxSummary;

  const { wallets, transactions, assets, assetSales, activeWalletId, displayCurrency } = useFinanceStore(pick('wallets', 'transactions', 'assets', 'assetSales', 'activeWalletId', 'displayCurrency'));
  const setWallets = useFinanceStore(s => s.setWallets);
  const setTransactions = useFinanceStore(s => s.setTransactions);
  const setAssets = useFinanceStore(s => s.setAssets);
  const setAssetSales = useFinanceStore(s => s.setAssetSales);
  const setActiveWallet = useFinanceStore(s => s.setActiveWallet);

  useEffect(() => {
    setWallets(initialWallets);
    setTransactions(initialTransactions);
    setAssets(initialAssets);
    setAssetSales(initialSales);
  }, [initialWallets, initialTransactions, initialAssets, initialSales, setWallets, setTransactions, setAssets, setAssetSales]);

  const filteredTransactions = useMemo(() => {
    if (!activeWalletId) return transactions;
    return transactions.filter(t => t.wallet === activeWalletId);
  }, [transactions, activeWalletId]);

  const activeWallet = useMemo(() => {
    return wallets.find(w => w.id === activeWalletId);
  }, [wallets, activeWalletId]);

  const hasOutcomes = useMemo(() => {
    return filteredTransactions.some(t => t.type === 'outcome');
  }, [filteredTransactions]);

  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

  const hasAnyOutcomes = useMemo(() => {
    return transactions.some(t => t.type === 'outcome');
  }, [transactions]);

  const handleDeleteTransaction = async (id: string) => {
    if (await confirm({ title: 'Czy na pewno chcesz usunąć tę transakcję?', variant: 'danger', confirmLabel: 'Usuń' })) {
      await deleteTransactionAction(id);
      setChartRefreshKey(k => k + 1);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (await confirm({ title: 'Czy na pewno chcesz usunąć ten portfel?', variant: 'danger', confirmLabel: 'Usuń' })) {
      await deleteWalletAction(id);
      if (activeWalletId === id) setActiveWallet(null);
    }
  };

  const handleRecalculate = async (id: string) => {
    try {
      await recalculateWalletBalance(id);
      setChartRefreshKey(k => k + 1);
    } catch {
      toast('Nie udało się przeliczyć salda', 'error');
    }
  };

  // Asset handlers
  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetModalOpen(true);
  };

  const handleDeleteAsset = async (id: string, revertTransaction?: boolean) => {
    try {
      await deleteAssetAction(id, revertTransaction);
      router.refresh();
    } catch {
      toast('Nie udało się usunąć aktywa', 'error');
    }
  };

  const handleSellAsset = (asset: Asset) => {
    setSellingAsset(asset);
    setSellModalOpen(true);
  };

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    try {
      await refreshAssetPricesAction();
      router.refresh();
    } catch {
      toast('Nie udało się odświeżyć cen', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handlePayTax = async (saleIds: string[], walletId: string) => {
    setPayingTax(true);
    try {
      await payTaxAction({ saleIds, walletId });
      setTaxPayMode(null);
      setTaxPayWalletId('');
      router.refresh();
    } catch {
      toast('Nie udało się opłacić podatku', 'error');
    } finally {
      setPayingTax(false);
    }
  };

  const unpaidSales = useMemo(() => {
    return assetSales.filter(s => !s.tax_paid && s.tax_amount > 0);
  }, [assetSales]);

  const visibleTransactions = transactionsExpanded ? filteredTransactions : filteredTransactions.slice(0, 5);
  const hasMoreTransactions = filteredTransactions.length > 5;

  return (
    <>
      <div id="wallets-top" className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 lg:px-0 scroll-mt-24">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfele</h1>
          {activeWalletId && (
            <button
              onClick={() => setActiveWallet(null)}
              className="text-primary hover:underline text-sm mt-1"
            >
              Pokaż wszystkie portfele
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg transition-all"
          >
            <Camera className="w-4 h-4" /> Skanuj
          </button>
          <button
            onClick={() => { setEditingWallet(null); setIsWalletModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Nowy portfel
          </button>
        </div>
      </div>

      <SectionNav sections={[
        { id: 'wallets-top', label: 'Portfele' },
        { id: 'transactions-section', label: 'Transakcje' },
        { id: 'assets-section', label: 'Aktywa' },
        ...(taxSummary && taxSummary.salesCount > 0 ? [{ id: 'tax-section', label: 'Podatki' }] : []),
      ]} />

      <div className="relative mb-6 px-4 lg:px-0">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => setActiveWallet(activeWalletId === wallet.id ? null : wallet.id)}
              className={`cursor-pointer shrink-0 w-[280px] md:w-[300px] lg:w-[320px] ${activeWalletId === wallet.id ? 'ring-2 ring-primary rounded-2xl' : ''}`}
            >
              <WalletCard
                wallet={wallet}
                assets={assets}
                exchangeRates={exchangeRates}
                onEdit={(w) => { setEditingWallet(w); setIsWalletModalOpen(true); }}
                onDelete={handleDeleteWallet}
                onRecalculate={handleRecalculate}
              />
            </div>
          ))}
        </div>
        {/* Right fade gradient */}
        <div className="absolute top-0 right-0 lg:right-0 w-16 h-full pointer-events-none bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* Wallet filter chips */}
      {wallets.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap px-4 lg:px-0">
          <button
            onClick={() => setActiveWallet(null)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              !activeWalletId
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            Wszystkie
          </button>
          {wallets.map(w => (
            <button
              key={w.id}
              onClick={() => setActiveWallet(activeWalletId === w.id ? null : w.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeWalletId === w.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
      )}

      {/* Wallet Chart */}
      {activeWalletId && activeWallet && (
        <div className="px-4 lg:px-0">
          <WalletChart
            walletId={activeWalletId}
            walletName={activeWallet.name}
            displayCurrency={displayCurrency}
            refreshKey={chartRefreshKey}
          />
        </div>
      )}

      {/* Transactions + Side Panel */}
      <div id="transactions-section" className={`scroll-mt-24 grid gap-6 px-4 lg:px-0 ${activeWalletId || hasAnyOutcomes ? 'grid-cols-1 lg:grid-cols-[1fr_auto]' : ''}`}>
        <div className="card-responsive min-w-0">
          <div className="px-4 py-4 lg:px-6 lg:py-6 pb-0 flex items-center justify-between">
            <h2 className="text-xl font-bold text-card-foreground">
              {activeWalletId
                ? `Transakcje — ${activeWallet?.name}`
                : 'Wszystkie transakcje'}
            </h2>
            <button
              onClick={() => { setEditingTransaction(null); setIsTransModalOpen(true); }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border"
            >
              <Plus className="w-3 h-3" /> Transakcja
            </button>
          </div>
          <TransactionList
            transactions={visibleTransactions}
            onDelete={handleDeleteTransaction}
            onEdit={(t) => { setEditingTransaction(t); setIsTransModalOpen(true); }}
          />
          {hasMoreTransactions && (
            <div className="px-4 pb-4 lg:px-6">
              <button
                onClick={() => setTransactionsExpanded(!transactionsExpanded)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
              >
                {transactionsExpanded ? (
                  <>Zwiń <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Pokaż wszystkie ({filteredTransactions.length}) <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>

        {activeWalletId && (
          <div className="space-y-3 lg:w-[340px]">
            {hasOutcomes && (
              <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
                <ExpensePieChart
                  transactions={filteredTransactions}
                  displayCurrency={displayCurrency}
                  exchangeRates={exchangeRates}
                />
              </div>
            )}
            {hasAnyOutcomes && (
              <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
                <FinancialCushion
                  transactions={transactions}
                  walletBalance={activeWallet?.balance ?? 0}
                  displayCurrency={displayCurrency}
                  exchangeRates={exchangeRates}
                />
              </div>
            )}
          </div>
        )}

        {!activeWalletId && hasAnyOutcomes && (
          <div className="space-y-3 lg:w-[340px]">
            <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
              <ExpensePieChart
                transactions={transactions}
                displayCurrency={displayCurrency}
                exchangeRates={exchangeRates}
              />
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
              <FinancialCushion
                transactions={transactions}
                walletBalance={totalBalance}
                displayCurrency={displayCurrency}
                exchangeRates={exchangeRates}
              />
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ AKTYWA ═══════════ */}
      <div id="assets-section" className="mt-8 px-4 lg:px-0 scroll-mt-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Aktywa</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshPrices}
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
              onClick={() => { setEditingAsset(null); setAssetModalOpen(true); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Dodaj aktywo</span>
            </button>
          </div>
        </div>

        <AssetList
          assets={assets}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
          onSell={handleSellAsset}
          standalone
        />
      </div>

      <div className="px-4 lg:px-0">
        <CompoundInterestChart initialCapital={assets.reduce((sum, a) => sum + a.total_value, 0)} transactions={initialTransactions} />
      </div>

      {/* Podsumowanie podatkowe */}
      {taxSummary && taxSummary.salesCount > 0 && (
        <div id="tax-section" className="mt-6 mx-4 lg:mx-0 bg-card border border-border rounded-xl p-4 lg:p-6 scroll-mt-24">
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
                    <span className="text-card-foreground font-bold ml-2">{formatCurrency(taxSummary.unpaidTax)}</span>
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

      <TransactionModal
        isOpen={isTransModalOpen}
        onClose={() => { setIsTransModalOpen(false); setChartRefreshKey(k => k + 1); }}
        editingTransaction={editingTransaction}
        onDelete={handleDeleteTransaction}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => { setIsWalletModalOpen(false); setChartRefreshKey(k => k + 1); }}
        editingWallet={editingWallet}
      />

      <ScanReceiptModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />

      <AssetModal
        isOpen={assetModalOpen}
        onClose={() => { setAssetModalOpen(false); setEditingAsset(null); }}
        editingAsset={editingAsset}
        onDelete={handleDeleteAsset}
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
