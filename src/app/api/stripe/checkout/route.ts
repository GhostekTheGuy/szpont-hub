import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/cached';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rl = rateLimit(`stripe-checkout:${user.id}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { priceId } = await req.json();
    const validPriceIds = [
      process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    ].filter(Boolean);

    if (!priceId || typeof priceId !== 'string' || !validPriceIds.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid priceId' }, { status: 400 });
    }

    // Check if user already has a stripe customer
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Save or update customer ID in DB
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'inactive',
      }, { onConflict: 'user_id' });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancel`,
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
      consent_collection: {
        terms_of_service: 'required',
      },
      custom_text: {
        terms_of_service_acceptance: {
          message: `Akceptuję [Regulamin](${origin}/regulamin) oraz [Politykę prywatności](${origin}/polityka-prywatnosci). Płatność jest obsługiwana przez Stripe. Subskrypcja odnawia się automatycznie — możesz ją anulować w dowolnym momencie.`,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
