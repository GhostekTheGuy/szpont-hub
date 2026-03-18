'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  LayoutDashboard,
  Wallet,
  FileText,
  CalendarDays,
  Target,
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
} from 'lucide-react';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { setOnboardingDone } from '@/app/actions';

interface TutorialStep {
  target: string | null;
  route: string | null;
  icon: typeof Sparkles;
  color: string;
  title: string;
  description: string;
}

const steps: TutorialStep[] = [
  {
    target: null,
    route: null,
    icon: Sparkles,
    color: 'bg-violet-500/15 text-violet-400',
    title: 'Witaj w SzpontHub!',
    description:
      'Twoje centrum dowodzenia finansami. Przeprowadzimy Cię przez najważniejsze sekcje — krok po kroku pokażemy gdzie co znajdziesz.',
  },
  {
    target: 'dashboard',
    route: '/dashboard',
    icon: LayoutDashboard,
    color: 'bg-blue-500/15 text-blue-400',
    title: 'Dashboard',
    description:
      'Główny widok z podsumowaniem finansów. Wykresy wydatków, net worth, tygodniowe statystyki i szybki przegląd wszystkich portfeli.',
  },
  {
    target: 'wallets',
    route: '/wallets',
    icon: Wallet,
    color: 'bg-emerald-500/15 text-emerald-400',
    title: 'Portfele',
    description:
      'Twórz portfele gotówkowe, krypto i giełdowe. Dodawaj transakcje, śledź salda i analizuj przepływy pieniędzy między kontami.',
  },
  {
    target: 'invoices',
    route: '/invoices',
    icon: FileText,
    color: 'bg-orange-500/15 text-orange-400',
    title: 'Faktury',
    description:
      'Generuj i zarządzaj fakturami. Wystawiaj dokumenty, śledź statusy płatności i eksportuj faktury do PDF.',
  },
  {
    target: 'calendar',
    route: '/calendar',
    icon: CalendarDays,
    color: 'bg-amber-500/15 text-amber-400',
    title: 'Praca / Kalendarz',
    description:
      'Planuj eventy pracy, rozliczaj godziny i generuj faktury. Kalendarz automatycznie liczy Twoje zarobki na podstawie stawki godzinowej.',
  },
  {
    target: 'habits',
    route: '/habits',
    icon: Target,
    color: 'bg-cyan-500/15 text-cyan-400',
    title: 'Nawyki',
    description:
      'Buduj dobre nawyki i śledź streak. Zaznaczaj codzienne wykonanie, obserwuj postępy i utrzymuj motywację dzięki statystykom.',
  },
];

const PAD = 6;

function findVisibleElement(target: string): Element | null {
  const els = document.querySelectorAll(`[data-onboarding="${target}"]`);
  return (
    Array.from(els).find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }) || null
  );
}

