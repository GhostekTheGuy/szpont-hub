'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Wallet,
  PiggyBank,
  CalendarDays,
  Target,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { signOutAction } from '@/app/actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { useFinanceStore } from '@/hooks/useFinanceStore';

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallets', label: 'Portfele', icon: Wallet },
  { href: '/assets', label: 'Aktywa', icon: PiggyBank },
  { href: '/calendar', label: 'Praca', icon: CalendarDays },
  { href: '/habits', label: 'Nawyki', icon: Target },
];

export function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { balanceMasked, toggleBalanceMask } = useFinanceStore();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOutAction();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border hidden lg:block transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-52'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`border-b border-sidebar-border ${collapsed ? 'p-4 flex justify-center' : 'p-5'}`}>
            <Link href="/" className="flex items-center justify-center">
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

          {/* Bottom actions */}
          <div className={`border-t border-sidebar-border space-y-0.5 ${collapsed ? 'p-2' : 'p-3'}`}>
            <div className={`flex items-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors ${collapsed ? 'justify-center' : 'justify-between pl-4 pr-2'}`}>
              {!collapsed && <span className="text-sm">Motyw</span>}
              <ThemeToggle />
            </div>
            <button
              onClick={toggleBalanceMask}
              title={balanceMasked ? 'Pokaż kwoty' : 'Ukryj kwoty'}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full ${
                collapsed ? 'justify-center px-2' : 'px-4'
              }`}
            >
              {balanceMasked ? <EyeOff className="w-5 h-5 shrink-0" /> : <Eye className="w-5 h-5 shrink-0" />}
              {!collapsed && <span>{balanceMasked ? 'Pokaż kwoty' : 'Ukryj kwoty'}</span>}
            </button>
            <button
              onClick={handleSignOut}
              title={collapsed ? 'Wyloguj się' : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors w-full ${
                collapsed ? 'justify-center px-2' : 'px-4'
              }`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Wyloguj się</span>}
            </button>
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
          <Link href="/" className="flex items-center">
            <Image src="/sygnet.svg" alt="SzpontHub" width={32} height={28} className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBalanceMask}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title={balanceMasked ? 'Pokaż kwoty' : 'Ukryj kwoty'}
            >
              {balanceMasked ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
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
