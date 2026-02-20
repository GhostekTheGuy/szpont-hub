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
    maxAge: 60 * 60 * 24 * 7, // 7 dni
  });
}

// --- POBIERANIE DANYCH ---

async function fetchWalletsAndTransactions(userId: string, existingDek?: Buffer) {
  // Równoległy fetch DEK (jeśli nie podany) + portfeli
  const [dek, { data: wallets, error: walletsError }] = await Promise.all([
    existingDek ? Promise.resolve(existingDek) : getDEK(),
    supabaseAdmin.from('wallets').select('*').eq('user_id', userId),
  ]);

  if (walletsError) {
    console.error('Error fetching wallets:', walletsError);
  }

  // Deszyfruj pola portfeli
  const decryptedWallets = (wallets || []).map(w => ({
    ...w,
    name: decryptString(w.name, dek) || w.name,
    balance: decryptNumber(w.balance, dek),
    track_from: w.track_from ? decryptString(w.track_from, dek) : undefined,
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

  // Równoległe pobieranie wszystkich danych
  const [{ wallets, transactions }, rates, { data: assets, error: assetsError }] = await Promise.all([
    fetchWalletsAndTransactions(userId, dek),
    getExchangeRates(),
    supabaseAdmin.from('assets').select('*').eq('user_id', userId),
  ]);

  if (assetsError) {
    console.error('Error fetching assets:', assetsError);
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
  }));

  return { wallets, transactions, assets: decryptedAssets, exchangeRates: rates };
}

export async function getWalletsWithTransactions() {
  const userId = await getUserId();
  if (!userId) return null;

  return fetchWalletsAndTransactions(userId);
}

export async function getTransactionsData() {
  const userId = await getUserId();
  if (!userId) return null;

  return fetchWalletsAndTransactions(userId);
}

export async function getAssetsData() {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  const { data: assets, error: assetsError } = await supabaseAdmin
    .from('assets')
    .select('*')
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

  const { transactions } = await fetchWalletsAndTransactions(userId);
  const walletTransactions = transactions.filter(t => t.wallet === walletId);

  const [historicalRates, currentRates] = await Promise.all([
    getHistoricalRates(startStr, endStr),
    getExchangeRates(),
  ]);

  // Dla każdego dnia w zakresie: oblicz saldo portfela z kursem Z TEGO DNIA
  const data: { date: string; value: number }[] = [];
  const current = new Date(startDate);

  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];
    const ratesForDay = historicalRates[dateStr] || currentRates;

    // Zsumuj transakcje do tego dnia, przeliczając kursem tego dnia
    const balance = walletTransactions
      .filter(t => t.date <= dateStr)
      .reduce((acc, t) => {
        return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, ratesForDay);
      }, 0);

    data.push({ date: dateStr, value: balance });
    current.setDate(current.getDate() + 1);
  }

  // Live saldo = suma transakcji przeliczona DZISIEJSZYM kursem
  const currentBalance = walletTransactions.reduce((acc, t) => {
    return acc + convertAmount(t.amount, t.currency || 'PLN', displayCurrency, currentRates);
  }, 0);

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

export async function addTransactionAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const dek = await getDEK();
  const currency: Currency = data.currency || 'PLN';

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
    throw new Error(insertError.message);
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

  // Zaktualizuj salda obu portfeli
  await Promise.all([
    supabaseAdmin.from('wallets').update({ balance: encryptNumber(fromBalance - amountInPLN, dek) }).eq('id', data.fromWalletId),
    supabaseAdmin.from('wallets').update({ balance: encryptNumber(toBalance + amountInPLN, dek) }).eq('id', data.toWalletId),
  ]);

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

  await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function editTransactionAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

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

  const newCurrency: Currency = data.currency || 'PLN';

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
    .single();

  if (newWallet) {
    const newWalletBalance = decryptNumber(newWallet.balance, dek);
    const updatedBalance = newWalletBalance + newAmountInPLN;
    await supabaseAdmin
      .from('wallets')
      .update({ balance: encryptNumber(updatedBalance, dek) })
      .eq('id', newWallet.id);
  }

  revalidatePath('/', 'layout');
}

// --- PORTFELE ---

