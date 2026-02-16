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
import { getExchangeRates, convertAmount, type Currency } from '@/lib/exchange-rates';

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
    type: t.type as 'income' | 'outcome',
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
    quantity: decryptNumber(a.quantity, dek),
    current_price: decryptNumber(a.current_price, dek),
    total_value: decryptNumber(a.total_value, dek),
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
    quantity: decryptNumber(a.quantity, dek),
    current_price: decryptNumber(a.current_price, dek),
    total_value: decryptNumber(a.total_value, dek),
  }));

  return { assets: decryptedAssets };
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

  await supabaseAdmin
    .from('wallets')
    .update({
      name: encryptString(data.name, dek),
      type: data.type,
      color: data.color,
      icon: data.icon
    })
    .eq('id', id);

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

  const [{ data: events, error: eventsError }, { data: wallets }] = await Promise.all([
    supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', weekStart)
      .lte('end_time', weekEnd)
      .order('start_time', { ascending: true }),
    supabaseAdmin
      .from('wallets')
      .select('id, name, color')
      .eq('user_id', userId),
  ]);

  if (eventsError) {
    console.error('Error fetching calendar events:', eventsError);
  }

  const walletMap = new Map(
    (wallets || []).map(w => [w.id, { name: decryptString(w.name, dek) || w.name, color: w.color }])
  );

  const decryptedEvents = (events || []).map(e => ({
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

export async function settleWeekAction(weekStart: string, weekEnd: string) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  const dek = await getDEK();
  const rates = await getExchangeRates();

  // Pobierz niezatwierdzone eventy z tego tygodnia
  const { data: events, error } = await supabaseAdmin
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .eq('is_settled', false)
    .gte('start_time', weekStart)
    .lte('end_time', weekEnd);

  if (error || !events || events.length === 0) return { settled: 0 };

  // Grupuj zarobki per portfel
  const walletEarnings = new Map<string, number>();

  for (const event of events) {
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
  const eventIds = events.map(e => e.id);
  await supabaseAdmin
    .from('calendar_events')
    .update({ is_settled: true })
    .in('id', eventIds);

  revalidatePath('/', 'layout');
  return { settled: events.length };
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

  const current = calcEarnings(events);
  const previous = calcEarnings(prevEvents);
  const unsettledCount = (events || []).filter(e => !e.is_settled).length;

  return {
    totalEarnings: current.total,
    totalHours: current.totalHours,
    byWallet: current.byWallet,
    previousWeekEarnings: previous.total,
    previousWeekHours: previous.totalHours,
    unsettledCount,
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

  const current = calcEarnings(events);
  const previous = calcEarnings(prevEvents);
  const unsettledCount = (events || []).filter(e => !e.is_settled).length;

  return {
    totalEarnings: current.total,
    totalHours: current.totalHours,
    byWallet: current.byWallet,
    weeklyBreakdown: current.weeklyBreakdown,
    previousPeriodEarnings: previous.total,
    previousPeriodHours: previous.totalHours,
    unsettledCount,
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
    .eq('is_settled', false)
    .gte('start_time', monthStart)
    .lte('end_time', monthEnd);

  if (error || !events || events.length === 0) return { settled: 0 };

  const walletEarnings = new Map<string, number>();

  for (const event of events) {
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

  const eventIds = events.map(e => e.id);
  await supabaseAdmin
    .from('calendar_events')
    .update({ is_settled: true })
    .in('id', eventIds);

  revalidatePath('/', 'layout');
  return { settled: events.length };
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
