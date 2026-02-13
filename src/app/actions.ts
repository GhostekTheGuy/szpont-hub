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
} from '@/lib/crypto';

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

async function fetchWalletsAndTransactions(userId: string) {
  const dek = await getDEK();

  const { data: wallets, error: walletsError } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  if (walletsError) {
    console.error('Error fetching wallets:', walletsError);
  }

  // Deszyfruj salda portfeli
  const decryptedWallets = (wallets || []).map(w => ({
    ...w,
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
    date: t.date?.split('T')[0] || '',
    walletName: t.wallet?.name || '',
    wallet: t.wallet_id,
    type: t.type as 'income' | 'outcome'
  }));

  return { wallets: decryptedWallets, transactions };
}

export async function getDashboardData() {
  const userId = await getUserId();
  if (!userId) return null;

  const dek = await getDEK();
  const { wallets, transactions } = await fetchWalletsAndTransactions(userId);

  const { data: assets, error: assetsError } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('user_id', userId);

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

  return { wallets, transactions, assets: decryptedAssets };
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

  // 2. Dodaj transakcję (zaszyfrowane amount)
  const { error: insertError } = await supabaseAdmin
    .from('transactions')
    .insert({
      id: nanoid(),
      amount: encryptNumber(data.amount, dek),
      category: data.category,
      description: data.description,
      type: data.type,
      date: data.date,
      wallet_id: data.wallet,
      created_at: new Date().toISOString()
    });

  if (insertError) {
    console.error('Error adding transaction:', insertError);
    throw new Error(insertError.message);
  }

  // 3. Zaktualizuj saldo (zaszyfrowane)
  const newBalance = currentBalance + data.amount;
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

  // Cofnij saldo (zaszyfrowane)
  const newBalance = walletBalance - transactionAmount;
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

  const { data: oldTransaction } = await supabaseAdmin
    .from('transactions')
    .select('*, wallet:wallets(*)')
    .eq('id', id)
    .single();

  if (!oldTransaction || oldTransaction.wallet?.user_id !== userId) return;

  // Odszyfruj wartości do obliczeń
  const oldWalletBalance = decryptNumber(oldTransaction.wallet.balance, dek);
  const oldAmount = decryptNumber(oldTransaction.amount, dek);

  // 1. Cofnij starą transakcję (zaszyfrowane)
  const revertedBalance = oldWalletBalance - oldAmount;
  await supabaseAdmin
    .from('wallets')
    .update({ balance: encryptNumber(revertedBalance, dek) })
    .eq('id', oldTransaction.wallet_id);

  // 2. Zaktualizuj transakcję (zaszyfrowane amount)
  await supabaseAdmin
    .from('transactions')
    .update({
      amount: encryptNumber(data.amount, dek),
      category: data.category,
      description: data.description,
      type: data.type,
      date: data.date,
      wallet_id: data.wallet
    })
    .eq('id', id);

  // 3. Dodaj do nowego portfela
  const { data: newWallet } = await supabaseAdmin
    .from('wallets')
    .select('*')
    .eq('id', data.wallet)
    .single();

  if (newWallet) {
    const newWalletBalance = decryptNumber(newWallet.balance, dek);
    const updatedBalance = newWalletBalance + data.amount;
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
      name: data.name,
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

  await supabaseAdmin
    .from('wallets')
    .update({
      name: data.name,
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

// --- MIGRACJA DANYCH ---

export async function migrateUserDataToEncryption() {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const dek = await getDEK();

  // Migruj portfele
  const { data: wallets } = await supabaseAdmin
    .from('wallets')
    .select('id, balance')
    .eq('user_id', userId);

  for (const w of wallets || []) {
    // Pomiń już zaszyfrowane (zawierają ':')
    if (typeof w.balance === 'string' && w.balance.includes(':')) continue;
    const numBalance = typeof w.balance === 'number' ? w.balance : parseFloat(w.balance);
    await supabaseAdmin
      .from('wallets')
      .update({ balance: encryptNumber(numBalance, dek) })
      .eq('id', w.id);
  }

  // Migruj transakcje
  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('id, amount, wallet_id')
    .in('wallet_id', (wallets || []).map(w => w.id));

  for (const t of transactions || []) {
    if (typeof t.amount === 'string' && t.amount.includes(':')) continue;
    const numAmount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount);
    await supabaseAdmin
      .from('transactions')
      .update({ amount: encryptNumber(numAmount, dek) })
      .eq('id', t.id);
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
