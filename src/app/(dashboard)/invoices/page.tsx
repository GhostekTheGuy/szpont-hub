'use client';

import dynamic from 'next/dynamic';

const KugaruInvoiceForm = dynamic(
  () => import('@/components/kugaru/KugaruInvoiceForm').then((m) => ({ default: m.KugaruInvoiceForm })),
  {
    ssr: false,
    // Szkielet zamiast białego ekranu przy wolnej sieci (komponent ładowany tylko po stronie klienta)
    loading: () => (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-72 bg-muted rounded" />
        <div className="h-64 w-full bg-muted rounded-xl mt-6" />
        <div className="h-11 w-40 bg-muted rounded-lg" />
      </div>
    ),
  }
);

export default function InvoicesPage() {
  return (
    <div className="px-4 py-8 md:px-8">
      <KugaruInvoiceForm />
    </div>
  );
}
