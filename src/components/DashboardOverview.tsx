'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { WalletCard } from '@/components/WalletCard';
import { TransactionList } from '@/components/TransactionList';
import { AssetList } from '@/components/AssetList';
import { FinancialChart } from '@/components/FinancialChart';
import { MonthlyIncomeChart } from '@/components/MonthlyIncomeChart';
import { ProfitChart } from '@/components/ProfitChart';
import { PLNBTCChart } from '@/components/PLNBTCChart';
import { ProjectedNetWorthChart } from '@/components/ProjectedNetWorthChart';
import { TransactionModal } from '@/components/TransactionModal';
import { WalletModal } from '@/components/WalletModal';
import { useFinanceStore, Transaction, Wallet, Asset, Goal } from '@/hooks/useFinanceStore';
import { GoalCard } from '@/components/GoalCard';
import { GoalModal } from '@/components/GoalModal';
import { TrendingUp, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, ArrowRight, Target } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { deleteTransactionAction, deleteWalletAction, deleteGoalAction } from '@/app/actions';
import { convertAmount, formatCurrency, type Currency, type ExchangeRates, type HistoricalRates } from '@/lib/exchange-rates';
import { getDashboardHistoricalRates } from '@/app/actions';

interface Props {
  initialWallets: Wallet[];
  initialTransactions: Transaction[];
  initialAssets: Asset[];
  initialGoals: Goal[];
  exchangeRates: ExchangeRates;
  userName: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Dzień dobry';
  if (hour >= 12 && hour < 18) return 'Cześć';
  if (hour >= 18 && hour < 22) return 'Dobry wieczór';
  return 'Dobrej nocy';
}

