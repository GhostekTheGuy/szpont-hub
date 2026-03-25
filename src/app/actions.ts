'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/cached';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import {
  deriveKEK,
  decryptDEK,
  generateSalt,
  generateDEK,
  encryptDEK,
  encryptForCookie,
  decryptFromCookie,
  encryptNumber,
  decryptNumber,
  encryptString,
  decryptString,
} from '@/lib/crypto';
import { getExchangeRates, getHistoricalRates, convertAmount, type Currency, type ExchangeRates, type HistoricalRates } from '@/lib/exchange-rates';
import { expandRecurringEvents, mergeWithExpanded } from '@/lib/calendar-utils';

// --- HELPERS ---

function isValidISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(s) && !isNaN(Date.parse(s));
}

function parseInstanceId(id: string): { parentId: string; dateStr: string } | null {
  const match = id.match(/_(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  return { parentId: id.slice(0, match.index!), dateStr: match[1] };
}

async function getUserId() {
  const user = await getUser();
  return user?.id;
}

// --- SZYFROWANIE: SESJA ---

async function getDEK(): Promise<Buffer> {
  const cookieStore = await cookies();
  const encryptedCookie = cookieStore.get('encryption_dek')?.value;
  if (!encryptedCookie) throw new Error('Encryption session expired');
  return decryptFromCookie(encryptedCookie);
}

export async function initEncryptionSession(password: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // Pobierz dane szyfrowania użytkownika
  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('encryption_salt, encrypted_dek')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user encryption data:', error);
    throw new Error('User not found');
  }

  let dek: Buffer;

  if (!userData?.encryption_salt || !userData?.encrypted_dek) {
    // Użytkownik zarejestrowany przed wdrożeniem szyfrowania
    // Generuj klucze szyfrowania na pierwszym loginie
    const salt = generateSalt();
    dek = generateDEK();
    const kek = await deriveKEK(password, salt);
    const encryptedDek = encryptDEK(dek, kek);

    await supabaseAdmin
      .from('users')
      .update({
        encryption_salt: salt.toString('base64'),
        encrypted_dek: encryptedDek,
      })
      .eq('id', userId);
  } else {
    // Normalny flow - odszyfruj istniejący DEK
    const salt = Buffer.from(userData.encryption_salt, 'base64');
    const kek = await deriveKEK(password, salt);
    dek = decryptDEK(userData.encrypted_dek, kek);
  }

  // Zaszyfruj DEK do cookie
  const encryptedForCookie = encryptForCookie(dek);

  const cookieStore = await cookies();
  cookieStore.set('encryption_dek', encryptedForCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  });
}

// --- POBIERANIE DANYCH ---

async function fetchWalletsAndTransactions(userId: string, existingDek?: Buffer) {
  // Równoległy fetch DEK (jeśli nie podany) + portfeli
  const [dek, { data: wallets, error: walletsError }] = await Promise.all([
    existingDek ? Promise.resolve(existingDek) : getDEK(),
    supabaseAdmin.from('wallets').select('id, user_id, name, balance, icon, color, type, track_from, initial_balance, currency').eq('user_id', userId),
  ]);

  if (walletsError) {
    console.error('Error fetching wallets:', walletsError);
  }

  // Deszyfruj pola portfeli
  const decryptedWallets = (wallets || []).map(w => ({
    ...w,
    name: decryptString(w.name, dek) || w.name,
    balance: decryptNumber(w.balance, dek),
    track_from: w.track_from ? decryptString(w.track_from, dek) || undefined : undefined,
    initial_balance: w.initial_balance ? decryptNumber(w.initial_balance, dek) : 0,
  }));

  const { data: transactionsRaw, error: transError } = await supabaseAdmin
    .from('transactions')
    .select(`
      *,
      wallet:wallets(name)
    `)
    .in('wallet_id', (wallets || []).map(w => w.id))
    .order('date', { ascending: false });

  if (transError) {
    console.error('Error fetching transactions:', transError);
  }

  const transactions = (transactionsRaw || []).map(t => ({
    ...t,
    amount: decryptNumber(t.amount, dek),
    category: decryptString(t.category, dek) || t.category,
    description: decryptString(t.description, dek),
    date: t.date?.split('T')[0] || '',
    walletName: decryptString(t.wallet?.name, dek) || t.wallet?.name || '',
    wallet: t.wallet_id,
    type: t.type as 'income' | 'outcome' | 'transfer',
    currency: (t.currency || 'PLN') as Currency,
  }));

  return { wallets: decryptedWallets, transactions };
}

export async function getDashboardData() {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  // Równoległe pobieranie wszystkich danych (w tym goals — unika dodatkowego getUserId+getDEK)
  const [{ wallets, transactions }, rates, { data: assets, error: assetsError }, { data: goals, error: goalsError }, { data: calendarEventsRaw }, { data: recurringExpensesRaw }] = await Promise.all([
    fetchWalletsAndTransactions(userId, dek),
    getExchangeRates(),
    supabaseAdmin.from('assets').select('id, user_id, name, symbol, coingecko_id, quantity, current_price, total_value, change_24h, cost_basis, asset_type, wallet_id, created_at').eq('user_id', userId),
    supabaseAdmin.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabaseAdmin.from('calendar_events').select('*').eq('user_id', userId).eq('is_confirmed', true).neq('event_type', 'personal'),
    supabaseAdmin.from('recurring_expenses').select('*').eq('user_id', userId).eq('is_active', true).order('next_due_date', { ascending: true }),
  ]);

  if (assetsError) {
    console.error('Error fetching assets:', assetsError);
  }
  if (goalsError) {
    console.error('Error fetching goals:', goalsError);
  }

  // Deszyfruj pola assets
  const decryptedAssets = (assets || []).map(a => ({
    ...a,
    name: decryptString(a.name, dek) || a.name,
    symbol: decryptString(a.symbol, dek) || a.symbol,
    coingecko_id: decryptString(a.coingecko_id, dek) || a.coingecko_id || '',
    quantity: decryptNumber(a.quantity, dek),
    current_price: decryptNumber(a.current_price, dek),
    total_value: decryptNumber(a.total_value, dek),
    change_24h: decryptNumber(a.change_24h, dek),
    cost_basis: a.cost_basis ? decryptNumber(a.cost_basis, dek) : 0,
    asset_type: (a.asset_type || 'crypto') as 'crypto' | 'stock',
    wallet_id: a.wallet_id || null,
    created_at: a.created_at || new Date().toISOString(),
  }));

  // Deszyfruj pola goals
  const decryptedGoals = (goals || []).map(g => ({
    id: g.id,
    name: decryptString(g.name, dek) || g.name,
    target_amount: decryptNumber(g.target_amount, dek),
    current_amount: decryptNumber(g.current_amount, dek),
    target_date: g.target_date,
    category: g.category,
    icon: g.icon,
    wallet_id: g.wallet_id,
  }));

  // Deszyfruj recurring expenses
  const walletMap = new Map<string, string>();
  for (const w of wallets) {
    walletMap.set(w.id, w.name);
  }
  const decryptedRecurringExpenses = (recurringExpensesRaw || []).map(e => ({
    id: e.id,
    name: decryptString(e.name, dek) || e.name,
    amount: decryptNumber(e.amount, dek),
    currency: (e.currency || 'PLN') as Currency,
    category: e.category,
    wallet_id: e.wallet_id,
    walletName: e.wallet_id ? walletMap.get(e.wallet_id) || '' : '',
    billing_day: e.billing_day,
    frequency: e.frequency as 'monthly' | 'quarterly' | 'yearly',
    next_due_date: e.next_due_date,
    is_active: e.is_active,
    icon: e.icon || '',
    color: e.color || '',
    notes: e.notes ? decryptString(e.notes, dek) : null,
    created_at: e.created_at,
  }));

  // Oblicz dzienne zarobki z rozliczonych wydarzeń kalendarza (data → kwota w PLN)
  const workEarningsByDate: Record<string, number> = {};
  for (const ev of calendarEventsRaw || []) {
    if (!ev.is_settled) continue;
    const eventDate = ev.start_time.split('T')[0];
    const hourlyRate = decryptNumber(ev.hourly_rate, dek);
    const start = new Date(ev.start_time);
    const end = new Date(ev.end_time);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const earnings = hours * hourlyRate;
    workEarningsByDate[eventDate] = (workEarningsByDate[eventDate] || 0) + earnings;
  }

  return { wallets, transactions, assets: decryptedAssets, goals: decryptedGoals, recurringExpenses: decryptedRecurringExpenses, exchangeRates: rates, workEarningsByDate };
}

export async function getWalletsWithTransactions() {
  const userId = await getUserId();
  if (!userId) return null;

  return fetchWalletsAndTransactions(userId);
}

// Lightweight version — fetches only wallets without transactions (for calendar, etc.)
export async function getWallets() {
  const userId = await getUserId();
  if (!userId) return null;

  const [dek, { data: wallets, error }] = await Promise.all([
    getDEK(),
    supabaseAdmin.from('wallets').select('*').eq('user_id', userId),
  ]);

  if (error) {
    console.error('Error fetching wallets:', error);
  }

  const decryptedWallets = (wallets || []).map(w => ({
    ...w,
    name: decryptString(w.name, dek) || w.name,
    balance: decryptNumber(w.balance, dek),
    track_from: w.track_from ? decryptString(w.track_from, dek) || undefined : undefined,
    initial_balance: w.initial_balance ? decryptNumber(w.initial_balance, dek) : 0,
  }));

  return { wallets: decryptedWallets };
}

export async function getAssetsData() {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  const { data: assets, error: assetsError } = await supabaseAdmin
    .from('assets')
    .select('id, user_id, name, symbol, coingecko_id, quantity, current_price, total_value, change_24h, cost_basis, asset_type, wallet_id, created_at')
    .eq('user_id', userId);

  if (assetsError) {
    console.error('Error fetching assets:', assetsError);
  }

  const decryptedAssets = (assets || []).map(a => ({
    ...a,
    name: decryptString(a.name, dek) || a.name,
    symbol: decryptString(a.symbol, dek) || a.symbol,
    coingecko_id: decryptString(a.coingecko_id, dek) || a.coingecko_id || '',
    quantity: decryptNumber(a.quantity, dek),
    current_price: decryptNumber(a.current_price, dek),
    total_value: decryptNumber(a.total_value, dek),
    change_24h: decryptNumber(a.change_24h, dek),
    cost_basis: a.cost_basis ? decryptNumber(a.cost_basis, dek) : 0,
    asset_type: (a.asset_type || 'crypto') as 'crypto' | 'stock',
    wallet_id: a.wallet_id || null,
    created_at: a.created_at || new Date().toISOString(),
  }));

  return { assets: decryptedAssets };
}

// --- WYKRES PORTFELA ---

export async function getWalletChartData(
  walletId: string,
  range: '1W' | '1M' | '3M' | '1Y',
  displayCurrency: Currency = 'PLN'
) {
  const userId = await getUserId();
  if (!userId) return null;

  const days = range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : 365;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = today.toISOString().split('T')[0];

  const { wallets, transactions } = await fetchWalletsAndTransactions(userId);
  const wallet = wallets.find(w => w.id === walletId);
  if (!wallet) return null;

  // Uwzględnij WSZYSTKIE transakcje dla tego portfela — saldo = initial_balance + sum(transactions)
  const walletTransactions = transactions.filter(t => t.wallet === walletId);

  const currentRates = await getExchangeRates();

  const currentBalance = convertAmount(wallet.balance, 'PLN', displayCurrency, currentRates);

  // Normalizuj kwoty transakcji
  function getSignedAmount(t: { amount: number; type: string; currency: Currency }) {
    const converted = convertAmount(t.amount, t.currency || 'PLN', displayCurrency, currentRates);
    if ((t.type as string) === 'expense' && converted > 0) return -converted;
    return converted;
  }

  // Prekomputacja: grupuj delty po dacie
  const txByDate = new Map<string, number>();
  for (const t of walletTransactions) {
    const d = t.date.slice(0, 10);
    txByDate.set(d, (txByDate.get(d) || 0) + getSignedAmount(t));
  }

  // Oblicz sumę przyszłych transakcji (od startDate+1 do dziś)
  let runningFutureTx = 0;
  for (const v of Array.from(txByDate.values())) runningFutureTx += v;

  const startDateStr = startDate.toISOString().split('T')[0];
  for (const [d, v] of Array.from(txByDate.entries())) {
    if (d <= startDateStr) runningFutureTx -= v;
  }

  const data: { date: string; value: number }[] = [];
  const current = new Date(startDate);

  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];

    data.push({ date: dateStr, value: currentBalance - runningFutureTx });

    runningFutureTx -= (txByDate.get(dateStr) || 0);
    current.setDate(current.getDate() + 1);
  }

  return { data, currentBalance };
}

// --- HISTORYCZNE KURSY DLA DASHBOARDU ---

export async function getDashboardHistoricalRates(range: '1W' | '1M' | '3M' | '1Y'): Promise<HistoricalRates> {
  const days = range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : 365;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = today.toISOString().split('T')[0];

  return getHistoricalRates(startStr, endStr);
}

// --- TRANSAKCJE ---

export async function addTransactionAction(data: {
  amount: number;
  wallet: string;
  type: 'income' | 'outcome';
  category: string;
  description?: string;
  date?: string;
  currency?: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Walidacja danych wejściowych
  if (typeof data?.amount !== 'number' || !isFinite(data.amount)) throw new Error("Invalid amount");
  if (typeof data?.wallet !== 'string' || !data.wallet) throw new Error("Invalid wallet");
  if (typeof data?.type !== 'string' || !['income', 'outcome'].includes(data.type)) throw new Error("Invalid type");
  if (typeof data?.category !== 'string' || data.category.length > 100) throw new Error("Invalid category");
  if (data.description && (typeof data.description !== 'string' || data.description.length > 500)) throw new Error("Invalid description");
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error("Invalid date");

  const dek = await getDEK();
  const currency: Currency = data.currency && ['PLN', 'USD', 'EUR'].includes(data.currency) ? data.currency as Currency : 'PLN';

  // 1. Pobierz portfel
  const { data: wallet, error: walletError } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('id', data.wallet)
    .eq('user_id', userId)
    .single();

  if (walletError || !wallet) {
    console.error('Error finding wallet:', walletError);
    throw new Error("Wallet not found");
  }

  // Odszyfruj aktualne saldo
  const currentBalance = decryptNumber(wallet.balance, dek);

  // Przelicz kwotę na PLN dla salda portfela
  const rates = await getExchangeRates();
  const amountInPLN = convertAmount(data.amount, currency, 'PLN', rates);

  // 2. Dodaj transakcję (zaszyfrowane pola)
  const { error: insertError } = await supabaseAdmin
    .from('transactions')
    .insert({
      id: nanoid(),
      amount: encryptNumber(data.amount, dek),
      category: encryptString(data.category, dek),
      description: data.description ? encryptString(data.description, dek) : null,
      type: data.type,
      date: data.date,
      wallet_id: data.wallet,
      currency,
      created_at: new Date().toISOString()
    });

  if (insertError) {
    console.error('Error adding transaction:', insertError);
    throw new Error('Failed to add transaction');
  }

  // 3. Zaktualizuj saldo w PLN (zaszyfrowane)
  const newBalance = currentBalance + amountInPLN;
  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(newBalance, dek) })
    .eq('id', data.wallet);

  revalidatePath('/', 'layout');
}