export async function addWalletAction(data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const dek = await getDEK();

  const trackFrom = data.track_from || new Date().toISOString().split('T')[0];

  const { error } = await supabaseAdmin
    .from('wallets')
    .insert({
      id: nanoid(),
      user_id: userId,
      name: encryptString(data.name, dek),
      type: data.type,
      color: data.color,
      icon: data.icon,
      balance: encryptNumber(0, dek),
      track_from: encryptString(trackFrom, dek),
      currency: 'PLN',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error adding wallet:', error);
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
}

export async function editWalletAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Sprawdź czy portfel należy do użytkownika
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('user_id')
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
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  const [{ data: events, error: eventsError }, { data: recurringEvents, error: recurringError }, { data: wallets }] = await Promise.all([
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', weekStart)
      .lte('end_time', weekEnd)
      .order('start_time', { ascending: true }),
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .lt('start_time', weekStart),
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

  // Generuj instancje eventów cyklicznych dla tego tygodnia
  const wsDate = new Date(weekStart);
  const weDate = new Date(weekEnd);
  const expandedRecurring: typeof events = [];

  for (const event of (recurringEvents || [])) {
    const origStart = new Date(event.start_time);
    const origEnd = new Date(event.end_time);
    const durationMs = origEnd.getTime() - origStart.getTime();
    const rule = event.recurrence_rule;

    if (rule === 'daily') {
      // Generuj instancję na każdy dzień tygodnia
      for (let d = new Date(wsDate); d <= weDate; d.setDate(d.getDate() + 1)) {
        const instanceStart = new Date(d);
        instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), 0);
        const instanceEnd = new Date(instanceStart.getTime() + durationMs);
        if (instanceStart >= wsDate && instanceEnd <= weDate && instanceStart > origStart) {
          expandedRecurring.push({
            ...event,
            id: `${event.id}_${instanceStart.toISOString().split('T')[0]}`,
            start_time: instanceStart.toISOString(),
            end_time: instanceEnd.toISOString(),
            is_settled: false,
            is_confirmed: false,
          });
        }
      }
    } else if (rule === 'weekly') {
      // Znajdź instancję na ten sam dzień tygodnia w tym tygodniu
      const origDay = origStart.getDay(); // 0=Sun, 1=Mon, ...
      const wsDay = wsDate.getDay();
      let diff = origDay - wsDay;
      if (diff < 0) diff += 7;
      const instanceStart = new Date(wsDate);
      instanceStart.setDate(instanceStart.getDate() + diff);
      instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), 0);
      const instanceEnd = new Date(instanceStart.getTime() + durationMs);
      if (instanceStart >= wsDate && instanceEnd <= weDate) {
        expandedRecurring.push({
          ...event,
          id: `${event.id}_${instanceStart.toISOString().split('T')[0]}`,
          start_time: instanceStart.toISOString(),
          end_time: instanceEnd.toISOString(),
          is_settled: false,
          is_confirmed: false,
        });
      }
    } else if (rule === 'monthly') {
      // Znajdź instancję w tym samym dniu miesiąca
      const origDayOfMonth = origStart.getDate();
      for (let d = new Date(wsDate); d <= weDate; d.setDate(d.getDate() + 1)) {
        if (d.getDate() === origDayOfMonth && d > origStart) {
          const instanceStart = new Date(d);
          instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), 0);
          const instanceEnd = new Date(instanceStart.getTime() + durationMs);
          if (instanceStart >= wsDate && instanceEnd <= weDate) {
            expandedRecurring.push({
              ...event,
              id: `${event.id}_${instanceStart.toISOString().split('T')[0]}`,
              start_time: instanceStart.toISOString(),
              end_time: instanceEnd.toISOString(),
              is_settled: false,
              is_confirmed: false,
            });
          }
          break;
        }
      }
    }
  }

  // Połącz zwykłe eventy z wygenerowanymi instancjami (bez duplikatów)
  const existingIds = new Set((events || []).map(e => e.id));
  const allEvents = [
    ...(events || []),
    ...expandedRecurring.filter(e => !existingIds.has(e.id)),
  ];

  const walletMap = new Map(
    (wallets || []).map(w => [w.id, { name: decryptString(w.name, dek) || w.name, color: w.color }])
  );

  const decryptedEvents = allEvents.map(e => ({
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
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  const { error } = await supabaseAdmin
    .from('calendar_events')
    .insert({
      id: nanoid(),
      user_id: userId,
      title: encryptString(data.title, dek),
      wallet_id: data.wallet_id,
      hourly_rate: encryptNumber(data.hourly_rate, dek),
      start_time: data.start_time,
      end_time: data.end_time,
      is_recurring: data.is_recurring,
      recurrence_rule: data.recurrence_rule,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding calendar event:', error);
    throw new Error(error.message);
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
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: event } = await supabaseAdmin
    .from('calendar_events')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!event || event.user_id !== userId) return;

  const dek = await getDEK();

  await supabaseAdmin
    .from('calendar_events')
    .update({
      title: encryptString(data.title, dek),
      wallet_id: data.wallet_id,
      hourly_rate: encryptNumber(data.hourly_rate, dek),
      start_time: data.start_time,
      end_time: data.end_time,
      is_recurring: data.is_recurring,
      recurrence_rule: data.recurrence_rule,
    })
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function deleteCalendarEvent(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: event } = await supabaseAdmin
    .from('calendar_events')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!event || event.user_id !== userId) return;

  await supabaseAdmin
    .from('calendar_events')
    .delete()
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function toggleEventConfirmed(id: string, confirmed: boolean) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // Check if this is a recurring instance (id_YYYY-MM-DD)
  const isInstance = id.includes('_') && /\d{4}-\d{2}-\d{2}$/.test(id);

  if (isInstance) {
    // Recurring instance — we need to materialize it as a real record
    const parentId = id.split('_').slice(0, -1).join('_');

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
        const dateStr = id.split('_').pop()!;
        const origStart = new Date(parent.start_time);
        const origEnd = new Date(parent.end_time);
        const durationMs = origEnd.getTime() - origStart.getTime();

        const instanceStart = new Date(dateStr + 'T00:00:00');
        instanceStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds(), 0);
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
            created_at: new Date().toISOString(),
          });
      }
    } else {
      // Unconfirm — delete the materialized instance (it'll be regenerated from parent)
      await supabaseAdmin
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
    }
  } else {
    // Regular (non-recurring) event — simple toggle
    const { data: event } = await supabaseAdmin
      .from('calendar_events')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!event || event.user_id !== userId) return;

    await supabaseAdmin
      .from('calendar_events')
      .update({ is_confirmed: confirmed })
      .eq('id', id);
  }

  revalidatePath('/', 'layout');
}

