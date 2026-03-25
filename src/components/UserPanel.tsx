'use client';

import { useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Moon,
  Sun,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Camera,
  User,
  Crown,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import { signOutAction, resetPasswordAction, setBalanceMasked, setOnboardingDone, setPreferredCurrency } from '@/app/actions';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import type { Currency } from '@/lib/exchange-rates';

interface Subscription {
  status: string;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface UserPanelProps {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  subscription?: Subscription | null;
}

export function UserPanel({ userName, userEmail, avatarUrl, subscription }: UserPanelProps) {
  const { theme, setTheme } = useTheme();
  const balanceMasked = useFinanceStore(s => s.balanceMasked);
  const toggleBalanceMask = useFinanceStore(s => s.toggleBalanceMask);
  const setShowOnboarding = useFinanceStore(s => s.setShowOnboarding);
  const displayCurrency = useFinanceStore(s => s.displayCurrency);
  const setDisplayCurrency = useFinanceStore(s => s.setDisplayCurrency);
  const [uploading, setUploading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPro = subscription?.status === 'active' || subscription?.status === 'trialing';

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // silently fail
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // silently fail
    } finally {
      setPortalLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        setCurrentAvatar(url);
      }
    } catch {
      // silently fail
    } finally {
      setUploading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPasswordAction();
      setResetSent(true);
      setTimeout(() => setResetSent(false), 3000);
    } catch {
      // silently fail
    }
  };

  const handleSignOut = async () => {
    await signOutAction();
    window.location.href = '/login';
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="px-4 lg:px-0">
      <h1 className="text-2xl font-bold mb-6">Ustawienia</h1>

      <div className="space-y-6 max-w-lg">
        {/* Profil */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative shrink-0 group"
            >
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={userName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </button>
            <div className="min-w-0">
              <p className="font-medium truncate">{userName}</p>
              <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Wygląd */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Wygląd</h2>
          <div className="space-y-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-3">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                Ciemny motyw
              </span>
              <div
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                  theme === 'dark' ? 'bg-primary justify-end' : 'bg-muted justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </div>
            </button>

            <button
              onClick={() => {
                const newValue = !balanceMasked;
                toggleBalanceMask();
                setBalanceMasked(newValue).catch(console.error);
              }}
              className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-3">
                {balanceMasked ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                Ukryj kwoty
              </span>
              <div
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                  balanceMasked ? 'bg-primary justify-end' : 'bg-muted justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </div>
            </button>

            <div className="flex items-center justify-between w-full px-3 py-3">
              <span className="flex items-center gap-3 text-sm">
                Domyślna waluta
              </span>
              <div className="flex gap-0.5 bg-secondary rounded-md p-0.5">
                {(['PLN', 'USD', 'EUR'] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setDisplayCurrency(c);
                      setPreferredCurrency(c).catch(console.error);
                    }}
                    className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                      displayCurrency === c
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setOnboardingDone(false).catch(console.error);
                setShowOnboarding(true);
              }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-accent transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              Powtórz samouczek
            </button>
          </div>
        </div>

        {/* Plan */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Plan
          </h2>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium flex items-center gap-2">
                {isPro ? 'Pro' : 'Darmowy'}
                {isPro && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">
                    Aktywny
                  </span>
                )}
              </p>
              {isPro && subscription?.current_period_end && (
                <p className="text-xs text-muted-foreground mt-1">
                  {subscription.cancel_at_period_end ? 'Wygasa' : 'Odnawia się'}:{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString('pl-PL')}
                </p>
              )}
            </div>
          </div>
          {isPro ? (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50"
            >
              {portalLoading ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Zarządzaj subskrypcją
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Ulepsz do Pro, aby odblokować funkcje AI.
              </p>
              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    Przejdź na Pro — 19 zł/mies.
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Konto */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Konto</h2>
          <div className="space-y-1">
            <button
              onClick={handleResetPassword}
              disabled={resetSent}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
            >
              <KeyRound className="w-5 h-5" />
              {resetSent ? 'Email wysłany!' : 'Resetuj hasło'}
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Wyloguj się
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
