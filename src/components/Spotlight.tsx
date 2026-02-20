'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  PiggyBank,
  CalendarDays,
  Target,
  Settings,
  Search,
} from 'lucide-react';

const routes = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallets', label: 'Portfele', icon: Wallet },
  { href: '/assets', label: 'Aktywa', icon: PiggyBank },
  { href: '/calendar', label: 'Praca', icon: CalendarDays },
  { href: '/habits', label: 'Nawyki', icon: Target },
  { href: '/settings', label: 'Ustawienia', icon: Settings },
];

export function Spotlight() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = routes.filter((r) =>
    r.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      handleClose();
    },
    [router, handleClose]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleNavigate(filtered[selectedIndex].href);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-md -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Przejdź do..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>

            <div className="max-h-64 overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Brak wyników
                </p>
              ) : (
                filtered.map((route, i) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.href}
                      onClick={() => handleNavigate(route.href)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        i === selectedIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground/70'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {route.label}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
