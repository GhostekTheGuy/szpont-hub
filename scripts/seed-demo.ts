/**
 * Demo account seed script
 * Creates demo@szpont.pl / demo1234 with rich, realistic data
 *
 * Usage: npm run seed:demo
 */

require('dotenv').config();

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ─── Crypto (inlined to avoid server-only / path alias issues) ───

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const IV_LENGTH = 12;

function deriveKEK(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

function encrypt(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

function generateDEK(): Buffer { return crypto.randomBytes(KEY_LENGTH); }
function generateSalt(): Buffer { return crypto.randomBytes(KEY_LENGTH); }
function encryptDEK(dek: Buffer, kek: Buffer): string { return encrypt(dek.toString('base64'), kek); }
function encryptNumber(value: number, dek: Buffer): string { return encrypt(value.toString(), dek); }
function encryptString(value: string, dek: Buffer): string { if (!value) return value; return encrypt(value, dek); }

// ─── Helpers ───

function nanoid(size = 21): string { return crypto.randomBytes(size).toString('base64url').slice(0, size); }
function randomInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function dateStr(d: Date): string { return d.toISOString().split('T')[0]; }
function isoStr(d: Date): string { return d.toISOString(); }

// ─── Config ───

const EMAIL = 'demo@szpont.pl';
const PASSWORD = 'demo1234';
const FORCE = process.argv.includes('--force');

// ─── Main ───

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Check existing user ──
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === EMAIL);

  if (existingUser && !FORCE) {
    console.log(`User ${EMAIL} already exists (id: ${existingUser.id}). Use --force to recreate.`);
    process.exit(0);
  }

  if (existingUser && FORCE) {
    console.log('Removing existing demo user...');
    const uid = existingUser.id;
    await supabase.from('habit_entries').delete().in(
      'habit_id',
      (await supabase.from('habits').select('id').eq('user_id', uid)).data?.map((h: any) => h.id) || []
    );
    await supabase.from('habits').delete().eq('user_id', uid);
    await supabase.from('scan_logs').delete().eq('user_id', uid);
    await supabase.from('subscriptions').delete().eq('user_id', uid);
    await supabase.from('goals').delete().eq('user_id', uid);
    await supabase.from('calendar_events').delete().eq('user_id', uid);
    await supabase.from('asset_sales').delete().eq('user_id', uid);
    await supabase.from('assets').delete().eq('user_id', uid);
    await supabase.from('transactions').delete().in(
      'wallet_id',
      (await supabase.from('wallets').select('id').eq('user_id', uid)).data?.map((w: any) => w.id) || []
    );
    await supabase.from('wallets').delete().eq('user_id', uid);
    await supabase.from('users').delete().eq('id', uid);
    await supabase.auth.admin.deleteUser(uid);
    console.log('Existing demo user removed.');
  }

  // ══════════════════════════════════════════════
  //  Kacper Szpont — freelance fullstack dev, 24
  //  Main gig: kontrakt B2B w software house
  //  Side: własne projekty, trochę crypto
  // ══════════════════════════════════════════════

  // ── Step 1: Create user ──
  console.log('\n1. Creating user...');
  const salt = generateSalt();
  const dek = generateDEK();
  const kek = await deriveKEK(PASSWORD, salt);
  const encryptedDek = encryptDEK(dek, kek);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'Kacper Szpont' },
  });

  if (authError || !authData.user) {
    console.error('Failed to create auth user:', authError);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`   Auth user created: ${userId}`);

  const { error: dbError } = await supabase.from('users').insert({
    id: userId,
    email: EMAIL,
    name: 'Kacper Szpont',
    encryption_salt: salt.toString('base64'),
    encrypted_dek: encryptedDek,
    onboarding_done: true,
    balance_masked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (dbError) {
    console.error('Failed to insert users row:', dbError);
    await supabase.auth.admin.deleteUser(userId);
    process.exit(1);
  }
  console.log('   Users row inserted.');

  // ── Step 2: Wallets ──
  console.log('\n2. Creating wallets...');
  const wallets = [
    { id: nanoid(), name: 'mBank',        type: 'fiat',   balance: 8740,   color: '#6366f1', icon: 'wallet',      currency: 'PLN', track_from: '2024-09-01', initial_balance: 3200 },
    { id: nanoid(), name: 'Oszczędności',  type: 'fiat',   balance: 34200,  color: '#22c55e', icon: 'piggy-bank',  currency: 'PLN', track_from: '2024-09-01', initial_balance: 15000 },
    { id: nanoid(), name: 'Revolut',       type: 'fiat',   balance: 2150,   color: '#0ea5e9', icon: 'credit-card', currency: 'PLN', track_from: '2024-11-01', initial_balance: 800 },
    { id: nanoid(), name: 'Binance',       type: 'crypto', balance: 18900,  color: '#f59e0b', icon: 'bitcoin',     currency: 'PLN', track_from: '2025-01-01', initial_balance: 5000 },
    { id: nanoid(), name: 'Gotówka',       type: 'fiat',   balance: 420,    color: '#a3a3a3', icon: 'banknote',    currency: 'PLN', track_from: '2024-09-01', initial_balance: 500 },
  ];

  for (const w of wallets) {
    await supabase.from('wallets').insert({
      id: w.id, user_id: userId,
      name: encryptString(w.name, dek),
      balance: encryptNumber(w.balance, dek),
      icon: w.icon, color: w.color, type: w.type, currency: w.currency,
      track_from: encryptString(w.track_from, dek),
      initial_balance: encryptNumber(w.initial_balance, dek),
      created_at: new Date().toISOString(),
    });
    console.log(`   ${w.name} — ${w.balance} PLN (track from ${w.track_from}, initial: ${w.initial_balance})`);
  }

  const [mbankId, oszczId, revolutId, binanceId, gotowkaId] = wallets.map(w => w.id);

  // ── Step 3: Transactions (~300+, last 18 months) ──
  console.log('\n3. Creating transactions...');
  const now = new Date();
  let txCount = 0;

  const monthlyFixed = [
    { cat: 'Wynagrodzenie B2B', amount: 14500, wallet: mbankId, type: 'income' as const, desc: 'Faktura — NovaSoft sp. z o.o.' },
    { cat: 'Rachunki',          amount: -850,  wallet: mbankId, type: 'outcome' as const, desc: 'Czynsz + media' },
    { cat: 'Rachunki',          amount: -89,   wallet: mbankId, type: 'outcome' as const, desc: 'Internet Netia' },
    { cat: 'Rachunki',          amount: -65,   wallet: mbankId, type: 'outcome' as const, desc: 'Telefon Play' },
    { cat: 'Subskrypcje',       amount: -49,   wallet: revolutId, type: 'outcome' as const, desc: 'Spotify Family' },
    { cat: 'Subskrypcje',       amount: -45,   wallet: revolutId, type: 'outcome' as const, desc: 'ChatGPT Plus' },
    { cat: 'Subskrypcje',       amount: -39,   wallet: revolutId, type: 'outcome' as const, desc: 'GitHub Copilot' },
    { cat: 'Subskrypcje',       amount: -55,   wallet: revolutId, type: 'outcome' as const, desc: 'Netflix' },
    { cat: 'Ubezpieczenia',     amount: -320,  wallet: mbankId, type: 'outcome' as const, desc: 'Składka ZUS' },
  ];

  const variableOutcome = [
    { cat: 'Jedzenie',    descs: ['Biedronka', 'Lidl', 'Żabka', 'Uber Eats', 'Pyszne.pl', 'Starbucks', 'Kebab u Alego', 'Sushi Kushi'], min: 25, max: 180 },
    { cat: 'Transport',   descs: ['Bolt', 'Uber', 'Orlen tankowanie', 'Bilety PKP', 'Parking'], min: 15, max: 250 },
    { cat: 'Rozrywka',    descs: ['Cinema City', 'Steam', 'PS Store', 'Bilety na koncert', 'Escape room'], min: 30, max: 200 },
    { cat: 'Zakupy',      descs: ['Amazon', 'Allegro', 'Media Expert', 'IKEA', 'Decathlon', 'Zalando'], min: 50, max: 600 },
    { cat: 'Zdrowie',     descs: ['Apteka', 'Wizyta lekarz', 'Suplementy'], min: 30, max: 200 },
    { cat: 'Jedzenie',    descs: ['Makro', 'Auchan', 'Carrefour'], min: 150, max: 400 },
    { cat: 'Edukacja',    descs: ['Udemy kurs', 'Książka tech', 'Konferencja'], min: 40, max: 300 },
    { cat: 'Prezenty',    descs: ['Prezent urodzinowy', 'Prezent świąteczny', 'Kwiaty', 'Voucher'], min: 50, max: 400 },
  ];

  const freelanceGigs = [
    { desc: 'Landing page — FitLife', amount: 2500 },
    { desc: 'Redesign UI — Booksy clone', amount: 4000 },
    { desc: 'API integration — klient DE', amount: 3200 },
    { desc: 'Konsultacja tech — startup', amount: 800 },
    { desc: 'Fix bugs — e-commerce', amount: 1200 },
    { desc: 'Dashboard analytics — SaaS', amount: 5500 },
    { desc: 'Mobile app prototype', amount: 3800 },
    { desc: 'Automatyzacja CI/CD', amount: 2000 },
  ];

  let freelanceIdx = 0;

  for (let monthsAgo = 17; monthsAgo >= 0; monthsAgo--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monthly fixed
    for (const f of monthlyFixed) {
      const day = f.type === 'income' ? randomInt(1, 5) : randomInt(1, 10);
      const txDate = new Date(year, month, Math.min(day, daysInMonth));
      await supabase.from('transactions').insert({
        id: nanoid(), wallet_id: f.wallet,
        amount: encryptNumber(Math.abs(f.amount), dek),
        category: encryptString(f.cat, dek),
        description: encryptString(f.desc, dek),
        type: f.type, date: dateStr(txDate),
        currency: 'PLN', created_at: isoStr(txDate),
      });
      txCount++;
    }

    // Variable spending: 8-14 per month
    const varCount = randomInt(8, 14);
    for (let i = 0; i < varCount; i++) {
      const cat = randomPick(variableOutcome);
      const amount = randomInt(cat.min, cat.max);
      const day = randomInt(1, Math.min(28, daysInMonth));
      const txDate = new Date(year, month, day);
      const walletId = Math.random() < 0.5 ? mbankId : Math.random() < 0.6 ? revolutId : gotowkaId;

      await supabase.from('transactions').insert({
        id: nanoid(), wallet_id: walletId,
        amount: encryptNumber(-amount, dek),
        category: encryptString(cat.cat, dek),
        description: encryptString(randomPick(cat.descs), dek),
        type: 'outcome', date: dateStr(txDate),
        currency: walletId === revolutId && Math.random() < 0.2 ? 'EUR' : 'PLN',
        created_at: isoStr(txDate),
      });
      txCount++;
    }

    // Freelance income: 0-2 per month
    const freelanceCount = randomInt(0, 2);
    for (let i = 0; i < freelanceCount; i++) {
      const gig = freelanceGigs[freelanceIdx % freelanceGigs.length];
      freelanceIdx++;
      const day = randomInt(10, 28);
      const txDate = new Date(year, month, Math.min(day, daysInMonth));
      const currency = Math.random() < 0.7 ? 'PLN' : randomPick(['EUR', 'USD']);

      await supabase.from('transactions').insert({
        id: nanoid(), wallet_id: Math.random() < 0.6 ? mbankId : revolutId,
        amount: encryptNumber(gig.amount, dek),
        category: encryptString('Freelance', dek),
        description: encryptString(gig.desc, dek),
        type: 'income', date: dateStr(txDate),
        currency, created_at: isoStr(txDate),
      });
      txCount++;
    }

    // Transfers: 1-2 per month
    const transferCount = randomInt(1, 2);
    for (let i = 0; i < transferCount; i++) {
      const amount = randomPick([1000, 1500, 2000, 2500, 3000]);
      const day = randomInt(5, 15);
      const txDate = new Date(year, month, Math.min(day, daysInMonth));

      await supabase.from('transactions').insert({
        id: nanoid(), wallet_id: mbankId,
        amount: encryptNumber(amount, dek),
        category: encryptString('Transfer', dek),
        description: encryptString('Oszczędności', dek),
        type: 'transfer', date: dateStr(txDate),
        currency: 'PLN', created_at: isoStr(txDate),
      });
      txCount++;
    }

    // Quarterly tax payment (months: Jan, Apr, Jul, Oct)
    if ([0, 3, 6, 9].includes(month)) {
      const taxAmount = randomInt(1800, 2400);
      const txDate = new Date(year, month, 20);
      await supabase.from('transactions').insert({
        id: nanoid(), wallet_id: mbankId,
        amount: encryptNumber(-taxAmount, dek),
        category: encryptString('Podatki', dek),
        description: encryptString('Zaliczka PIT — kwartalny', dek),
        type: 'outcome', date: dateStr(txDate),
        currency: 'PLN', created_at: isoStr(txDate),
      });
      txCount++;
    }

    // Monthly savings transfer
    {
      const savingsAmount = randomPick([2000, 2500, 3000, 3500]);
      const day = randomInt(1, 5);
      const txDate = new Date(year, month, Math.min(day, daysInMonth));
      await supabase.from('transactions').insert({
        id: nanoid(), wallet_id: oszczId,
        amount: encryptNumber(savingsAmount, dek),
        category: encryptString('Oszczędności', dek),
        description: encryptString('Przelew na oszczędności', dek),
        type: 'income', date: dateStr(txDate),
        currency: 'PLN', created_at: isoStr(txDate),
      });
      txCount++;
    }

    // Occasional investment purchase (ETF/stocks)
    if (Math.random() < 0.4) {
      const investAmount = randomPick([500, 1000, 1500, 2000, 3000]);
      const day = randomInt(5, 20);
      const txDate = new Date(year, month, Math.min(day, daysInMonth));
      await supabase.from('transactions').insert({
        id: nanoid(), wallet_id: mbankId,
        amount: encryptNumber(-investAmount, dek),
        category: encryptString('Inwestycje', dek),
        description: encryptString(randomPick(['Zakup ETF VWCE', 'Zakup ETF S&P500', 'Zakup akcji AAPL', 'Zakup akcji NVDA', 'DCA ETF globalny']), dek),
        type: 'outcome', date: dateStr(txDate),
        currency: 'PLN', created_at: isoStr(txDate),
      });
      txCount++;
    }

    // Occasional crypto buy
    if (Math.random() < 0.3) {
      const amount = randomPick([500, 1000, 1500, 2000]);
      const day = randomInt(1, 28);
      const txDate = new Date(year, month, Math.min(day, daysInMonth));
      await supabase.from('transactions').insert({
        id: nanoid(), wallet_id: binanceId,
        amount: encryptNumber(amount, dek),
        category: encryptString('Crypto DCA', dek),
        description: encryptString(randomPick(['Zakup BTC', 'Zakup ETH', 'Zakup SOL']), dek),
        type: 'income', date: dateStr(txDate),
        currency: 'PLN', created_at: isoStr(txDate),
      });
      txCount++;
    }
  }
  console.log(`   Created ${txCount} transactions.`);

  // ── Step 4: Assets ──
  console.log('\n4. Creating assets...');
  const assets = [
    { symbol: 'BTC',  name: 'Bitcoin',   coingecko_id: 'bitcoin',   quantity: 0.085, current_price: 395000, cost_basis: 352000, change_24h: 1.9,  asset_type: 'crypto' },
    { symbol: 'ETH',  name: 'Ethereum',  coingecko_id: 'ethereum',  quantity: 1.8,   current_price: 14200,  cost_basis: 11800,  change_24h: 2.4,  asset_type: 'crypto' },
    { symbol: 'SOL',  name: 'Solana',    coingecko_id: 'solana',    quantity: 32,    current_price: 720,    cost_basis: 540,    change_24h: 4.7,  asset_type: 'crypto' },
    { symbol: 'LINK', name: 'Chainlink', coingecko_id: 'chainlink', quantity: 85,    current_price: 78,     cost_basis: 58,     change_24h: 1.2,  asset_type: 'crypto' },
    { symbol: 'AVAX', name: 'Avalanche', coingecko_id: 'avalanche-2', quantity: 50,  current_price: 145,    cost_basis: 120,    change_24h: -0.8, asset_type: 'crypto' },
    { symbol: 'AAPL', name: 'Apple',     coingecko_id: '',          quantity: 5,     current_price: 920,    cost_basis: 780,    change_24h: 0.4,  asset_type: 'stock' },
    { symbol: 'NVDA', name: 'NVIDIA',    coingecko_id: '',          quantity: 3,     current_price: 4850,   cost_basis: 3200,   change_24h: 1.1,  asset_type: 'stock' },
  ];

  for (const a of assets) {
    const totalValue = a.quantity * a.current_price;
    await supabase.from('assets').insert({
      id: nanoid(), user_id: userId,
      name: encryptString(a.name, dek),
      symbol: encryptString(a.symbol, dek),
      coingecko_id: encryptString(a.coingecko_id, dek),
      quantity: encryptNumber(a.quantity, dek),
      current_price: encryptNumber(a.current_price, dek),
      total_value: encryptNumber(totalValue, dek),
      change_24h: encryptNumber(a.change_24h, dek),
      cost_basis: encryptNumber(a.cost_basis, dek),
      asset_type: a.asset_type,
      created_at: new Date().toISOString(),
    });
    console.log(`   ${a.symbol} — ${a.quantity} × ${a.current_price} PLN`);
  }

  // ── Step 5: Asset Sales ──
  console.log('\n5. Creating asset sales...');
  const sales = [
    { asset_name: 'Dogecoin', asset_symbol: 'DOGE', quantity_sold: 8000, sale_price_per_unit: 1.45, cost_basis_per_unit: 0.90, total_proceeds: 11600, total_cost: 7200, profit: 4400, tax_amount: 836, sale_date: dateStr(new Date(now.getFullYear(), now.getMonth() - 3, 22)) },
    { asset_name: 'Polkadot', asset_symbol: 'DOT', quantity_sold: 150, sale_price_per_unit: 28, cost_basis_per_unit: 38, total_proceeds: 4200, total_cost: 5700, profit: -1500, tax_amount: 0, sale_date: dateStr(new Date(now.getFullYear(), now.getMonth() - 2, 8)) },
    { asset_name: 'Cardano', asset_symbol: 'ADA', quantity_sold: 5000, sale_price_per_unit: 2.85, cost_basis_per_unit: 1.60, total_proceeds: 14250, total_cost: 8000, profit: 6250, tax_amount: 1187, sale_date: dateStr(new Date(now.getFullYear(), now.getMonth() - 1, 14)) },
    { asset_name: 'Polygon', asset_symbol: 'MATIC', quantity_sold: 3000, sale_price_per_unit: 3.20, cost_basis_per_unit: 2.10, total_proceeds: 9600, total_cost: 6300, profit: 3300, tax_amount: 627, sale_date: dateStr(new Date(now.getFullYear(), now.getMonth() - 5, 10)) },
    { asset_name: 'Solana', asset_symbol: 'SOL', quantity_sold: 10, sale_price_per_unit: 780, cost_basis_per_unit: 540, total_proceeds: 7800, total_cost: 5400, profit: 2400, tax_amount: 456, sale_date: dateStr(new Date(now.getFullYear(), now.getMonth() - 4, 18)) },
    { asset_name: 'Apple', asset_symbol: 'AAPL', quantity_sold: 3, sale_price_per_unit: 950, cost_basis_per_unit: 780, total_proceeds: 2850, total_cost: 2340, profit: 510, tax_amount: 97, sale_date: dateStr(new Date(now.getFullYear(), now.getMonth() - 6, 5)) },
    { asset_name: 'Uniswap', asset_symbol: 'UNI', quantity_sold: 200, sale_price_per_unit: 28, cost_basis_per_unit: 42, total_proceeds: 5600, total_cost: 8400, profit: -2800, tax_amount: 0, sale_date: dateStr(new Date(now.getFullYear(), now.getMonth() - 7, 22)) },
  ];

  for (const s of sales) {
    await supabase.from('asset_sales').insert({
      id: nanoid(), user_id: userId,
      asset_name: encryptString(s.asset_name, dek), asset_symbol: encryptString(s.asset_symbol, dek),
      quantity_sold: encryptNumber(s.quantity_sold, dek),
      sale_price_per_unit: encryptNumber(s.sale_price_per_unit, dek),
      cost_basis_per_unit: encryptNumber(s.cost_basis_per_unit, dek),
      total_proceeds: encryptNumber(s.total_proceeds, dek),
      total_cost: encryptNumber(s.total_cost, dek),
      profit: encryptNumber(s.profit, dek),
      tax_amount: encryptNumber(s.tax_amount, dek),
      wallet_id: binanceId, sale_date: s.sale_date, created_at: new Date().toISOString(),
    });
    console.log(`   ${s.asset_symbol} — profit: ${s.profit} PLN`);
  }

  // ── Step 6: Calendar Events (full year 2026) ──
  console.log('\n6. Creating calendar events for 2026...');
  let eventCount = 0;
  const calBatch: any[] = [];

  const flushCalendar = async () => {
    for (let i = 0; i < calBatch.length; i += 50) {
      const batch = calBatch.slice(i, i + 50);
      const { error } = await supabase.from('calendar_events').insert(batch);
      if (error) console.error(`   Cal batch error:`, error.message);
    }
    eventCount += calBatch.length;
    calBatch.length = 0;
  };

  // Kacper works B2B for NovaSoft, has clients, and personal life
  // Full 2026: Jan 5 (first Monday) through Dec 31

  // Vacation/holiday weeks — week index from Jan 5 = 0
  // Week 9 (Mar 9): konferencja/wyjazd
  // Week 13 (Apr 6): Wielkanoc — off
  // Week 22 (Jun 1): długi weekend Boże Ciało
  // Week 30-31 (Aug 3-16): wakacje letnie — off
  // Week 44 (Nov 2): Wszystkich Świętych — light
  // Week 50-51 (Dec 21-28): Boże Narodzenie / Sylwester — off
  const vacationWeeks = new Set([13, 30, 31, 50, 51]);
  const lightWeeks = new Set([9, 14, 22, 29, 32, 44, 49]);

  const adHocMeetings = [
    'Demo klienta', 'Sync z designem', 'Rozmowa z PM', 'Prezentacja architektury',
    'Pair programming', 'Planowanie migracji DB', 'Sync z QA', 'Refinement backlogu',
    'Interview kandydat', 'Tech debt review', 'Onboarding nowego dev', 'Sync z frontendem',
    'Grooming backlogu', 'Deployment review', 'Architektura mikroserwisów',
  ];

  const freelanceEvents = [
    'Freelance — landing page', 'Freelance — API', 'Freelance — UI redesign',
    'Freelance — bug fixing', 'Freelance — konsultacja', 'Freelance — prototyp',
    'Praca nad side project', 'Freelance — e-commerce', 'Freelance — dashboard',
    'Freelance — mobile app',
  ];

  const personalRoutine = [
    { title: 'Siłownia',         dur: 75,  days: [0, 2, 4], h: 7 },
    { title: 'Bieganie',         dur: 45,  days: [1, 3],    h: 6 },
    { title: 'Zakupy spożywcze', dur: 45,  days: [5],       h: 11 },
  ];

  const randomPersonal = [
    'Kolacja z Olą', 'Kino z ziomkami', 'Wizyta u rodziców', 'Fryzjer',
    'Dentysta', 'Spotkanie z Kubą', 'Piwo z ekipą', 'Spacer z psem',
    'Gotowanie', 'Nauka japońskiego', 'Grill u Adama', 'Mecz piłki',
    'Escape room', 'Basen', 'Masaż', 'Spotkanie z księgową',
    'Wyjście na miasto', 'Koncert', 'Bilard z ekipą', 'Planszówki',
    'Wizyta u dziadków', 'Kręgle', 'Zakupy w IKEA', 'Sprzątanie mieszkania',
  ];

  const vacationPersonal = [
    'Plaża', 'Zwiedzanie', 'Wycieczka rowerowa', 'Relaks',
    'Góry — szlak', 'Grill z rodziną', 'Kajaki', 'Fotografia',
  ];

  // Iterate week by week: Jan 5, 2026 (Mon) through end of year
  const weekMon = new Date(2026, 0, 5);
  let weekIdx = 0;

  while (weekMon.getFullYear() <= 2026) {
    const ws = new Date(weekMon); // week start (Monday)
    const isVacation = vacationWeeks.has(weekIdx);
    const isLight = lightWeeks.has(weekIdx);
    const isPast = ws < now;
    const weeksFromNow = Math.round((now.getTime() - ws.getTime()) / (7 * 24 * 3600000));
    const isSettled = isPast && weeksFromNow > 2;
    const isConfirmedWork = isPast ? (weeksFromNow > 0 || Math.random() < 0.7) : false;

    if (!isVacation) {
      // ── NovaSoft work blocks (Mon-Fri, 4-5 days or 2-3 on light weeks) ──
      const workDaysCount = isLight ? randomInt(2, 3) : randomInt(4, 5);
      const allDays = [0, 1, 2, 3, 4];
      const workDays = allDays.sort(() => Math.random() - 0.5).slice(0, workDaysCount);

      for (const dayOff of workDays) {
        const d = new Date(ws); d.setDate(d.getDate() + dayOff);
        const startH = randomPick([8, 9]);
        const endH = randomPick([16, 17]);
        const start = new Date(d); start.setHours(startH, 0, 0, 0);
        const end = new Date(d); end.setHours(endH, 0, 0, 0);

        calBatch.push({
          id: nanoid(), user_id: userId,
          title: encryptString(randomPick(['Praca — NovaSoft', 'NovaSoft dev', 'NovaSoft — sprint', 'NovaSoft — feature work']), dek),
          wallet_id: mbankId, hourly_rate: encryptNumber(120, dek),
          start_time: isoStr(start), end_time: isoStr(end),
          is_recurring: false, recurrence_rule: null,
          is_settled: isSettled, is_confirmed: isConfirmedWork,
          event_type: 'work', created_at: isoStr(start),
        });
      }

      // ── Recurring meetings (standup, sprint, retro, 1:1, code review) ──
      if (!isLight) {
        // Daily standup Mon-Fri 9:00-9:15
        for (let d = 0; d < 5; d++) {
          const day = new Date(ws); day.setDate(day.getDate() + d);
          const start = new Date(day); start.setHours(9, 0, 0, 0);
          const end = new Date(day); end.setHours(9, 15, 0, 0);

          calBatch.push({
            id: nanoid(), user_id: userId,
            title: encryptString('Daily standup', dek),
            wallet_id: mbankId, hourly_rate: encryptNumber(120, dek),
            start_time: isoStr(start), end_time: isoStr(end),
            is_recurring: true, recurrence_rule: 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
            is_settled: isSettled, is_confirmed: true,
            event_type: 'work', created_at: isoStr(start),
          });
        }

        // Sprint planning — Monday 10:00-11:30 (biweekly)
        if (weekIdx % 2 === 0) {
          const start = new Date(ws); start.setHours(10, 0, 0, 0);
          const end = new Date(ws); end.setHours(11, 30, 0, 0);

          calBatch.push({
            id: nanoid(), user_id: userId,
            title: encryptString('Sprint planning', dek),
            wallet_id: mbankId, hourly_rate: encryptNumber(120, dek),
            start_time: isoStr(start), end_time: isoStr(end),
            is_recurring: true, recurrence_rule: 'RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO',
            is_settled: isSettled, is_confirmed: true,
            event_type: 'work', created_at: isoStr(start),
          });
        }

        // Retro — Friday 15:00-16:00 (biweekly, alternating)
        if (weekIdx % 2 === 1) {
          const fri = new Date(ws); fri.setDate(fri.getDate() + 4);
          const start = new Date(fri); start.setHours(15, 0, 0, 0);
          const end = new Date(fri); end.setHours(16, 0, 0, 0);

          calBatch.push({
            id: nanoid(), user_id: userId,
            title: encryptString('Retro', dek),
            wallet_id: mbankId, hourly_rate: encryptNumber(120, dek),
            start_time: isoStr(start), end_time: isoStr(end),
            is_recurring: true, recurrence_rule: 'RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=FR',
            is_settled: isSettled, is_confirmed: true,
            event_type: 'work', created_at: isoStr(start),
          });
        }

        // 1:1 z CTO — Wednesday 13:00-13:30
        {
          const wed = new Date(ws); wed.setDate(wed.getDate() + 2);
          const start = new Date(wed); start.setHours(13, 0, 0, 0);
          const end = new Date(wed); end.setHours(13, 30, 0, 0);

          calBatch.push({
            id: nanoid(), user_id: userId,
            title: encryptString('1:1 z Marcinem (CTO)', dek),
            wallet_id: mbankId, hourly_rate: encryptNumber(120, dek),
            start_time: isoStr(start), end_time: isoStr(end),
            is_recurring: true, recurrence_rule: 'RRULE:FREQ=WEEKLY;BYDAY=WE',
            is_settled: isSettled, is_confirmed: true,
            event_type: 'work', created_at: isoStr(start),
          });
        }

        // Code review — Thursday 14:00-15:00
        {
          const thu = new Date(ws); thu.setDate(thu.getDate() + 3);
          const start = new Date(thu); start.setHours(14, 0, 0, 0);
          const end = new Date(thu); end.setHours(15, 0, 0, 0);

          calBatch.push({
            id: nanoid(), user_id: userId,
            title: encryptString('Code review', dek),
            wallet_id: mbankId, hourly_rate: encryptNumber(120, dek),
            start_time: isoStr(start), end_time: isoStr(end),
            is_recurring: true, recurrence_rule: 'RRULE:FREQ=WEEKLY;BYDAY=TH',
            is_settled: isSettled, is_confirmed: true,
            event_type: 'work', created_at: isoStr(start),
          });
        }
      }

      // ── Ad-hoc meetings (2-4 per week, 1-2 on light) ──
      const meetCount = isLight ? randomInt(1, 2) : randomInt(2, 4);
      for (let i = 0; i < meetCount; i++) {
        const dayOff = randomInt(0, 4);
        const d = new Date(ws); d.setDate(d.getDate() + dayOff);
        const h = randomPick([10, 11, 12, 14, 15, 16]);
        const dur = randomPick([30, 45, 60]);
        const start = new Date(d); start.setHours(h, randomPick([0, 30]), 0, 0);
        const end = new Date(start.getTime() + dur * 60_000);

        calBatch.push({
          id: nanoid(), user_id: userId,
          title: encryptString(randomPick(adHocMeetings), dek),
          wallet_id: mbankId, hourly_rate: encryptNumber(120, dek),
          start_time: isoStr(start), end_time: isoStr(end),
          is_recurring: false, recurrence_rule: null,
          is_settled: isSettled, is_confirmed: isPast ? Math.random() < 0.85 : false,
          event_type: 'work', created_at: isoStr(start),
        });
      }

      // ── Freelance sessions (0-2 per week) ──
      const flCount = isLight ? randomInt(0, 1) : randomInt(0, 2);
      for (let i = 0; i < flCount; i++) {
        const dayOff = Math.random() < 0.4 ? randomInt(5, 6) : randomInt(0, 4);
        const d = new Date(ws); d.setDate(d.getDate() + dayOff);
        const h = dayOff >= 5 ? randomInt(10, 15) : randomInt(18, 20);
        const dur = randomPick([60, 90, 120, 180]);
        const start = new Date(d); start.setHours(h, 0, 0, 0);
        const end = new Date(start.getTime() + dur * 60_000);

        calBatch.push({
          id: nanoid(), user_id: userId,
          title: encryptString(randomPick(freelanceEvents), dek),
          wallet_id: revolutId, hourly_rate: encryptNumber(randomPick([100, 120, 150]), dek),
          start_time: isoStr(start), end_time: isoStr(end),
          is_recurring: false, recurrence_rule: null,
          is_settled: isSettled, is_confirmed: isConfirmedWork,
          event_type: 'work', created_at: isoStr(start),
        });
      }
    }

    // ── Personal routine (gym, running, groceries — even partial during vacation) ──
    for (const pe of personalRoutine) {
      for (const dayOff of pe.days) {
        const skipChance = isVacation ? 0.5 : 0.25;
        if (Math.random() > skipChance) {
          const d = new Date(ws); d.setDate(d.getDate() + dayOff);
          const start = new Date(d); start.setHours(pe.h, 0, 0, 0);
          const end = new Date(start.getTime() + pe.dur * 60_000);

          calBatch.push({
            id: nanoid(), user_id: userId,
            title: encryptString(pe.title, dek),
            wallet_id: null, hourly_rate: encryptNumber(0, dek),
            start_time: isoStr(start), end_time: isoStr(end),
            is_recurring: true, recurrence_rule: pe.days.length > 1
              ? `RRULE:FREQ=WEEKLY;BYDAY=${pe.days.map(d => ['MO','TU','WE','TH','FR','SA','SU'][d]).join(',')}`
              : `RRULE:FREQ=WEEKLY;BYDAY=${['MO','TU','WE','TH','FR','SA','SU'][pe.days[0]]}`,
            is_settled: false, is_confirmed: true,
            event_type: 'personal', created_at: isoStr(start),
          });
        }
      }
    }

    // ── Random personal events (1-3 per week, more during vacation) ──
    const rpCount = isVacation ? randomInt(3, 5) : randomInt(1, 3);
    const personalPool = isVacation ? [...randomPersonal, ...vacationPersonal] : randomPersonal;

    for (let i = 0; i < rpCount; i++) {
      const dayOff = randomInt(0, 6);
      const d = new Date(ws); d.setDate(d.getDate() + dayOff);
      const h = randomInt(10, 20);
      const dur = randomPick([30, 60, 90, 120]);
      const start = new Date(d); start.setHours(h, randomPick([0, 15, 30]), 0, 0);
      const end = new Date(start.getTime() + dur * 60_000);

      calBatch.push({
        id: nanoid(), user_id: userId,
        title: encryptString(randomPick(personalPool), dek),
        wallet_id: null, hourly_rate: encryptNumber(0, dek),
        start_time: isoStr(start), end_time: isoStr(end),
        is_recurring: false, recurrence_rule: null,
        is_settled: false, is_confirmed: isPast ? Math.random() < 0.9 : false,
        event_type: 'personal', created_at: isoStr(start),
      });
    }

    // Flush periodically
    if (calBatch.length >= 200) {
      await flushCalendar();
      process.stdout.write(`   ... ${eventCount} events\r`);
    }

    weekIdx++;
    weekMon.setDate(weekMon.getDate() + 7);
  }

  // Final flush
  await flushCalendar();
  console.log(`   Created ${eventCount} calendar events (52 weeks of 2026).`);

  // ── Step 7: Habits + Entries ──
  console.log('\n7. Creating habits and entries...');
  const habitsData = [
    { name: 'Ćwiczenia',     color: '#ef4444', icon: 'dumbbell',   frequency: '5_per_week' },
    { name: 'Czytanie',      color: '#3b82f6', icon: 'book-open',  frequency: 'daily' },
    { name: 'Medytacja',     color: '#8b5cf6', icon: 'star',       frequency: 'daily' },
    { name: 'Kodowanie',     color: '#22c55e', icon: 'code',       frequency: 'weekdays' },
    { name: 'Woda 2L',       color: '#06b6d4', icon: 'droplets',   frequency: 'daily' },
    { name: 'Bez social media', color: '#f97316', icon: 'shield', frequency: 'daily' },
    { name: 'Journaling',    color: '#ec4899', icon: 'pencil',     frequency: '3_per_week' },
  ];

  const habitIds: string[] = [];

  for (const h of habitsData) {
    const hid = nanoid();
    habitIds.push(hid);
    await supabase.from('habits').insert({
      id: hid, user_id: userId,
      name: encryptString(h.name, dek),
      color: h.color, icon: h.icon, frequency: h.frequency,
      created_at: new Date().toISOString(),
    });
    console.log(`   ${h.name} (${h.frequency})`);
  }

  // Entries: 90 days back, realistic completion rates per habit
  let entryCount = 0;
  const entries: Array<{ id: string; habit_id: string; date: string; completed: boolean; created_at: string }> = [];

  // Per-habit completion rates (more realistic — some habits harder than others)
  const completionRates = [0.78, 0.65, 0.72, 0.88, 0.82, 0.45, 0.55];

  for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
    const entryDate = new Date(now);
    entryDate.setDate(entryDate.getDate() - daysAgo);
    const dow = entryDate.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;
    const ds = dateStr(entryDate);

    for (let hi = 0; hi < habitsData.length; hi++) {
      const habit = habitsData[hi];
      const habitId = habitIds[hi];

      if (habit.name === 'Kodowanie' && isWeekend) continue;

      // Streak boost: if completed yesterday, higher chance today
      const baseRate = completionRates[hi];
      const rate = daysAgo < 14 ? Math.min(baseRate + 0.1, 0.95) : baseRate; // recent = more motivated

      const completed = Math.random() < rate;

      entries.push({
        id: nanoid(), habit_id: habitId, date: ds, completed, created_at: isoStr(entryDate),
      });
      entryCount++;
    }
  }

  for (let i = 0; i < entries.length; i += 50) {
    const batch = entries.slice(i, i + 50);
    const { error } = await supabase.from('habit_entries').insert(batch);
    if (error) console.error(`   Entries batch ${i} error:`, error);
  }
  console.log(`   Created ${entryCount} habit entries.`);

  // ── Step 8: Financial Goals ──
  console.log('\n8. Creating financial goals...');
  const goals = [
    { name: 'Wakacje w Japonii',           target: 12000, current: 7800,  target_date: '2026-08-01', icon: 'plane',          category: 'travel' },
    { name: 'MacBook Pro M4',              target: 8500,  current: 8200,  target_date: '2026-04-15', icon: 'laptop',         category: 'purchase' },
    { name: 'Fundusz awaryjny',            target: 20000, current: 14500, target_date: null,         icon: 'shield',         category: 'savings' },
    { name: 'Kurs AWS Solutions Architect', target: 2500,  current: 800,   target_date: '2026-06-01', icon: 'graduation-cap', category: 'education' },
    { name: 'Samochód',                    target: 45000, current: 12000, target_date: '2027-06-01', icon: 'car',            category: 'purchase' },
  ];

  for (const g of goals) {
    await supabase.from('goals').insert({
      id: nanoid(), user_id: userId,
      name: encryptString(g.name, dek),
      target_amount: encryptNumber(g.target, dek),
      current_amount: encryptNumber(g.current, dek),
      target_date: g.target_date,
      icon: g.icon, category: g.category,
      wallet_id: oszczId,
      created_at: new Date().toISOString(),
    });
    const pct = Math.round((g.current / g.target) * 100);
    console.log(`   ${g.name} — ${g.current}/${g.target} PLN (${pct}%)`);
  }

  // ── Step 9: Subscription (Pro) ──
  console.log('\n9. Creating Pro subscription...');
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  await supabase.from('subscriptions').insert({
    user_id: userId,
    stripe_customer_id: 'cus_demo_kacper',
    stripe_subscription_id: 'sub_demo_kacper',
    price_id: 'price_demo',
    status: 'active',
    current_period_end: isoStr(periodEnd),
    cancel_at_period_end: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log(`   Pro subscription active until ${dateStr(periodEnd)}`);

  // ── Step 10: Scan Logs ──
  console.log('\n10. Creating scan logs...');
  const scanLogs: Array<{ user_id: string; scan_type: string; created_at: string }> = [];

  // 5-8 receipt scans in the last 4 weeks
  const receiptCount = randomInt(5, 8);
  for (let i = 0; i < receiptCount; i++) {
    const daysAgo = randomInt(1, 28);
    const scanDate = new Date(now);
    scanDate.setDate(scanDate.getDate() - daysAgo);
    scanDate.setHours(randomInt(9, 21), randomInt(0, 59), 0, 0);
    scanLogs.push({ user_id: userId, scan_type: 'receipt', created_at: isoStr(scanDate) });
  }

  // 3-4 toggl scans in the last 4 weeks
  const togglCount = randomInt(3, 4);
  for (let i = 0; i < togglCount; i++) {
    const daysAgo = randomInt(1, 28);
    const scanDate = new Date(now);
    scanDate.setDate(scanDate.getDate() - daysAgo);
    scanDate.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0);
    scanLogs.push({ user_id: userId, scan_type: 'toggl', created_at: isoStr(scanDate) });
  }

  const { error: scanError } = await supabase.from('scan_logs').insert(scanLogs);
  if (scanError) console.error('   Scan logs error:', scanError);
  console.log(`   Created ${scanLogs.length} scan logs (${receiptCount} receipt, ${togglCount} toggl).`);

  // ── Summary ──
  console.log('\n════════════════════════════════════');
  console.log('  Demo seed complete!');
  console.log('════════════════════════════════════');
  console.log(`  User:          ${EMAIL} / ${PASSWORD}`);
  console.log(`  Persona:       Kacper Szpont, 24, fullstack dev`);
  console.log(`  User ID:       ${userId}`);
  console.log(`  Wallets:       ${wallets.length}`);
  console.log(`  Transactions:  ${txCount}`);
  console.log(`  Assets:        ${assets.length}`);
  console.log(`  Asset Sales:   ${sales.length}`);
  console.log(`  Goals:         ${goals.length}`);
  console.log(`  Calendar:      ${eventCount}`);
  console.log(`  Habits:        ${habitsData.length}`);
  console.log(`  Habit Entries: ${entryCount}`);
  console.log(`  Scan Logs:     ${scanLogs.length}`);
  console.log(`  Subscription:  Pro (active)`);
  console.log('════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