export async function settleWeekAction(weekStart: string, weekEnd: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();
  const rates = await getExchangeRates();

  // Pobierz potwierdzone ale niezatwierdzone eventy z tego tygodnia
  const { data: events, error } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .eq('is_confirmed', true)
    .eq('is_settled', false)
    .gte('start_time', weekStart)
    .lte('end_time', weekEnd);

  if (error || !events || events.length === 0) return { settled: 0 };

  // Pobierz portfele z track_from do filtrowania
  const walletIds = Array.from(new Set(events.filter(e => e.wallet_id).map(e => e.wallet_id)));
  const { data: walletsRaw } = await supabaseAdmin
    .from('wallets')
    .select('id, track_from')
    .in('id', walletIds);

  const walletTrackFrom = new Map<string, string | undefined>();
  for (const w of walletsRaw || []) {
    walletTrackFrom.set(w.id, w.track_from ? decryptString(w.track_from, dek) || undefined : undefined);
  }

  // Filtruj eventy: odrzuć te przed track_from portfela
  const filteredEvents = events.filter(event => {
    if (!event.wallet_id) return false;
    const trackFrom = walletTrackFrom.get(event.wallet_id);
    if (!trackFrom) return true;
    const eventDate = event.start_time.split('T')[0];
    return eventDate >= trackFrom;
  });

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

  // Stwórz transakcje income i zaktualizuj salda
  for (const [walletId, totalEarnings] of Array.from(walletEarnings.entries())) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (!wallet) continue;

    const currentBalance = decryptNumber(wallet.balance, dek);
    const amountInPLN = totalEarnings; // Stawki są w PLN

    // Dodaj transakcję income
    await supabaseAdmin
      .from('transactions')
      .insert({
        id: nanoid(),
        amount: encryptNumber(totalEarnings, dek),
        category: encryptString('Praca', dek),
        description: encryptString(`Zarobki za tydzień ${weekStart.split('T')[0]}`, dek),
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        wallet_id: walletId,
        currency: 'PLN',
        created_at: new Date().toISOString(),
      });

    // Zaktualizuj saldo portfela
    const newBalance = currentBalance + amountInPLN;
    await supabaseAdmin
      .from('wallets')
      .update({ balance: encryptNumber(newBalance, dek) })
      .eq('id', walletId);
  }

  // Oznacz eventy jako settled
  const eventIds = filteredEvents.map(e => e.id);
  await supabaseAdmin
    .from('calendar_events')
    .update({ is_settled: true })
    .in('id', eventIds);

  revalidatePath('/', 'layout');
  return { settled: filteredEvents.length };
}

