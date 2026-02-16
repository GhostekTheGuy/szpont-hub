import { create } from 'zustand';
import type { Currency } from '@/lib/exchange-rates';

// Typy zgodne z bazą danych
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  wallet: string; // ID portfela
  walletName: string;
  type: 'income' | 'outcome';
  description: string | null;
  currency: Currency;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  type: 'fiat' | 'crypto' | 'stock';
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  current_price: number;
  total_value: number;
  change_24h: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  wallet_id: string | null;
  walletName: string;
  walletColor: string;
  hourly_rate: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  is_settled: boolean;
}

interface FinanceState {
  wallets: Wallet[];
  transactions: Transaction[];
  assets: Asset[];
  calendarEvents: CalendarEvent[];
  activeWalletId: string | null;

  // Tylko settery - żadnej logiki dodawania/usuwania tutaj!
  setWallets: (wallets: Wallet[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAssets: (assets: Asset[]) => void;
  setCalendarEvents: (events: CalendarEvent[]) => void;
  setActiveWallet: (id: string | null) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  wallets: [],
  transactions: [],
  assets: [],
  calendarEvents: [],
  activeWalletId: null,

  setWallets: (wallets) => set({ wallets }),
  setTransactions: (transactions) => set({ transactions }),
  setAssets: (assets) => set({ assets }),
  setCalendarEvents: (calendarEvents) => set({ calendarEvents }),
  setActiveWallet: (id) => set({ activeWalletId: id }),
}));