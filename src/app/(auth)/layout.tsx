import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Logowanie i rejestracja',
  description: `Zaloguj się lub załóż konto w ${SITE_NAME} (SzpontHub) — aplikacji do zarządzania finansami, nawykami i kalendarzem pracy.`,
  alternates: {
    canonical: '/login',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