export async function addTransferAction(data: {
  amount: number;
  fromWalletId: string;
  toWalletId: string;
  description: string;
  date: string;
  currency: Currency;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const dek = await getDEK();
  const rates = await getExchangeRates();
  const amountInPLN = convertAmount(data.amount, data.currency, 'PLN', rates);

  // Pobierz oba portfele
  const [{ data: fromWallet }, { data: toWallet }] = await Promise.all([
    supabaseAdmin.from('wallets').select('*').eq('id', data.fromWalletId).eq('user_id', userId).single(),
    supabaseAdmin.from('wallets').select('*').eq('id', data.toWalletId).eq('user_id', userId).single(),
  ]);

  if (!fromWallet || !toWallet) throw new Error("Wallet not found");

  const fromBalance = decryptNumber(fromWallet.balance, dek);
  const toBalance = decryptNumber(toWallet.balance, dek);
  const fromName = decryptString(fromWallet.name, dek) || fromWallet.name;
  const toName = decryptString(toWallet.name, dek) || toWallet.name;

  const outcomeDesc = data.description ? `${data.description} → ${toName}` : `→ ${toName}`;
  const incomeDesc = data.description ? `${data.description} ← ${fromName}` : `← ${fromName}`;

  // Utwórz 2 transakcje: outcome z fromWallet, income do toWallet
  await supabaseAdmin.from('transactions').insert([
    {
      id: nanoid(),
      amount: encryptNumber(-Math.abs(data.amount), dek),
      category: encryptString('Transfer', dek),
      description: encryptString(outcomeDesc, dek),
      type: 'transfer',
      date: data.date,
      wallet_id: data.fromWalletId,
      currency: data.currency,
      created_at: new Date().toISOString(),
    },
    {
      id: nanoid(),
      amount: encryptNumber(Math.abs(data.amount), dek),
      category: encryptString('Transfer', dek),
      description: encryptString(incomeDesc, dek),
      type: 'transfer',
      date: data.date,
      wallet_id: data.toWalletId,
      currency: data.currency,
      created_at: new Date().toISOString(),
    },
  ]);

  // Zaktualizuj salda obu portfeli sekwencyjnie (rollback przy błędzie)
  const { error: fromError } = await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(fromBalance - amountInPLN, dek) })
    .eq('id', data.fromWalletId);

  if (fromError) throw new Error('Transfer failed: source wallet update error');

  const { error: toError } = await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(toBalance + amountInPLN, dek) })
    .eq('id', data.toWalletId);

  if (toError) {
    // Rollback: przywróć saldo portfela źródłowego
    await supabaseAdmin
      .from('wallets')
      .update({ balance: encryptNumber(fromBalance, dek) })
      .eq('id', data.fromWalletId);
    throw new Error('Transfer failed: destination wallet update error');
  }

  revalidatePath('/', 'layout');
}

export async function deleteTransactionAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const dek = await getDEK();

  const { data: transaction } = await supabaseAdmin
    .from('transactions')
    .select('*, wallet:wallets(*)')
    .eq('id', id)
    .single();

  if (!transaction || transaction.wallet?.user_id !== userId) return;

  // Odszyfruj wartości do obliczeń
  const walletBalance = decryptNumber(transaction.wallet.balance, dek);
  const transactionAmount = decryptNumber(transaction.amount, dek);

  // Przelicz na PLN jeśli inna waluta
  const currency: Currency = transaction.currency || 'PLN';
  const rates = await getExchangeRates();
  const amountInPLN = convertAmount(transactionAmount, currency, 'PLN', rates);

  // Cofnij saldo w PLN (zaszyfrowane)
  const newBalance = walletBalance - amountInPLN;
  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(newBalance, dek) })
    .eq('id', transaction.wallet_id);

  // Usuń powiązaną opłatę stałego wydatku (jeśli istnieje) i cofnij next_due_date
  const { data: payment } = await supabaseAdmin
    .from('expense_payments')
    .select('id, expense_id, status')
    .eq('transaction_id', id)
    .maybeSingle();

  if (payment) {
    // Cofnij next_due_date o jeden cykl
    const { data: expense } = await supabaseAdmin
      .from('recurring_expenses')
      .select('next_due_date, frequency')
      .eq('id', payment.expense_id)
      .single();

    if (expense) {
      const currentDue = new Date(expense.next_due_date);
      let prevDue: Date;
      if (expense.frequency === 'monthly') {
        prevDue = new Date(currentDue);
        prevDue.setMonth(prevDue.getMonth() - 1);
      } else if (expense.frequency === 'quarterly') {
        prevDue = new Date(currentDue);
        prevDue.setMonth(prevDue.getMonth() - 3);
      } else {
        prevDue = new Date(currentDue);
        prevDue.setFullYear(prevDue.getFullYear() - 1);
      }

      await supabaseAdmin
        .from('recurring_expenses')
        .update({ next_due_date: prevDue.toISOString().split('T')[0] })
        .eq('id', payment.expense_id);
    }

    await supabaseAdmin
      .from('expense_payments')
      .delete()
      .eq('id', payment.id);
  }

  await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function editTransactionAction(id: string, data: {
  amount: number;
  wallet: string;
  type: 'income' | 'outcome';
  category: string;
  description?: string;
  date?: string;
  currency?: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Walidacja
  if (typeof id !== 'string' || !id) throw new Error("Invalid id");
  if (typeof data?.amount !== 'number' || !isFinite(data.amount)) throw new Error("Invalid amount");
  if (typeof data?.wallet !== 'string' || !data.wallet) throw new Error("Invalid wallet");
  if (typeof data?.type !== 'string' || !['income', 'outcome'].includes(data.type)) throw new Error("Invalid type");
  if (typeof data?.category !== 'string' || data.category.length > 100) throw new Error("Invalid category");
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error("Invalid date");

  const dek = await getDEK();
  const rates = await getExchangeRates();

  const { data: oldTransaction } = await supabaseAdmin
    .from('transactions')
    .select('*, wallet:wallets(*)')
    .eq('id', id)
    .single();

  if (!oldTransaction || oldTransaction.wallet?.user_id !== userId) return;

  // Odszyfruj wartości do obliczeń
  const oldWalletBalance = decryptNumber(oldTransaction.wallet.balance, dek);
  const oldAmount = decryptNumber(oldTransaction.amount, dek);
  const oldCurrency: Currency = oldTransaction.currency || 'PLN';
  const oldAmountInPLN = convertAmount(oldAmount, oldCurrency, 'PLN', rates);

  // 1. Cofnij starą transakcję w PLN (zaszyfrowane)
  const revertedBalance = oldWalletBalance - oldAmountInPLN;
  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(revertedBalance, dek) })
    .eq('id', oldTransaction.wallet_id);

  const newCurrency: Currency = data.currency && ['PLN', 'USD', 'EUR'].includes(data.currency) ? data.currency as Currency : 'PLN';

  // 2. Zaktualizuj transakcję (zaszyfrowane pola)
  await supabaseAdmin
    .from('transactions')
    .update({
      amount: encryptNumber(data.amount, dek),
      category: encryptString(data.category, dek),
      description: data.description ? encryptString(data.description, dek) : null,
      type: data.type,
      date: data.date,
      wallet_id: data.wallet,
      currency: newCurrency,
    })
    .eq('id', id);

  // 3. Dodaj do nowego portfela (przeliczone na PLN)
  const newAmountInPLN = convertAmount(data.amount, newCurrency, 'PLN', rates);
  const { data: newWallet } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('id', data.wallet)
    .eq('user_id', userId)
    .single();

  if (!newWallet) throw new Error('Wallet not found');

  const newWalletBalance = decryptNumber(newWallet.balance, dek);
  const updatedBalance = newWalletBalance + newAmountInPLN;
  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(updatedBalance, dek) })
    .eq('id', newWallet.id);

  revalidatePath('/', 'layout');
}

// --- PORTFELE ---

export async function addWalletAction(data: {
  name: string;
  type: string;
  track_from?: string;
  initial_balance?: number;
  color?: string;
  icon?: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Walidacja
  if (typeof data?.name !== 'string' || data.name.trim().length === 0 || data.name.length > 100) throw new Error("Invalid name");
  if (typeof data?.type !== 'string') throw new Error("Invalid type");
  if (data.track_from && !/^\d{4}-\d{2}-\d{2}$/.test(data.track_from)) throw new Error("Invalid date");

  const dek = await getDEK();

  const trackFrom = data.track_from || new Date().toISOString().split('T')[0];

  const initialBalance = typeof data.initial_balance === 'number' ? data.initial_balance : 0;

  const { error } = await supabaseAdmin
    .from('wallets')
    .insert({
      id: nanoid(),
      user_id: userId,
      name: encryptString(data.name, dek),
      type: data.type,
      color: data.color,
      icon: data.icon,
      balance: encryptNumber(initialBalance, dek),
      track_from: encryptString(trackFrom, dek),
      initial_balance: encryptNumber(initialBalance, dek),
      currency: 'PLN',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error adding wallet:', error);
    throw new Error('Failed to add wallet');
  }

  revalidatePath('/', 'layout');
}

export async function editWalletAction(id: string, data: {
  name: string;
  type: string;
  track_from?: string;
  initial_balance?: number;
  color?: string;
  icon?: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Walidacja
  if (typeof id !== 'string' || !id) throw new Error("Invalid id");
  if (typeof data?.name !== 'string' || data.name.trim().length === 0 || data.name.length > 100) throw new Error("Invalid name");
  if (typeof data?.type !== 'string') throw new Error("Invalid type");

  // Sprawdź czy portfel należy do użytkownika
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('user_id, balance, initial_balance')
    .eq('id', id)
    .single();

  if (!wallet || wallet.user_id !== userId) return;

  const dek = await getDEK();

  const updateData: Record<string, any> = {
    name: encryptString(data.name, dek),
    type: data.type,
    color: data.color,
    icon: data.icon,
  };

  if (data.track_from) {
    updateData.track_from = encryptString(data.track_from, dek);
  }

  if (typeof data.initial_balance === 'number') {
    const oldInitialBalance = wallet.initial_balance ? decryptNumber(wallet.initial_balance, dek) : 0;
    const delta = data.initial_balance - oldInitialBalance;
    if (delta !== 0) {
      const currentBalance = wallet.balance ? decryptNumber(wallet.balance, dek) : 0;
      updateData.balance = encryptNumber(currentBalance + delta, dek);
    }
    updateData.initial_balance = encryptNumber(data.initial_balance, dek);
  }

  await supabaseAdmin
    .from('wallets')
    .update(updateData)
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function adjustBalanceAction(walletId: string, newBalance: number) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('user_id')
    .eq('id', walletId)
    .single();

  if (!wallet || wallet.user_id !== userId) throw new Error("Wallet not found");

  const dek = await getDEK();

  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(newBalance, dek) })
    .eq('id', walletId);

  revalidatePath('/', 'layout');
}

export async function recalculateWalletBalance(walletId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const dek = await getDEK();

  const [{ data: wallet }, { data: transactions }] = await Promise.all([
    supabaseAdmin.from('wallets').select('*').eq('id', walletId).eq('user_id', userId).single(),
    supabaseAdmin.from('transactions').select('*').eq('wallet_id', walletId),
  ]);

  if (!wallet) throw new Error("Wallet not found");

  const rates = await getExchangeRates();
  const initialBalance = wallet.initial_balance ? decryptNumber(wallet.initial_balance, dek) : 0;

  let balance = initialBalance;
  for (const t of transactions || []) {
    const amount = decryptNumber(t.amount, dek);
    const currency: Currency = t.currency || 'PLN';
    const amountInPLN = convertAmount(amount, currency, 'PLN', rates);
    balance += amountInPLN;
  }

  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(balance, dek) })
    .eq('id', walletId);

  revalidatePath('/', 'layout');
  return balance;
}

export async function deleteWalletAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Sprawdź czy portfel należy do użytkownika
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!wallet || wallet.user_id !== userId) return;

  // Usuń najpierw transakcje (Supabase nie ma cascade by default)
  await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('wallet_id', id);

  await supabaseAdmin
    .from('wallets')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

// --- RESET HASŁA ---
export async function resetPasswordAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error('No email found');

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
  });

  if (error) throw new Error('Failed to send reset email');
}

export async function resetPasswordByEmailAction(email: string) {
  // Walidacja formatu email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== 'string' || !emailRegex.test(email) || email.length > 254) {
    throw new Error('Nieprawidłowy format email');
  }

  const supabase = await createClient();

  // Zawsze zwracaj sukces — nie ujawniaj czy email istnieje
  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
  });
}

// --- PREFERENCJE UŻYTKOWNIKA ---

export async function getUserPreferences() {
  const userId = await getUserId();
  if (!userId) return {
    balanceMasked: false,
    preferredCurrency: 'PLN' as Currency,
    onboardingDone: false,
    lastWeeklyReport: null as string | null,
    isPro: false,
    subscription: null as { status: string; price_id: string | null; current_period_end: string | null; cancel_at_period_end: boolean } | null,
  };

  // Single parallel fetch: user prefs + subscription (eliminates separate isProUser call)
  const [{ data: userData }, { data: subData }] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('balance_masked, preferred_currency, onboarding_done, last_weekly_report')
      .eq('id', userId)
      .single(),
    supabaseAdmin
      .from('subscriptions')
      .select('status, price_id, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .single(),
  ]);

  const isPro = subData?.status === 'active' || subData?.status === 'trialing';

  return {
    balanceMasked: userData?.balance_masked ?? false,
    preferredCurrency: (userData?.preferred_currency as Currency) ?? 'PLN',
    onboardingDone: userData?.onboarding_done ?? false,
    lastWeeklyReport: userData?.last_weekly_report ?? null,
    isPro,
    subscription: subData,
  };
}

export async function getBalanceMasked(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { data } = await supabaseAdmin
    .from('users')
    .select('balance_masked')
    .eq('id', userId)
    .single();

  return data?.balance_masked ?? false;
}

export async function setBalanceMasked(masked: boolean) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  await supabaseAdmin
    .from('users')
    .update({ balance_masked: masked })
    .eq('id', userId);
}

export async function getPreferredCurrency(): Promise<Currency> {
  const userId = await getUserId();
  if (!userId) return 'PLN';

  const { data } = await supabaseAdmin
    .from('users')
    .select('preferred_currency')
    .eq('id', userId)
    .single();

  return (data?.preferred_currency as Currency) ?? 'PLN';
}

export async function setPreferredCurrency(currency: Currency) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  await supabaseAdmin
    .from('users')
    .update({ preferred_currency: currency })
    .eq('id', userId);
}

export async function getOnboardingDone(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const { data } = await supabaseAdmin
    .from('users')
    .select('onboarding_done')
    .eq('id', userId)
    .single();

  return data?.onboarding_done ?? false;
}

export async function setOnboardingDone(done: boolean) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  await supabaseAdmin
    .from('users')
    .update({ onboarding_done: done })
    .eq('id', userId);
}

// --- WYLOGOWANIE ---
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Usuń cookie szyfrowania
  const cookieStore = await cookies();
  cookieStore.delete('encryption_dek');

  revalidatePath('/', 'layout');
}

// --- KALENDARZ ---

