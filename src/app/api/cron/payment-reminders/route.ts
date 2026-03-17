import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getTransporter, EMAIL_FROM } from '@/lib/mailer';

const REMIND_DAYS_BEFORE = 3;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const reminderDate = new Date(today);
  reminderDate.setDate(reminderDate.getDate() + REMIND_DAYS_BEFORE);

  const todayStr = today.toISOString().split('T')[0];
  const reminderDateStr = reminderDate.toISOString().split('T')[0];

  // Fetch all active recurring expenses with next_due_date within the reminder window
  const { data: expenses, error: expError } = await supabaseAdmin
    .from('recurring_expenses')
    .select('id, name, amount, currency, frequency, next_due_date, user_id')
    .eq('is_active', true)
    .gte('next_due_date', todayStr)
    .lte('next_due_date', reminderDateStr);

  if (expError) {
    console.error('Error fetching recurring expenses:', expError);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  if (!expenses || expenses.length === 0) {
    return NextResponse.json({ message: 'No upcoming payments', sent: 0 });
  }

  // Group expenses by user_id
  const byUser = new Map<string, typeof expenses>();
  for (const exp of expenses) {
    const list = byUser.get(exp.user_id) || [];
    list.push(exp);
    byUser.set(exp.user_id, list);
  }

  // Fetch emails for all users in one query
  const userIds = Array.from(byUser.keys());
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return NextResponse.json({ error: 'Users fetch error' }, { status: 500 });
  }

  const emailMap = new Map<string, string>();
  for (const user of usersData.users) {
    if (user.email && userIds.includes(user.id)) {
      emailMap.set(user.id, user.email);
    }
  }

  let sent = 0;
  const errors: string[] = [];

  for (const [userId, userExpenses] of Array.from(byUser.entries())) {
    const email = emailMap.get(userId);
    if (!email) continue;

    // Note: expense names are encrypted in DB, so we use the raw (encrypted) name field.
    // We pass the expense data as-is — the name will be the encrypted blob.
    // To show readable names, we'd need the user's DEK, which we don't have in a cron context.
    // Instead, we show the category + amount + due date (these are not encrypted or are plain).
    const expenseRows = userExpenses
      .map((e) => {
        const dueDate = new Date(e.next_due_date).toLocaleDateString('pl-PL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const amount = e.amount; // encrypted — we'll use currency only for context
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${e.currency} opłata</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${dueDate}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${e.frequency}</td>
        </tr>`;
      })
      .join('');

    const count = userExpenses.length;
    const subject = `Przypomnienie: ${count} ${count === 1 ? 'opłata zbliża się' : 'opłaty zbliżają się'} terminem`;

    const html = `
      <!DOCTYPE html>
      <html lang="pl">
      <head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px;border-radius:12px 12px 0 0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="https://szponthub.pl/logo-icon.png" alt="Szpont Hub" width="40" height="40" style="display:block;border-radius:8px;" />
            <div>
              <h1 style="color:#fff;margin:0;font-size:20px;">Szpont Hub</h1>
              <p style="color:#e0e7ff;margin:4px 0 0;font-size:14px;">Przypomnienie o płatnościach</p>
            </div>
          </div>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <p style="margin:0 0 16px;">Masz <strong>${count}</strong> ${count === 1 ? 'nadchodzącą opłatę' : 'nadchodzących opłat'} w ciągu najbliższych ${REMIND_DAYS_BEFORE} dni:</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Opłata</th>
                <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Termin</th>
                <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Częstotliwość</th>
              </tr>
            </thead>
            <tbody>${expenseRows}</tbody>
          </table>
          <div style="margin-top:24px;text-align:center;">
            <a href="https://szponthub.pl/dashboard" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;">Przejdź do panelu</a>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af;text-align:center;">Ta wiadomość została wysłana automatycznie przez Szpont Hub.</p>
        </div>
      </body>
      </html>
    `;

    try {
      await getTransporter().sendMail({
        from: EMAIL_FROM,
        to: email,
        subject,
        html,
      });
      sent++;
    } catch (sendError) {
      console.error(`Failed to send to ${email}:`, sendError);
      errors.push(email);
    }
  }

  return NextResponse.json({
    message: `Sent ${sent} reminder(s)`,
    sent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