export function DashboardOverview({ initialWallets, initialTransactions, initialAssets, initialGoals, exchangeRates, userName }: Props) {
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [range, setRange] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('PLN');

  const [historicalRates, setHistoricalRates] = useState<HistoricalRates | undefined>(undefined);
  const [ratesReady, setRatesReady] = useState(false);

  const { wallets, transactions, assets, goals, setWallets, setTransactions, setAssets, setGoals, balanceMasked } = useFinanceStore();

  useEffect(() => {
    setWallets(initialWallets);
    setTransactions(initialTransactions);
    setAssets(initialAssets);
    setGoals(initialGoals);
  }, [initialWallets, initialTransactions, initialAssets, initialGoals, setWallets, setTransactions, setAssets, setGoals]);

  // Pobierz historyczne kursy gdy zmieni się range
  useEffect(() => {
    let cancelled = false;
    setRatesReady(false);
    getDashboardHistoricalRates(range).then((rates) => {
      if (!cancelled) {
        setHistoricalRates(rates);
        setRatesReady(true);
      }
    });
    return () => { cancelled = true; };
  }, [range]);

  const stats = useMemo(() => {
    // Salda portfeli są w PLN - przelicz na wybraną walutę
    const walletsTotal = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    const assetsTotal = assets.reduce((sum, asset) => sum + (asset.total_value || 0), 0);
    const netWorthPLN = walletsTotal + assetsTotal;
    const netWorth = convertAmount(netWorthPLN, 'PLN', displayCurrency, exchangeRates);

    const today = new Date();
    let startDate = subDays(today, 30);
    if (range === '1W') startDate = subDays(today, 7);
    if (range === '1M') startDate = subDays(today, 30);
    if (range === '3M') startDate = subDays(today, 90);
    if (range === '1Y') startDate = subDays(today, 365);

    const periodTransactions = transactions.filter(t => new Date(t.date) >= startDate);
    // Przelicz każdą transakcję na wybraną walutę wyświetlania
    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates), 0);
    const outcome = periodTransactions
      .filter(t => t.type === 'outcome')
      .reduce((sum, t) => sum + Math.abs(convertAmount(t.amount, t.currency || 'PLN', displayCurrency, exchangeRates)), 0);

    return { totalNetWorth: netWorth, totalIncome: income, totalOutcome: outcome, profit: income - outcome, periodLabel: range };
  }, [wallets, assets, transactions, range, displayCurrency, exchangeRates]);

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Czy na pewno?')) await deleteTransactionAction(id);
  };

  const handleDeleteWallet = async (id: string) => {
    if (confirm('Czy na pewno?')) await deleteWalletAction(id);
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm('Czy na pewno?')) await deleteGoalAction(id);
  };

  return (
    <>
      {/* Hero header */}
      <div className="mb-3 flex flex-col md:flex-row md:items-start justify-between gap-3 px-4 lg:px-0">
        <div>
          <span className="text-sm text-muted-foreground md:hidden">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: pl })}
          </span>
          <div className="flex items-baseline gap-2 mb-0.5">
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}, <span className="text-primary">{userName}</span>
            </h1>
            <span className="text-sm text-muted-foreground hidden md:inline">
              {format(new Date(), "EEEE, d MMMM yyyy", { locale: pl })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingWallet(null); setIsWalletModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border"
          >
            <Plus className="w-4 h-4" /> Portfel
          </button>
          <button
            onClick={() => { setEditingTransaction(null); setIsTransModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Transakcja
          </button>
        </div>
      </div>

      {/* Main grid: left content + right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        {/* Left column — main content */}
        <div className="min-w-0 space-y-3">
          {/* Chart + net worth + stats in one card */}
          <div className="card-responsive">
            <div className="flex flex-col lg:flex-row">
              {/* Left: net worth + chart */}
              <div className="flex-1 min-w-0">
                <div className="px-4 pt-4 lg:px-5 lg:pt-5 pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground text-sm">Wartość netto</span>
                    <select
                      value={displayCurrency}
                      onChange={(e) => setDisplayCurrency(e.target.value as Currency)}
                      className="bg-secondary border border-border rounded-md px-2 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="PLN">PLN</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    <span className={balanceMasked ? 'blur-md select-none' : ''}>{formatCurrency(stats.totalNetWorth, displayCurrency)}</span>
                  </div>
                </div>
                {ratesReady ? (
                  <FinancialChart transactions={transactions} range={range} setRange={setRange} displayCurrency={displayCurrency} exchangeRates={exchangeRates} historicalRates={historicalRates} currentNetWorth={stats.totalNetWorth} />
                ) : (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-40 bg-muted rounded-lg animate-pulse" />
                    </div>
                    <div className="h-[300px] bg-muted/30 rounded-lg animate-pulse" />
                  </div>
                )}
              </div>

              {/* Right: stats column */}
              <div className="lg:w-[200px] lg:border-l border-t lg:border-t-0 border-border flex lg:flex-col divide-x lg:divide-x-0 lg:divide-y divide-border">
                <div className="flex-1 p-4">
                  <span className="text-muted-foreground text-xs">Przychody ({stats.periodLabel})</span>
                  <div className="text-xl font-bold text-green-500 mt-1">
                    <span className={balanceMasked ? 'blur-md select-none' : ''}>{formatCurrency(stats.totalIncome, displayCurrency)}</span>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <span className="text-muted-foreground text-xs">Wydatki ({stats.periodLabel})</span>
                  <div className="text-xl font-bold text-red-500 mt-1">
                    <span className={balanceMasked ? 'blur-md select-none' : ''}>{formatCurrency(stats.totalOutcome, displayCurrency)}</span>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <span className="text-muted-foreground text-xs">Bilans ({stats.periodLabel})</span>
                  <div className={`text-xl font-bold mt-1 ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <span className={balanceMasked ? 'blur-md select-none' : ''}>{formatCurrency(stats.profit, displayCurrency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly charts row */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 ${balanceMasked ? 'blur-lg select-none pointer-events-none' : ''}`}>
            <div className="card-responsive">
              <MonthlyIncomeChart transactions={transactions} displayCurrency={displayCurrency} exchangeRates={exchangeRates} />
            </div>
            <div className="card-responsive">
              <ProfitChart transactions={transactions} displayCurrency={displayCurrency} exchangeRates={exchangeRates} />
            </div>
          </div>

          {/* PLN/BTC chart */}
          <div className={`card-responsive ${balanceMasked ? 'blur-lg select-none pointer-events-none' : ''}`}>
            <PLNBTCChart />
          </div>

          {/* Projected net worth */}
          <div className={`card-responsive ${balanceMasked ? 'blur-lg select-none pointer-events-none' : ''}`}>
            <ProjectedNetWorthChart
              transactions={transactions}
              wallets={wallets}
              assets={assets}
              displayCurrency={displayCurrency}
              exchangeRates={exchangeRates}
            />
          </div>

          {/* Assets preview */}
          <div className="card-responsive">
            <AssetList assets={assets} />
            <div className="px-4 lg:px-6 pb-4">
              <Link href="/assets" className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
                Wszystkie aktywa <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right column — sidebar */}
        <div className="space-y-3 lg:sticky lg:top-4 lg:self-start px-4 lg:px-0">
          {/* Wallet cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Portfele</h2>
              <Link href="/wallets" className="flex items-center gap-1 text-xs text-primary hover:underline">
                Wszystkie <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {wallets.slice(0, 3).map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onEdit={(w) => { setEditingWallet(w); setIsWalletModalOpen(true); }}
                  onDelete={handleDeleteWallet}
                />
              ))}
              {wallets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Brak portfeli</p>
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="card-responsive">
            <div className="px-4 py-4 lg:px-6 lg:py-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground">Cele</h2>
                <button
                  onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="w-3 h-3" /> Nowy
                </button>
              </div>
              <div className="space-y-2">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    displayCurrency={displayCurrency}
                    onEdit={(g) => { setEditingGoal(g); setIsGoalModalOpen(true); }}
                    onDelete={handleDeleteGoal}
                  />
                ))}
                {goals.length === 0 && (
                  <button
                    onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
                    className="w-full flex flex-col items-center gap-2 py-6 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    <Target className="w-8 h-8 opacity-40" />
                    <span className="text-sm">Dodaj swój pierwszy cel</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card-responsive">
            <TransactionList
              transactions={transactions}
              limit={5}
              showSeeMore
              compact
              onDelete={handleDeleteTransaction}
              onEdit={(t) => { setEditingTransaction(t); setIsTransModalOpen(true); }}
            />
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={isTransModalOpen}
        onClose={() => setIsTransModalOpen(false)}
        editingTransaction={editingTransaction}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        editingWallet={editingWallet}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editingGoal={editingGoal}
        wallets={wallets}
      />
    </>
  );
}