export function OnboardingTutorial() {
  const router = useRouter();
  const pathname = usePathname();
  const showOnboarding = useFinanceStore((s) => s.showOnboarding);
  const setShowOnboarding = useFinanceStore((s) => s.setShowOnboarding);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [, setTick] = useState(0);
  const stepRef = useRef(0);
  const measureTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const measureCurrent = useCallback(() => {
    const t = steps[stepRef.current].target;
    if (!t) {
      setRect(null);
      return;
    }
    const el = findVisibleElement(t);
    setRect(el ? el.getBoundingClientRect() : null);
  }, []);

  // Retry measurement a few times (element may not be visible yet after navigation)
  const measureWithRetry = useCallback(() => {
    let attempts = 0;
    const tryMeasure = () => {
      measureCurrent();
      const t = steps[stepRef.current].target;
      if (t) {
        const el = findVisibleElement(t);
        if (!el && attempts < 10) {
          attempts++;
          measureTimerRef.current = setTimeout(tryMeasure, 100);
          return;
        }
      }
    };
    tryMeasure();
  }, [measureCurrent]);

  const navigateToStep = useCallback(
    (s: number) => {
      stepRef.current = s;
      setStep(s);

      const stepData = steps[s];
      if (stepData.route) {
        router.push(stepData.route);
        // Measure after navigation settles
        if (measureTimerRef.current) clearTimeout(measureTimerRef.current);
        measureTimerRef.current = setTimeout(measureWithRetry, 150);
      } else {
        setRect(null);
      }
    },
    [router, measureWithRetry],
  );

  const handleClose = useCallback(() => {
    if (measureTimerRef.current) clearTimeout(measureTimerRef.current);
    setShowOnboarding(false);
    setOnboardingDone(true).catch(console.error);
    stepRef.current = 0;
    setStep(0);
    setRect(null);
  }, [setShowOnboarding]);

  // Re-measure when pathname changes (navigation completed)
  useEffect(() => {
    if (!showOnboarding) return;
    const id = requestAnimationFrame(measureWithRetry);
    return () => cancelAnimationFrame(id);
  }, [showOnboarding, pathname, measureWithRetry]);

  // Resize handler
  useEffect(() => {
    if (!showOnboarding) return;
    const onResize = () => {
      measureCurrent();
      setTick((t) => t + 1);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [showOnboarding, measureCurrent]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (measureTimerRef.current) clearTimeout(measureTimerRef.current);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!showOnboarding) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      else if (e.key === 'ArrowRight') {
        if (step < steps.length - 1) navigateToStep(step + 1);
        else handleClose();
      } else if (e.key === 'ArrowLeft') {
        if (step > 0) navigateToStep(step - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showOnboarding, step, navigateToStep, handleClose]);

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;
  const isIntro = step === 0;
  const hasSpotlight = !isIntro && rect !== null;

  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 1024;

  // Tooltip positioning
  let tipStyle: React.CSSProperties = {};
  if (rect && !isIntro) {
    if (isMobile) {
      tipStyle = {
        position: 'fixed',
        left: 12,
        right: 12,
        bottom:
          (typeof window !== 'undefined' ? window.innerHeight : 800) -
          rect.top +
          PAD +
          8,
      };
    } else {
      tipStyle = {
        position: 'fixed',
        left: rect.right + PAD + 16,
        top: rect.top + rect.height / 2,
        transform: 'translateY(-50%)',
        maxWidth: '360px',
      };
    }
  }

  // Step dots
  const dots = (
    <div className="flex gap-1.5">
      {steps.map((_, i) => (
        <button
          key={i}
          onClick={() => navigateToStep(i)}
          className={`h-1.5 rounded-full transition-all ${
            i === step
              ? 'bg-primary w-4'
              : 'bg-muted-foreground/30 w-1.5 hover:bg-muted-foreground/50'
          }`}
        />
      ))}
    </div>
  );

  // Step content used in both spotlight tooltip and fallback card
  const stepContent = (
    <>
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${current.color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-card-foreground">
            {current.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {current.description}
          </p>
        </div>
      </div>

      {isMobile && hasSpotlight && (
        <div className="flex justify-center mt-3 -mb-1">
          <ChevronsDown className="w-4 h-4 text-primary/60 animate-bounce" />
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        {dots}
        <div className="flex items-center gap-1.5">
          {step > 0 && (
            <button
              onClick={() => navigateToStep(step - 1)}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={isLast ? handleClose : () => navigateToStep(step + 1)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            {isLast ? 'Zaczynamy!' : 'Dalej'}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {showOnboarding && (
        <motion.div
          key="onboarding"
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {isIntro ? (
            /* ── Welcome modal (step 0 only) ── */
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl relative"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center pt-2">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${current.color}`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-card-foreground mb-2">
                    {current.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {current.description}
                  </p>
                </div>

                <div className="flex justify-center mt-6 mb-5">{dots}</div>

                <button
                  onClick={() => navigateToStep(1)}
                  className="w-full flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Rozpocznij tour
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          ) : hasSpotlight ? (
            /* ── Spotlight mode ── */
            <>
              <div className="absolute inset-0" />

              <motion.div
                key={`spot-${step}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute rounded-lg pointer-events-none"
                style={{
                  top: rect!.top - PAD,
                  left: rect!.left - PAD,
                  width: rect!.width + PAD * 2,
                  height: rect!.height + PAD * 2,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
                  zIndex: 1,
                }}
              />

              <motion.div
                key={`pulse-${step}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{
                  opacity: [0, 0.8, 0.4],
                  scale: [0.92, 1, 1.04],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute rounded-lg pointer-events-none border-2 border-primary/40"
                style={{
                  top: rect!.top - PAD - 4,
                  left: rect!.left - PAD - 4,
                  width: rect!.width + PAD * 2 + 8,
                  height: rect!.height + PAD * 2 + 8,
                  zIndex: 1,
                }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{
                    opacity: 0,
                    y: isMobile ? 16 : 0,
                    x: isMobile ? 0 : 15,
                  }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card border border-border rounded-xl p-4 shadow-xl relative"
                  style={{ ...tipStyle, zIndex: 2 }}
                >
                  {stepContent}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            /* ── Fallback: centered card while waiting for element ── */
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                key={`fallback-${step}`}
                className="bg-card border border-border rounded-xl p-4 w-full max-w-sm shadow-xl relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {stepContent}
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
