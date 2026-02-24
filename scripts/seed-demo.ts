/**
 * Demo account seed script
 * Creates demo@szpont.pl / demo1234 with rich data for screenshots
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

function generateDEK(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

function generateSalt(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

function encryptDEK(dek: Buffer, kek: Buffer): string {
  return encrypt(dek.toString('base64'), kek);
}

function encryptNumber(value: number, dek: Buffer): string {
  return encrypt(value.toString(), dek);
}

function encryptString(value: string, dek: Buffer): string {
  if (!value) return value;
  return encrypt(value, dek);
}

// ─── Helpers ───

function nanoid(size = 21): string {
  return crypto.randomBytes(size).toString('base64url').slice(0, size);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isoStr(d: Date): string {
  return d.toISOString();
}

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
    // Delete data first (order matters for FK)
    const uid = existingUser.id;
    await supabase.from('habit_entries').delete().in(
      'habit_id',
      (await supabase.from('habits').select('id').eq('user_id', uid)).data?.map((h: any) => h.id) || []
    );
    await supabase.from('habits').delete().eq('user_id', uid);
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

  // ── Step 1: Create user + encryption keys ──
  console.log('\n1. Creating user...');
  const salt = generateSalt();
  const dek = generateDEK();
  const kek = await deriveKEK(PASSWORD, salt);
  const encryptedDek = encryptDEK(dek, kek);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'Demo User' },
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
    name: 'Demo User',
    encryption_salt: salt.toString('base64'),
    encrypted_dek: encryptedDek,
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
    { id: nanoid(), name: 'Konto główne', type: 'fiat', balance: 15420, color: '#6366f1', icon: 'wallet', currency: 'PLN' },
    { id: nanoid(), name: 'Oszczędności', type: 'fiat', balance: 47800, color: '#22c55e', icon: 'piggy-bank', currency: 'PLN' },
    { id: nanoid(), name: 'Binance', type: 'crypto', balance: 12350, color: '#f59e0b', icon: 'bitcoin', currency: 'PLN' },
  ];

  for (const w of wallets) {
    const { error } = await supabase.from('wallets').insert({
      id: w.id,
      user_id: userId,
      name: encryptString(w.name, dek),
      balance: encryptNumber(w.balance, dek),
      icon: w.icon,
      color: w.color,
      type: w.type,
      currency: w.currency,
      created_at: new Date().toISOString(),
    });
    if (error) console.error(`   Wallet "${w.name}" error:`, error);
    else console.log(`   ${w.name} (${w.type}) — ${w.balance} PLN`);
  }

  const kontoId = wallets[0].id;
  const oszczId = wallets[1].id;
  const binanceId = wallets[2].id;

  // ── Step 3: Transactions (~120, last 12 months) ──
  console.log('\n3. Creating transactions...');
  const now = new Date();
  let txCount = 0;

  const incomeCategories = ['Praca', 'Freelance'];
  const outcomeCategories = [
    { name: 'Jedzenie', min: 800, max: 1200 },
    { name: 'Transport', min: 200, max: 400 },
    { name: 'Rachunki', min: 1500, max: 2000 },
    { name: 'Rozrywka', min: 300, max: 600 },
    { name: 'Zakupy', min: 400, max: 900 },
    { name: 'Subskrypcje', min: 150, max: 250 },
  ];

  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Income: 2-3 per month
    const incomeCount = randomInt(2, 3);
    for (let i = 0; i < incomeCount; i++) {
      const cat = i === 0 ? 'Praca' : randomPick(incomeCategories);
      const amount = cat === 'Praca' ? randomInt(7000, 9000) : randomInt(1000, 3000);
      const day = randomInt(1, Math.min(28, daysInMonth));
      const txDate = new Date(year, month, day);
      const currency = Math.random() < 0.85 ? 'PLN' : randomPick(['EUR', 'USD']);

      await supabase.from('transactions').insert({
        id: nanoid(),
        wallet_id: kontoId,
        amount: encryptNumber(amount, dek),
        category: encryptString(cat, dek),
        description: encryptString(cat === 'Praca' ? 'Wypłata' : 'Projekt', dek),
        type: 'income',
        date: dateStr(txDate),
        currency,
        created_at: isoStr(txDate),
      });
      txCount++;
    }

    // Outcome: 6-10 per month
    const outcomeCount = randomInt(6, 10);
    const usedCategories = new Set<string>();
    for (let i = 0; i < outcomeCount; i++) {
      let cat: typeof outcomeCategories[number];
      if (usedCategories.size < outcomeCategories.length && i < outcomeCategories.length) {
        // Ensure variety first
        do {
          cat = randomPick(outcomeCategories);
        } while (usedCategories.has(cat.name) && usedCategories.size < outcomeCategories.length);
      } else {
        cat = randomPick(outcomeCategories);
      }
      usedCategories.add(cat.name);

      const amount = randomInt(cat.min, cat.max);
      const day = randomInt(1, Math.min(28, daysInMonth));
      const txDate = new Date(year, month, day);
      const walletId = Math.random() < 0.7 ? kontoId : Math.random() < 0.5 ? oszczId : binanceId;
      const currency = Math.random() < 0.9 ? 'PLN' : randomPick(['EUR', 'USD']);

      await supabase.from('transactions').insert({
        id: nanoid(),
        wallet_id: walletId,
        amount: encryptNumber(-amount, dek),
        category: encryptString(cat.name, dek),
        description: null,
        type: 'outcome',
        date: dateStr(txDate),
        currency,
        created_at: isoStr(txDate),
      });
      txCount++;
    }

    // Transfer: 1-2 per month (Konto główne → Oszczędności)
    const transferCount = randomInt(1, 2);
    for (let i = 0; i < transferCount; i++) {
      const amount = randomInt(1000, 3000);
      const day = randomInt(1, Math.min(28, daysInMonth));
      const txDate = new Date(year, month, day);

      // Outgoing from Konto główne
      await supabase.from('transactions').insert({
        id: nanoid(),
        wallet_id: kontoId,
        amount: encryptNumber(amount, dek),
        category: encryptString('Transfer', dek),
        description: encryptString('Oszczędności', dek),
        type: 'transfer',
        date: dateStr(txDate),
        currency: 'PLN',
        created_at: isoStr(txDate),
      });
      txCount++;
    }
  }
  console.log(`   Created ${txCount} transactions.`);

  // ── Step 4: Assets ──
  console.log('\n4. Creating assets...');
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', coingecko_id: 'bitcoin', quantity: 0.15, current_price: 410000, cost_basis: 380000, change_24h: 2.4, asset_type: 'crypto' },
    { symbol: 'ETH', name: 'Ethereum', coingecko_id: 'ethereum', quantity: 2.5, current_price: 16500, cost_basis: 14200, change_24h: 1.8, asset_type: 'crypto' },
    { symbol: 'SOL', name: 'Solana', coingecko_id: 'solana', quantity: 45, current_price: 780, cost_basis: 620, change_24h: 5.1, asset_type: 'crypto' },
    { symbol: 'ADA', name: 'Cardano', coingecko_id: 'cardano', quantity: 3000, current_price: 2.80, cost_basis: 2.10, change_24h: -1.2, asset_type: 'crypto' },
    { symbol: 'LINK', name: 'Chainlink', coingecko_id: 'chainlink', quantity: 120, current_price: 85, cost_basis: 65, change_24h: 3.3, asset_type: 'crypto' },
    { symbol: 'XRP', name: 'XRP', coingecko_id: 'ripple', quantity: 2000, current_price: 4.20, cost_basis: 3.50, change_24h: 0.8, asset_type: 'crypto' },
  ];

  for (const a of assets) {
    const totalValue = a.quantity * a.current_price;
    const { error } = await supabase.from('assets').insert({
      id: nanoid(),
      user_id: userId,
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
    if (error) console.error(`   Asset "${a.symbol}" error:`, error);
    else console.log(`   ${a.symbol} — ${a.quantity} × ${a.current_price} PLN`);
  }

  // ── Step 5: Asset Sales ──
  console.log('\n5. Creating asset sales...');
  const sales = [
    {
      asset_name: 'Dogecoin', asset_symbol: 'DOGE',
      quantity_sold: 5000, sale_price_per_unit: 1.20, cost_basis_per_unit: 0.80,
      total_proceeds: 6000, total_cost: 4000, profit: 2000, tax_amount: 380,
      sale_date: dateStr(new Date(now.getFullYear(), now.getMonth() - 2, 15)),
    },
    {
      asset_name: 'Polkadot', asset_symbol: 'DOT',
      quantity_sold: 100, sale_price_per_unit: 32, cost_basis_per_unit: 45,
      total_proceeds: 3200, total_cost: 4500, profit: -1300, tax_amount: 0,
      sale_date: dateStr(new Date(now.getFullYear(), now.getMonth() - 1, 8)),
    },
  ];

  for (const s of sales) {
    const { error } = await supabase.from('asset_sales').insert({
      id: nanoid(),
      user_id: userId,
      asset_name: encryptString(s.asset_name, dek),
      asset_symbol: encryptString(s.asset_symbol, dek),
      quantity_sold: encryptNumber(s.quantity_sold, dek),
      sale_price_per_unit: encryptNumber(s.sale_price_per_unit, dek),
      cost_basis_per_unit: encryptNumber(s.cost_basis_per_unit, dek),
      total_proceeds: encryptNumber(s.total_proceeds, dek),
      total_cost: encryptNumber(s.total_cost, dek),
      profit: encryptNumber(s.profit, dek),
      tax_amount: encryptNumber(s.tax_amount, dek),
      wallet_id: binanceId,
      sale_date: s.sale_date,
      created_at: new Date().toISOString(),
    });
    if (error) console.error(`   Sale "${s.asset_symbol}" error:`, error);
    else console.log(`   ${s.asset_symbol} — profit: ${s.profit} PLN`);
  }

  // ── Step 6: Calendar Events (3 months) ──
  console.log('\n6. Creating calendar events...');
  let eventCount = 0;

  const workTitles = ['Praca zdalna', 'Biuro', 'Projekt klienta', 'Spotkanie z zespołem', 'Deploy produkcyjny', 'Sprint planning', 'Refactoring API', 'Konsultacja techniczna'];
  const personalTitles = ['Siłownia', 'Spotkanie', 'Lekarz', 'Zakupy', 'Fryzjer', 'Dentysta', 'Kino', 'Kolacja', 'Spacer', 'Basen'];
  const meetingTitles = ['1:1 z managerem', 'Retro', 'Demo klienta', 'Sync z designem', 'Onboarding nowego', 'Planowanie Q2', 'Rozmowa z inwestorem'];

  for (let weeksAgo = 12; weeksAgo >= -1; weeksAgo--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weeksAgo * 7);
    weekStart.setHours(0, 0, 0, 0);
    // Find Monday of this week
    const dayOfWeek = weekStart.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + mondayOffset);

    // Work events: 4-5 per week, Mon-Fri (main work blocks)
    const workDays = [0, 1, 2, 3, 4]; // Mon-Fri offsets
    const workCount = randomInt(4, 5);
    const selectedWorkDays = workDays.sort(() => Math.random() - 0.5).slice(0, workCount);

    for (const dayOffset of selectedWorkDays) {
      const eventDate = new Date(weekStart);
      eventDate.setDate(eventDate.getDate() + dayOffset);

      const isLong = Math.random() < 0.6;
      const startHour = isLong ? 9 : 10;
      const endHour = isLong ? 17 : 14;
      const hourlyRate = randomInt(80, 150);

      const start = new Date(eventDate);
      start.setHours(startHour, 0, 0, 0);
      const end = new Date(eventDate);
      end.setHours(endHour, 0, 0, 0);

      const isSettled = weeksAgo > 1;
      const isConfirmed = weeksAgo > 0 || Math.random() < 0.7;

      await supabase.from('calendar_events').insert({
        id: nanoid(),
        user_id: userId,
        title: encryptString(randomPick(workTitles), dek),
        wallet_id: kontoId,
        hourly_rate: encryptNumber(hourlyRate, dek),
        start_time: isoStr(start),
        end_time: isoStr(end),
        is_recurring: false,
        recurrence_rule: null,
        is_settled: isSettled,
        is_confirmed: isConfirmed,
        event_type: 'work',
        created_at: isoStr(start),
      });
      eventCount++;
    }

    // Short meetings/calls: 2-4 per week, Mon-Fri (30min-1.5h slots)
    const meetingCount = randomInt(2, 4);
    for (let i = 0; i < meetingCount; i++) {
      const dayOffset = randomInt(0, 4);
      const eventDate = new Date(weekStart);
      eventDate.setDate(eventDate.getDate() + dayOffset);

      const startHour = randomInt(9, 16);
      const startMin = randomPick([0, 30]);
      const durationMin = randomPick([30, 45, 60, 90]);

      const start = new Date(eventDate);
      start.setHours(startHour, startMin, 0, 0);
      const end = new Date(start.getTime() + durationMin * 60_000);

      const isWork = Math.random() < 0.7;
      const hourlyRate = isWork ? randomInt(100, 150) : 0;

      await supabase.from('calendar_events').insert({
        id: nanoid(),
        user_id: userId,
        title: encryptString(randomPick(meetingTitles), dek),
        wallet_id: isWork ? kontoId : null,
        hourly_rate: encryptNumber(hourlyRate, dek),
        start_time: isoStr(start),
        end_time: isoStr(end),
        is_recurring: false,
        recurrence_rule: null,
        is_settled: weeksAgo > 1,
        is_confirmed: Math.random() < 0.85,
        event_type: isWork ? 'work' : 'personal',
        created_at: isoStr(start),
      });
      eventCount++;
    }

    // Personal events: 3-5 per week
    const personalCount = randomInt(3, 5);
    for (let i = 0; i < personalCount; i++) {
      const dayOffset = randomInt(0, 6);
      const eventDate = new Date(weekStart);
      eventDate.setDate(eventDate.getDate() + dayOffset);

      const startHour = randomInt(7, 20);
      const startMin = randomPick([0, 15, 30, 45]);
      const durationMin = randomPick([30, 45, 60, 90, 120]);

      const start = new Date(eventDate);
      start.setHours(startHour, startMin, 0, 0);
      const end = new Date(start.getTime() + durationMin * 60_000);

      await supabase.from('calendar_events').insert({
        id: nanoid(),
        user_id: userId,
        title: encryptString(randomPick(personalTitles), dek),
        wallet_id: null,
        hourly_rate: encryptNumber(0, dek),
        start_time: isoStr(start),
        end_time: isoStr(end),
        is_recurring: false,
        recurrence_rule: null,
        is_settled: false,
        is_confirmed: Math.random() < 0.8,
        event_type: 'personal',
        created_at: isoStr(start),
      });
      eventCount++;
    }

    // Recurring weekly: Standup (Mon 9:00-9:30), Code review (Wed 14:00-15:00), Piątkowy sync (Fri 10:00-10:30)
    if (weeksAgo >= 0) {
      // Standup — Monday
      const mon = new Date(weekStart);
      const monStart = new Date(mon);
      monStart.setHours(9, 0, 0, 0);
      const monEnd = new Date(mon);
      monEnd.setHours(9, 30, 0, 0);

      await supabase.from('calendar_events').insert({
        id: nanoid(),
        user_id: userId,
        title: encryptString('Standup', dek),
        wallet_id: kontoId,
        hourly_rate: encryptNumber(100, dek),
        start_time: isoStr(monStart),
        end_time: isoStr(monEnd),
        is_recurring: true,
        recurrence_rule: 'RRULE:FREQ=WEEKLY;BYDAY=MO',
        is_settled: weeksAgo > 1,
        is_confirmed: true,
        event_type: 'work',
        created_at: isoStr(monStart),
      });
      eventCount++;

      // Code review — Wednesday
      const wed = new Date(weekStart);
      wed.setDate(wed.getDate() + 2);
      const wedStart = new Date(wed);
      wedStart.setHours(14, 0, 0, 0);
      const wedEnd = new Date(wed);
      wedEnd.setHours(15, 0, 0, 0);

      await supabase.from('calendar_events').insert({
        id: nanoid(),
        user_id: userId,
        title: encryptString('Code review', dek),
        wallet_id: kontoId,
        hourly_rate: encryptNumber(120, dek),
        start_time: isoStr(wedStart),
        end_time: isoStr(wedEnd),
        is_recurring: true,
        recurrence_rule: 'RRULE:FREQ=WEEKLY;BYDAY=WE',
        is_settled: weeksAgo > 1,
        is_confirmed: true,
        event_type: 'work',
        created_at: isoStr(wedStart),
      });
      eventCount++;

      // Piątkowy sync — Friday
      const fri = new Date(weekStart);
      fri.setDate(fri.getDate() + 4);
      const friStart = new Date(fri);
      friStart.setHours(10, 0, 0, 0);
      const friEnd = new Date(fri);
      friEnd.setHours(10, 30, 0, 0);

      await supabase.from('calendar_events').insert({
        id: nanoid(),
        user_id: userId,
        title: encryptString('Weekly sync', dek),
        wallet_id: kontoId,
        hourly_rate: encryptNumber(100, dek),
        start_time: isoStr(friStart),
        end_time: isoStr(friEnd),
        is_recurring: true,
        recurrence_rule: 'RRULE:FREQ=WEEKLY;BYDAY=FR',
        is_settled: weeksAgo > 1,
        is_confirmed: true,
        event_type: 'work',
        created_at: isoStr(friStart),
      });
      eventCount++;
    }
  }
  console.log(`   Created ${eventCount} calendar events.`);

  // ── Step 7: Habits + Entries ──
  console.log('\n7. Creating habits and entries...');
  const habitsData = [
    { name: 'Ćwiczenia', color: '#ef4444', icon: 'dumbbell', frequency: 'daily' },
    { name: 'Czytanie', color: '#3b82f6', icon: 'book-open', frequency: 'daily' },
    { name: 'Medytacja', color: '#8b5cf6', icon: 'brain', frequency: 'daily' },
    { name: 'Kodowanie', color: '#22c55e', icon: 'code', frequency: 'weekdays' },
    { name: 'Woda 2L', color: '#06b6d4', icon: 'droplets', frequency: 'daily' },
  ];

  const habitIds: string[] = [];

  for (const h of habitsData) {
    const hid = nanoid();
    habitIds.push(hid);
    const { error } = await supabase.from('habits').insert({
      id: hid,
      user_id: userId,
      name: encryptString(h.name, dek),
      color: h.color,
      icon: h.icon,
      frequency: h.frequency,
      created_at: new Date().toISOString(),
    });
    if (error) console.error(`   Habit "${h.name}" error:`, error);
    else console.log(`   ${h.name} (${h.frequency})`);
  }

  // Entries: 60 days back, ~70-85% completion
  let entryCount = 0;
  const entries: Array<{ id: string; habit_id: string; date: string; completed: boolean; created_at: string }> = [];

  for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
    const entryDate = new Date(now);
    entryDate.setDate(entryDate.getDate() - daysAgo);
    const dayOfWeek = entryDate.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const ds = dateStr(entryDate);

    for (let hi = 0; hi < habitsData.length; hi++) {
      const habit = habitsData[hi];
      const habitId = habitIds[hi];

      // Skip weekends for "Kodowanie"
      if (habit.name === 'Kodowanie' && isWeekend) continue;

      // 70-85% completion rate
      const completed = Math.random() < randomFloat(0.70, 0.85);

      entries.push({
        id: nanoid(),
        habit_id: habitId,
        date: ds,
        completed,
        created_at: isoStr(entryDate),
      });
      entryCount++;
    }
  }

  // Batch insert entries (50 at a time)
  for (let i = 0; i < entries.length; i += 50) {
    const batch = entries.slice(i, i + 50);
    const { error } = await supabase.from('habit_entries').insert(batch);
    if (error) console.error(`   Entries batch ${i} error:`, error);
  }
  console.log(`   Created ${entryCount} habit entries.`);

  // ── Step 8: Summary ──
  console.log('\n════════════════════════════════════');
  console.log('  Demo seed complete!');
  console.log('════════════════════════════════════');
  console.log(`  User:          ${EMAIL} / ${PASSWORD}`);
  console.log(`  User ID:       ${userId}`);
  console.log(`  Wallets:       ${wallets.length}`);
  console.log(`  Transactions:  ${txCount}`);
  console.log(`  Assets:        ${assets.length}`);
  console.log(`  Asset Sales:   ${sales.length}`);
  console.log(`  Calendar:      ${eventCount}`);
  console.log(`  Habits:        ${habitsData.length}`);
  console.log(`  Habit Entries: ${entryCount}`);
  console.log('════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
