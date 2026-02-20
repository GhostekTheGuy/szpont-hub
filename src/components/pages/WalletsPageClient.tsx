'use client';

import { useState, useMemo, useEffect } from 'react';
import { WalletCard } from '@/components/WalletCard';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { WalletModal } from '@/components/WalletModal';
import { WalletChart } from '@/components/WalletChart';
import { ScanReceiptModal } from '@/components/ScanReceiptModal';
import { useFinanceStore, Transaction, Wallet } from '@/hooks/useFinanceStore';
import { Plus, Camera } from 'lucide-react';
import { deleteTransactionAction, deleteWalletAction } from '@/app/actions';
import { type Currency } from '@/lib/exchange-rates';

interface Props {
  initialWallets: Wallet[];
  initialTransactions: Transaction[];
}

export function WalletsPageClient({ initialWallets, initialTransactions }: Props) {
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('PLN');

  const { wallets, transactions, activeWalletId, setWallets, setTransactions, setActiveWallet } = useFinanceStore();

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
          <select
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value as Currency)}
            className="bg-secondary border border-border rounded-md px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="PLN">PLN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 px-4 lg:px-0">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            onClick={() => setActiveWallet(activeWalletId === wallet.id ? null : wallet.id)}
            className={`cursor-pointer ${activeWalletId === wallet.id ? 'ring-2 ring-primary rounded-2xl' : ''}`}
          >
            <WalletCard
              wallet={wallet}
              onEdit={(w) => { setEditingWallet(w); setIsWalletModalOpen(true); }}
              onDelete={handleDeleteWallet}
            />
          </div>
        ))}
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
        <WalletChart
          walletId={activeWalletId}
          walletName={activeWallet.name}
          displayCurrency={displayCurrency}
        />
      )}

      {/* Transactions for selected wallet */}
      <div className="card-responsive">
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

      <ScanReceiptModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </>
  );
}