export async function getCalendarEvents(weekStart: string, weekEnd: string) {
  if (!isValidISODate(weekStart) || !isValidISODate(weekEnd)) throw new Error('Invalid date range');
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  const [{ data: events, error: eventsError }, { data: recurringEvents, error: recurringError }, { data: wallets }] = await Promise.all([
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .lte('start_time', weekEnd)
      .gte('end_time', weekStart)
      .order('start_time', { ascending: true }),
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .lt('start_time', weekEnd),
    supabaseAdmin
      .from('wallets')
      .select('id, name, color')
      .eq('user_id', userId),
  ]);

  if (eventsError) {
    console.error('Error fetching calendar events:', eventsError);
  }
  if (recurringError) {
    console.error('Error fetching recurring events:', recurringError);
  }

  // Expand recurring events and merge with DB events
  const expandedRecurring = expandRecurringEvents(recurringEvents || [], weekStart, weekEnd);
  const allEvents = mergeWithExpanded(events || [], expandedRecurring);

  const walletMap = new Map(
    (wallets || []).map(w => [w.id, { name: decryptString(w.name, dek) || w.name, color: w.color }])
  );

  // Filter out excluded recurring instances (soft-deleted)
  const visibleEvents = allEvents.filter(e => e.recurrence_rule !== 'EXCLUDED');

  const decryptedEvents = visibleEvents.map(e => ({
    id: e.id,
    title: decryptString(e.title, dek) || e.title,
    wallet_id: e.wallet_id,
    walletName: e.wallet_id ? walletMap.get(e.wallet_id)?.name || '' : '',
    walletColor: e.wallet_id ? walletMap.get(e.wallet_id)?.color || '' : '',
    hourly_rate: decryptNumber(e.hourly_rate, dek),
    start_time: e.start_time,
    end_time: e.end_time,
    is_recurring: e.is_recurring,
    recurrence_rule: e.recurrence_rule,
    is_settled: e.is_settled,
    is_confirmed: e.is_confirmed ?? false,
    event_type: (e.event_type || (e.google_event_id ? 'personal' : 'work')) as 'work' | 'personal',
    order_id: e.order_id || null,
    google_event_id: e.google_event_id || null,
    google_calendar_id: e.google_calendar_id || null,
  }));

  // Pobierz portfele do formularza
  const decryptedWallets = (wallets || []).map(w => ({
    ...w,
    name: decryptString(w.name, dek) || w.name,
    balance: 0,
    icon: '',
    type: 'fiat' as const,
  }));

  return { events: decryptedEvents, wallets: decryptedWallets };
}

export async function addCalendarEvent(data: {
  title: string;
  wallet_id: string;
  hourly_rate: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  event_type?: 'work' | 'personal';
  order_id?: string | null;
}) {
  if (!isValidISODate(data.start_time) || !isValidISODate(data.end_time)) throw new Error('Invalid date');
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (data.hourly_rate < 0) throw new Error('Invalid hourly rate');

  const dek = await getDEK();
  const isPersonal = data.event_type === 'personal';

  const { error } = await supabaseAdmin
    .from('calendar_events')
    .insert({
      id: nanoid(),
      user_id: userId,
      title: encryptString(data.title, dek),
      wallet_id: isPersonal ? null : data.wallet_id,
      hourly_rate: isPersonal ? encryptNumber(0, dek) : encryptNumber(data.hourly_rate, dek),
      start_time: data.start_time,
      end_time: data.end_time,
      is_recurring: data.is_recurring,
      recurrence_rule: data.recurrence_rule,
      event_type: data.event_type || 'work',
      order_id: data.order_id || null,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding calendar event:', error);
    throw new Error('Failed to add calendar event');
  }

  revalidatePath('/', 'layout');
}

export async function editCalendarEvent(id: string, data: {
  title: string;
  wallet_id: string;
  hourly_rate: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  event_type?: 'work' | 'personal';
  order_id?: string | null;
}) {
  if (!isValidISODate(data.start_time) || !isValidISODate(data.end_time)) throw new Error('Invalid date');
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: event } = await supabaseAdmin
    .from('calendar_events')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!event || event.user_id !== userId) return;

  const dek = await getDEK();
  const isPersonal = data.event_type === 'personal';

  await supabaseAdmin
    .from('calendar_events')
    .update({
      title: encryptString(data.title, dek),
      wallet_id: isPersonal ? null : data.wallet_id,
      hourly_rate: isPersonal ? encryptNumber(0, dek) : encryptNumber(data.hourly_rate, dek),
      start_time: data.start_time,
      end_time: data.end_time,
      is_recurring: data.is_recurring,
      recurrence_rule: data.recurrence_rule,
      event_type: data.event_type || 'work',
      order_id: data.order_id || null,
    })
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function moveCalendarEvent(id: string, start_time: string, end_time: string) {
  if (!isValidISODate(start_time) || !isValidISODate(end_time)) throw new Error('Invalid date');
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: event } = await supabaseAdmin
    .from('calendar_events')
    .select('user_id, google_event_id, is_recurring')
    .eq('id', id)
    .single();

  // DEBUG: remove after fixing
  console.log('[SERVER MOVE DEBUG]', { id, start_time, end_time, eventFound: !!event, eventData: event });

  if (!event || event.user_id !== userId) {
    console.log('[SERVER MOVE DEBUG] → SKIPPED: event not found or wrong user');
    return;
  }
  if (event.google_event_id || event.is_recurring) {
    console.log('[SERVER MOVE DEBUG] → SKIPPED: google_event_id or is_recurring', {
      google_event_id: event.google_event_id,
      is_recurring: event.is_recurring,
    });
    return;
  }

  console.log('[SERVER MOVE DEBUG] → SAVING to DB');
  await supabaseAdmin
    .from('calendar_events')
    .update({ start_time, end_time })
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function moveRecurringEvent(
  id: string,
  newStartTime: string,
  newEndTime: string,
  mode: 'all' | 'this'
) {
  if (!isValidISODate(newStartTime) || !isValidISODate(newEndTime)) throw new Error('Invalid date');
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const parsedInstance = parseInstanceId(id);
  const parentId = parsedInstance ? parsedInstance.parentId : id;

  const { data: parent } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('id', parentId)
    .eq('user_id', userId)
    .single();

  if (!parent) throw new Error('Event not found');

  if (mode === 'all') {
    // Update parent's date and time to match the new position
    // For weekly: this changes the day-of-week anchor
    // For daily/monthly: this changes the date anchor
    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);

    // If dragged from an expanded instance, shift the parent's date
    // to match the new day while preserving the original creation week offset
    if (parsedInstance) {
      const origStart = new Date(parent.start_time);
      const origEnd = new Date(parent.end_time);
      const durationMs = origEnd.getTime() - origStart.getTime();
      // Shift parent date by the same day-of-week delta
      const instanceOrigDate = new Date(parsedInstance.dateStr + 'T00:00:00Z');
      const dayDelta = Math.round((newStart.getTime() - instanceOrigDate.getTime()) / 86400000);
      const shiftedStart = new Date(origStart);
      shiftedStart.setUTCDate(shiftedStart.getUTCDate() + dayDelta);
      shiftedStart.setUTCHours(newStart.getUTCHours(), newStart.getUTCMinutes(), 0, 0);
      const shiftedEnd = new Date(shiftedStart.getTime() + durationMs);
      await supabaseAdmin
        .from('calendar_events')
        .update({ start_time: shiftedStart.toISOString(), end_time: shiftedEnd.toISOString() })
        .eq('id', parentId);
    } else {
      // Moving the parent directly — just use new times
      await supabaseAdmin
        .from('calendar_events')
        .update({ start_time: newStartTime, end_time: newEndTime })
        .eq('id', parentId);
    }
  } else {
    // "this" mode — materialize this specific instance
    if (parsedInstance) {
      const { data: existing } = await supabaseAdmin
        .from('calendar_events')
        .select('id')
        .eq('id', id)
        .single();

      if (existing) {
        await supabaseAdmin
          .from('calendar_events')
          .update({ start_time: newStartTime, end_time: newEndTime })
          .eq('id', id);
      } else {
        await supabaseAdmin
          .from('calendar_events')
          .insert({
            id,
            user_id: userId,
            title: parent.title,
            wallet_id: parent.wallet_id,
            hourly_rate: parent.hourly_rate,
            start_time: newStartTime,
            end_time: newEndTime,
            is_recurring: false,
            recurrence_rule: null,
            is_settled: false,
            is_confirmed: false,
            event_type: parent.event_type || 'work',
            created_at: new Date().toISOString(),
          });
      }
    } else {
      // Moving the parent directly (unlikely in UI but safe fallback)
      await supabaseAdmin
        .from('calendar_events')
        .update({ start_time: newStartTime, end_time: newEndTime })
        .eq('id', parentId);
    }
  }

  revalidatePath('/', 'layout');
}

export async function deleteCalendarEvent(id: string, reverseTransaction = false) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: event } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .single();

  if (!event || event.user_id !== userId) return;

  // Reverse the wallet balance if requested (settled event)
  if (reverseTransaction && event.is_settled && event.wallet_id) {
    const dek = await getDEK();
    const hourlyRate = decryptNumber(event.hourly_rate, dek);
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const earnings = hours * hourlyRate;

    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('id', event.wallet_id)
      .single();

    if (wallet) {
      const currentBalance = decryptNumber(wallet.balance, dek);
      await supabaseAdmin
        .from('wallets')
        .update({ balance: encryptNumber(currentBalance - earnings, dek) })
        .eq('id', event.wallet_id);

      // Create a reversal transaction
      const eventDate = event.start_time.split('T')[0];
      await supabaseAdmin
        .from('transactions')
        .insert({
          id: nanoid(),
          amount: encryptNumber(-earnings, dek),
          category: encryptString('Praca', dek),
          description: encryptString(`Cofnięcie rozliczenia: ${decryptString(event.title, dek)}`, dek),
          type: 'outcome',
          date: eventDate,
          wallet_id: event.wallet_id,
          currency: 'PLN',
          created_at: new Date().toISOString(),
        });
    }
  }

  await supabaseAdmin
    .from('calendar_events')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function editRecurringInstance(instanceId: string, data: {
  title: string;
  wallet_id: string;
  hourly_rate: number;
  event_type?: 'work' | 'personal';
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const parsed = parseInstanceId(instanceId);
  if (!parsed) throw new Error('Invalid instance ID');
  const { parentId } = parsed;
  const dek = await getDEK();
  const isPersonal = data.event_type === 'personal';

  // Check if instance is already materialized
  const { data: existing } = await supabaseAdmin
    .from('calendar_events')
    .select('id, user_id')
    .eq('id', instanceId)
    .single();

  if (existing) {
    if (existing.user_id !== userId) return;
    // Update the materialized instance
    await supabaseAdmin
      .from('calendar_events')
      .update({
        title: encryptString(data.title, dek),
        wallet_id: isPersonal ? null : data.wallet_id,
        hourly_rate: isPersonal ? encryptNumber(0, dek) : encryptNumber(data.hourly_rate, dek),
        event_type: data.event_type || 'work',
      })
      .eq('id', instanceId);
  } else {
    // Materialize from parent, then apply edits
    const { data: parent } = await supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('id', parentId)
      .eq('user_id', userId)
      .single();

    if (!parent) return;

    const dateStr = parsed.dateStr;
    const origStart = new Date(parent.start_time);
    const origEnd = new Date(parent.end_time);
    const durationMs = origEnd.getTime() - origStart.getTime();

    const instanceStart = new Date(dateStr + 'T00:00:00Z');
    instanceStart.setUTCHours(origStart.getUTCHours(), origStart.getUTCMinutes(), origStart.getUTCSeconds(), 0);
    const instanceEnd = new Date(instanceStart.getTime() + durationMs);

    await supabaseAdmin
      .from('calendar_events')
      .insert({
        id: instanceId,
        user_id: userId,
        title: encryptString(data.title, dek),
        wallet_id: isPersonal ? null : data.wallet_id,
        hourly_rate: isPersonal ? encryptNumber(0, dek) : encryptNumber(data.hourly_rate, dek),
        start_time: instanceStart.toISOString(),
        end_time: instanceEnd.toISOString(),
        is_recurring: false,
        recurrence_rule: null,
        is_settled: false,
        is_confirmed: false,
        event_type: data.event_type || 'work',
        created_at: new Date().toISOString(),
      });
  }

  revalidatePath('/', 'layout');
}

export async function deleteRecurringInstance(instanceId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const parsed = parseInstanceId(instanceId);
  if (!parsed) throw new Error('Invalid instance ID');

  const { data: existing } = await supabaseAdmin
    .from('calendar_events')
    .select('id, user_id')
    .eq('id', instanceId)
    .single();

  if (existing && existing.user_id === userId) {
    // Materialized instance — delete it and insert exclusion marker
    await supabaseAdmin
      .from('calendar_events')
      .delete()
      .eq('id', instanceId)
      .eq('user_id', userId);
  }

  // Insert exclusion marker so expansion doesn't regenerate this instance.
  // mergeWithExpanded deduplicates by ID, so this blocks the virtual instance.
  const { parentId } = parsed;
  const { data: parent } = await supabaseAdmin
    .from('calendar_events')
    .select('start_time, end_time, title, wallet_id, hourly_rate, event_type')
    .eq('id', parentId)
    .eq('user_id', userId)
    .single();

  if (parent) {
    const origStart = new Date(parent.start_time);
    const origEnd = new Date(parent.end_time);
    const durationMs = origEnd.getTime() - origStart.getTime();
    const instanceStart = new Date(parsed.dateStr + 'T00:00:00Z');
    instanceStart.setUTCHours(origStart.getUTCHours(), origStart.getUTCMinutes(), origStart.getUTCSeconds(), 0);
    const instanceEnd = new Date(instanceStart.getTime() + durationMs);

    await supabaseAdmin
      .from('calendar_events')
      .insert({
        id: instanceId,
        user_id: userId,
        title: parent.title,
        wallet_id: parent.wallet_id,
        hourly_rate: parent.hourly_rate,
        start_time: instanceStart.toISOString(),
        end_time: instanceEnd.toISOString(),
        is_recurring: false,
        recurrence_rule: 'EXCLUDED',
        is_settled: false,
        is_confirmed: false,
        event_type: parent.event_type || 'work',
        created_at: new Date().toISOString(),
      });
  }

  revalidatePath('/', 'layout');
}

/**
 * Delete a recurring instance and all future instances from a given date.
 * Stops recurrence by deleting the parent event and keeping only past materialized instances.
 */
export async function deleteRecurringFromDate(instanceId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const parsed = parseInstanceId(instanceId);
  if (!parsed) throw new Error('Invalid instance ID');
  const { parentId, dateStr } = parsed;

  // Verify parent belongs to user
  const { data: parent } = await supabaseAdmin
    .from('calendar_events')
    .select('id, user_id')
    .eq('id', parentId)
    .eq('user_id', userId)
    .single();

  if (!parent) return;

  // Delete all materialized instances from this date onwards (including EXCLUDED markers)
  await supabaseAdmin
    .from('calendar_events')
    .delete()
    .like('id', `${parentId}_%`)
    .eq('user_id', userId)
    .gte('start_time', `${dateStr}T00:00:00Z`);

  // Delete the parent (stops all future expansion)
  await supabaseAdmin
    .from('calendar_events')
    .delete()
    .eq('id', parentId)
    .eq('user_id', userId);

  revalidatePath('/calendar', 'page');
}

/**
 * Get info about settled instances for a recurring parent event.
 * Used to show the user how many events are settled before deleting all.
 */
export async function getRecurringSettledInfo(parentId: string): Promise<{ count: number; totalAmount: number }> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: instances } = await supabaseAdmin
    .from('calendar_events')
    .select('hourly_rate, start_time, end_time')
    .like('id', `${parentId}_%`)
    .eq('user_id', userId)
    .eq('is_settled', true)
    .neq('recurrence_rule', 'EXCLUDED');

  if (!instances || instances.length === 0) return { count: 0, totalAmount: 0 };

  const dek = await getDEK();
  let totalAmount = 0;
  for (const inst of instances) {
    const rate = decryptNumber(inst.hourly_rate, dek);
    const start = new Date(inst.start_time);
    const end = new Date(inst.end_time);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    totalAmount += hours * rate;
  }

  return { count: instances.length, totalAmount: Math.round(totalAmount * 100) / 100 };
}

/**
 * Delete all instances of a recurring event (parent + all materialized instances).
 * Optionally reverses transactions for settled instances.
 */
