'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function AutoCheckout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    if (searchParams.get('checkout') !== 'pro') return;
    triggered.current = true;

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
    if (!priceId) return;

    fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
      .then((res) => res.json())
      .then(({ url }) => {
        if (url) window.location.href = url;
      })
      .catch(() => {
        router.replace('/dashboard');
      });
  }, [searchParams, router]);

  return null;
}
