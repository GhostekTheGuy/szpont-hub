// Server-only helpers shared across server-action modules.
// NOT a server-actions file — no 'use server' directive here.
// These functions are internal helpers, not callable endpoints from the client.
import 'server-only';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/supabase/cached';
import { decryptFromCookie } from '@/lib/crypto';

// Granular page revalidation. Pass the route segments that show data
// changed by this action. Avoids the 'layout' nuke that invalidates every page.
export type Page = 'dashboard' | 'wallets' | 'calendar' | 'habits' | 'invoices' | 'settings';

export function revalidatePages(...pages: Page[]) {
  for (const p of Array.from(new Set(pages))) {
    revalidatePath(`/${p}`);
  }
}

export function isValidISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(s) && !isNaN(Date.parse(s));
}

export function parseInstanceId(id: string): { parentId: string; dateStr: string } | null {
  const match = id.match(/_(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  return { parentId: id.slice(0, match.index!), dateStr: match[1] };
}

export async function getUserId() {
  const user = await getUser();
  return user?.id;
}

export async function getDEK(): Promise<Buffer> {
  const cookieStore = await cookies();
  const encryptedCookie = cookieStore.get('encryption_dek')?.value;
  if (!encryptedCookie) throw new Error('Encryption session expired');
  return decryptFromCookie(encryptedCookie);
}
