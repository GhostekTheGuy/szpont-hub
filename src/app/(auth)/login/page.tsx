'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AlertCircle, Mail, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { initEncryptionSession, resetPasswordByEmailAction } from '@/app/actions';
import LetterGlitch from '@/components/LetterGlitch';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const switchMode = (newMode: Mode) => {
    setError('');
    setShowReset(false);
    setResetSent(false);
    setResetError('');
    setRegisterSuccess(false);
    setMode(newMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? 'Nieprawidłowy email lub hasło.'
          : error.message);
        setShowReset(true);
        setResetEmail(loginData.email);
        setLoading(false);
      } else {
        await initEncryptionSession(loginData.password);
        setTransitioning(true);
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1200);
      }
    } catch {
      setError('Wystąpił błąd logowania');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Błąd rejestracji');
      }

      setRegisterSuccess(true);
      setLoginData({ email: registerData.email, password: '' });
      setTimeout(() => {
        switchMode('login');
        setRegisterSuccess(false);
      }, 1500);
    } catch {
      setError('Wystąpił błąd. Spróbuj użyć innego adresu email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return;
    setResetSending(true);
    setResetError('');
    try {
      await resetPasswordByEmailAction(resetEmail);
      setResetSent(true);
    } catch {
      setResetError('Nie udało się wysłać maila. Sprawdź adres.');
    } finally {
      setResetSending(false);
    }
  };

  // Fullscreen loading after successful login
  if (transitioning) {
    return (
      <div className="fixed inset-0 z-50 animate-fade-in">
        <div className="absolute inset-0 z-0 opacity-30">
          <LetterGlitch
            glitchColors={['#7c3aed', '#9459FF', '#6d28d9']}
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={true}
            smooth={true}
            characters="$zpont01"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <Image
            src="/start.gif"
            alt="Loading"
            width={80}
            height={80}
            className="mb-6"
            unoptimized
          />
          <p className="text-sm text-muted-foreground animate-pulse">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all";

  const Spinner = () => (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* LetterGlitch background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <LetterGlitch
          glitchColors={['#7c3aed', '#9459FF', '#6d28d9']}
          glitchSpeed={70}
          centerVignette={false}
          outerVignette={true}
          smooth={true}
          characters="$zpont01"
        />
      </div>

      {/* Card */}
      <div className="relative z-10 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/sygnet.svg"
            alt="SzpontHub"
            width={48}
            height={42}
            className="mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-1">
            <span className="text-primary">$zpont</span><span>Hub</span>
          </h1>
          <p
            key={mode}
            className="text-muted-foreground text-sm animate-fade-in"
          >
            {mode === 'login' ? 'Zaloguj się, aby zarządzać finansami' : 'Utwórz konto i dołącz'}
          </p>
        </div>

        {/* Success message after registration */}
        {registerSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-500 text-sm animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            Konto utworzone! Możesz się zalogować.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              {showReset && mode === 'login' && !resetSent && (
                <button
                  onClick={handleResetPassword}
                  disabled={resetSending}
                  className="mt-2 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {resetSending ? 'Wysyłanie...' : 'Wyślij link do resetu hasła'}
                </button>
              )}
              {resetSent && (
                <p className="mt-2 text-xs text-green-500 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Link wysłany na {resetEmail}
                </p>
              )}
              {resetError && (
                <p className="mt-1 text-xs text-destructive">{resetError}</p>
              )}
            </div>
          </div>
        )}

        {/* Forms with animation */}
        <div key={mode} className="animate-fade-in">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className={inputClass}
                  placeholder="jan@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Hasło</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg shadow-lg transition-all duration-200 mt-2 ${
                  loading
                    ? 'scale-[0.97] opacity-80 cursor-not-allowed'
                    : 'hover:bg-primary/90 hover:scale-[1.01] hover:shadow-xl active:scale-[0.97]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Logowanie...
                  </span>
                ) : 'Zaloguj się'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Imię</label>
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className={inputClass}
                  placeholder="Jan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className={inputClass}
                  placeholder="jan@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Hasło</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg shadow-lg transition-all duration-200 mt-2 ${
                  loading
                    ? 'scale-[0.97] opacity-80 cursor-not-allowed'
                    : 'hover:bg-primary/90 hover:scale-[1.01] hover:shadow-xl active:scale-[0.97]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Tworzenie konta...
                  </span>
                ) : 'Zarejestruj się'}
              </button>
            </form>
          )}
        </div>

        {/* Toggle */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Nie masz jeszcze konta?{' '}
              <button onClick={() => switchMode('register')} className="text-primary hover:text-primary/80 font-medium transition-colors">
                Zarejestruj się
              </button>
            </>
          ) : (
            <>
              Masz już konto?{' '}
              <button onClick={() => switchMode('login')} className="text-primary hover:text-primary/80 font-medium transition-colors">
                Zaloguj się
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
