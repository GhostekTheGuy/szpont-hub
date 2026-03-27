'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Wallet, PiggyBank, CalendarDays, Target, Monitor, Smartphone, Check, ScanLine, Bot, X, Menu, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LetterGlitch from '@/components/LetterGlitch';
import { BlurFade } from '@/components/ui/blur-fade';
import { Marquee } from '@/components/ui/marquee';
import { AvatarCircles } from '@/components/ui/avatar-circles';
import { GridPattern } from '@/components/ui/grid-pattern';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Globe } from '@/components/ui/globe';
import { MeshGradient } from '@paper-design/shaders-react';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('desktop');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const priceId = billingCycle === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID;

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (res.status === 401) {
        navigateTo('/login?mode=register&plan=pro');
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // silently fail
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setIsLoggedIn(true);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cursor glow tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>('.glow-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const navigateTo = useCallback((href: string) => {
    setExiting(true);
    setTimeout(() => router.push(href), 500);
  }, [router]);

  return (
    <>
    {/* Sticky Nav — outside transform container so fixed works */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-2'
            : 'py-4'
        }`}
      >
        <div className={`max-w-4xl mx-auto px-4 transition-all duration-500 ${
          scrolled
            ? 'bg-background/70 backdrop-blur-2xl border border-border/50 rounded-full shadow-lg shadow-black/5'
            : ''
        }`}>
          <div className="flex items-center justify-between h-12">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image src="/sygnet.svg" alt="SzpontHub" width={24} height={20} className="h-5 w-auto" />
              <span className="text-base font-bold">
                <span className="text-primary">$zpont</span>Hub
              </span>
            </Link>

            {/* Nav links — hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'Funkcje', href: '#funkcje' },
                { label: 'Integracje', href: '#integracje' },
                { label: 'Opinie', href: '#opinie' },
                { label: 'Cennik', href: '#cennik' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Społeczność', href: '#spolecznosc' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-full hover:bg-muted/50"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-full text-xs h-8 px-4 shrink-0 hidden sm:inline-flex" onClick={() => navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register')}>
                {isLoggedIn ? 'Przejdź do panelu' : 'Rozpocznij'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full text-foreground hover:bg-muted/50 transition-colors duration-200"
              >
                {mobileMenu ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>

      </nav>

      {/* Mobile menu — fullscreen overlay */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[45] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-xl animate-fade-in"
            onClick={() => setMobileMenu(false)}
          />
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 gap-2">
            {[
              { label: 'Funkcje', href: '#funkcje' },
              { label: 'Integracje', href: '#integracje' },
              { label: 'Opinie', href: '#opinie' },
              { label: 'Cennik', href: '#cennik' },
              { label: 'FAQ', href: '#faq' },
              { label: 'Społeczność', href: '#spolecznosc' },
            ].map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenu(false)}
                className="text-2xl font-bold text-foreground/80 hover:text-primary py-3 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${(i + 1) * 60}ms`, animationFillMode: 'both' }}
              >
                {link.label}
              </a>
            ))}
            <div
              className="mt-6 w-full max-w-xs animate-fade-in"
              style={{ animationDelay: '360ms', animationFillMode: 'both' }}
            >
              <Button className="rounded-full text-sm h-12 w-full" onClick={() => { setMobileMenu(false); navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register'); }}>
                {isLoggedIn ? 'Przejdź do panelu' : 'Rozpocznij za darmo'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

    <div className={`min-h-screen bg-background text-foreground transition-all duration-500 ${exiting ? 'opacity-0 scale-[0.98] blur-sm' : 'opacity-100 scale-100'}`}>
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Mesh Gradient BG */}
        <div className="absolute inset-0">
          <MeshGradient
            style={{ width: '100%', height: '100%' }}
            colors={['#212121', '#000000']}
            distortion={1}
            swirl={0.2}
            grainMixer={0.34}
            grainOverlay={0}
            speed={1}
            rotation={90}
            offsetY={0.32}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6 pt-28 pb-16">
          <BlurFade delay={0.1} inView>
            <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="w-3 h-3" />
              Szyfrowane end‑to‑end
            </Badge>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12]">
              Kontroluj swoje finanse
              <br />
              <span className="text-primary">w jednym miejscu</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl leading-relaxed">
              Portfele, aktywa, nawyki i kalendarz pracy — wszystko zsynchronizowane, zaszyfrowane i gotowe do analizy.
            </p>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <Button size="lg" className="rounded-full text-sm h-11 px-6" onClick={() => navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register')}>
                {isLoggedIn ? 'Przejdź do panelu' : 'Rozpocznij za darmo'}
                <ArrowRight className="w-4 h-4" />
              </Button>
              {!isLoggedIn && <Button variant="outline" size="lg" className="rounded-full text-sm h-11 px-6" onClick={() => navigateTo('/login')}>
                Zaloguj się
              </Button>}
            </div>
            {!isLoggedIn && (
              <p className="text-muted-foreground text-sm mt-3 text-center">
                Nie wymaga karty kredytowej. Konfiguracja w 30 sekund.
              </p>
            )}
          </BlurFade>
        </div>

        {/* Dashboard preview */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24 animate-hero-tilt">
          <div className="relative overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-dashboard.png"
              alt="Dashboard $zpont Hub"
              width={2114}
              height={1076}
              className="w-full h-auto shadow-2xl shadow-primary/5"
            />
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
            {/* Glare sweep */}
            <div className="absolute inset-0 animate-hero-glare pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Cross-device section wrapper */}
      <div className="relative -mt-[140px] sm:-mt-[290px] z-20">
      {/* Arc divider — desktop only */}
      <div className="hidden sm:block h-20 pointer-events-none">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full block">
          <path d="M0,0 C360,80 1080,80 1440,0 L1440,80 L0,80 Z" className="fill-neutral-900" />
        </svg>
      </div>

      {/* Cross-device section */}
      <section className="relative bg-neutral-900 pt-16 pb-24 blend-to-bg">
        <GridPattern
          width={48}
          height={48}
          squares={[[4, 4], [8, 2], [12, 6], [2, 10], [16, 3], [6, 8]]}
          className="absolute inset-0 h-full w-full fill-white/[0.02] stroke-white/[0.04] [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          <BlurFade delay={0.1} inView>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              Dostępne na każdym urządzeniu
            </span>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Pracuj gdziekolwiek,<br /><span className="text-primary">zawsze w synchronizacji.</span>
            </h2>
          </BlurFade>

          {/* Device mockup gallery */}
          <BlurFade delay={0.3} inView>
            <div className="mt-14 relative w-full overflow-hidden rounded-2xl">
              {/* Desktop image */}
              <img
                src="/MB.png"
                alt="$zpont Hub — aplikacja webowa na MacBooku"
                className={`w-full h-auto transition-all duration-700 ease-in-out ${
                  deviceView === 'desktop'
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 absolute inset-0'
                }`}
              />
              {/* Mobile image */}
              <img
                src="/AP.png"
                alt="$zpont Hub — aplikacja mobilna"
                className={`w-full h-auto transition-all duration-700 ease-in-out ${
                  deviceView === 'mobile'
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 absolute inset-0'
                }`}
              />

              {/* Switch overlay — bottom center */}
              <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-0.5 sm:gap-1 rounded-full bg-black/60 backdrop-blur-xl p-0.5 sm:p-1">
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                    deviceView === 'mobile'
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Mobile
                </button>
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                    deviceView === 'desktop'
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Desktop
                </button>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <Button className="rounded-full text-sm h-11 px-6 mt-10" onClick={() => navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register')}>
              {isLoggedIn ? 'Przejdź do panelu' : 'Wypróbuj za darmo'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </BlurFade>
        </div>
      </section>
      </div>

      {/* Features section */}
      <section id="funkcje" className="relative bg-background pt-24 pb-24 scroll-mt-20 blend-to-dark">
        <GridPattern
          width={48}
          height={48}
          squares={[[3, 3], [7, 1], [11, 5], [15, 8], [1, 12], [9, 10]]}
          className="absolute inset-0 h-full w-full fill-violet-500/[0.02] stroke-violet-500/[0.06] [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        />
        {/* Heading */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center mb-16">
          <BlurFade delay={0.1} inView>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Funkcje stworzone<br />dla <span className="text-primary">Twojego sukcesu.</span>
            </h2>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Wszystko czego potrzebujesz, by mieć pełną kontrolę nad finansami i produktywnością.
            </p>
          </BlurFade>
        </div>

        {/* 2x2 Grid */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Portfele */}
          <BlurFade delay={0.25} inView>
          <div className="glow-card group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 mb-6 overflow-hidden relative">
              <video
                src="/wallets-preview.mov"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-left-top"
              />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center transition-colors duration-300 group-hover:bg-violet-500/25">
                <Wallet className="w-[18px] h-[18px] text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Portfele</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Zarządzaj wieloma portfelami w różnych walutach z pełnym podglądem salda i historii.</p>
          </div>
          </BlurFade>

          {/* Aktywa */}
          <BlurFade delay={0.3} inView>
          <div className="glow-card group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 mb-6 overflow-hidden relative">
              <video
                src="/assets-preview.mov"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-left-top"
              />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center transition-colors duration-300 group-hover:bg-violet-500/25">
                <PiggyBank className="w-[18px] h-[18px] text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Aktywa</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Śledź wartość swoich aktywów, inwestycji i oszczędności w jednym widoku.</p>
          </div>
          </BlurFade>

          {/* Kalendarz pracy */}
          <BlurFade delay={0.35} inView>
          <div className="glow-card group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 mb-6 overflow-hidden relative">
              <video
                src="/calendar-preview.mov"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-left-top"
              />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center transition-colors duration-300 group-hover:bg-blue-500/25">
                <CalendarDays className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Kalendarz pracy</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Planuj zmiany, śledź przepracowane godziny i kontroluj przychody z pracy.</p>
          </div>
          </BlurFade>

          {/* Nawyki */}
          <BlurFade delay={0.4} inView>
          <div className="glow-card group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 mb-6 overflow-hidden relative">
              <video
                src="/habits-preview.mov"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-left-top"
              />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center transition-colors duration-300 group-hover:bg-amber-500/25">
                <Target className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Nawyki</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Buduj zdrowe nawyki finansowe i monitoruj swoje postępy dzień po dniu.</p>
          </div>
          </BlurFade>

        </div>

        <div className="relative z-10 flex justify-center mt-14">
          <BlurFade delay={0.45} inView>
            <Button className="rounded-full text-sm h-11 px-6" onClick={() => navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register')}>
              {isLoggedIn ? 'Przejdź do panelu' : 'Odkryj wszystkie funkcje'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </BlurFade>
        </div>
      </section>

      {/* Integrations section */}
      <section id="integracje" className="relative bg-neutral-900 py-32 overflow-hidden scroll-mt-20 blend-from-dark blend-to-bg">
        <GridPattern
          width={48}
          height={48}
          squares={[[5, 2], [10, 4], [2, 7], [14, 1], [8, 9], [16, 6]]}
          className="absolute inset-0 h-full w-full fill-white/[0.02] stroke-white/[0.04] [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-20">
            <BlurFade delay={0.1} inView>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                Integracje
              </span>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
                Łączy się z narzędziami,<br />których <span className="text-primary">już używasz.</span>
              </h2>
            </BlurFade>
          </div>

          {/* Top row — 2 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Google */}
            <BlurFade delay={0.25} inView>
              <div className="glow-card group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1">
                {/* Mini calendar component */}
                <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 p-4 mb-6 overflow-hidden relative">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="text-[10px] font-bold text-foreground">Google Calendar</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-[9px] text-violet-400 font-medium">Sync</span>
                      </div>
                    </div>
                    {/* Animated calendar events */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      {[
                        { time: '09:00', label: 'Zmiana — Biuro', color: 'bg-violet-500/20 border-violet-500/30 text-violet-300' },
                        { time: '13:00', label: 'Przerwa obiadowa', color: 'bg-muted/80 border-border/30 text-muted-foreground' },
                        { time: '14:00', label: 'Zmiana — Zdalna', color: 'bg-violet-500/20 border-violet-500/30 text-violet-300' },
                        { time: '17:00', label: 'Spotkanie zespołu', color: 'bg-violet-600/25 border-violet-500/40 text-violet-300' },
                      ].map((ev, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-500 group-hover:translate-x-1 ${ev.color}`}
                          style={{ transitionDelay: `${i * 60}ms` }}
                        >
                          <span className="text-[9px] font-mono opacity-60 w-8 shrink-0">{ev.time}</span>
                          <span className="text-[10px] font-medium truncate">{ev.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Sync arrow animation */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <ArrowRight className="w-4 h-4 text-violet-400 animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDirection: 'alternate' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center transition-colors duration-300 group-hover:bg-violet-500/25">
                    <CalendarDays className="w-[18px] h-[18px] text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Google</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">Synchronizuj kalendarz pracy z Google Calendar i twórz automatyczne kopie zapasowe na Drive.</p>
              </div>
            </BlurFade>

            {/* Toggl Track */}
            <BlurFade delay={0.3} inView>
              <div className="glow-card group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1">
                {/* Mini time tracker component */}
                <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 p-4 mb-6 overflow-hidden relative">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="2"/>
                          <path d="M12 7v6l4 2" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className="text-[10px] font-bold text-foreground">Toggl Track</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-[9px] text-violet-400 font-medium">Live</span>
                      </div>
                    </div>
                    {/* Time entries */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      {[
                        { project: 'SzpontHub', task: 'Frontend dev', hours: '3h 24m', active: true },
                        { project: 'Freelance', task: 'Logo design', hours: '1h 45m', active: false },
                        { project: 'SzpontHub', task: 'API integration', hours: '2h 10m', active: false },
                      ].map((entry, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all duration-500 group-hover:translate-x-1 ${
                            entry.active
                              ? 'bg-violet-500/20 border-violet-500/30'
                              : 'bg-muted/60 border-border/30'
                          }`}
                          style={{ transitionDelay: `${i * 60}ms` }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.active ? 'bg-violet-400 animate-pulse' : 'bg-muted-foreground/30'}`} />
                            <div className="min-w-0">
                              <div className="text-[10px] font-medium text-foreground truncate">{entry.project}</div>
                              <div className="text-[8px] text-muted-foreground truncate">{entry.task}</div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono shrink-0 ml-2 ${entry.active ? 'text-violet-400' : 'text-muted-foreground'}`}>{entry.hours}</span>
                        </div>
                      ))}
                    </div>
                    {/* Total bar */}
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 transition-all duration-500 group-hover:bg-violet-500/15">
                      <span className="text-[9px] text-muted-foreground font-medium">Dziś łącznie</span>
                      <span className="text-[11px] font-bold text-violet-400">7h 19m</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center transition-colors duration-300 group-hover:bg-violet-500/25">
                    <Target className="w-[18px] h-[18px] text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Toggl Track</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">Importuj logi czasu pracy, automatycznie przeliczaj stawki i generuj raporty.</p>
              </div>
            </BlurFade>
          </div>

          {/* Bottom row — Apple card */}
          <BlurFade delay={0.35} inView>
            <div className="glow-card group bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row gap-6 transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1">
              {/* Mini health/habits component */}
              <div className="sm:w-1/2 aspect-[4/2] sm:aspect-auto rounded-xl bg-muted/50 border border-border/40 p-4 overflow-hidden relative">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <span className="text-[10px] font-bold text-foreground">Apple Health</span>
                    </div>
                    <Badge variant="secondary" className="text-[8px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border-violet-500/20">
                      Wkrótce
                    </Badge>
                  </div>
                  {/* Activity rings */}
                  <div className="flex-1 flex items-center justify-center gap-6">
                    <div className="relative w-16 h-16">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-violet-500/10" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-violet-500 transition-all duration-1000 group-hover:stroke-dashoffset-[20]" strokeWidth="3" strokeLinecap="round" strokeDasharray="97.4" strokeDashoffset="25" />
                        <circle cx="18" cy="18" r="11" fill="none" className="stroke-violet-400/10" strokeWidth="3" />
                        <circle cx="18" cy="18" r="11" fill="none" className="stroke-violet-400 transition-all duration-1000" strokeWidth="3" strokeLinecap="round" strokeDasharray="69.1" strokeDashoffset="22" style={{ transitionDelay: '100ms' }} />
                        <circle cx="18" cy="18" r="6.5" fill="none" className="stroke-violet-300/10" strokeWidth="3" />
                        <circle cx="18" cy="18" r="6.5" fill="none" className="stroke-violet-300 transition-all duration-1000" strokeWidth="3" strokeLinecap="round" strokeDasharray="40.8" strokeDashoffset="8" style={{ transitionDelay: '200ms' }} />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: 'Nawyki', value: '85%', color: 'bg-violet-500' },
                        { label: 'Budżet', value: '70%', color: 'bg-violet-400' },
                        { label: 'Oszczędz.', value: '92%', color: 'bg-violet-300' },
                      ].map((ring, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${ring.color}`} />
                          <span className="text-[9px] text-muted-foreground w-14">{ring.label}</span>
                          <span className="text-[9px] font-bold text-foreground">{ring.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Text */}
              <div className="sm:w-1/2 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center transition-colors duration-300 group-hover:bg-violet-500/25">
                    <Sparkles className="w-[18px] h-[18px] text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Apple</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Połącz nawyki ze zdrowiem przez Apple Health, synchronizuj kalendarz i automatyzuj zadania przez Shortcuts.
                </p>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.45} inView>
            <div className="flex justify-center mt-16">
              <Button className="rounded-full text-sm h-11 px-6" onClick={() => navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register')}>
                {isLoggedIn ? 'Przejdź do panelu' : 'Połącz swoje usługi'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Testimonials */}
      <section id="opinie" className="relative bg-background py-32 overflow-hidden scroll-mt-20 blend-to-dark">
        <GridPattern
          width={48}
          height={48}
          squares={[[6, 3], [2, 8], [12, 1], [9, 6], [15, 10], [4, 12]]}
          className="absolute inset-0 h-full w-full fill-violet-500/[0.02] stroke-violet-500/[0.06] [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        />
        {/* Header */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center mb-16">
          <BlurFade delay={0.1} inView>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              Opinie
            </span>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Ludzie <span className="text-primary">kochają</span><br />$zpont Hub.
            </h2>
          </BlurFade>
        </div>

        {/* Marquee container — clipped to section width */}
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Row 1 */}
          <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
            <Marquee pauseOnHover className="[--duration:35s] [--gap:1rem]">
              {[
                { quote: 'Jako freelancer potrzebowałem narzędzia, które ogarnie czas pracy i finanse w jednym miejscu. SzpontHub robi to idealnie.', name: 'Marta Kowalska', role: 'Freelancer, UX Designer', initials: 'MK' },
                { quote: 'Wcześniej używaliśmy 4 różnych apek. Teraz kontrakty, śledzenie czasu i płatności — wszystko w jednym systemie.', name: 'Jan Nowak', role: 'Project Manager', initials: 'JN' },
                { quote: 'Kalendarz pracy z automatycznym liczeniem godzin to game changer. Oszczędzam godzinę tygodniowo na samych raportach.', name: 'Paweł Zieliński', role: 'Programista', initials: 'PZ' },
                { quote: 'Nareszcie apka, która rozumie polskie realia. Waluta, format dat, wszystko działa jak należy.', name: 'Karolina Majewska', role: 'Księgowa', initials: 'KM' },
              ].map((t, i) => (
                <div key={i} className="glow-card w-[320px] sm:w-[360px] shrink-0 bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-500/15 flex items-center justify-center text-xs font-bold text-violet-400">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>

          {/* Row 2 — reverse */}
          <div className="relative overflow-hidden mt-4" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
            <Marquee reverse pauseOnHover className="[--duration:38s] [--gap:1rem]">
              {[
                { quote: 'Nawyki finansowe zmieniły moje podejście do oszczędzania. Seria 30 dni bez zbędnych wydatków — zrobione!', name: 'Aleksandra Wiśniewska', role: 'Właścicielka studia', initials: 'AW' },
                { quote: 'Integracja z Toggl Track to strzał w dziesiątkę. Moje logi czasu pracy automatycznie lądują w kalendarzu.', name: 'Tomasz Krawczyk', role: 'DevOps Engineer', initials: 'TK' },
                { quote: 'Wreszcie mam pełny obraz moich finansów. Portfele w różnych walutach, aktywa, wszystko w jednym dashboardzie.', name: 'Natalia Dąbrowska', role: 'Product Designer', initials: 'ND' },
                { quote: 'Szyfrowanie end-to-end daje mi spokój ducha. Moje dane finansowe są bezpieczne i tylko ja mam do nich dostęp.', name: 'Michał Lewandowski', role: 'CTO, Startup', initials: 'ML' },
              ].map((t, i) => (
                <div key={i} className="glow-card w-[320px] sm:w-[360px] shrink-0 bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-500/15 flex items-center justify-center text-xs font-bold text-violet-400">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </div>

        <div className="relative z-10 flex justify-center mt-14">
          <BlurFade delay={0.3} inView>
            <Button className="rounded-full text-sm h-11 px-6" onClick={() => navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register')}>
              {isLoggedIn ? 'Przejdź do panelu' : 'Dołącz do nich'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </BlurFade>
        </div>
      </section>

      {/* Pricing */}
      <section id="cennik" className="relative bg-neutral-900 py-32 overflow-hidden scroll-mt-20 blend-from-dark blend-to-bg">
        <GridPattern
          width={48}
          height={48}
          squares={[[3, 5], [7, 2], [11, 8], [15, 3], [1, 11], [13, 7]]}
          className="absolute inset-0 h-full w-full fill-white/[0.02] stroke-white/[0.04] [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <BlurFade delay={0.1} inView>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                Cennik
              </span>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
                Prosty cennik,<br /><span className="text-primary">bez ukrytych kosztów.</span>
              </h2>
            </BlurFade>

            {/* Billing toggle */}
            <BlurFade delay={0.3} inView>
              <div className="mt-8 inline-flex items-center gap-1 rounded-full bg-card border border-border p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    billingCycle === 'monthly'
                      ? 'bg-violet-600 text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Miesięcznie
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-violet-600 text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Rocznie
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors duration-300 ${
                    billingCycle === 'yearly'
                      ? 'bg-white/20 text-white'
                      : 'bg-violet-500/15 text-violet-400'
                  }`}>
                    -17%
                  </span>
                </button>
              </div>
            </BlurFade>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <BlurFade delay={0.3} inView>
              <div className="glow-card group bg-card border border-border rounded-2xl p-8 flex flex-col h-full transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground">Darmowy</h3>
                  <p className="text-sm text-muted-foreground mt-1">Wszystko czego potrzebujesz na start.</p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-foreground">0 zł</span>
                  <span className="text-sm text-muted-foreground">/ miesiąc</span>
                </div>

                <Button
                  variant="outline"
                  className="rounded-full w-full mb-8"
                  onClick={() => navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register')}
                >
                  {isLoggedIn ? 'Przejdź do panelu' : 'Rozpocznij za darmo'}
                </Button>

                <div className="flex flex-col gap-3">
                  {[
                    'Nieograniczone portfele',
                    'Śledzenie aktywów',
                    'Kalendarz pracy',
                    'Nawyki finansowe',
                    'Szyfrowanie end-to-end',
                    'Synchronizacja między urządzeniami',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>

            {/* Pro */}
            <BlurFade delay={0.35} inView>
              <div className="glow-card group relative !overflow-visible bg-card border-2 border-violet-500/50 rounded-2xl p-8 flex flex-col h-full transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1">
                {/* Popular badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="rounded-full px-3 py-1 text-[10px] font-bold bg-violet-600 text-white border-0 shadow-lg shadow-violet-500/25">
                    Popularny
                  </Badge>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground">Pro</h3>
                  <p className="text-sm text-muted-foreground mt-1">Narzędzia AI dla pełnej kontroli.</p>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-foreground">
                    {billingCycle === 'monthly' ? '19 zł' : '190 zł'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {billingCycle === 'monthly' ? 'miesiąc' : 'rok'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-xs text-violet-400 font-medium mb-6">
                    ~15,83 zł / miesiąc — oszczędzasz 38 zł
                  </p>
                )}
                {billingCycle === 'monthly' && <div className="mb-6" />}

                <Button
                  className="rounded-full w-full mb-8"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Rozpocznij z Pro
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="flex flex-col gap-3">
                  {[
                    'Wszystko z planu Darmowego',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}

                  <div className="w-full h-px bg-border/50 my-1" />

                  {[
                    { icon: ScanLine, label: 'Skanowanie paragonów i faktur AI' },
                    { icon: Bot, label: 'Asystent AI do analizy wydatków' },
                    { icon: Sparkles, label: 'Inteligentne kategorie i tagi' },
                    { icon: Target, label: 'Predykcje i cele finansowe AI' },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <feature.icon className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="text-sm text-foreground font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>

          {/* Social proof */}
          <BlurFade delay={0.4} inView>
            <div className="flex flex-col items-center gap-4 mt-16">
              <AvatarCircles
                numPeople={92}
                avatarUrls={[
                  { imageUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Kacper', profileUrl: '#' },
                  { imageUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Marta', profileUrl: '#' },
                  { imageUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Tomek', profileUrl: '#' },
                  { imageUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Ola', profileUrl: '#' },
                  { imageUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Pawel', profileUrl: '#' },
                ]}
              />
              <p className="text-sm text-muted-foreground font-medium">
                Zaufało nam już ponad <span className="text-violet-400 font-bold">100 szponciarzy</span>!
              </p>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative bg-neutral-900 py-32 overflow-hidden scroll-mt-20 blend-from-dark blend-to-bg">
        <GridPattern
          width={48}
          height={48}
          squares={[[2, 4], [6, 9], [10, 2], [14, 7], [4, 12], [12, 5]]}
          className="absolute inset-0 h-full w-full fill-white/[0.02] stroke-white/[0.04] [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <BlurFade delay={0.1} inView>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                FAQ
              </span>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
                Najczęściej zadawane <span className="text-primary">pytania.</span>
              </h2>
            </BlurFade>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: 'Czy moje dane są bezpieczne?',
                a: 'Tak. Wszystkie dane finansowe są szyfrowane end-to-end — nawet my nie mamy do nich dostępu. Klucze szyfrujące są generowane po stronie klienta i nigdy nie opuszczają Twojego urządzenia.',
              },
              {
                q: 'Co daje plan Pro?',
                a: 'Plan Pro odblokowuje narzędzia AI (inteligentna kategoryzacja, prognozy), nielimitowane skanowanie paragonów, zaawansowane raporty i priorytetowe wsparcie.',
              },
              {
                q: 'Jak szybko mogę zacząć?',
                a: 'Rejestracja zajmuje około 30 sekund. Nie wymagamy karty kredytowej — możesz korzystać z darmowego planu bez żadnych zobowiązań.',
              },
              {
                q: 'Czy mogę zaimportować dane z innych aplikacji?',
                a: 'Obecnie wspieramy import z Toggl Track. Pracujemy nad kolejnymi integracjami — jeśli masz konkretną potrzebę, daj nam znać na Discordzie.',
              },
              {
                q: 'Jak działa szyfrowanie?',
                a: 'Używamy szyfrowania DEK (Data Encryption Key). Każdy użytkownik ma unikalny klucz, a cała operacja szyfrowania odbywa się po stronie klienta (client-side encryption), zanim dane trafią na serwer.',
              },
              {
                q: 'Czy mogę korzystać na telefonie?',
                a: 'Tak! $zpontHub jest w pełni responsywny — działa na każdym urządzeniu z przeglądarką. Nie potrzebujesz osobnej aplikacji mobilnej.',
              },
            ].map((item, i) => (
              <BlurFade key={i} delay={0.25 + i * 0.05} inView>
                <AccordionItem value={`faq-${i}`} className="bg-card border border-border rounded-2xl px-6">
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-5">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              </BlurFade>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Community / Social */}
      <section id="spolecznosc" className="relative bg-background py-32 overflow-hidden scroll-mt-20 blend-to-dark">
        <GridPattern
          width={48}
          height={48}
          squares={[[4, 6], [8, 1], [14, 4], [2, 9], [10, 11], [6, 3]]}
          className="absolute inset-0 h-full w-full fill-violet-500/[0.02] stroke-violet-500/[0.06] [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <BlurFade delay={0.1} inView>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                Społeczność
              </span>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
                Bądź <span className="text-primary">na bieżąco.</span>
              </h2>
            </BlurFade>
          </div>

          {/* Discord Card with decorative logos */}
          <BlurFade delay={0.25} inView>
            <div className="relative max-w-lg mx-auto">
              {/* Left decorative Discord logo - dark blue/gray, partially hidden */}
              <svg className="absolute -left-24 sm:-left-16 md:-left-28 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 text-[#5865F2]/15 pointer-events-none select-none" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>

              {/* Right decorative Discord logo - white/light, partially hidden */}
              <svg className="absolute -right-24 sm:-right-16 md:-right-28 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 text-white/[0.06] pointer-events-none select-none" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>

              {/* Main card */}
              <div className="relative z-10 glow-card group bg-card border border-border rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-[#5865F2] flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">Discord</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
                  Rozmawiaj z innymi szponciarzami, zgłaszaj pomysły i testuj nowe funkcje jako pierwszy.
                </p>

                <a
                  href="https://discord.gg/cveFpy4d9H"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-400 w-fit"
                >
                  Dołącz
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <div className="flex justify-center mt-14">
              <Button className="rounded-full text-sm h-11 px-6" onClick={() => navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register')}>
                {isLoggedIn ? 'Przejdź do panelu' : 'Dołącz teraz'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* CTA + Footer wrapper with matrix bg */}
      <div className="relative overflow-hidden blend-from-dark">
        {/* Matrix shader — spans CTA + footer */}
        <div className="absolute inset-0 opacity-20">
          <LetterGlitch
            glitchColors={['#1a1a2e', '#7c3aed', '#4c1d95']}
            glitchSpeed={70}
            centerVignette={false}
            outerVignette={true}
            smooth={true}
            characters="$ZPONT01"
          />
        </div>
        {/* Top fade — smooth blend from previous section */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-neutral-900 to-transparent z-[1] pointer-events-none" />

      {/* CTA */}
      <section className="relative z-[2] py-32">
        <GridPattern
          width={48}
          height={48}
          squares={[[5, 3], [9, 7], [13, 2], [1, 6], [7, 10], [11, 5]]}
          className="absolute inset-0 h-full w-full fill-white/[0.02] stroke-white/[0.04] [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Gotowy, by <span className="text-primary">zacząć?</span>
            </h2>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-lg leading-relaxed">
              Załóż konto za darmo. Bez karty kredytowej.
            </p>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <Button size="lg" className="rounded-full text-sm h-12 px-8 mt-8" onClick={() => navigateTo(isLoggedIn ? '/dashboard' : '/login?mode=register')}>
              {isLoggedIn ? 'Przejdź do panelu' : 'Rozpocznij za darmo'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-[2] pb-8 pt-4">
        {/* Globe */}
        <div className="relative z-[1] flex justify-center -mb-60 sm:-mb-72 -mt-[180px] pointer-events-none">
          <div className="relative w-[420px] h-[420px] sm:w-[560px] sm:h-[560px]">
            <Globe
              config={{
                width: 800,
                height: 800,
                onRender: () => {},
                devicePixelRatio: 2,
                phi: 0,
                theta: 0.3,
                dark: 1,
                diffuse: 0.4,
                mapSamples: 16000,
                mapBrightness: 1.2,
                baseColor: [1, 1, 1],
                markerColor: [139 / 255, 92 / 255, 246 / 255],
                glowColor: [60 / 255, 40 / 255, 120 / 255],
                markers: [
                  { location: [52.2297, 21.0122], size: 0.12 },
                  { location: [51.1079, 17.0385], size: 0.08 },
                  { location: [50.0647, 19.945], size: 0.08 },
                  { location: [48.8566, 2.3522], size: 0.06 },
                  { location: [52.52, 13.405], size: 0.06 },
                  { location: [40.7128, -74.006], size: 0.05 },
                  { location: [35.6762, 139.6503], size: 0.05 },
                ],
              }}
            />
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-10 sm:p-12">
            <div className="flex flex-col sm:flex-row gap-12 sm:gap-8">
              {/* Brand */}
              <div className="sm:w-1/3">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <Image src="/sygnet.svg" alt="SzpontHub" width={28} height={24} className="h-6 w-auto" />
                  <span className="text-lg font-bold">
                    <span className="text-primary">$zpont</span>Hub
                  </span>
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                  Twoje ulubione narzędzie do zarządzania finansami. Stworzone dla freelancerów.
                </p>
                {/* Social icons */}
                <div className="flex items-center gap-2 mt-6">
                  <a href="https://discord.gg/cveFpy4d9H" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-muted/50 border border-border/40 flex items-center justify-center text-muted-foreground transition-all duration-300 hover:bg-violet-500/15 hover:text-violet-400 hover:border-violet-500/30">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-16 sm:gap-20 sm:ml-auto">
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">Produkt</h4>
                  <ul className="flex flex-col gap-3">
                    <li><a href="#funkcje" className="text-sm text-foreground/70 hover:text-violet-400 transition-colors duration-300">Funkcje</a></li>
                    <li><a href="#cennik" className="text-sm text-foreground/70 hover:text-violet-400 transition-colors duration-300">Cennik</a></li>
                    <li><a href="#integracje" className="text-sm text-foreground/70 hover:text-violet-400 transition-colors duration-300">Integracje</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">Informacje</h4>
                  <ul className="flex flex-col gap-3">
                    <li><Link href="/polityka-prywatnosci" className="text-sm text-foreground/70 hover:text-violet-400 transition-colors duration-300">Polityka prywatności</Link></li>
                    <li><Link href="/regulamin" className="text-sm text-foreground/70 hover:text-violet-400 transition-colors duration-300">Regulamin</Link></li>
                    <li><a href="mailto:kontakt@szponthub.pl" className="text-sm text-foreground/70 hover:text-violet-400 transition-colors duration-300">Kontakt</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-10 pt-6 border-t border-border/30 flex flex-col items-center justify-center gap-1">
              <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} $zpont Hub. Wszelkie prawa zastrzeżone.</p>
            </div>
          </div>
        </div>
      </footer>
      </div>

    </div>

    {/* Legal modal — outside transform container */}
    {legalModal && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={() => setLegalModal(null)}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <div
          className="relative bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 shadow-2xl animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setLegalModal(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          {legalModal === 'privacy' ? (
            <>
              <h2 className="text-2xl font-extrabold text-foreground mb-6">Polityka prywatności</h2>
              <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
                <p>Ostatnia aktualizacja: 24 lutego 2026</p>
                <h3 className="text-base font-bold text-foreground mt-2">1. Administrator danych</h3>
                <p>Administratorem danych osobowych jest Hubert Kolejko, prowadzący serwis $zpont Hub. Adres: ul. Stanisława Leszczyńskiego 25/403, 20-400 Lublin. Kontakt: kontakt@szponthub.pl</p>
                <h3 className="text-base font-bold text-foreground mt-2">2. Jakie dane zbieramy</h3>
                <p>Zbieramy wyłącznie dane niezbędne do działania serwisu: adres e-mail, zaszyfrowane dane finansowe oraz anonimowe dane analityczne. Wszystkie dane finansowe są szyfrowane end-to-end — nie mamy do nich dostępu.</p>
                <h3 className="text-base font-bold text-foreground mt-2">3. Cel przetwarzania</h3>
                <p>Dane przetwarzane są w celu świadczenia usług, obsługi konta użytkownika oraz komunikacji związanej z serwisem.</p>
                <h3 className="text-base font-bold text-foreground mt-2">4. Prawa użytkownika</h3>
                <p>Masz prawo do wglądu, edycji, usunięcia swoich danych oraz eksportu ich w dowolnym momencie z poziomu ustawień konta.</p>
                <h3 className="text-base font-bold text-foreground mt-2">5. Pliki cookies</h3>
                <p>Używamy wyłącznie niezbędnych plików cookies technicznych. Nie stosujemy cookies śledzących ani reklamowych.</p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-foreground mb-6">Regulamin</h2>
              <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
                <p>Ostatnia aktualizacja: 24 lutego 2026</p>
                <h3 className="text-base font-bold text-foreground mt-2">1. Postanowienia ogólne</h3>
                <p>Niniejszy regulamin określa zasady korzystania z serwisu $zpont Hub. Operatorem serwisu jest Hubert Kolejko, ul. Stanisława Leszczyńskiego 25/403, 20-400 Lublin, e-mail: kontakt@szponthub.pl. Rejestracja oznacza akceptację regulaminu.</p>
                <h3 className="text-base font-bold text-foreground mt-2">2. Konto użytkownika</h3>
                <p>Użytkownik zobowiązany jest do podania prawdziwego adresu e-mail. Konto jest osobiste i nie może być udostępniane osobom trzecim.</p>
                <h3 className="text-base font-bold text-foreground mt-2">3. Plan darmowy i Pro</h3>
                <p>Plan darmowy zapewnia pełen dostęp do podstawowych funkcji. Plan Pro (19 zł/mies. lub 190 zł/rok) oferuje dodatkowe narzędzia AI. Subskrypcję można anulować w dowolnym momencie.</p>
                <h3 className="text-base font-bold text-foreground mt-2">4. Odpowiedzialność</h3>
                <p>$zpont Hub nie ponosi odpowiedzialności za decyzje finansowe podjęte na podstawie danych prezentowanych w aplikacji. Serwis ma charakter informacyjny i organizacyjny.</p>
                <h3 className="text-base font-bold text-foreground mt-2">5. Usunięcie konta</h3>
                <p>Użytkownik może w każdej chwili usunąć konto z poziomu ustawień. Wszystkie dane zostaną trwale usunięte w ciągu 30 dni.</p>
              </div>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}
