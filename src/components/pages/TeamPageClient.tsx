'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Users, Mail, Loader2, Check, X, Unplug, Send, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { PartnerWeekView } from '@/components/PartnerWeekView';
import {
  getScheduleSharing,
  sendScheduleInvite,
  cancelScheduleInvite,
  respondToScheduleInviteById,
  removeSchedulePartner,
  type SchedulePartner,
  type SentInvite,
  type ReceivedInvite,
} from '@/app/schedule-share-actions';

interface Props {
  initialPartners: SchedulePartner[];
  initialSentInvites: SentInvite[];
  initialReceivedInvites: ReceivedInvite[];
  /** Partner do otwarcia od razu (np. po akceptacji zaproszenia z linku). */
  initialPartnerId?: string | null;
}

const inputClass =
  'w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

export function TeamPageClient({ initialPartners, initialSentInvites, initialReceivedInvites, initialPartnerId }: Props) {
  const { toast, confirm } = useToast();
  const [partners, setPartners] = useState(initialPartners);
  const [sentInvites, setSentInvites] = useState(initialSentInvites);
  const [receivedInvites, setReceivedInvites] = useState(initialReceivedInvites);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPartnerId && initialPartners.some(p => p.id === initialPartnerId)
      ? initialPartnerId
      : initialPartners[0]?.id ?? null,
  );
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setPartners(initialPartners);
    setSentInvites(initialSentInvites);
    setReceivedInvites(initialReceivedInvites);
  }, [initialPartners, initialSentInvites, initialReceivedInvites]);

  const refresh = useCallback(async () => {
    try {
      const data = await getScheduleSharing();
      setPartners(data.partners);
      setSentInvites(data.sentInvites);
      setReceivedInvites(data.receivedInvites);
      setSelectedId(prev => (prev && data.partners.some(p => p.id === prev) ? prev : data.partners[0]?.id ?? null));
    } catch (e) {
      console.error('Error refreshing schedule sharing:', e);
    }
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await sendScheduleInvite(email);
      toast('Zaproszenie wysłane — link trafił na podany adres', 'success');
      setEmail('');
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Nie udało się wysłać zaproszenia', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (inv: SentInvite) => {
    setBusyId(inv.id);
    try {
      await cancelScheduleInvite(inv.id);
      setSentInvites(prev => prev.filter(i => i.id !== inv.id));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Błąd', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleRespond = async (inv: ReceivedInvite, accept: boolean) => {
    setBusyId(inv.id);
    try {
      const res = await respondToScheduleInviteById(inv.id, accept);
      toast(accept ? `Połączono z ${inv.inviterName}` : 'Zaproszenie odrzucone', accept ? 'success' : 'info');
      await refresh();
      if (accept) setSelectedId(res.partnerId);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Błąd', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (p: SchedulePartner) => {
    const ok = await confirm({
      title: `Rozłączyć z ${p.name}?`,
      description: 'Oboje przestaniecie widzieć nawzajem swoje grafiki. Możesz później wysłać nowe zaproszenie.',
      confirmLabel: 'Rozłącz',
      variant: 'danger',
    });
    if (!ok) return;
    setBusyId(p.id);
    try {
      await removeSchedulePartner(p.id);
      setPartners(prev => prev.filter(x => x.id !== p.id));
      setSelectedId(prev => (prev === p.id ? null : prev));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Błąd', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const selected = partners.find(p => p.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Zaproś */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Zaproś do wspólnego grafiku</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Na podany adres wyślemy link. Zaproszenie może przyjąć tylko konto Szpont Hub założone na ten e-mail.
          </p>
          <form onSubmit={handleInvite} className="flex flex-col gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@znajomego.pl"
              className={inputClass}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="flex items-center justify-center gap-2 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Wyślij zaproszenie
            </button>
          </form>
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
            <span>Druga strona widzi tylko bloki zajętości (praca / prywatne) — bez tytułów, stawek i kwot.</span>
          </div>
        </div>

        {/* Zaproszenia */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Zaproszenia</h3>
          </div>

          {receivedInvites.length === 0 && sentInvites.length === 0 && (
            <p className="text-xs text-muted-foreground">Brak oczekujących zaproszeń.</p>
          )}

          {receivedInvites.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Otrzymane</div>
              {receivedInvites.map(inv => (
                <div key={inv.id} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{inv.inviterName}</div>
                    <div className="text-xs text-muted-foreground truncate">{inv.inviterEmail}</div>
                  </div>
                  <button
                    onClick={() => handleRespond(inv, true)}
                    disabled={busyId === inv.id}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 disabled:opacity-50"
                    title="Akceptuj"
                  >
                    {busyId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleRespond(inv, false)}
                    disabled={busyId === inv.id}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50"
                    title="Odrzuć"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {sentInvites.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Wysłane — czekają</div>
              {sentInvites.map(inv => (
                <div key={inv.id} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">{inv.email}</div>
                    <div className="text-xs text-muted-foreground">
                      wygasa {format(new Date(inv.expiresAt), 'd MMM', { locale: pl })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancel(inv)}
                    disabled={busyId === inv.id}
                    className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-50"
                  >
                    {busyId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Anuluj'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Połączeni */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Połączeni ({partners.length})</h3>
          </div>
          {partners.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nikogo jeszcze nie ma. Wyślij zaproszenie, a po akceptacji zobaczysz tutaj grafik tej osoby.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {partners.map(p => {
                const active = p.id === selectedId;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors cursor-pointer ${
                      active ? 'border-primary/50 bg-primary/5' : 'border-border bg-secondary/40 hover:bg-secondary/70'
                    }`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      {initials(p.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(p); }}
                      disabled={busyId === p.id}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      title="Rozłącz"
                    >
                      {busyId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unplug className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected ? (
        <PartnerWeekView partnerId={selected.id} partnerName={selected.name} />
      ) : (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
          Wybierz połączoną osobę, aby zobaczyć, kiedy pracuje, a kiedy jest wolna.
        </div>
      )}
    </div>
  );
}