export async function getWeeklySummary(weekStart: string, weekEnd: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  // Pobierz eventy z bieżącego tygodnia
  const { data: events } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', weekStart)
    .lte('end_time', weekEnd);

  // Pobierz eventy z poprzedniego tygodnia
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(weekEnd);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

  const { data: prevEvents } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', prevWeekStart.toISOString())
    .lte('end_time', prevWeekEnd.toISOString());

  const { data: wallets } = await supabaseAdmin
    .from('wallets')
    .select('id, name, color')
    .eq('user_id', userId);

  const walletMap = new Map(
    (wallets || []).map(w => [w.id, { name: decryptString(w.name, dek) || w.name, color: w.color }])
  );

  const calcEarnings = (evts: typeof events) => {
    let total = 0;
    let totalHours = 0;
    const byWallet = new Map<string, { name: string; color: string; earnings: number; hours: number }>();

    for (const e of evts || []) {
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

  const confirmedEvents = (events || []).filter(e => e.is_confirmed);
  const current = calcEarnings(confirmedEvents);
  const previous = calcEarnings(prevEvents);
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
    eventCount: (events || []).length,
  };
}

export async function getMonthlySummary(monthStart: string, monthEnd: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();

  // Pobierz eventy z bieżącego miesiąca
  const { data: events } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', monthStart)
    .lte('end_time', monthEnd);

  // Pobierz eventy z poprzedniego miesiąca
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  const prevMonthEnd = new Date(monthEnd);
  prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);

  const { data: prevEvents } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', prevMonthStart.toISOString())
    .lte('end_time', prevMonthEnd.toISOString());

  const { data: wallets } = await supabaseAdmin
    .from('wallets')
    .select('id, name, color')
    .eq('user_id', userId);

  const walletMap = new Map(
    (wallets || []).map(w => [w.id, { name: decryptString(w.name, dek) || w.name, color: w.color }])
  );

  const calcEarnings = (evts: typeof events) => {
    let total = 0;
    let totalHours = 0;
    const byWallet = new Map<string, { name: string; color: string; earnings: number; hours: number }>();
    const weeklyBreakdown = new Map<string, number>();

    for (const e of evts || []) {
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

  const confirmedEvents = (events || []).filter(e => e.is_confirmed);
  const current = calcEarnings(confirmedEvents);
  const previous = calcEarnings(prevEvents);
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
    eventCount: (events || []).length,
  };
}

function getISOWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `Tydzień ${weekNum}`;
}

export async function settleMonthAction(monthStart: string, monthEnd: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  const { data: events, error } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .eq('is_confirmed', true)
    .eq('is_settled', false)
    .gte('start_time', monthStart)
    .lte('end_time', monthEnd);

  if (error || !events || events.length === 0) return { settled: 0 };

  // Pobierz portfele z track_from do filtrowania
  const mWalletIds = Array.from(new Set(events.filter(e => e.wallet_id).map(e => e.wallet_id)));
  const { data: mWalletsRaw } = await supabaseAdmin
    .from('wallets')
    .select('id, track_from')
    .in('id', mWalletIds);

  const mWalletTrackFrom = new Map<string, string | undefined>();
  for (const w of mWalletsRaw || []) {
    mWalletTrackFrom.set(w.id, w.track_from ? decryptString(w.track_from, dek) || undefined : undefined);
  }

  // Filtruj eventy: odrzuć te przed track_from portfela
  const filteredMonthEvents = events.filter(event => {
    if (!event.wallet_id) return false;
    const trackFrom = mWalletTrackFrom.get(event.wallet_id);
    if (!trackFrom) return true;
    const eventDate = event.start_time.split('T')[0];
    return eventDate >= trackFrom;
  });

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

  for (const [walletId, totalEarnings] of Array.from(walletEarnings.entries())) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (!wallet) continue;

    const currentBalance = decryptNumber(wallet.balance, dek);

    await supabaseAdmin
      .from('transactions')
      .insert({
        id: nanoid(),
        amount: encryptNumber(totalEarnings, dek),
        category: encryptString('Praca', dek),
        description: encryptString(`Zarobki za miesiąc ${monthStart.split('T')[0].slice(0, 7)}`, dek),
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        wallet_id: walletId,
        currency: 'PLN',
        created_at: new Date().toISOString(),
      });

    const newBalance = currentBalance + totalEarnings;
    await supabaseAdmin
      .from('wallets')
      .update({ balance: encryptNumber(newBalance, dek) })
      .eq('id', walletId);
  }

  const eventIds = filteredMonthEvents.map(e => e.id);
  await supabaseAdmin
    .from('calendar_events')
    .update({ is_settled: true })
    .in('id', eventIds);

  revalidatePath('/', 'layout');
  return { settled: filteredMonthEvents.length };
}

