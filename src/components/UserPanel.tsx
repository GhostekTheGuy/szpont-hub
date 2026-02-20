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
} from 'lucide-react';
import { signOutAction, resetPasswordAction } from '@/app/actions';
import { useFinanceStore } from '@/hooks/useFinanceStore';

interface UserPanelProps {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
}

export function UserPanel({ userName, userEmail, avatarUrl }: UserPanelProps) {
  const { theme, setTheme } = useTheme();
  const { balanceMasked, toggleBalanceMask } = useFinanceStore();
  const [uploading, setUploading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              onClick={toggleBalanceMask}
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
          </div>
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
