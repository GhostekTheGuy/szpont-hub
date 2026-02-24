'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Wallet, PiggyBank, CalendarDays, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DarkVeil from '@/components/DarkVeil';
import { BlurFade } from '@/components/ui/blur-fade';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigateTo = useCallback((href: string) => {
    setExiting(true);
    setTimeout(() => router.push(href), 500);
  }, [router]);

  return (
    <div className={`min-h-screen bg-background text-foreground transition-all duration-500 ${exiting ? 'opacity-0 scale-[0.98] blur-sm' : 'opacity-100 scale-100'}`}>
      {/* Sticky Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/sygnet.svg" alt="SzpontHub" width={28} height={24} className="h-6 w-auto" />
            <span className="text-lg font-bold">
              <span className="text-primary">$zpont</span>Hub
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigateTo('/login')}>
              Zaloguj&nbsp;się
            </Button>
            <Button size="sm" className="rounded-full" onClick={() => navigateTo('/login?mode=register')}>
              Rozpocznij
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* DarkVeil BG */}
        <div className="absolute inset-0 grayscale">
          <DarkVeil
            hueShift={0}
            noiseIntensity={0.15}
            scanlineIntensity={0.04}
            speed={0.8}
            scanlineFrequency={80}
            warpAmount={0.02}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6 pt-12 pb-16">
          <BlurFade delay={0.1} inView>
            <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="w-3 h-3" />
              Szyfrowane end‑to‑end
            </Badge>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
              Kontroluj swoje finanse{' '}
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
              <Button size="lg" className="rounded-full text-sm h-11 px-6" onClick={() => navigateTo('/login?mode=register')}>
                Rozpocznij za darmo
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full text-sm h-11 px-6" onClick={() => navigateTo('/login')}>
                Zaloguj się
              </Button>
            </div>
          </BlurFade>
        </div>

        {/* Dashboard preview */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24 animate-hero-tilt">
          <div className="relative overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/image 7.png"
              alt="Dashboard $zpont Hub"
              className="w-full h-auto shadow-2xl shadow-primary/5"
            />
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
            {/* Glare sweep */}
            <div className="absolute inset-0 animate-hero-glare pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Features section wrapper (arc + section share gradient) */}
      <div className="relative -mt-[290px] z-20">
        {/* Arc divider */}
        <div className="h-20 pointer-events-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full block">
            <path d="M0,0 C360,80 1080,80 1440,0 L1440,80 L0,80 Z" className="fill-background" />
          </svg>
        </div>

      <section className="relative bg-background pt-16 pb-24">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-600/10 to-transparent pointer-events-none" />
        {/* Heading */}
        <div className="max-w-3xl mx-auto px-6 text-center mb-16">
          <BlurFade delay={0.1} inView>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Funkcje stworzone<br />dla Twojego sukcesu.
            </h2>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Wszystko czego potrzebujesz, by mieć pełną kontrolę nad finansami i produktywnością.
            </p>
          </BlurFade>
        </div>

        {/* 2x2 Grid */}
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Portfele */}
          <BlurFade delay={0.25} inView>
          <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 p-4 mb-6 overflow-hidden relative">
              {/* Stacked credit cards */}
              <div className="relative h-full flex items-center justify-center">
                {/* Card 3 — back */}
                <div className="absolute w-[82%] h-[58%] rounded-xl bg-violet-400/20 border border-violet-400/10 backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-3 group-hover:-rotate-3 translate-y-2 rotate-2" />
                {/* Card 2 — middle */}
                <div className="absolute w-[88%] h-[58%] rounded-xl bg-violet-500/40 border border-violet-400/15 backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-1.5 group-hover:rotate-1 translate-y-1 -rotate-1 delay-75">
                  <div className="absolute bottom-3 left-4">
                    <div className="text-[9px] text-white/50 font-medium">Oszczędności</div>
                    <div className="text-xs font-bold text-white/70">34 200,00 zł</div>
                  </div>
                </div>
                {/* Card 1 — front */}
                <div className="absolute w-[94%] h-[58%] rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 border border-violet-400/20 shadow-lg shadow-violet-500/10 transition-all duration-500 group-hover:translate-y-1 group-hover:rotate-0 -translate-y-0.5 delay-100">
                  <div className="p-4 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-white/50 font-medium tracking-wide uppercase">Główne konto</div>
                      <div className="text-[10px] text-white/30 font-mono">PLN</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white tracking-tight">12 450,00 zł</div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="text-[9px] text-white/40 font-mono tracking-widest">•••• 4218</div>
                        <div className="text-[9px] text-violet-300/60 font-medium">Visa</div>
                      </div>
                    </div>
                  </div>
                  {/* Card shine */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
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
          <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 p-5 mb-6 overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-medium">Wartość portfela</div>
                    <div className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-violet-400">179 615 zł</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-violet-400 font-semibold">+12.4%</div>
                    <div className="text-[9px] text-muted-foreground">ten miesiąc</div>
                  </div>
                </div>
                {/* SVG Line chart */}
                <div className="flex-1 relative mt-2">
                  <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="200" y2="20" className="stroke-border/30" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1="40" x2="200" y2="40" className="stroke-border/30" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1="60" x2="200" y2="60" className="stroke-border/30" strokeWidth="0.5" strokeDasharray="4 4" />
                    {/* Area fill */}
                    <path
                      d="M0,65 L15,60 L30,58 L45,55 L60,52 L75,48 L90,50 L105,42 L120,38 L135,35 L150,30 L165,25 L180,20 L200,15 L200,80 L0,80 Z"
                      className="fill-violet-500/10 transition-all duration-700 group-hover:fill-violet-500/20"
                    />
                    {/* Line */}
                    <path
                      d="M0,65 L15,60 L30,58 L45,55 L60,52 L75,48 L90,50 L105,42 L120,38 L135,35 L150,30 L165,25 L180,20 L200,15"
                      fill="none"
                      className="stroke-violet-500 transition-all duration-700"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="300"
                      strokeDashoffset="300"
                      style={{ animation: 'none' }}
                    >
                      <animate attributeName="stroke-dashoffset" from="300" to="0" dur="1.5s" fill="freeze" begin="0.3s" />
                    </path>
                    {/* Glow line */}
                    <path
                      d="M0,65 L15,60 L30,58 L45,55 L60,52 L75,48 L90,50 L105,42 L120,38 L135,35 L150,30 L165,25 L180,20 L200,15"
                      fill="none"
                      className="stroke-violet-400/30"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="300"
                      strokeDashoffset="300"
                      filter="url(#glow)"
                    >
                      <animate attributeName="stroke-dashoffset" from="300" to="0" dur="1.5s" fill="freeze" begin="0.3s" />
                    </path>
                    {/* Endpoint dot */}
                    <circle cx="200" cy="15" r="3" className="fill-violet-500" opacity="0">
                      <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="1.6s" />
                    </circle>
                    <circle cx="200" cy="15" r="6" className="fill-violet-500/20" opacity="0">
                      <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="1.6s" />
                      <animate attributeName="r" from="6" to="8" dur="1.5s" repeatCount="indefinite" begin="1.6s" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" begin="1.6s" />
                    </circle>
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                  </svg>
                </div>
                {/* Bottom stats */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-muted/60 rounded-lg px-3 py-1.5 border border-border/20 transition-transform duration-500 group-hover:scale-[1.02]">
                    <div className="text-[8px] text-muted-foreground uppercase tracking-wider">Przychody</div>
                    <div className="text-xs font-bold text-foreground">64 243 zł</div>
                  </div>
                  <div className="flex-1 bg-muted/60 rounded-lg px-3 py-1.5 border border-border/20 transition-transform duration-500 group-hover:scale-[1.02] delay-75">
                    <div className="text-[8px] text-muted-foreground uppercase tracking-wider">Wydatki</div>
                    <div className="text-xs font-bold text-foreground">9 919 zł</div>
                  </div>
                  <div className="flex-1 bg-muted/60 rounded-lg px-3 py-1.5 border border-border/20 transition-transform duration-500 group-hover:scale-[1.02] delay-100">
                    <div className="text-[8px] text-muted-foreground uppercase tracking-wider">Bilans</div>
                    <div className="text-xs font-bold text-violet-400">+54 324 zł</div>
                  </div>
                </div>
              </div>
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
          <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 p-5 mb-6 overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-foreground">Luty 2026</div>
                  <div className="text-[10px] text-muted-foreground">168h / 160h</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center flex-1">
                  {['Pn','Wt','Śr','Cz','Pt','So','Nd'].map(d => (
                    <div key={d} className="text-[8px] text-muted-foreground font-medium">{d}</div>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => {
                    const isWork = [0,1,2,3,4,7,8,9,10,11,14,15,16,17,18,21,22,23,24,25].includes(i);
                    const isToday = i === 23;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-medium transition-all duration-300 ${
                          isToday
                            ? 'bg-violet-600 text-white shadow-sm scale-110'
                            : isWork
                              ? 'bg-violet-500/15 text-violet-400 group-hover:bg-violet-500/25'
                              : 'text-muted-foreground/30'
                        }`}
                        style={{ transitionDelay: `${i * 15}ms` }}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
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
          <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className="w-full aspect-[4/3] rounded-xl bg-muted/50 border border-border/40 p-5 mb-6 overflow-hidden">
              <div className="flex flex-col h-full justify-between">
                {/* Oszczędzanie */}
                <div className="flex items-center gap-3 transition-transform duration-500 group-hover:translate-x-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-amber-500/25">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-foreground/80">Oszczędzanie</span>
                      <span className="text-[9px] text-muted-foreground ml-2">12 dni</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500 transition-all duration-700 group-hover:brightness-125" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>
                {/* Budżet dzienny */}
                <div className="flex items-center gap-3 transition-transform duration-500 group-hover:translate-x-1" style={{ transitionDelay: '60ms' }}>
                  <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-violet-500/25">
                    <Target className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-foreground/80">Budżet dzienny</span>
                      <span className="text-[9px] text-muted-foreground ml-2">7 dni</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500 transition-all duration-700 group-hover:brightness-125" style={{ width: '70%', transitionDelay: '100ms' }} />
                    </div>
                  </div>
                </div>
                {/* Bez zbędnych wydatków */}
                <div className="flex items-center gap-3 transition-transform duration-500 group-hover:translate-x-1" style={{ transitionDelay: '120ms' }}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-emerald-500/25">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-foreground/80">Bez zbędnych wydatków</span>
                      <span className="text-[9px] text-muted-foreground ml-2">21 dni</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all duration-700 group-hover:brightness-125" style={{ width: '95%', transitionDelay: '200ms' }} />
                    </div>
                  </div>
                </div>
                {/* Weekly dots */}
                <div className="flex items-center justify-between mt-2 px-1">
                  {['Pn','Wt','Śr','Cz','Pt','So','Nd'].map((d, i) => (
                    <div key={d} className="flex flex-col items-center gap-1">
                      <div className="text-[7px] text-muted-foreground">{d}</div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all duration-300 ${
                        i < 5 ? 'bg-emerald-500 text-white group-hover:scale-110' : i === 5 ? 'bg-amber-400 text-white group-hover:scale-110' : 'bg-muted text-muted-foreground'
                      }`} style={{ transitionDelay: `${i * 40}ms` }}>
                        {i < 6 ? '✓' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
      </section>
      </div>
    </div>
  );
}
