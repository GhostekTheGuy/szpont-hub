/**
 * Clears all user business data from the database.
 * Preserves: users, subscriptions, stripe_events tables.
 * Deletes: wallets, transactions, assets, asset_sales, calendar_events,
 *          habits, habit_entries, goals, scan_logs, google_calendar_*
 *
 * Usage: npx tsx scripts/clear-user-data.ts
 */

require('dotenv').config();

import { createClient } from '@supabase/supabase-js';

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

  console.log('\n⚠️  Clearing all user business data...\n');

  // Order matters — delete children before parents (foreign keys)
  const tables = [
    'habit_entries',
    'habits',
    'google_calendar_mappings',
    'google_calendar_connections',
    'calendar_events',
    'asset_sales',
    'assets',
    'transactions',
    'goals',
    'scan_logs',
    'wallets',
  ];

  for (const table of tables) {
    // Use a UUID that will never match to select all rows
    const { error, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error(`  ✗ ${table}: ${error.message}`);
    } else {
      console.log(`  ✓ ${table}: ${count ?? '?'} rows deleted`);
    }
  }

  console.log('\n✅ Done. Tables users, subscriptions, stripe_events preserved.\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
