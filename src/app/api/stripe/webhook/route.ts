import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotencja — sprawdź czy event był już przetworzony
  const { data: existing } = await supabaseAdmin
    .from('stripe_events')
    .select('id')
    .eq('event_id', event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;

          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const subPeriodEnd =
            sub.items.data[0]?.current_period_end ??
            (sub as unknown as { current_period_end?: number })
              .current_period_end;

          await supabaseAdmin
            .from('subscriptions')
            .update({
              stripe_subscription_id: sub.id,
              price_id: sub.items.data[0]?.price.id,
              status: sub.status,
              current_period_end: subPeriodEnd
                ? new Date(subPeriodEnd * 1000).toISOString()
                : null,
              cancel_at_period_end: sub.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq(
              'stripe_customer_id',
              typeof session.customer === 'string'
                ? session.customer
                : session.customer?.id
            );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const updatedPeriodEnd =
          sub.items.data[0]?.current_period_end ??
          (sub as unknown as { current_period_end?: number })
            .current_period_end;
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: sub.status,
            price_id: sub.items.data[0]?.price.id,
            current_period_end: updatedPeriodEnd
              ? new Date(updatedPeriodEnd * 1000).toISOString()
              : null,
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);
        break;
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error instanceof Error ? error.message : 'Unknown error');
    // Nie zapisujemy markera idempotencji — zwracamy 500, aby Stripe ponowił dostarczenie.
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }

  // Marker idempotencji zapisujemy dopiero PO udanej obsłudze.
  // Wymaga UNIQUE constraint na stripe_events.event_id — przy równoległym duplikacie
  // drugi insert zawiedzie i jest bezpiecznie ignorowany.
  const { error: markError } = await supabaseAdmin
    .from('stripe_events')
    .insert({ event_id: event.id });
  if (markError && markError.code !== '23505') {
    console.error('Failed to persist stripe event marker:', markError.message);
  }

  return NextResponse.json({ received: true });
}
