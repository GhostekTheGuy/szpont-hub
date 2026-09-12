'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Users, Check, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { signOutAction } from '@/app/actions';
import {
  acceptScheduleInvite,
  declineScheduleInvite,
  type InviteLookup,
} from '@/app/schedule-share-actions';

interface Props {
  token: string;
  lookup: InviteLookup;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 mt-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Zaproszenie do wspólnego grafiku</h1>
          <p className="text-xs text-muted-foreground">Szpont Hub · Ekipa</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Notice({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <>
      <div className="flex items-start gap-2 text-sm text-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2.5">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
        <span>{text}</span>
      </div>
      {action ?? (
        <Link href="/calendar?view=team" className="text-sm text-primary hover:underline">
          Przejdź do zakładki Ekipa →
        </Link>
      )}
    </>
  );
}

export function InviteAcceptCard({ token, lookup }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState<'accept' | 'decline' | 'logout' | null>(null);

  const handleSwitchAccount = async () => {
    setBusy('logout');
    try {
      await signOutAction();
    } finally {
      // signOutAction może sam przekierować; jeśli nie — wróć na login z celem.
      router.push(`/login?next=${encodeURIComponent(`/calendar/invite/${token}`)}`);
    }
  };

  if (lookup.state === 'invalid') {
    return <Shell><Notice text="Ten link jest nieprawidłowy. Sprawdź, czy skopiowano go w całości z wiadomości e-mail." /></Shell>;
  }
  if (lookup.state === 'expired') {
    return <Shell><Notice text="To zaproszenie wygasło. Poproś nadawcę o wysłanie nowego." /></Shell>;
  }
  if (lookup.state === 'already_responded') {
    const map = { accepted: 'To zaproszenie zostało już zaakceptowane.', declined: 'To zaproszenie zostało odrzucone.', cancelled: 'Nadawca anulował to zaproszenie.' };
    return <Shell><Notice text={map[lookup.status]} /></Shell>;
  }
  if (lookup.state === 'self') {
    return <Shell><Notice text="To Twoje własne zaproszenie — link powinien kliknąć zaproszony." /></Shell>;
  }
  if (lookup.state === 'wrong_account') {
    return (
      <Shell>
        <Notice
          text={`To zaproszenie wysłano na adres ${lookup.maskedEmail}. Jesteś zalogowany na inne konto — przełącz się na konto z tym adresem.`}
          action={
            <button
              onClick={handleSwitchAccount}
              disabled={busy === 'logout'}
              className="flex items-center justify-center gap-2 h-9 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              {busy === 'logout' && <Loader2 className="w-4 h-4 animate-spin" />}
              Wyloguj i zaloguj na inne konto
            </button>
          }
        />
      </Shell>
    );
  }

  const handle = async (accept: boolean) => {
    setBusy(accept ? 'accept' : 'decline');
    try {
      const res = accept ? await acceptScheduleInvite(token) : await declineScheduleInvite(token);
      toast(accept ? `Połączono z ${lookup.inviterName}` : 'Zaproszenie odrzucone', accept ? 'success' : 'info');
      router.push(accept ? `/calendar?view=team&partner=${res.partnerId}` : '/calendar?view=team');
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Nie udało się przetworzyć zaproszenia', 'error');
      setBusy(null);
    }
  };

  return (
    <Shell>
      <p className="text-sm text-foreground">
        <strong>{lookup.inviterName}</strong>
        {lookup.inviterEmail && <span className="text-muted-foreground"> ({lookup.inviterEmail})</span>} chce połączyć z Tobą grafik.
      </p>

      <ul className="text-sm text-muted-foreground flex flex-col gap-1.5">
        <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" /> Oboje widzicie nawzajem tylko <strong className="text-foreground font-medium">bloki zajętości</strong> (praca / prywatne) — bez tytułów, stawek i kwot.</li>
        <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" /> Połączenie możesz zakończyć w każdej chwili w zakładce Ekipa.</li>
      </ul>

      {lookup.alreadyConnected && (
        <div className="text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2">
          Jesteście już połączeni — akceptacja tylko domknie to zaproszenie.
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => handle(true)}
          disabled={busy !== null}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {busy === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Akceptuj
        </button>
        <button
          onClick={() => handle(false)}
          disabled={busy !== null}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
        >
          {busy === 'decline' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          Odrzuć
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Zaproszenie ważne do {format(new Date(lookup.expiresAt), 'd MMMM yyyy, HH:mm', { locale: pl })}.
      </p>
    </Shell>
  );
}