export async function deleteAllRecurring(parentId: string, reverseTransactions: boolean) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // Verify parent belongs to user
  const { data: parent } = await supabaseAdmin
    .from('calendar_events')
    .select('id, user_id')
    .eq('id', parentId)
    .eq('user_id', userId)
    .single();

  if (!parent) return;

  if (reverseTransactions) {
    // Find all settled materialized instances
    const { data: settledInstances } = await supabaseAdmin
      .from('calendar_events')
      .select('*')
      .like('id', `${parentId}_%`)
      .eq('user_id', userId)
      .eq('is_settled', true)
      .neq('recurrence_rule', 'EXCLUDED');

    if (settledInstances && settledInstances.length > 0) {
      const dek = await getDEK();

      for (const inst of settledInstances) {
        if (inst.wallet_id) {
          await reverseSettledEvent({
            wallet_id: inst.wallet_id,
            hourly_rate: inst.hourly_rate,
            start_time: inst.start_time,
            end_time: inst.end_time,
            title: inst.title,
          });
        }
      }
    }
  }

  // Delete all materialized instances (including EXCLUDED markers)
  await supabaseAdmin
    .from('calendar_events')
    .delete()
    .like('id', `${parentId}_%`)
    .eq('user_id', userId);

  // Delete the parent event
  await supabaseAdmin
    .from('calendar_events')
    .delete()
    .eq('id', parentId)
    .eq('user_id', userId);

  revalidatePath('/calendar', 'page');
  revalidatePath('/wallets', 'page');
}

export async function toggleEventConfirmed(id: string, confirmed: boolean, reverseTransaction = false) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // Check if this is a recurring instance (id_YYYY-MM-DD)
  const parsedInstance = parseInstanceId(id);

  if (parsedInstance) {
    // Recurring instance — we need to materialize it as a real record
    const parentId = parsedInstance.parentId;

    const { data: parent } = await supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('id', parentId)
      .eq('user_id', userId)
      .single();

    if (!parent) return;

    if (confirmed) {
      // Check if already materialized
      const { data: existing } = await supabaseAdmin
        .from('calendar_events')
        .select('id')
        .eq('id', id)
        .single();

      if (existing) {
        // Already exists — just update
        await supabaseAdmin
          .from('calendar_events')
          .update({ is_confirmed: true })
          .eq('id', id);
      } else {
        // Parse instance date from the ID suffix
        const dateStr = parsedInstance.dateStr;
        const origStart = new Date(parent.start_time);
        const origEnd = new Date(parent.end_time);
        const durationMs = origEnd.getTime() - origStart.getTime();

        const instanceStart = new Date(dateStr + 'T00:00:00Z');
        instanceStart.setUTCHours(origStart.getUTCHours(), origStart.getUTCMinutes(), origStart.getUTCSeconds(), 0);
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);

        // Materialize as a non-recurring confirmed event
        await supabaseAdmin
          .from('calendar_events')
          .insert({
            id,
            user_id: userId,
            title: parent.title,
            wallet_id: parent.wallet_id,
            hourly_rate: parent.hourly_rate,
            start_time: instanceStart.toISOString(),
            end_time: instanceEnd.toISOString(),
            is_recurring: false,
            recurrence_rule: null,
            is_settled: false,
            is_confirmed: true,
            event_type: parent.event_type || 'work',
            created_at: new Date().toISOString(),
          });
      }
    } else {
      // Unconfirm — check if we need to reverse transaction
      const { data: existing } = await supabaseAdmin
        .from('calendar_events')
        .select('*')
        .eq('id', id)
        .single();

      if (existing) {
        if (reverseTransaction && existing.is_settled && existing.wallet_id) {
          await reverseSettledEvent(existing);
        }

        await supabaseAdmin
          .from('calendar_events')
          .update({ is_confirmed: false, is_settled: false })
          .eq('id', id)
          .eq('user_id', userId);
      }
    }
  } else {
    // Regular (non-recurring) event
    if (confirmed) {
      // Simple confirm — no need to fetch first
      await supabaseAdmin
        .from('calendar_events')
        .update({ is_confirmed: true })
        .eq('id', id)
        .eq('user_id', userId);
    } else {
      // Need event data only when reversing settled transaction
      if (reverseTransaction) {
        const { data: event } = await supabaseAdmin
          .from('calendar_events')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (!event) return;

        if (event.is_settled && event.wallet_id) {
          await reverseSettledEvent(event);
        }
      }

      await supabaseAdmin
        .from('calendar_events')
        .update({ is_confirmed: false, is_settled: false })
        .eq('id', id)
        .eq('user_id', userId);
    }
  }

  revalidatePath('/calendar', 'page');
}

async function reverseSettledEvent(event: { wallet_id: string; hourly_rate: string; start_time: string; end_time: string; title: string }) {
  const dek = await getDEK();
  const hourlyRate = decryptNumber(event.hourly_rate, dek);
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const earnings = hours * hourlyRate;

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance')
    .eq('id', event.wallet_id)
    .single();

  if (wallet) {
    const currentBalance = decryptNumber(wallet.balance, dek);
    await supabaseAdmin
      .from('wallets')
      .update({ balance: encryptNumber(currentBalance - earnings, dek) })
      .eq('id', event.wallet_id);

    const eventDate = event.start_time.split('T')[0];
    await supabaseAdmin
      .from('transactions')
      .insert({
        id: nanoid(),
        amount: encryptNumber(-earnings, dek),
        category: encryptString('Praca', dek),
        description: encryptString(`Cofnięcie rozliczenia: ${decryptString(event.title, dek)}`, dek),
        type: 'outcome',
        date: eventDate,
        wallet_id: event.wallet_id,
        currency: 'PLN',
        created_at: new Date().toISOString(),
      });
  }
}

export async function settleWeekAction(weekStart: string, weekEnd: string) {
  if (!isValidISODate(weekStart) || !isValidISODate(weekEnd)) throw new Error('Invalid date range');
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();
  const rates = await getExchangeRates();

  // Pobierz potwierdzone ale niezatwierdzone eventy z tego tygodnia (tylko work)
  const { data: events, error } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .eq('is_confirmed', true)
    .eq('is_settled', false)
    .lte('start_time', weekEnd)
    .gte('end_time', weekStart);

  if (error || !events || events.length === 0) return { settled: 0 };

  // Filter out personal events — only settle work events
  const workEvents = events.filter(e => (e.event_type || 'work') === 'work');
  if (workEvents.length === 0) return { settled: 0 };

  const filteredEvents = workEvents.filter(event => !!event.wallet_id);

  if (filteredEvents.length === 0) return { settled: 0 };

  // Grupuj zarobki per portfel
  const walletEarnings = new Map<string, number>();

  for (const event of filteredEvents) {
    if (!event.wallet_id) continue;
    const hourlyRate = decryptNumber(event.hourly_rate, dek);
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const earnings = hours * hourlyRate;

    walletEarnings.set(
      event.wallet_id,
      (walletEarnings.get(event.wallet_id) || 0) + earnings
    );
  }

  // Najpierw oznacz eventy jako settled (zapobiega podwójnemu rozliczeniu)
  const eventIds = filteredEvents.map(e => e.id);
  await supabaseAdmin
    .from('calendar_events')
    .update({ is_settled: true })
    .in('id', eventIds);

  // Stwórz transakcje income i zaktualizuj salda — każdy portfel niezależnie, równolegle
  await Promise.all(Array.from(walletEarnings.entries()).map(async ([walletId, totalEarnings]) => {
    await supabaseAdmin
      .from('transactions')
      .insert({
        id: nanoid(),
        amount: encryptNumber(totalEarnings, dek),
        category: encryptString('Praca', dek),
        description: encryptString(`Zarobki za tydzień ${weekStart.split('T')[0]}`, dek),
        type: 'income',
        date: weekStart.split('T')[0],
        wallet_id: walletId,
        currency: 'PLN',
        created_at: new Date().toISOString(),
      });

    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('id', walletId)
      .single();

    if (!wallet) return;

    const currentBalance = decryptNumber(wallet.balance, dek);
    const { error: updateError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: encryptNumber(currentBalance + totalEarnings, dek) })
      .eq('id', walletId);

    if (updateError) {
      console.error(`Settlement balance update failed for wallet ${walletId}:`, updateError);
    }
  }));

  revalidatePath('/', 'layout');
  return { settled: filteredEvents.length };
}

export async function getWeeklySummary(weekStart: string, weekEnd: string) {
  if (!isValidISODate(weekStart) || !isValidISODate(weekEnd)) throw new Error('Invalid date range');
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);
  const prevWeekEnd = new Date(weekEnd);
  prevWeekEnd.setUTCDate(prevWeekEnd.getUTCDate() - 7);

  // Fetch current week events, previous week events, recurring events, and wallets in parallel
  const [{ data: events }, { data: prevEvents }, { data: recurringEvents }, { data: wallets }] = await Promise.all([
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .lte('start_time', weekEnd)
      .gte('end_time', weekStart),
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .lte('start_time', prevWeekEnd.toISOString())
      .gte('end_time', prevWeekStart.toISOString()),
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .lt('start_time', weekEnd),
    supabaseAdmin
      .from('wallets')
      .select('id, name, color')
      .eq('user_id', userId),
  ]);

  // Expand recurring events for current and previous week, filter out excluded
  const expandedCurrent = expandRecurringEvents(recurringEvents || [], weekStart, weekEnd);
  const allCurrentEvents = mergeWithExpanded(events || [], expandedCurrent).filter(e => e.recurrence_rule !== 'EXCLUDED');

  const expandedPrev = expandRecurringEvents(recurringEvents || [], prevWeekStart.toISOString(), prevWeekEnd.toISOString());
  const allPrevEvents = mergeWithExpanded(prevEvents || [], expandedPrev).filter(e => e.recurrence_rule !== 'EXCLUDED');

  const walletMap = new Map(
    (wallets || []).map(w => [w.id, { name: decryptString(w.name, dek) || w.name, color: w.color }])
  );

  const calcEarnings = (evts: typeof events) => {
    let total = 0;
    let totalHours = 0;
    const byWallet = new Map<string, { name: string; color: string; earnings: number; hours: number }>();

    for (const e of evts || []) {
      if ((e.event_type || 'work') !== 'work') continue;
      const rate = decryptNumber(e.hourly_rate, dek);
      const hours = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
      const earnings = hours * rate;
      total += earnings;
      totalHours += hours;

      if (e.wallet_id) {
        const wallet = walletMap.get(e.wallet_id);
        const existing = byWallet.get(e.wallet_id) || {
          name: wallet?.name || '',
          color: wallet?.color || '',
          earnings: 0,
          hours: 0,
        };
        existing.earnings += earnings;
        existing.hours += hours;
        byWallet.set(e.wallet_id, existing);
      }
    }

    return { total, totalHours, byWallet: Array.from(byWallet.entries()).map(([id, data]) => ({ id, ...data })) };
  };

  const workEvents = allCurrentEvents.filter(e => (e.event_type || 'work') === 'work');
  const confirmedEvents = workEvents.filter(e => e.is_confirmed);
  const current = calcEarnings(confirmedEvents);
  const prevWorkEvents = allPrevEvents.filter(e => (e.event_type || 'work') === 'work');
  const prevConfirmedEvents = prevWorkEvents.filter(e => e.is_confirmed);
  const previous = calcEarnings(prevConfirmedEvents);
  const confirmedCount = confirmedEvents.length;
  const unsettledCount = confirmedEvents.filter(e => !e.is_settled).length;

  return {
    totalEarnings: current.total,
    totalHours: current.totalHours,
    byWallet: current.byWallet,
    previousWeekEarnings: previous.total,
    previousWeekHours: previous.totalHours,
    unsettledCount,
    confirmedCount,
    eventCount: workEvents.length,
  };
}

export async function getMonthlySummary(monthStart: string, monthEnd: string) {
  if (!isValidISODate(monthStart) || !isValidISODate(monthEnd)) throw new Error('Invalid date range');
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  // Safe previous month calculation — setMonth() fails at month boundaries (e.g. Mar 31 → Mar 3 instead of Feb 28)
  const msDate = new Date(monthStart);
  const prevMonthStart = new Date(msDate.getFullYear(), msDate.getMonth() - 1, 1);
  const prevMonthEnd = new Date(msDate.getFullYear(), msDate.getMonth(), 0, 23, 59, 59, 999);

  // Fetch current month events, previous month events, recurring events, and wallets in parallel
  const [{ data: events }, { data: prevEvents }, { data: recurringEvents }, { data: wallets }] = await Promise.all([
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .lte('start_time', monthEnd)
      .gte('end_time', monthStart),
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .lte('start_time', prevMonthEnd.toISOString())
      .gte('end_time', prevMonthStart.toISOString()),
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .lt('start_time', monthEnd),
    supabaseAdmin
      .from('wallets')
      .select('id, name, color')
      .eq('user_id', userId),
  ]);

  // Expand recurring events for current and previous month, filter out excluded
  const expandedCurrent = expandRecurringEvents(recurringEvents || [], monthStart, monthEnd);
  const allCurrentEvents = mergeWithExpanded(events || [], expandedCurrent).filter(e => e.recurrence_rule !== 'EXCLUDED');

  const expandedPrev = expandRecurringEvents(recurringEvents || [], prevMonthStart.toISOString(), prevMonthEnd.toISOString());
  const allPrevEvents = mergeWithExpanded(prevEvents || [], expandedPrev).filter(e => e.recurrence_rule !== 'EXCLUDED');

  const walletMap = new Map(
    (wallets || []).map(w => [w.id, { name: decryptString(w.name, dek) || w.name, color: w.color }])
  );

  const calcEarnings = (evts: typeof events) => {
    let total = 0;
    let totalHours = 0;
    const byWallet = new Map<string, { name: string; color: string; earnings: number; hours: number }>();
    const weeklyBreakdown = new Map<string, number>();

    for (const e of evts || []) {
      if ((e.event_type || 'work') !== 'work') continue;
      const rate = decryptNumber(e.hourly_rate, dek);
      const hours = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
      const earnings = hours * rate;
      total += earnings;
      totalHours += hours;

      // Weekly breakdown
      const eventDate = new Date(e.start_time);
      const weekNum = getISOWeekLabel(eventDate);
      weeklyBreakdown.set(weekNum, (weeklyBreakdown.get(weekNum) || 0) + earnings);

      if (e.wallet_id) {
        const wallet = walletMap.get(e.wallet_id);
        const existing = byWallet.get(e.wallet_id) || {
          name: wallet?.name || '',
          color: wallet?.color || '',
          earnings: 0,
          hours: 0,
        };
        existing.earnings += earnings;
        existing.hours += hours;
        byWallet.set(e.wallet_id, existing);
      }
    }

    return {
      total,
      totalHours,
      byWallet: Array.from(byWallet.entries()).map(([id, data]) => ({ id, ...data })),
      weeklyBreakdown: Array.from(weeklyBreakdown.entries())
        .map(([week, earnings]) => ({ week, earnings }))
        .sort((a, b) => a.week.localeCompare(b.week)),
    };
  };

  const workMonthEvts = allCurrentEvents.filter(e => (e.event_type || 'work') === 'work');
  const confirmedEvents = workMonthEvts.filter(e => e.is_confirmed);
  const current = calcEarnings(confirmedEvents);
  const prevWorkEvents = allPrevEvents.filter(e => (e.event_type || 'work') === 'work');
  const prevConfirmedEvents = prevWorkEvents.filter(e => e.is_confirmed);
  const previous = calcEarnings(prevConfirmedEvents);
  const confirmedCount = confirmedEvents.length;
  const unsettledCount = confirmedEvents.filter(e => !e.is_settled).length;

  return {
    totalEarnings: current.total,
    totalHours: current.totalHours,
    byWallet: current.byWallet,
    weeklyBreakdown: current.weeklyBreakdown,
    previousPeriodEarnings: previous.total,
    previousPeriodHours: previous.totalHours,
    unsettledCount,
    confirmedCount,
    eventCount: workMonthEvts.length,
  };
}

function getISOWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const week1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7);
  return `Tydzień ${weekNum}`;
}

export async function settleMonthAction(monthStart: string, monthEnd: string) {
  if (!isValidISODate(monthStart) || !isValidISODate(monthEnd)) throw new Error('Invalid date range');
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  const { data: events, error } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .eq('is_confirmed', true)
    .eq('is_settled', false)
    .lte('start_time', monthEnd)
    .gte('end_time', monthStart);

  if (error || !events || events.length === 0) return { settled: 0 };

  // Filter out personal events — only settle work events
  const workMonthEvents = events.filter(e => (e.event_type || 'work') === 'work');
  if (workMonthEvents.length === 0) return { settled: 0 };

  const filteredMonthEvents = workMonthEvents.filter(event => !!event.wallet_id);

  if (filteredMonthEvents.length === 0) return { settled: 0 };

  const walletEarnings = new Map<string, number>();

  for (const event of filteredMonthEvents) {
    if (!event.wallet_id) continue;
    const hourlyRate = decryptNumber(event.hourly_rate, dek);
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const earnings = hours * hourlyRate;

    walletEarnings.set(
      event.wallet_id,
      (walletEarnings.get(event.wallet_id) || 0) + earnings
    );
  }

  // Najpierw oznacz eventy jako settled (zapobiega podwójnemu rozliczeniu)
  const eventIds = filteredMonthEvents.map(e => e.id);
  await supabaseAdmin
    .from('calendar_events')
    .update({ is_settled: true })
    .in('id', eventIds);

  // Stwórz transakcje income i zaktualizuj salda — każdy portfel niezależnie, równolegle
  await Promise.all(Array.from(walletEarnings.entries()).map(async ([walletId, totalEarnings]) => {
    await supabaseAdmin
      .from('transactions')
      .insert({
        id: nanoid(),
        amount: encryptNumber(totalEarnings, dek),
        category: encryptString('Praca', dek),
        description: encryptString(`Zarobki za miesiąc ${monthStart.split('T')[0].slice(0, 7)}`, dek),
        type: 'income',
        date: monthStart.split('T')[0],
        wallet_id: walletId,
        currency: 'PLN',
        created_at: new Date().toISOString(),
      });

    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('id', walletId)
      .single();

    if (!wallet) return;

    const currentBalance = decryptNumber(wallet.balance, dek);
    const { error: updateError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: encryptNumber(currentBalance + totalEarnings, dek) })
      .eq('id', walletId);

    if (updateError) {
      console.error(`Settlement balance update failed for wallet ${walletId}:`, updateError);
    }
  }));

  revalidatePath('/', 'layout');
  return { settled: filteredMonthEvents.length };
}

export async function getUnsettledCount() {
  const userId = await getUserId();
  if (!userId) return 0;

  const { count } = await supabaseAdmin
    .from('calendar_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_confirmed', true)
    .eq('is_settled', false)
    .neq('event_type', 'personal');

  return count || 0;
}

export async function settleAllUnsettledAction() {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  const { data: events, error } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .eq('is_confirmed', true)
    .eq('is_settled', false);

  if (error || !events || events.length === 0) return { settled: 0 };

  const workEvents = events.filter(e => (e.event_type || 'work') === 'work');
  if (workEvents.length === 0) return { settled: 0 };

  const filteredEvents = workEvents.filter(event => !!event.wallet_id);
  if (filteredEvents.length === 0) return { settled: 0 };

  const walletEarnings = new Map<string, number>();

  for (const event of filteredEvents) {
    if (!event.wallet_id) continue;
    const hourlyRate = decryptNumber(event.hourly_rate, dek);
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const earnings = hours * hourlyRate;

    walletEarnings.set(
      event.wallet_id,
      (walletEarnings.get(event.wallet_id) || 0) + earnings
    );
  }

  const eventIds = filteredEvents.map(e => e.id);
  await supabaseAdmin
    .from('calendar_events')
    .update({ is_settled: true })
    .in('id', eventIds);

  const today = new Date().toISOString().split('T')[0];

  await Promise.all(Array.from(walletEarnings.entries()).map(async ([walletId, totalEarnings]) => {
    await supabaseAdmin
      .from('transactions')
      .insert({
        id: nanoid(),
        amount: encryptNumber(totalEarnings, dek),
        category: encryptString('Praca', dek),
        description: encryptString(`Zarobki zatwierdzone ${today}`, dek),
        type: 'income',
        date: today,
        wallet_id: walletId,
        currency: 'PLN',
        created_at: new Date().toISOString(),
      });

    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('id', walletId)
      .single();

    if (!wallet) return;

    const currentBalance = decryptNumber(wallet.balance, dek);
    const { error: updateError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: encryptNumber(currentBalance + totalEarnings, dek) })
      .eq('id', walletId);

    if (updateError) {
      console.error(`Settlement balance update failed for wallet ${walletId}:`, updateError);
    }
  }));

  revalidatePath('/calendar', 'page');
  revalidatePath('/wallets', 'page');
  return { settled: filteredEvents.length, settledIds: eventIds };
}

// --- YAHOO FINANCE ---

export async function searchYahooFinance(query: string): Promise<{ symbol: string; name: string; exchange: string; type: string }[]> {
  // Limit długości query
  if (typeof query !== 'string' || query.length > 100) return [];
  const sanitizedQuery = query.trim().slice(0, 100);
  if (!sanitizedQuery) return [];

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(sanitizedQuery)}&quotesCount=8&newsCount=0&listsCount=0`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.quotes || [])
      .filter((q: { quoteType: string }) => ['EQUITY', 'ETF', 'FUTURE', 'INDEX', 'COMMODITY'].includes(q.quoteType))
      .map((q: { symbol: string; shortname?: string; longname?: string; exchange?: string; quoteType?: string }) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchange || '',
        type: q.quoteType || 'EQUITY',
      }));
  } catch {
    return [];
  }
}

export async function fetchYahooQuotes(symbols: string[]): Promise<{ symbol: string; price: number; change: number; currency: string }[]> {
  const results: { symbol: string; price: number; change: number; currency: string }[] = [];
  // Limit do 20 symboli na raz
  const limitedSymbols = symbols.slice(0, 20);
  for (const symbol of limitedSymbols) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const meta = data.chart?.result?.[0]?.meta;
      if (!meta) continue;
      const price = meta.regularMarketPrice || 0;
      const prevClose = meta.chartPreviousClose || price;
      const change = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
      results.push({ symbol, price, change, currency: meta.currency || 'USD' });
    } catch {
      // skip failed symbol
    }
  }
  return results;
}

// --- AKTYWA CRUD ---

export async function addAssetAction(data: {
  name: string;
  symbol: string;
  coingecko_id: string;
  quantity: number;
  cost_basis?: number;
  asset_type?: 'crypto' | 'stock';
  wallet_id?: string;
  deduct_from_wallet?: boolean;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();
  const assetType = data.asset_type || 'crypto';

  let currentPrice = 0;
  let change24h = 0;

  // Sanityzacja identyfikatorów zewnętrznych API
  const safeCoingeckoId = (data.coingecko_id || '').replace(/[^a-z0-9\-]/gi, '').slice(0, 100);
  const safeSymbol = (data.symbol || '').replace(/[^a-zA-Z0-9.\-^=]/g, '').slice(0, 20);

  if (assetType === 'stock') {
    // Yahoo Finance — price in original currency, convert to PLN
    try {
      const quotes = await fetchYahooQuotes([safeSymbol]);
      if (quotes.length > 0) {
        const q = quotes[0];
        change24h = q.change;
        if (q.currency === 'PLN') {
          currentPrice = q.price;
        } else {
          // Convert to PLN using exchange rates
          const rates = await getExchangeRates();
          const curr = q.currency as Currency;
          if (rates[curr] !== undefined) {
            currentPrice = q.price / rates[curr]; // rates are FROM PLN, so USD price / rates.USD = PLN
          } else {
            // Fallback: assume USD
            currentPrice = q.price / (rates.USD || 0.25);
          }
        }
      }
    } catch {
      // price stays 0
    }
  } else {
    // CoinGecko — price already in PLN
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=pln&ids=${safeCoingeckoId}&sparkline=false&price_change_percentage=24h`
      );
      if (res.ok) {
        const coins = await res.json();
        if (coins.length > 0) {
          currentPrice = coins[0].current_price || 0;
          change24h = coins[0].price_change_percentage_24h || 0;
        }
      }
    } catch {
      // price stays 0
    }
  }

  const totalValue = data.quantity * currentPrice;
  const costBasis = data.cost_basis ?? currentPrice;

  const { error } = await supabaseAdmin
    .from('assets')
    .insert({
      id: nanoid(),
      user_id: userId,
      name: encryptString(data.name, dek),
      symbol: encryptString(safeSymbol, dek),
      coingecko_id: encryptString(safeCoingeckoId, dek),
      quantity: encryptNumber(data.quantity, dek),
      current_price: encryptNumber(currentPrice, dek),
      total_value: encryptNumber(totalValue, dek),
      change_24h: encryptNumber(change24h, dek),
      cost_basis: encryptNumber(costBasis, dek),
      asset_type: assetType,
      wallet_id: data.wallet_id || null,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding asset:', error);
    throw new Error('Failed to add asset');
  }

  // Odejmij kwotę zakupu z portfela i zapisz transakcję
  if (data.deduct_from_wallet && data.wallet_id) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('id', data.wallet_id)
      .eq('user_id', userId)
      .single();

    if (wallet) {
      const purchaseAmount = data.quantity * costBasis;
      const currentBalance = decryptNumber(wallet.balance, dek);
      const newBalance = currentBalance - purchaseAmount;

      await supabaseAdmin
        .from('transactions')
        .insert({
          id: nanoid(),
          amount: encryptNumber(-purchaseAmount, dek),
          category: encryptString('Zakup aktywa', dek),
          description: encryptString(`Zakup ${data.quantity} ${safeSymbol}`, dek),
          type: 'outcome',
          date: new Date().toISOString().split('T')[0],
          wallet_id: data.wallet_id,
          currency: 'PLN',
          created_at: new Date().toISOString(),
        });

      await supabaseAdmin
        .from('wallets')
        .update({ balance: encryptNumber(newBalance, dek) })
        .eq('id', data.wallet_id);
    }
  }

  revalidatePath('/', 'layout');
}

export async function editAssetAction(id: string, data: { quantity: number; cost_basis?: number; wallet_id?: string | null }) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: asset } = await supabaseAdmin
    .from('assets')
    .select('user_id, current_price')
    .eq('id', id)
    .single();

  if (!asset || asset.user_id !== userId) return;

  const dek = await getDEK();
  const currentPrice = decryptNumber(asset.current_price, dek);
  const totalValue = data.quantity * currentPrice;

  const updateData: Record<string, string | null> = {
    quantity: encryptNumber(data.quantity, dek),
    total_value: encryptNumber(totalValue, dek),
  };

  if (data.cost_basis !== undefined) {
    updateData.cost_basis = encryptNumber(data.cost_basis, dek);
  }

  if (data.wallet_id !== undefined) {
    updateData.wallet_id = data.wallet_id || null;
  }

  await supabaseAdmin
    .from('assets')
    .update(updateData)
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function deleteAssetAction(id: string, revertTransaction = false) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  const { data: asset } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('id', id)
    .single();

  if (!asset || asset.user_id !== userId) return;

  // Cofnij transakcję zakupu i przywróć saldo portfela
  if (revertTransaction && asset.wallet_id) {
    const assetSymbol = decryptString(asset.symbol, dek) || '';
    const description = `Zakup ${assetSymbol}`;

    // Szukaj transakcji zakupu po wallet_id, type=outcome, category="Zakup aktywa" i opisie zawierającym symbol
    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('id, amount, description, category')
      .eq('wallet_id', asset.wallet_id)
      .eq('type', 'outcome');

    if (transactions) {
      for (const t of transactions) {
        const desc = decryptString(t.description, dek) || '';
        const cat = decryptString(t.category, dek) || '';
        if (cat === 'Zakup aktywa' && desc.includes(assetSymbol)) {
          // Cofnij saldo
          const { data: wallet } = await supabaseAdmin
            .from('wallets')
            .select('*')
            .eq('id', asset.wallet_id)
            .eq('user_id', userId)
            .single();

          if (wallet) {
            const txAmount = decryptNumber(t.amount, dek);
            const currentBalance = decryptNumber(wallet.balance, dek);
            // txAmount jest ujemny (outcome), więc odejmujemy go (dodajemy z powrotem)
            const newBalance = currentBalance - txAmount;
            await supabaseAdmin
              .from('wallets')
              .update({ balance: encryptNumber(newBalance, dek) })
              .eq('id', asset.wallet_id);
          }

          // Usuń transakcję
          await supabaseAdmin.from('transactions').delete().eq('id', t.id);
          break;
        }
      }
    }
  }

  await supabaseAdmin.from('assets').delete().eq('id', id);

  revalidatePath('/', 'layout');
}

