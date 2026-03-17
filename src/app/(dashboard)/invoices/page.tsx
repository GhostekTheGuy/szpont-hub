'use client';

import dynamic from 'next/dynamic';

const KugaruInvoiceForm = dynamic(
  () => import('@/components/kugaru/KugaruInvoiceForm').then((m) => ({ default: m.KugaruInvoiceForm })),
  { ssr: false }
);

export default function InvoicesPage() {
  return (
    <div className="px-4 py-8 md:px-8">
      <KugaruInvoiceForm />
    </div>
  );
}
