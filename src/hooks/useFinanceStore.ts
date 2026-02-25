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
  type: 'income' | 'outcome' | 'transfer';
  description: string | null;
  currency: Currency;
  transfer_to_wallet?: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  type: 'fiat' | 'crypto' | 'stock';
  track_from?: string;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  coingecko_id: string;
  quantity: number;
  current_price: number;
  total_value: number;
  change_24h: number;
  cost_basis: number;
  asset_type: 'crypto' | 'stock';
}

export interface AssetSale {
  id: string;
  asset_name: string;
  asset_symbol: string;
  quantity_sold: number;
  sale_price_per_unit: number;
  cost_basis_per_unit: number;
  total_proceeds: number;
  total_cost: number;
  profit: number;
  tax_amount: number;
  wallet_id: string;
  sale_date: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  frequency: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string;
  icon: string;
  wallet_id: string | null;
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
  is_confirmed: boolean;
  event_type: 'work' | 'personal';
  google_event_id?: string | null;
  google_calendar_id?: string | null;
}

interface FinanceState {
  wallets: Wallet[];
  transactions: Transaction[];
  assets: Asset[];
  assetSales: AssetSale[];
  calendarEvents: CalendarEvent[];
  goals: Goal[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  activeWalletId: string | null;
  balanceMasked: boolean;

  // Tylko settery - żadnej logiki dodawania/usuwania tutaj!
  setWallets: (wallets: Wallet[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAssets: (assets: Asset[]) => void;
  setAssetSales: (sales: AssetSale[]) => void;
  setCalendarEvents: (events: CalendarEvent[]) => void;
  setGoals: (goals: Goal[]) => void;
  setHabits: (habits: Habit[]) => void;
  setHabitEntries: (entries: HabitEntry[]) => void;
  setActiveWallet: (id: string | null) => void;
  setBalanceMasked: (masked: boolean) => void;
  toggleBalanceMask: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  (set) => ({
    wallets: [],
    transactions: [],
    assets: [],
    assetSales: [],
    calendarEvents: [],
    goals: [],
    habits: [],
    habitEntries: [],
    activeWalletId: null,
    balanceMasked: false,

    setWallets: (wallets) => set({ wallets }),
    setTransactions: (transactions) => set({ transactions }),
    setAssets: (assets) => set({ assets }),
    setAssetSales: (assetSales) => set({ assetSales }),
    setCalendarEvents: (calendarEvents) => set({ calendarEvents }),
    setGoals: (goals) => set({ goals }),
    setHabits: (habits) => set({ habits }),
    setHabitEntries: (habitEntries) => set({ habitEntries }),
    setActiveWallet: (id) => set({ activeWalletId: id }),
    setBalanceMasked: (masked) => set({ balanceMasked: masked }),
    toggleBalanceMask: () => {
      set((state) => ({ balanceMasked: !state.balanceMasked }));
    },
  })
);
