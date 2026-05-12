// Netlify Scheduled Function — replaces the Vercel cron in vercel.json.
// Triggers the existing Next.js API route (which holds the business logic)
// over HTTP, authenticated with CRON_SECRET. Runs daily at 08:00 UTC,
// matching the original Vercel schedule.

export default async () => {
  const baseUrl = process.env.URL;
  const secret = process.env.CRON_SECRET;

  if (!baseUrl) {
    console.error('[payment-reminders] URL env var missing');
    return new Response('Missing URL', { status: 500 });
  }
  if (!secret) {
    console.error('[payment-reminders] CRON_SECRET env var missing');
    return new Response('Missing CRON_SECRET', { status: 500 });
  }

  const target = `${baseUrl}/api/cron/payment-reminders`;
  const res = await fetch(target, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();

  if (!res.ok) {
    console.error(`[payment-reminders] upstream ${res.status}`, body);
    return new Response(body, { status: res.status });
  }

  console.log(`[payment-reminders] ok`, body);
  return new Response(body, { status: 200 });
};

export const config = {
  schedule: '0 8 * * *',
};
