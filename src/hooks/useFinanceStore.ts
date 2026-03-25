import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
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
  initial_balance?: number;
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
  wallet_id: string | null;
  created_at: string;
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
  tax_paid: boolean;
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
  order_id?: string | null;
  google_event_id?: string | null;
  google_calendar_id?: string | null;
}

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'settled';

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  nip: string | null;
  company_name: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
}

export type BillingType = 'flat' | 'hourly';

export interface Order {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  amount: number;
  billing_type: BillingType;
  hourly_rate: number | null;
  tracked_hours: number;
  wallet_id: string | null;
  walletName: string;
  status: OrderStatus;
  tags: string[];
  completion_date: string | null;
  is_settled: boolean;
  settled_at: string | null;
  created_at: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  category: string;
  wallet_id: string | null;
  walletName: string;
  billing_day: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  next_due_date: string;
  is_active: boolean;
  icon: string;
  color: string;
  notes: string | null;
  created_at: string;
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
  recurringExpenses: RecurringExpense[];
  clients: Client[];
  orders: Order[];
  activeWalletId: string | null;
  balanceMasked: boolean;
  displayCurrency: Currency;
  showOnboarding: boolean;
  showWeeklyReport: boolean;

  // Tylko settery - żadnej logiki dodawania/usuwania tutaj!
  setWallets: (wallets: Wallet[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAssets: (assets: Asset[]) => void;
  setAssetSales: (sales: AssetSale[]) => void;
  setCalendarEvents: (events: CalendarEvent[]) => void;
  setGoals: (goals: Goal[]) => void;
  setHabits: (habits: Habit[]) => void;
  setHabitEntries: (entries: HabitEntry[]) => void;
  setRecurringExpenses: (expenses: RecurringExpense[]) => void;
  setClients: (clients: Client[]) => void;
  setOrders: (orders: Order[]) => void;
  setActiveWallet: (id: string | null) => void;
  setBalanceMasked: (masked: boolean) => void;
  toggleBalanceMask: () => void;
  setDisplayCurrency: (currency: Currency) => void;
  setShowOnboarding: (show: boolean) => void;
  setShowWeeklyReport: (show: boolean) => void;
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
    recurringExpenses: [],
    clients: [],
    orders: [],
    activeWalletId: null,
    balanceMasked: false,
    displayCurrency: 'PLN' as Currency,
    showOnboarding: false,
    showWeeklyReport: false,

    setWallets: (wallets) => set({ wallets }),
    setTransactions: (transactions) => set({ transactions }),
    setAssets: (assets) => set({ assets }),
    setAssetSales: (assetSales) => set({ assetSales }),
    setCalendarEvents: (calendarEvents) => set({ calendarEvents }),
    setGoals: (goals) => set({ goals }),
    setHabits: (habits) => set({ habits }),
    setHabitEntries: (habitEntries) => set({ habitEntries }),
    setRecurringExpenses: (recurringExpenses) => set({ recurringExpenses }),
    setClients: (clients) => set({ clients }),
    setOrders: (orders) => set({ orders }),
    setActiveWallet: (id) => set({ activeWalletId: id }),
    setBalanceMasked: (masked) => set({ balanceMasked: masked }),
    toggleBalanceMask: () => {
      set((state) => ({ balanceMasked: !state.balanceMasked }));
    },
    setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
    setShowOnboarding: (show) => set({ showOnboarding: show }),
    setShowWeeklyReport: (show) => set({ showWeeklyReport: show }),
  })
);

// ─── Shallow selector helper ───
// Wraps useShallow for picking multiple keys with stable identity.
// Usage: useStore(pick('wallets', 'transactions'))
type Keys = keyof FinanceState;
export function pick<K extends Keys>(...keys: K[]) {
  return useShallow((s: FinanceState) => {
    const out = {} as Pick<FinanceState, K>;
    for (const k of keys) (out as Record<string, unknown>)[k] = s[k];
    return out;
  });
}
