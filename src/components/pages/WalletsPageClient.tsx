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
import { useFinanceStore, Transaction, Wallet } from '@/hooks/useFinanceStore';
import { Plus, Camera } from 'lucide-react';
import { deleteTransactionAction, deleteWalletAction } from '@/app/actions';
import { type ExchangeRates } from '@/lib/exchange-rates';

interface Props {
  initialWallets: Wallet[];
  initialTransactions: Transaction[];
  exchangeRates: ExchangeRates;
}

export function WalletsPageClient({ initialWallets, initialTransactions, exchangeRates }: Props) {
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const { wallets, transactions, activeWalletId, setWallets, setTransactions, setActiveWallet, displayCurrency } = useFinanceStore();

  useEffect(() => {
    setWallets(initialWallets);
    setTransactions(initialTransactions);
  }, [initialWallets, initialTransactions, setWallets, setTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!activeWalletId) return transactions;
    return transactions.filter(t => t.wallet === activeWalletId);
  }, [transactions, activeWalletId]);

  const activeWallet = useMemo(() => {
    return wallets.find(w => w.id === activeWalletId);
  }, [wallets, activeWalletId]);

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Czy na pewno?')) await deleteTransactionAction(id);
  };

  const handleDeleteWallet = async (id: string) => {
    if (confirm('Czy na pewno?')) {
      await deleteWalletAction(id);
      if (activeWalletId === id) setActiveWallet(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 lg:px-0">
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
                exchangeRates={exchangeRates}
                onEdit={(w) => { setEditingWallet(w); setIsWalletModalOpen(true); }}
                onDelete={handleDeleteWallet}
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
          />
        </div>
      )}

      {/* Transactions + Pie Chart */}
      <div className={`grid gap-6 px-4 lg:px-0 ${activeWalletId ? 'grid-cols-1 lg:grid-cols-[1fr_auto]' : ''}`}>
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
            transactions={filteredTransactions}
            onDelete={handleDeleteTransaction}
            onEdit={(t) => { setEditingTransaction(t); setIsTransModalOpen(true); }}
          />
        </div>

        {activeWalletId && (
          <div className="space-y-3 lg:w-[340px]">
            <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
              <ExpensePieChart
                transactions={filteredTransactions}
                displayCurrency={displayCurrency}
                exchangeRates={exchangeRates}
              />
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
              <FinancialCushion
                transactions={filteredTransactions}
                walletBalance={activeWallet?.balance ?? 0}
                displayCurrency={displayCurrency}
                exchangeRates={exchangeRates}
              />
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isTransModalOpen}
        onClose={() => setIsTransModalOpen(false)}
        editingTransaction={editingTransaction}
        onDelete={handleDeleteTransaction}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        editingWallet={editingWallet}
      />

      <ScanReceiptModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </>
  );
}