export async function refreshAssetPricesAction() {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  const { data: assets } = await supabaseAdmin
    .from('assets')
    .select('id, coingecko_id, symbol, quantity, asset_type')
    .eq('user_id', userId);

  if (!assets || assets.length === 0) return;

  const assetMap = assets.map(a => ({
    id: a.id,
    coingecko_id: decryptString(a.coingecko_id, dek) || a.coingecko_id || '',
    symbol: decryptString(a.symbol, dek) || a.symbol || '',
    quantity: decryptNumber(a.quantity, dek),
    asset_type: (a.asset_type || 'crypto') as 'crypto' | 'stock',
  }));

  const cryptoAssets = assetMap.filter(a => a.asset_type === 'crypto');
  const stockAssets = assetMap.filter(a => a.asset_type === 'stock');

  // Refresh crypto via CoinGecko
  if (cryptoAssets.length > 0) {
    const ids = cryptoAssets.map(a => a.coingecko_id).filter(Boolean).join(',');
    if (ids) {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=pln&ids=${ids}&sparkline=false&price_change_percentage=24h`
        );
        if (res.ok) {
          const coins = await res.json();
          const priceMap = new Map<string, { price: number; change: number }>(
            coins.map((c: { id: string; current_price: number; price_change_percentage_24h: number }) => [
              c.id,
              { price: c.current_price || 0, change: c.price_change_percentage_24h || 0 },
            ])
          );

          await Promise.all(cryptoAssets.map(asset => {
            const coinData = priceMap.get(asset.coingecko_id);
            if (!coinData) return Promise.resolve();

            const totalValue = asset.quantity * coinData.price;
            return supabaseAdmin
              .from('assets')
              .update({
                current_price: encryptNumber(coinData.price, dek),
                total_value: encryptNumber(totalValue, dek),
                change_24h: encryptNumber(coinData.change, dek),
              })
              .eq('id', asset.id);
          }));
        }
      } catch {
        // Ignoruj błędy API
      }
    }
  }

  // Refresh stocks/ETF/commodities via Yahoo Finance
  if (stockAssets.length > 0) {
    try {
      const symbols = stockAssets.map(a => a.symbol).filter(Boolean);
      const quotes = await fetchYahooQuotes(symbols);
      const rates = await getExchangeRates();

      const quoteMap = new Map(quotes.map(q => [q.symbol, q]));

      await Promise.all(stockAssets.map(asset => {
        const q = quoteMap.get(asset.symbol);
        if (!q) return Promise.resolve();

        let pricePLN: number;
        if (q.currency === 'PLN') {
          pricePLN = q.price;
        } else {
          const curr = q.currency as Currency;
          pricePLN = rates[curr] !== undefined ? q.price / rates[curr] : q.price / (rates.USD || 0.25);
        }

        const totalValue = asset.quantity * pricePLN;
        return supabaseAdmin
          .from('assets')
          .update({
            current_price: encryptNumber(pricePLN, dek),
            total_value: encryptNumber(totalValue, dek),
            change_24h: encryptNumber(q.change, dek),
          })
          .eq('id', asset.id);
      }));
    } catch {
      // Ignoruj błędy API
    }
  }

  revalidatePath('/', 'layout');
}

// --- SPRZEDAŻ AKTYWÓW ---

export async function sellAssetAction(data: {
  assetId: string;
  quantityToSell: number;
  walletId: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  // 1. Pobierz asset i zwaliduj ownership
  const { data: asset } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('id', data.assetId)
    .eq('user_id', userId)
    .single();

  if (!asset) throw new Error('Asset not found');

  const quantity = decryptNumber(asset.quantity, dek);
  const currentPrice = decryptNumber(asset.current_price, dek);
  const costBasis = asset.cost_basis ? decryptNumber(asset.cost_basis, dek) : 0;
  const assetName = decryptString(asset.name, dek) || asset.name;
  const assetSymbol = decryptString(asset.symbol, dek) || asset.symbol;

  if (data.quantityToSell <= 0) {
    throw new Error('Invalid quantity');
  }

  if (data.quantityToSell > quantity) {
    throw new Error('Insufficient quantity');
  }

  // 2. Sprawdź portfel — preferuj wallet_id z aktywa, fallback na podany
  const targetWalletId = asset.wallet_id || data.walletId;
  if (!targetWalletId) throw new Error('No wallet assigned');

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('id', targetWalletId)
    .eq('user_id', userId)
    .single();

  if (!wallet) throw new Error('Wallet not found');

  // 3. Oblicz: proceeds, cost, profit, tax
  const totalProceeds = data.quantityToSell * currentPrice;
  const totalCost = data.quantityToSell * costBasis;
  const profit = totalProceeds - totalCost;
  const taxAmount = Math.max(0, profit) * 0.19;

  // 4. Insert do asset_sales (encrypted)
  const { error: saleError } = await supabaseAdmin
    .from('asset_sales')
    .insert({
      id: nanoid(),
      user_id: userId,
      asset_name: encryptString(assetName, dek),
      asset_symbol: encryptString(assetSymbol, dek),
      quantity_sold: encryptNumber(data.quantityToSell, dek),
      sale_price_per_unit: encryptNumber(currentPrice, dek),
      cost_basis_per_unit: encryptNumber(costBasis, dek),
      total_proceeds: encryptNumber(totalProceeds, dek),
      total_cost: encryptNumber(totalCost, dek),
      profit: encryptNumber(profit, dek),
      tax_amount: encryptNumber(taxAmount, dek),
      wallet_id: targetWalletId,
      sale_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    });

  if (saleError) {
    console.error('Error inserting asset sale:', saleError);
    throw new Error('Failed to record asset sale');
  }

  // 5. Update or delete asset
  const remainingQuantity = quantity - data.quantityToSell;

  if (remainingQuantity <= 0) {
    await supabaseAdmin.from('assets').delete().eq('id', data.assetId);
  } else {
    const newTotalValue = remainingQuantity * currentPrice;
    await supabaseAdmin
      .from('assets')
      .update({
        quantity: encryptNumber(remainingQuantity, dek),
        total_value: encryptNumber(newTotalValue, dek),
      })
      .eq('id', data.assetId);
  }

  // 6. Utwórz transakcję income w wybranym portfelu (pełna kwota przychodu)
  await supabaseAdmin
    .from('transactions')
    .insert({
      id: nanoid(),
      amount: encryptNumber(totalProceeds, dek),
      category: encryptString('Sprzedaż aktywa', dek),
      description: encryptString(
        `Sprzedaż ${data.quantityToSell} ${assetSymbol}`,
        dek
      ),
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      wallet_id: targetWalletId,
      currency: 'PLN',
      created_at: new Date().toISOString(),
    });

  // 7. Zaktualizuj saldo portfela (pełna kwota)
  const currentBalance = decryptNumber(wallet.balance, dek);
  const newBalance = currentBalance + totalProceeds;
  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(newBalance, dek) })
    .eq('id', data.walletId);

  revalidatePath('/', 'layout');
}

export async function getAssetSalesData() {
  const userId = await getUserId();
  if (!userId) return [];

  const dek = await getDEK();

  const { data: sales, error } = await supabaseAdmin
    .from('asset_sales')
    .select('*')
    .eq('user_id', userId)
    .order('sale_date', { ascending: false });

  if (error) {
    console.error('Error fetching asset sales:', error);
    return [];
  }

  return (sales || []).map(s => ({
    id: s.id,
    asset_name: decryptString(s.asset_name, dek) || s.asset_name,
    asset_symbol: decryptString(s.asset_symbol, dek) || s.asset_symbol,
    quantity_sold: decryptNumber(s.quantity_sold, dek),
    sale_price_per_unit: decryptNumber(s.sale_price_per_unit, dek),
    cost_basis_per_unit: decryptNumber(s.cost_basis_per_unit, dek),
    total_proceeds: decryptNumber(s.total_proceeds, dek),
    total_cost: decryptNumber(s.total_cost, dek),
    profit: decryptNumber(s.profit, dek),
    tax_amount: decryptNumber(s.tax_amount, dek),
    wallet_id: s.wallet_id,
    sale_date: s.sale_date,
    tax_paid: s.tax_paid || false,
  }));
}

export async function getAssetTaxSummary(year: number) {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data: sales, error } = await supabaseAdmin
    .from('asset_sales')
    .select('*')
    .eq('user_id', userId)
    .gte('sale_date', startDate)
    .lte('sale_date', endDate);

  if (error) {
    console.error('Error fetching tax summary:', error);
    return null;
  }

  let totalProceeds = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let totalTax = 0;
  let unpaidTax = 0;

  for (const s of sales || []) {
    const taxAmt = decryptNumber(s.tax_amount, dek);
    totalProceeds += decryptNumber(s.total_proceeds, dek);
    totalCost += decryptNumber(s.total_cost, dek);
    totalProfit += decryptNumber(s.profit, dek);
    totalTax += taxAmt;
    if (!s.tax_paid) {
      unpaidTax += taxAmt;
    }
  }

  return {
    totalProceeds,
    totalCost,
    totalProfit,
    totalTax,
    unpaidTax,
    salesCount: (sales || []).length,
  };
}

export async function addManualSaleAction(data: {
  assetName: string;
  assetSymbol: string;
  quantitySold: number;
  salePricePerUnit: number;
  costBasisPerUnit: number;
  walletId: string;
  saleDate: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  const totalProceeds = data.quantitySold * data.salePricePerUnit;
  const totalCost = data.quantitySold * data.costBasisPerUnit;
  const profit = totalProceeds - totalCost;
  const taxAmount = Math.max(0, profit) * 0.19;

  const { error: saleError } = await supabaseAdmin
    .from('asset_sales')
    .insert({
      id: nanoid(),
      user_id: userId,
      asset_name: encryptString(data.assetName, dek),
      asset_symbol: encryptString(data.assetSymbol, dek),
      quantity_sold: encryptNumber(data.quantitySold, dek),
      sale_price_per_unit: encryptNumber(data.salePricePerUnit, dek),
      cost_basis_per_unit: encryptNumber(data.costBasisPerUnit, dek),
      total_proceeds: encryptNumber(totalProceeds, dek),
      total_cost: encryptNumber(totalCost, dek),
      profit: encryptNumber(profit, dek),
      tax_amount: encryptNumber(taxAmount, dek),
      wallet_id: data.walletId,
      sale_date: data.saleDate,
      created_at: new Date().toISOString(),
    });

  if (saleError) {
    console.error('Error inserting manual sale:', saleError);
    throw new Error('Failed to record asset sale');
  }

  // Transakcja income do portfela (pełna kwota przychodu)
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('id', data.walletId)
    .eq('user_id', userId)
    .single();

  if (!wallet) throw new Error('Wallet not found');

  await supabaseAdmin
    .from('transactions')
    .insert({
      id: nanoid(),
      amount: encryptNumber(totalProceeds, dek),
      category: encryptString('Sprzedaż aktywa', dek),
      description: encryptString(
        `Sprzedaż ${data.quantitySold} ${data.assetSymbol}`,
        dek
      ),
      type: 'income',
      date: data.saleDate,
      wallet_id: data.walletId,
      currency: 'PLN',
      created_at: new Date().toISOString(),
    });

  const currentBalance = decryptNumber(wallet.balance, dek);
  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(currentBalance + totalProceeds, dek) })
    .eq('id', data.walletId);

  revalidatePath('/', 'layout');
}

export async function payTaxAction(data: {
  saleIds: string[];
  walletId: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  if (!data.saleIds.length) throw new Error('No sales selected');

  // Pobierz wybrane sprzedaże
  const { data: sales, error: salesError } = await supabaseAdmin
    .from('asset_sales')
    .select('*')
    .eq('user_id', userId)
    .in('id', data.saleIds);

  if (salesError || !sales?.length) {
    throw new Error('Failed to fetch sales');
  }

  // Oblicz łączny podatek do zapłaty (tylko nieopłacone)
  let totalTaxToPay = 0;
  const unpaidSaleIds: string[] = [];

  for (const sale of sales) {
    if (!sale.tax_paid) {
      const taxAmount = decryptNumber(sale.tax_amount, dek);
      if (taxAmount > 0) {
        totalTaxToPay += taxAmount;
        unpaidSaleIds.push(sale.id);
      }
    }
  }

  if (totalTaxToPay <= 0 || unpaidSaleIds.length === 0) {
    throw new Error('No unpaid tax to pay');
  }

  // Sprawdź portfel
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('id', data.walletId)
    .eq('user_id', userId)
    .single();

  if (!wallet) throw new Error('Wallet not found');

  // Oznacz sprzedaże jako opłacone
  const { error: updateError } = await supabaseAdmin
    .from('asset_sales')
    .update({ tax_paid: true })
    .eq('user_id', userId)
    .in('id', unpaidSaleIds);

  if (updateError) {
    throw new Error('Failed to update tax status');
  }

  // Utwórz transakcję wydatku (podatek)
  const description = unpaidSaleIds.length === 1
    ? `Podatek Belki - 1 transakcja`
    : `Podatek Belki - ${unpaidSaleIds.length} transakcje`;

  await supabaseAdmin
    .from('transactions')
    .insert({
      id: nanoid(),
      amount: encryptNumber(totalTaxToPay, dek),
      category: encryptString('Podatek Belki', dek),
      description: encryptString(description, dek),
      type: 'outcome',
      date: new Date().toISOString().split('T')[0],
      wallet_id: data.walletId,
      currency: 'PLN',
      created_at: new Date().toISOString(),
    });

  // Zaktualizuj saldo portfela
  const currentBalance = decryptNumber(wallet.balance, dek);
  const newBalance = currentBalance - totalTaxToPay;
  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(newBalance, dek) })
    .eq('id', data.walletId);

  revalidatePath('/', 'layout');
}

// --- NAWYKI (HABITS) ---

export async function getHabits() {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  const [{ data: habits, error: habitsError }, { data: entries, error: entriesError }] = await Promise.all([
    supabaseAdmin
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('habit_entries')
      .select('*, habit:habits!inner(user_id)')
      .eq('habit.user_id', userId),
  ]);

  if (habitsError) console.error('Error fetching habits:', habitsError);
  if (entriesError) console.error('Error fetching habit entries:', entriesError);

  const decryptedHabits = (habits || []).map(h => ({
    id: h.id,
    name: decryptString(h.name, dek) || h.name,
    color: h.color,
    icon: h.icon,
    frequency: h.frequency || 'daily',
  }));

  const decryptedEntries = (entries || []).map(e => ({
    id: e.id,
    habit_id: e.habit_id,
    date: e.date,
    completed: e.completed,
  }));

  return { habits: decryptedHabits, entries: decryptedEntries };
}

export async function addHabit(data: { name: string; color: string; icon: string; frequency?: string }) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  const { error } = await supabaseAdmin
    .from('habits')
    .insert({
      id: nanoid(),
      user_id: userId,
      name: encryptString(data.name, dek),
      color: data.color,
      icon: data.icon,
      frequency: data.frequency || 'daily',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding habit:', error);
    throw new Error('Failed to add habit');
  }

  revalidatePath('/', 'layout');
}

export async function editHabit(id: string, data: { name: string; color: string; icon: string; frequency?: string }) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: habit } = await supabaseAdmin
    .from('habits')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!habit || habit.user_id !== userId) return;

  const dek = await getDEK();

  await supabaseAdmin
    .from('habits')
    .update({
      name: encryptString(data.name, dek),
      color: data.color,
      icon: data.icon,
      frequency: data.frequency || 'daily',
    })
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function deleteHabit(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: habit } = await supabaseAdmin
    .from('habits')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!habit || habit.user_id !== userId) return;

  // habit_entries mają ON DELETE CASCADE
  await supabaseAdmin
    .from('habits')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function toggleHabitEntry(habitId: string, date: string, completed: boolean) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // Sprawdź ownership
  const { data: habit } = await supabaseAdmin
    .from('habits')
    .select('user_id')
    .eq('id', habitId)
    .single();

  if (!habit || habit.user_id !== userId) return;

  if (completed) {
    // Upsert - dodaj lub zaktualizuj entry
    const { data: existing } = await supabaseAdmin
      .from('habit_entries')
      .select('id')
      .eq('habit_id', habitId)
      .eq('date', date)
      .single();

    if (existing) {
      await supabaseAdmin
        .from('habit_entries')
        .update({ completed: true })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin
        .from('habit_entries')
        .insert({
          id: nanoid(),
          habit_id: habitId,
          date,
          completed: true,
          created_at: new Date().toISOString(),
        });
    }
  } else {
    // Usuń entry (unchecked = brak rekordu)
    await supabaseAdmin
      .from('habit_entries')
      .delete()
      .eq('habit_id', habitId)
      .eq('date', date);
  }

  revalidatePath('/', 'layout');
}

// --- GOOGLE CALENDAR ---

export async function getGoogleCalendarConnection() {
  const userId = await getUserId();
  if (!userId) return null;

  const { data: connection } = await supabaseAdmin
    .from('google_calendar_connections')
    .select('id, google_email, created_at, updated_at')
    .eq('user_id', userId)
    .single();

  if (!connection) return null;

  return {
    id: connection.id,
    email: connection.google_email,
    connected: true,
    connectedAt: connection.created_at,
  };
}

export async function getGoogleCalendarMappings() {
  const userId = await getUserId();
  if (!userId) return [];

  const dek = await getDEK();

  const { data: mappings } = await supabaseAdmin
    .from('google_calendar_mappings')
    .select('*, wallet:wallets(id, name, color)')
    .eq('user_id', userId);

  if (!mappings) return [];

  return mappings.map(m => ({
    id: m.id,
    google_calendar_id: m.google_calendar_id,
    calendar_name: m.calendar_name,
    wallet_id: m.wallet_id,
    walletName: m.wallet_id && m.wallet ? decryptString(m.wallet.name, dek) || '' : '',
    walletColor: m.wallet?.color || '',
    hourly_rate: m.hourly_rate ? decryptNumber(m.hourly_rate, dek) : 0,
    is_enabled: m.is_enabled,
    last_synced_at: m.last_synced_at,
  }));
}

export async function updateGoogleCalendarMapping(
  id: string,
  data: { wallet_id?: string | null; hourly_rate?: number; is_enabled?: boolean }
) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: mapping } = await supabaseAdmin
    .from('google_calendar_mappings')
    .select('user_id, google_calendar_id')
    .eq('id', id)
    .single();

  if (!mapping || mapping.user_id !== userId) throw new Error('Not found');

  const dek = await getDEK();
  const updateData: Record<string, unknown> = {};

  if (data.wallet_id !== undefined) updateData.wallet_id = data.wallet_id;
  if (data.hourly_rate !== undefined) updateData.hourly_rate = encryptNumber(data.hourly_rate, dek);
  if (data.is_enabled !== undefined) updateData.is_enabled = data.is_enabled;

  await supabaseAdmin
    .from('google_calendar_mappings')
    .update(updateData)
    .eq('id', id);

  // Also update existing Google events from this calendar with new wallet/rate
  if (data.wallet_id !== undefined || data.hourly_rate !== undefined) {
    const eventUpdates: Record<string, unknown> = {};
    if (data.wallet_id !== undefined) eventUpdates.wallet_id = data.wallet_id;
    if (data.hourly_rate !== undefined) eventUpdates.hourly_rate = encryptNumber(data.hourly_rate, dek);

    await supabaseAdmin
      .from('calendar_events')
      .update(eventUpdates)
      .eq('user_id', userId)
      .eq('google_calendar_id', mapping.google_calendar_id);
  }

  revalidatePath('/', 'layout');
}

export async function disconnectGoogleCalendar() {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // Delete all Google-synced events
  await supabaseAdmin
    .from('calendar_events')
    .delete()
    .eq('user_id', userId)
    .not('google_event_id', 'is', null);

  // Delete mappings and connection (cascade handles mappings)
  await supabaseAdmin
    .from('google_calendar_connections')
    .delete()
    .eq('user_id', userId);

  revalidatePath('/', 'layout');
}

// --- SUBSCRIPTIONS ---

export async function getSubscription() {
  const userId = await getUserId();
  if (!userId) return null;

  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('status, price_id, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .single();

  return data;
}

export async function isProUser() {
  const sub = await getSubscription();
  return sub?.status === 'active' || sub?.status === 'trialing';
}

export async function getScansRemaining(): Promise<{ remaining: number; limit: number; isPro: boolean }> {
  const userId = await getUserId();
  if (!userId) return { remaining: 0, limit: 3, isPro: false };

  const pro = await isProUser();
  if (pro) return { remaining: Infinity, limit: Infinity, isPro: true };

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from('scan_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', weekAgo);

  const used = count ?? 0;
  return { remaining: Math.max(0, 3 - used), limit: 3, isPro: false };
}

// --- CELE FINANSOWE ---

export async function getGoals() {
  const userId = await getUserId();
  if (!userId) return [];

  const dek = await getDEK();

  const { data: goals, error } = await supabaseAdmin
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }

  return (goals || []).map(g => ({
    id: g.id,
    name: decryptString(g.name, dek) || g.name,
    target_amount: decryptNumber(g.target_amount, dek),
    current_amount: decryptNumber(g.current_amount, dek),
    target_date: g.target_date,
    category: g.category,
    icon: g.icon,
    wallet_id: g.wallet_id,
  }));
}

export async function addGoalAction(data: {
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string;
  icon: string;
  wallet_id: string | null;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  if (!data.name || data.name.length > 100) throw new Error('Invalid name');
  if (typeof data.target_amount !== 'number' || !isFinite(data.target_amount)) throw new Error('Invalid target_amount');
  if (typeof data.current_amount !== 'number' || !isFinite(data.current_amount)) throw new Error('Invalid current_amount');

  const dek = await getDEK();

  const { error } = await supabaseAdmin
    .from('goals')
    .insert({
      id: nanoid(),
      user_id: userId,
      name: encryptString(data.name, dek),
      target_amount: encryptNumber(data.target_amount, dek),
      current_amount: encryptNumber(data.current_amount, dek),
      target_date: data.target_date || null,
      category: data.category || 'savings',
      icon: data.icon || 'target',
      wallet_id: data.wallet_id || null,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding goal:', error);
    throw new Error('Failed to add goal');
  }

  revalidatePath('/', 'layout');
}

export async function editGoalAction(id: string, data: {
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string;
  icon: string;
  wallet_id: string | null;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  if (!id) throw new Error('Invalid id');
  if (!data.name || data.name.length > 100) throw new Error('Invalid name');

  const { data: goal } = await supabaseAdmin
    .from('goals')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!goal || goal.user_id !== userId) return;

  const dek = await getDEK();

  await supabaseAdmin
    .from('goals')
    .update({
      name: encryptString(data.name, dek),
      target_amount: encryptNumber(data.target_amount, dek),
      current_amount: encryptNumber(data.current_amount, dek),
      target_date: data.target_date || null,
      category: data.category || 'savings',
      icon: data.icon || 'target',
      wallet_id: data.wallet_id || null,
    })
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function deleteGoalAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: goal } = await supabaseAdmin
    .from('goals')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!goal || goal.user_id !== userId) return;

  await supabaseAdmin
    .from('goals')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

// --- COTYGODNIOWY RAPORT AI ---

export interface WeeklyReportInput {
  weekLabel: string;
  totalIncome: number;
  totalOutcome: number;
  outcomeByCategory: { category: string; amount: number }[];
  topExpenses: { description: string; amount: number; category: string }[];
  workHours: number;
  workEarnings: number;
  habits: { name: string; completed: number; expected: number }[];
}

export async function getLastWeeklyReport(): Promise<string | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data } = await supabaseAdmin
    .from('users')
    .select('last_weekly_report')
    .eq('id', userId)
    .single();

  return data?.last_weekly_report ?? null;
}

export async function getWeeklyReportData(): Promise<WeeklyReportInput | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  // Oblicz daty poprzedniego tygodnia (pon-ndz)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=ndz, 1=pon
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(now);
  thisMonday.setUTCDate(now.getUTCDate() - daysSinceMonday);
  thisMonday.setUTCHours(0, 0, 0, 0);

  const prevMonday = new Date(thisMonday);
  prevMonday.setUTCDate(thisMonday.getUTCDate() - 7);
  const prevSunday = new Date(thisMonday);
  prevSunday.setUTCDate(thisMonday.getUTCDate() - 1);
  prevSunday.setUTCHours(23, 59, 59, 999);

  const weekStartStr = prevMonday.toISOString().split('T')[0];
  const weekEndStr = prevSunday.toISOString().split('T')[0];

  // Format label: "17–23 lut 2026"
  const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  const weekLabel = `${prevMonday.getUTCDate()}–${prevSunday.getUTCDate()} ${months[prevMonday.getUTCMonth()]} ${prevMonday.getUTCFullYear()}`;

  // Fetch transakcje, nawyki, kalendarz równolegle
  const [
    { wallets, transactions },
    habitsData,
    weeklySummary,
  ] = await Promise.all([
    fetchWalletsAndTransactions(userId, dek),
    (async () => {
      const [{ data: habits }, { data: entries }] = await Promise.all([
        supabaseAdmin.from('habits').select('*').eq('user_id', userId),
        supabaseAdmin.from('habit_entries').select('*, habit:habits!inner(user_id)').eq('habit.user_id', userId),
      ]);
      return {
        habits: (habits || []).map(h => ({
          id: h.id,
          name: decryptString(h.name, dek) || h.name,
          frequency: h.frequency || 'daily',
        })),
        entries: (entries || []).map(e => ({
          habit_id: e.habit_id,
          date: e.date,
          completed: e.completed,
        })),
      };
    })(),
    getWeeklySummary(prevMonday.toISOString(), prevSunday.toISOString()),
  ]);

  // Filtruj transakcje z poprzedniego tygodnia
  const weekTransactions = transactions.filter(t => {
    return t.date >= weekStartStr && t.date <= weekEndStr;
  });

  const totalIncome = weekTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutcome = weekTransactions
    .filter(t => t.type === 'outcome')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Outcome per kategoria
  const catMap = new Map<string, number>();
  weekTransactions.filter(t => t.type === 'outcome').forEach(t => {
    const cat = t.category || 'Inne';
    catMap.set(cat, (catMap.get(cat) || 0) + Math.abs(t.amount));
  });
  const outcomeByCategory = Array.from(catMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Top 5 wydatków
  const topExpenses = weekTransactions
    .filter(t => t.type === 'outcome')
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)
    .map(t => ({
      description: t.description || t.category || 'Brak opisu',
      amount: Math.abs(t.amount),
      category: t.category || 'Inne',
    }));

  // Nawyki: completion rate z poprzedniego tygodnia — Map lookup zamiast powtarzanego filter
  const entriesByHabit = new Map<string, typeof habitsData.entries>();
  for (const e of habitsData.entries) {
    if (e.date >= weekStartStr && e.date <= weekEndStr) {
      const arr = entriesByHabit.get(e.habit_id);
      if (arr) arr.push(e);
      else entriesByHabit.set(e.habit_id, [e]);
    }
  }
  const habitStats = habitsData.habits.map(h => {
    const weekEntries = entriesByHabit.get(h.id) || [];
    const completed = weekEntries.filter(e => e.completed).length;
    const expected = h.frequency === 'daily' ? 7 : h.frequency === 'weekly' ? 1 : 7;
    return { name: h.name, completed, expected };
  });

  return {
    weekLabel,
    totalIncome,
    totalOutcome,
    outcomeByCategory,
    topExpenses,
    workHours: weeklySummary?.totalHours ?? 0,
    workEarnings: weeklySummary?.totalEarnings ?? 0,
    habits: habitStats,
  };
}

// --- STAŁE WYDATKI ---

export async function getRecurringExpenses() {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  const [{ data: expenses, error }, { data: wallets }] = await Promise.all([
    supabaseAdmin
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_date', { ascending: true }),
    supabaseAdmin.from('wallets').select('id, name').eq('user_id', userId),
  ]);

  if (error) {
    console.error('Error fetching recurring expenses:', error);
  }

  const decryptedWallets = (wallets || []).map(w => ({
    ...w,
    name: decryptString(w.name, dek) || w.name,
  }));

  const walletMap = new Map<string, string>();
  for (const w of decryptedWallets) {
    walletMap.set(w.id, w.name);
  }

  const decryptedExpenses = (expenses || []).map(e => ({
    id: e.id,
    name: decryptString(e.name, dek) || e.name,
    amount: decryptNumber(e.amount, dek),
    currency: (e.currency || 'PLN') as Currency,
    category: e.category,
    wallet_id: e.wallet_id,
    walletName: e.wallet_id ? walletMap.get(e.wallet_id) || '' : '',
    billing_day: e.billing_day,
    frequency: e.frequency as 'monthly' | 'quarterly' | 'yearly',
    next_due_date: e.next_due_date,
    is_active: e.is_active,
    icon: e.icon || '',
    color: e.color || '',
    notes: e.notes ? decryptString(e.notes, dek) : null,
    created_at: e.created_at,
  }));

  return { expenses: decryptedExpenses, wallets: decryptedWallets };
}

export async function addRecurringExpense(data: {
  name: string;
  amount: number;
  currency: string;
  category: string;
  wallet_id: string | null;
  billing_day: number;
  frequency: string;
  next_due_date: string;
  icon: string;
  color: string;
  notes: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  if (!data.name || data.name.length > 200) throw new Error('Invalid name');
  if (typeof data.amount !== 'number' || !isFinite(data.amount) || data.amount <= 0) throw new Error('Invalid amount');
  if (data.billing_day < 1 || data.billing_day > 31) throw new Error('Invalid billing day');
  if (!['monthly', 'quarterly', 'yearly'].includes(data.frequency)) throw new Error('Invalid frequency');

  const dek = await getDEK();

  const { error } = await supabaseAdmin
    .from('recurring_expenses')
    .insert({
      user_id: userId,
      name: encryptString(data.name, dek),
      amount: encryptNumber(data.amount, dek),
      currency: data.currency || 'PLN',
      category: data.category,
      wallet_id: data.wallet_id || null,
      billing_day: data.billing_day,
      frequency: data.frequency,
      next_due_date: data.next_due_date,
      is_active: true,
      icon: data.icon,
      color: data.color,
      notes: data.notes ? encryptString(data.notes, dek) : null,
    });

  if (error) {
    console.error('Error adding recurring expense:', error);
    throw new Error('Failed to add recurring expense');
  }

  revalidatePath('/', 'layout');
}

export async function editRecurringExpense(id: string, data: {
  name: string;
  amount: number;
  currency: string;
  category: string;
  wallet_id: string | null;
  billing_day: number;
  frequency: string;
  next_due_date: string;
  icon: string;
  color: string;
  notes: string;
  is_active: boolean;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: existing } = await supabaseAdmin
    .from('recurring_expenses')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== userId) throw new Error('Not found');

  const dek = await getDEK();

  const { error } = await supabaseAdmin
    .from('recurring_expenses')
    .update({
      name: encryptString(data.name, dek),
      amount: encryptNumber(data.amount, dek),
      currency: data.currency || 'PLN',
      category: data.category,
      wallet_id: data.wallet_id || null,
      billing_day: data.billing_day,
      frequency: data.frequency,
      next_due_date: data.next_due_date,
      is_active: data.is_active,
      icon: data.icon,
      color: data.color,
      notes: data.notes ? encryptString(data.notes, dek) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error editing recurring expense:', error);
    throw new Error('Failed to edit recurring expense');
  }

  revalidatePath('/', 'layout');
}

export async function deleteRecurringExpense(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: existing } = await supabaseAdmin
    .from('recurring_expenses')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== userId) throw new Error('Not found');

  // Payments cascade-delete via FK
  await supabaseAdmin
    .from('recurring_expenses')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function payRecurringExpense(id: string, actualAmount: number) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  if (typeof actualAmount !== 'number' || !isFinite(actualAmount) || actualAmount <= 0) {
    throw new Error('Invalid amount');
  }

  const dek = await getDEK();

  // Fetch expense
  const { data: expense } = await supabaseAdmin
    .from('recurring_expenses')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!expense) throw new Error('Expense not found');

  const expenseName = decryptString(expense.name, dek) || 'Stały wydatek';
  const currency: Currency = (['PLN', 'USD', 'EUR'].includes(expense.currency) ? expense.currency : 'PLN') as Currency;

  // Create transaction (outcome)
  const transactionId = nanoid();
  const rates = await getExchangeRates();
  const amountInPLN = convertAmount(actualAmount, currency, 'PLN', rates);

  if (expense.wallet_id) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('id', expense.wallet_id)
      .eq('user_id', userId)
      .single();

    if (wallet) {
      // Add transaction
      await supabaseAdmin
        .from('transactions')
        .insert({
          id: transactionId,
          amount: encryptNumber(-Math.abs(actualAmount), dek),
          category: encryptString(expense.category, dek),
          description: encryptString(expenseName, dek),
          type: 'outcome',
          date: new Date().toISOString().split('T')[0],
          wallet_id: expense.wallet_id,
          currency,
          created_at: new Date().toISOString(),
        });

      // Update wallet balance
      const currentBalance = decryptNumber(wallet.balance, dek);
      const newBalance = currentBalance - amountInPLN;
      await supabaseAdmin
        .from('wallets')
        .update({ balance: encryptNumber(newBalance, dek) })
        .eq('id', expense.wallet_id);
    }
  }

  // Record payment
  await supabaseAdmin
    .from('expense_payments')
    .insert({
      expense_id: id,
      user_id: userId,
      amount: encryptNumber(actualAmount, dek),
      paid_date: new Date().toISOString().split('T')[0],
      transaction_id: expense.wallet_id ? transactionId : null,
      status: 'paid',
    });

  // Advance next_due_date
  const currentDue = new Date(expense.next_due_date);
  let nextDue: Date;
  if (expense.frequency === 'monthly') {
    nextDue = new Date(currentDue);
    nextDue.setMonth(nextDue.getMonth() + 1);
  } else if (expense.frequency === 'quarterly') {
    nextDue = new Date(currentDue);
    nextDue.setMonth(nextDue.getMonth() + 3);
  } else {
    nextDue = new Date(currentDue);
    nextDue.setFullYear(nextDue.getFullYear() + 1);
  }

  await supabaseAdmin
    .from('recurring_expenses')
    .update({
      next_due_date: nextDue.toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function skipRecurringExpense(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: expense } = await supabaseAdmin
    .from('recurring_expenses')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!expense) throw new Error('Expense not found');

  const dek = await getDEK();

  // Record skipped payment
  await supabaseAdmin
    .from('expense_payments')
    .insert({
      expense_id: id,
      user_id: userId,
      amount: encryptNumber(0, dek),
      paid_date: new Date().toISOString().split('T')[0],
      status: 'skipped',
    });

  // Advance next_due_date
  const currentDue = new Date(expense.next_due_date);
  let nextDue: Date;
  if (expense.frequency === 'monthly') {
    nextDue = new Date(currentDue);
    nextDue.setMonth(nextDue.getMonth() + 1);
  } else if (expense.frequency === 'quarterly') {
    nextDue = new Date(currentDue);
    nextDue.setMonth(nextDue.getMonth() + 3);
  } else {
    nextDue = new Date(currentDue);
    nextDue.setFullYear(nextDue.getFullYear() + 1);
  }

  await supabaseAdmin
    .from('recurring_expenses')
    .update({
      next_due_date: nextDue.toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  revalidatePath('/', 'layout');
}

// --- KLIENCI I ZLECENIA ---

export async function getClients() {
  const userId = await getUserId();
  if (!userId) return { clients: [] };

  const [dek, { data: clients }] = await Promise.all([
    getDEK(),
    supabaseAdmin.from('clients').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  const decrypted = (clients || []).map(c => ({
    id: c.id,
    name: decryptString(c.name, dek) || c.name,
    email: c.email ? decryptString(c.email, dek) : null,
    phone: c.phone ? decryptString(c.phone, dek) : null,
    nip: c.nip ? decryptString(c.nip, dek) : null,
    company_name: c.company_name ? decryptString(c.company_name, dek) : null,
    street: c.street ? decryptString(c.street, dek) : null,
    postal_code: c.postal_code ? decryptString(c.postal_code, dek) : null,
    city: c.city ? decryptString(c.city, dek) : null,
    notes: c.notes ? decryptString(c.notes, dek) : null,
    created_at: c.created_at,
  }));

  return { clients: decrypted };
}

export async function addClient(data: {
  name: string;
  email?: string;
  phone?: string;
  nip?: string;
  company_name?: string;
  street?: string;
  postal_code?: string;
  city?: string;
  notes?: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!data.name || data.name.length > 200) throw new Error('Invalid name');

  const dek = await getDEK();

  const insertData = {
    id: nanoid(),
    user_id: userId,
    name: encryptString(data.name, dek),
    email: data.email ? encryptString(data.email, dek) : null,
    phone: data.phone ? encryptString(data.phone, dek) : null,
    nip: data.nip ? encryptString(data.nip, dek) : null,
    company_name: data.company_name ? encryptString(data.company_name, dek) : null,
    street: data.street ? encryptString(data.street, dek) : null,
    postal_code: data.postal_code ? encryptString(data.postal_code, dek) : null,
    city: data.city ? encryptString(data.city, dek) : null,
    notes: data.notes ? encryptString(data.notes, dek) : null,
    created_at: new Date().toISOString(),
  };

  console.log('Inserting client with id:', insertData.id, 'for user:', userId);
  const { error } = await supabaseAdmin.from('clients').insert(insertData);

  if (error) {
    console.error('Error adding client:', error.message, error.details, error.hint);
    throw new Error(`Failed to add client: ${error.message}`);
  }
  console.log('Client added successfully');

  revalidatePath('/', 'layout');
}

export async function editClient(id: string, data: {
  name: string;
  email?: string;
  phone?: string;
  nip?: string;
  company_name?: string;
  street?: string;
  postal_code?: string;
  city?: string;
  notes?: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!client || client.user_id !== userId) throw new Error('Not found');

  const dek = await getDEK();

  await supabaseAdmin.from('clients').update({
    name: encryptString(data.name, dek),
    email: data.email ? encryptString(data.email, dek) : null,
    phone: data.phone ? encryptString(data.phone, dek) : null,
    nip: data.nip ? encryptString(data.nip, dek) : null,
    company_name: data.company_name ? encryptString(data.company_name, dek) : null,
    street: data.street ? encryptString(data.street, dek) : null,
    postal_code: data.postal_code ? encryptString(data.postal_code, dek) : null,
    city: data.city ? encryptString(data.city, dek) : null,
    notes: data.notes ? encryptString(data.notes, dek) : null,
  }).eq('id', id);

  revalidatePath('/', 'layout');
}

export async function deleteClient(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!client || client.user_id !== userId) throw new Error('Not found');

  const { error } = await supabaseAdmin.from('clients').delete().eq('id', id);
  if (error) {
    console.error('Error deleting client:', error);
    throw new Error('Failed to delete client');
  }

  revalidatePath('/', 'layout');
}

export async function getOrders() {
  const userId = await getUserId();
  if (!userId) return { orders: [] };

  const [dek, { data: orders }, { data: wallets }, { data: linkedEvents }] = await Promise.all([
    getDEK(),
    supabaseAdmin.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabaseAdmin.from('wallets').select('id, name').eq('user_id', userId),
    supabaseAdmin.from('calendar_events').select('order_id, start_time, end_time').eq('user_id', userId).not('order_id', 'is', null),
  ]);

  const walletMap = new Map<string, string>();
  for (const w of wallets || []) {
    walletMap.set(w.id, decryptString(w.name, dek) || w.name);
  }

  // Calculate tracked hours per order from linked calendar events
  const hoursMap = new Map<string, number>();
  for (const ev of linkedEvents || []) {
    if (!ev.order_id) continue;
    const ms = new Date(ev.end_time).getTime() - new Date(ev.start_time).getTime();
    const hours = ms / 3_600_000;
    hoursMap.set(ev.order_id, (hoursMap.get(ev.order_id) || 0) + hours);
  }

  const decrypted = (orders || []).map(o => {
    const billingType = (o.billing_type || 'flat') as 'flat' | 'hourly';
    const hourlyRate = o.hourly_rate ? decryptNumber(o.hourly_rate, dek) : null;
    const trackedHours = hoursMap.get(o.id) || 0;
    const flatAmount = o.amount ? decryptNumber(o.amount, dek) : 0;
    const computedAmount = billingType === 'hourly' && hourlyRate
      ? trackedHours * hourlyRate
      : flatAmount;

    return {
      id: o.id,
      client_id: o.client_id,
      title: decryptString(o.title, dek) || o.title,
      description: o.description ? decryptString(o.description, dek) : null,
      amount: computedAmount,
      billing_type: billingType,
      hourly_rate: hourlyRate,
      tracked_hours: trackedHours,
      wallet_id: o.wallet_id,
      walletName: o.wallet_id ? (walletMap.get(o.wallet_id) || '') : '',
      status: o.status as 'pending' | 'in_progress' | 'completed' | 'settled',
      tags: Array.isArray(o.tags) ? o.tags.map((t: string) => decryptString(t, dek) || t) : [],
      completion_date: o.completion_date,
      is_settled: o.is_settled,
      settled_at: o.settled_at,
      created_at: o.created_at,
    };
  });

  return { orders: decrypted };
}

export async function addOrder(data: {
  client_id: string;
  title: string;
  description?: string;
  amount: number;
  billing_type?: 'flat' | 'hourly';
  hourly_rate?: number;
  wallet_id?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'settled';
  tags?: string[];
  completion_date?: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!data.title || !data.client_id) throw new Error('Missing required fields');
  const isHourly = data.billing_type === 'hourly';
  if (!isHourly && (typeof data.amount !== 'number' || !isFinite(data.amount) || data.amount < 0)) throw new Error('Invalid amount');
  if (isHourly && (typeof data.hourly_rate !== 'number' || !isFinite(data.hourly_rate) || data.hourly_rate <= 0)) throw new Error('Invalid hourly rate');

  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('user_id')
    .eq('id', data.client_id)
    .single();
  if (!client || client.user_id !== userId) throw new Error('Client not found');

  const dek = await getDEK();

  const { error } = await supabaseAdmin.from('orders').insert({
    id: nanoid(),
    user_id: userId,
    client_id: data.client_id,
    title: encryptString(data.title, dek),
    description: data.description ? encryptString(data.description, dek) : null,
    amount: isHourly ? null : encryptNumber(data.amount, dek),
    billing_type: data.billing_type || 'flat',
    hourly_rate: isHourly && data.hourly_rate ? encryptNumber(data.hourly_rate, dek) : null,
    wallet_id: data.wallet_id || null,
    status: data.status || 'pending',
    tags: data.tags ? data.tags.map(t => encryptString(t, dek)) : [],
    completion_date: data.completion_date || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error adding order:', error);
    throw new Error('Failed to add order');
  }

  revalidatePath('/', 'layout');
}

export async function editOrder(id: string, data: {
  title: string;
  description?: string;
  amount: number;
  billing_type?: 'flat' | 'hourly';
  hourly_rate?: number;
  wallet_id?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'settled';
  tags?: string[];
  completion_date?: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!order || order.user_id !== userId) throw new Error('Not found');

  const dek = await getDEK();
  const isHourly = data.billing_type === 'hourly';

  await supabaseAdmin.from('orders').update({
    title: encryptString(data.title, dek),
    description: data.description ? encryptString(data.description, dek) : null,
    amount: isHourly ? null : encryptNumber(data.amount, dek),
    billing_type: data.billing_type || 'flat',
    hourly_rate: isHourly && data.hourly_rate ? encryptNumber(data.hourly_rate, dek) : null,
    wallet_id: data.wallet_id || null,
    status: data.status || 'pending',
    tags: data.tags ? data.tags.map(t => encryptString(t, dek)) : [],
    completion_date: data.completion_date || null,
  }).eq('id', id);

  revalidatePath('/', 'layout');
}

export async function deleteOrder(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!order || order.user_id !== userId) throw new Error('Not found');

  const { error } = await supabaseAdmin.from('orders').delete().eq('id', id);
  if (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }

  revalidatePath('/', 'layout');
}

export async function settleOrdersAction(orderIds: string[]) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');
  if (!Array.isArray(orderIds) || orderIds.length === 0) throw new Error('No orders selected');

  const dek = await getDEK();

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .in('id', orderIds)
    .eq('user_id', userId);

  if (!orders || orders.length === 0) throw new Error('No orders found');

  const unsettled = orders.filter(o => !o.is_settled);
  if (unsettled.length === 0) return { settled: 0 };

  const rates = await getExchangeRates();
  const now = new Date().toISOString();
  let settledCount = 0;

  for (const order of unsettled) {
    if (!order.wallet_id) continue;

    const amount = decryptNumber(order.amount, dek);
    if (amount <= 0) continue;

    const { error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        id: nanoid(),
        amount: encryptNumber(amount, dek),
        category: encryptString('Zlecenie', dek),
        description: encryptString(decryptString(order.title, dek) || 'Zlecenie', dek),
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        wallet_id: order.wallet_id,
        currency: 'PLN',
        created_at: now,
      });

    if (txError) {
      console.error('Error creating transaction for order:', txError);
      continue;
    }

    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('id', order.wallet_id)
      .single();

    if (wallet) {
      const currentBalance = decryptNumber(wallet.balance, dek);
      const amountInPLN = convertAmount(amount, 'PLN', 'PLN', rates);
      await supabaseAdmin
        .from('wallets')
        .update({ balance: encryptNumber(currentBalance + amountInPLN, dek) })
        .eq('id', order.wallet_id);
    }

    await supabaseAdmin.from('orders').update({
      is_settled: true,
      settled_at: now,
      status: 'settled',
    }).eq('id', order.id);

    settledCount++;
  }

  revalidatePath('/', 'layout');
  return { settled: settledCount };
}

// ─── Kugaru Partner API ───

export async function submitKugaruInvoice(data: {
  name: string;
  email: string;
  phone: string;
  pesel: string;
  citizenship: string;
  items: { name: string; quantity: number; unit: string; netPrice: number; vatRate: number }[];
  rightsTransfer: string;
  orderValue: number;
  currency: string;
  amountType: string;
  contractType: string;
  isStudent: boolean;
  clientType: string;
  clientNip: string;
  clientCompanyName: string;
  clientStreet: string;
  clientPostalCode: string;
  clientCity: string;
  clientEmail: string;
  description: string;
  notes: string;
  paymentTerm: string;
  customPaymentTerm?: string;
  skipProforma: boolean;
  verifyBeforeSending: boolean;
  sendIndependently: boolean;
  subscriptionInsteadOfFee: boolean;
  noLegalProceedings: boolean;
  acceptTerms: boolean;
}): Promise<{ ok: boolean; invoiceId?: string; error?: string }> {
  const partnerId = process.env.KUGARU_PARTNER_ID;
  const partnerSecret = process.env.KUGARU_PARTNER_SECRET;

  if (!partnerId || !partnerSecret) {
    return { ok: false, error: 'Brak konfiguracji Kugaru API (KUGARU_PARTNER_ID / KUGARU_PARTNER_SECRET)' };
  }

  const { createHmac } = await import('crypto');

  const rightsMap: Record<string, string> = {
    przekazuje: 'przekazanie praw',
    udziela_licencji: 'licencja',
    nie_przekazuje: 'brak',
  };

  const settlementMap: Record<string, string> = {
    umowa_o_dzielo: 'dzieło',
    umowa_zlecenie: 'zlecenie',
    dzielo_zlecenie: 'mieszana',
  };

  const payload = {
    type: 'polska' as const,
    payload: {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      pesel: data.pesel,
      citizenship: data.citizenship,
      rightsTransfer: rightsMap[data.rightsTransfer] || data.rightsTransfer,
      currency: data.currency,
      amountType: data.amountType,
      settlementType: settlementMap[data.contractType] || data.contractType,
      isStudent: data.isStudent,
      clientType: data.clientType === 'firma' ? 'firma' : 'osoba',
      clientNip: data.clientNip || undefined,
      clientCompanyName: data.clientType === 'firma' ? data.clientCompanyName : undefined,
      clientPersonName: data.clientType !== 'firma' ? data.clientCompanyName : undefined,
      clientStreet: data.clientStreet,
      clientPostalCode: data.clientPostalCode,
      clientCity: data.clientCity,
      clientEmail: data.clientEmail,
      description: data.description,
      comments: data.notes || undefined,
      paymentTerm: data.paymentTerm,
      customPaymentTerm: data.customPaymentTerm || undefined,
      skipProforma: data.skipProforma,
      verifyInvoice: data.verifyBeforeSending,
      sendInvoiceSelf: data.sendIndependently,
      useSubscription: data.subscriptionInsteadOfFee,
      confirmNoDebt: data.noLegalProceedings,
      acceptTerms: data.acceptTerms,
      items: data.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        netPrice: item.netPrice,
        vatRate: item.vatRate,
      })),
    },
  };

  const rawBody = JSON.stringify(payload);
  const timestamp = Date.now().toString();
  const signature = createHmac('sha256', partnerSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  try {
    const res = await fetch(
      'https://kugaru.netlify.app/.netlify/functions/partner-invoice-submit',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://szponthub.pl',
          'x-kugaru-partner': partnerId,
          'x-kugaru-timestamp': timestamp,
          'x-kugaru-signature': signature,
        },
        body: rawBody,
      }
    );

    const result = await res.json();

    if (!res.ok) {
      return { ok: false, error: result.error || `Błąd API Kugaru (${res.status})` };
    }

    return { ok: true, invoiceId: result.invoiceId };
  } catch (err) {
    return { ok: false, error: 'Nie udało się połączyć z API Kugaru' };
  }
}
