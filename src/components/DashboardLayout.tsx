'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Wallet,
  FileText,
  CalendarDays,
  Target,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
} from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { Spotlight } from '@/components/Spotlight';

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
  avatarUrl: string | null;
  isPro?: boolean;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallets', label: 'Portfele', icon: Wallet },
  { href: '/invoices', label: 'Faktury', icon: FileText },
  { href: '/calendar', label: 'Praca', icon: CalendarDays },
  { href: '/habits', label: 'Nawyki', icon: Target },
];

function UserAvatar({ userName, avatarUrl, size = 'sm' }: { userName: string; avatarUrl: string | null; size?: 'sm' | 'md' }) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={userName}
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold`}>
      {initials}
    </div>
  );
}

export function DashboardLayout({ children, userName, avatarUrl, isPro }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const settingsActive = pathname.startsWith('/settings');

  return (
    <div className="min-h-screen bg-background">
      {/* Spotlight */}
      <Spotlight />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border hidden lg:block transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-52'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`border-b border-sidebar-border ${collapsed ? 'p-4 flex justify-center' : 'p-5'}`}>
            <Link href="/dashboard" className="flex items-center justify-center">
              {collapsed ? (
                <Image src="/sygnet.svg" alt="SzpontHub" width={32} height={28} className="h-8 w-auto" />
              ) : (
                <Image src="/logo.svg" alt="SzpontHub" width={150} height={38} className="h-8 w-auto" />
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 space-y-1 ${collapsed ? 'p-2' : 'p-3'}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-onboarding={item.href.slice(1)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 py-3 rounded-lg transition-colors ${
                    collapsed ? 'justify-center px-2' : 'px-4'
                  } ${
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: profile + collapse */}
          <div className={`border-t border-sidebar-border ${collapsed ? 'p-2' : 'p-3'} space-y-0.5`}>
            <Link
              href="/settings"
              title={collapsed ? 'Ustawienia' : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-lg transition-colors w-full ${
                collapsed ? 'justify-center px-2' : 'px-3'
              } ${
                settingsActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <div className="relative shrink-0">
                <UserAvatar userName={userName} avatarUrl={avatarUrl} />
                {isPro && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center ring-2 ring-sidebar">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              {!collapsed && (
                <span className="text-sm truncate flex items-center gap-1.5">
                  {userName}
                  {isPro && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400">PRO</span>}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full ${
                collapsed ? 'justify-center px-2' : 'px-4'
              }`}
            >
              {collapsed ? (
                <ChevronsRight className="w-5 h-5 shrink-0" />
              ) : (
                <>
                  <ChevronsLeft className="w-5 h-5 shrink-0" />
                  <span>Zwiń</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/sygnet.svg" alt="SzpontHub" width={32} height={28} className="h-7 w-auto" />
          </Link>
          <Link href="/settings" className="p-1">
            <div className="relative">
              <UserAvatar userName={userName} avatarUrl={avatarUrl} />
              {isPro && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center ring-2 ring-card">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className={`relative min-h-screen pb-20 lg:pb-0 transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-52'}`}>
        <div className="px-0 pt-20 pb-4 lg:px-6 lg:pt-6 lg:pb-0">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-30" />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-onboarding={item.href.slice(1)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