// --- YAHOO FINANCE ---

export async function searchYahooFinance(query: string): Promise<{ symbol: string; name: string; exchange: string; type: string }[]> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&listsCount=0`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
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
  for (const symbol of symbols) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
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
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();
  const assetType = data.asset_type || 'crypto';

  let currentPrice = 0;
  let change24h = 0;

  if (assetType === 'stock') {
    // Yahoo Finance — price in original currency, convert to PLN
    try {
      const quotes = await fetchYahooQuotes([data.symbol]);
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
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=pln&ids=${data.coingecko_id}&sparkline=false&price_change_percentage=24h`
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
      symbol: encryptString(data.symbol, dek),
      coingecko_id: encryptString(data.coingecko_id || '', dek),
      quantity: encryptNumber(data.quantity, dek),
      current_price: encryptNumber(currentPrice, dek),
      total_value: encryptNumber(totalValue, dek),
      change_24h: encryptNumber(change24h, dek),
      cost_basis: encryptNumber(costBasis, dek),
      asset_type: assetType,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding asset:', error);
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
}

export async function editAssetAction(id: string, data: { quantity: number; cost_basis?: number }) {
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

  const updateData: Record<string, string> = {
    quantity: encryptNumber(data.quantity, dek),
    total_value: encryptNumber(totalValue, dek),
  };

  if (data.cost_basis !== undefined) {
    updateData.cost_basis = encryptNumber(data.cost_basis, dek);
  }

  await supabaseAdmin
    .from('assets')
    .update(updateData)
    .eq('id', id);

  revalidatePath('/', 'layout');
}

export async function deleteAssetAction(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const { data: asset } = await supabaseAdmin
    .from('assets')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!asset || asset.user_id !== userId) return;

  await supabaseAdmin.from('assets').delete().eq('id', id);

  revalidatePath('/', 'layout');
}

export async function refreshAssetPricesAction() {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();

  const { data: assets } = await supabaseAdmin
    .from('assets')
    .select('*')
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

          for (const asset of cryptoAssets) {
            const coinData = priceMap.get(asset.coingecko_id);
            if (!coinData) continue;

            const totalValue = asset.quantity * coinData.price;
            await supabaseAdmin
              .from('assets')
              .update({
                current_price: encryptNumber(coinData.price, dek),
                total_value: encryptNumber(totalValue, dek),
                change_24h: encryptNumber(coinData.change, dek),
              })
              .eq('id', asset.id);
          }
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

      for (const asset of stockAssets) {
        const q = quoteMap.get(asset.symbol);
        if (!q) continue;

        let pricePLN: number;
        if (q.currency === 'PLN') {
          pricePLN = q.price;
        } else {
          const curr = q.currency as Currency;
          pricePLN = rates[curr] !== undefined ? q.price / rates[curr] : q.price / (rates.USD || 0.25);
        }

        const totalValue = asset.quantity * pricePLN;
        await supabaseAdmin
          .from('assets')
          .update({
            current_price: encryptNumber(pricePLN, dek),
            total_value: encryptNumber(totalValue, dek),
            change_24h: encryptNumber(q.change, dek),
          })
          .eq('id', asset.id);
      }
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

  if (data.quantityToSell > quantity) {
    throw new Error('Insufficient quantity');
  }

  // 2. Oblicz: proceeds, cost, profit, tax
  const totalProceeds = data.quantityToSell * currentPrice;
  const totalCost = data.quantityToSell * costBasis;
  const profit = totalProceeds - totalCost;
  const taxAmount = Math.max(0, profit) * 0.19;

  // 3. Insert do asset_sales (encrypted)
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
      wallet_id: data.walletId,
      sale_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    });

  if (saleError) {
    console.error('Error inserting asset sale:', saleError);
    throw new Error(saleError.message);
  }

  // 4. Update or delete asset
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

  // 5. Utwórz transakcję income w wybranym portfelu (kwota netto po podatku)
  const netProceeds = totalProceeds - taxAmount;

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
      amount: encryptNumber(netProceeds, dek),
      category: encryptString('Sprzedaż krypto', dek),
      description: encryptString(
        `Sprzedaż ${data.quantityToSell} ${assetSymbol} (podatek: ${taxAmount.toFixed(2)} PLN)`,
        dek
      ),
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      wallet_id: data.walletId,
      currency: 'PLN',
      created_at: new Date().toISOString(),
    });

  // 6. Zaktualizuj saldo portfela
  const currentBalance = decryptNumber(wallet.balance, dek);
  const newBalance = currentBalance + netProceeds;
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

  for (const s of sales || []) {
    totalProceeds += decryptNumber(s.total_proceeds, dek);
    totalCost += decryptNumber(s.total_cost, dek);
    totalProfit += decryptNumber(s.profit, dek);
    totalTax += decryptNumber(s.tax_amount, dek);
  }

  return {
    totalProceeds,
    totalCost,
    totalProfit,
    totalTax,
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
    throw new Error(saleError.message);
  }

  // Transakcja income netto do portfela
  const netProceeds = totalProceeds - taxAmount;

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
      amount: encryptNumber(netProceeds, dek),
      category: encryptString('Sprzedaż krypto', dek),
      description: encryptString(
        `Sprzedaż ${data.quantitySold} ${data.assetSymbol} (podatek: ${taxAmount.toFixed(2)} PLN)`,
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
    .update({ balance: encryptNumber(currentBalance + netProceeds, dek) })
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
  }));

  const decryptedEntries = (entries || []).map(e => ({
    id: e.id,
    habit_id: e.habit_id,
    date: e.date,
    completed: e.completed,
  }));

  return { habits: decryptedHabits, entries: decryptedEntries };
}

export async function addHabit(data: { name: string; color: string; icon: string }) {
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
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding habit:', error);
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
}

export async function editHabit(id: string, data: { name: string; color: string; icon: string }) {
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

// --- MIGRACJA DANYCH ---

export async function migrateUserDataToEncryption() {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const dek = await getDEK();

  // Migruj portfele
  const { data: wallets } = await supabaseAdmin
    .from('wallets')
    .select('id, balance, name')
    .eq('user_id', userId);

  for (const w of wallets || []) {
    const updates: Record<string, string> = {};
    // Saldo
    if (typeof w.balance === 'string' && !w.balance.includes(':')) {
      updates.balance = encryptNumber(parseFloat(w.balance), dek);
    } else if (typeof w.balance === 'number') {
      updates.balance = encryptNumber(w.balance, dek);
    }
    // Nazwa
    if (w.name && typeof w.name === 'string' && w.name.split(':').length !== 3) {
      updates.name = encryptString(w.name, dek);
    }
    if (Object.keys(updates).length > 0) {
      await supabaseAdmin
        .from('wallets')
        .update(updates)
        .eq('id', w.id);
    }
  }

  // Migruj transakcje
  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('id, amount, category, description, wallet_id')
    .in('wallet_id', (wallets || []).map(w => w.id));

  for (const t of transactions || []) {
    const updates: Record<string, string | null> = {};
    // Amount
    if (typeof t.amount === 'string' && !t.amount.includes(':')) {
      updates.amount = encryptNumber(parseFloat(t.amount), dek);
    } else if (typeof t.amount === 'number') {
      updates.amount = encryptNumber(t.amount, dek);
    }
    // Category
    if (t.category && typeof t.category === 'string' && t.category.split(':').length !== 3) {
      updates.category = encryptString(t.category, dek);
    }
    // Description
    if (t.description && typeof t.description === 'string' && t.description.split(':').length !== 3) {
      updates.description = encryptString(t.description, dek);
    }
    if (Object.keys(updates).length > 0) {
      await supabaseAdmin
        .from('transactions')
        .update(updates)
        .eq('id', t.id);
    }
  }

  // Migruj aktywa
  const { data: assets } = await supabaseAdmin
    .from('assets')
    .select('id, quantity, current_price, total_value')
    .eq('user_id', userId);

  for (const a of assets || []) {
    const updates: Record<string, string> = {};
    for (const field of ['quantity', 'current_price', 'total_value'] as const) {
      const val = a[field];
      if (typeof val === 'string' && val.includes(':')) continue;
      const num = typeof val === 'number' ? val : parseFloat(val);
      updates[field] = encryptNumber(num, dek);
    }
    if (Object.keys(updates).length > 0) {
      await supabaseAdmin
        .from('assets')
        .update(updates)
        .eq('id', a.id);
    }
  }
}
