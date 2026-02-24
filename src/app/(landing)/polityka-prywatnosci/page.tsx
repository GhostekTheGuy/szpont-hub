import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka prywatności — $zpont Hub',
  description:
    'Polityka prywatności serwisu $zpont Hub — informacje o przetwarzaniu danych osobowych, RODO i plikach cookies.',
};

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground hover:text-violet-400 transition-colors"
          >
            $zpont Hub
          </Link>
          <span className="mx-3 text-border/60">/</span>
          <span className="text-sm text-muted-foreground">
            Polityka prywatności
          </span>
          <Link
            href="/"
            className="ml-auto text-xs text-muted-foreground hover:text-violet-400 transition-colors"
          >
            &larr; Powrót
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl p-8 sm:p-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Polityka prywatności
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Ostatnia aktualizacja: 24 lutego 2026
          </p>

          <div className="flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                1. Administrator danych
              </h2>
              <p>
                Administratorem danych osobowych jest Hubert Kolejko, prowadzący
                serwis $zpont Hub, adres: ul.&nbsp;Stanisława Leszczyńskiego 25/403,
                20&#8209;400&nbsp;Lublin, e&#8209;mail:{' '}
                <a
                  href="mailto:kontakt@szponthub.pl"
                  className="text-violet-400 hover:underline"
                >
                  kontakt@szponthub.pl
                </a>
                .
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                2. Jakie dane zbieramy
              </h2>
              <p>
                Zbieramy wyłącznie dane niezbędne do działania serwisu:
              </p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Adres e&#8209;mail — do rejestracji i komunikacji.</li>
                <li>
                  Zaszyfrowane dane finansowe — wprowadzone przez Użytkownika w celu
                  zarządzania budżetem. Dane są szyfrowane end&#8209;to&#8209;end;
                  Usługodawca nie ma do nich dostępu w formie jawnej.
                </li>
                <li>
                  Anonimowe dane analityczne — w celu poprawy jakości usługi (np.
                  liczba odwiedzin, typ urządzenia).
                </li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                3. Cel przetwarzania
              </h2>
              <p>Dane przetwarzane są w celu:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>świadczenia usług drogą elektroniczną (art.&nbsp;6 ust.&nbsp;1 lit.&nbsp;b RODO),</li>
                <li>obsługi konta użytkownika i subskrypcji,</li>
                <li>komunikacji związanej z serwisem,</li>
                <li>
                  wypełnienia obowiązków prawnych, w tym podatkowych (art.&nbsp;6
                  ust.&nbsp;1 lit.&nbsp;c RODO).
                </li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                4. Przetwarzanie danych płatniczych (Stripe)
              </h2>
              <p>
                Płatności w serwisie obsługiwane są przez Stripe Inc. (
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:underline"
                >
                  polityka prywatności Stripe
                </a>
                ). Dane kart płatniczych i rachunków bankowych są przetwarzane
                bezpośrednio przez Stripe i&nbsp;nie są przechowywane na serwerach
                $zpont Hub. Stripe posiada certyfikat PCI DSS Level&nbsp;1 —
                najwyższy poziom bezpieczeństwa w branży płatniczej.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                5. Okres przechowywania danych
              </h2>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                <li>
                  <strong className="text-foreground">Dane konta</strong> —
                  przechowywane do momentu usunięcia konta przez Użytkownika.
                </li>
                <li>
                  <strong className="text-foreground">Dane płatnicze</strong> —
                  przechowywane przez 5 lat od zakończenia subskrypcji, zgodnie z
                  wymogami prawa podatkowego.
                </li>
                <li>
                  <strong className="text-foreground">Dane analityczne</strong> —
                  przechowywane w formie zanonimizowanej przez maksymalnie
                  24&nbsp;miesiące.
                </li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                6. Prawa użytkownika (RODO)
              </h2>
              <p>Zgodnie z RODO, przysługują Ci następujące prawa:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>prawo dostępu do swoich danych,</li>
                <li>prawo do sprostowania danych,</li>
                <li>prawo do usunięcia danych (&bdquo;prawo do bycia zapomnianym&rdquo;),</li>
                <li>prawo do przenoszenia danych,</li>
                <li>prawo do sprzeciwu wobec przetwarzania,</li>
                <li>
                  prawo do wniesienia skargi do organu nadzorczego — Prezesa Urzędu
                  Ochrony Danych Osobowych (UODO),{' '}
                  <a
                    href="https://uodo.gov.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:underline"
                  >
                    uodo.gov.pl
                  </a>
                  .
                </li>
              </ul>
              <p className="mt-2">
                Realizacja praw możliwa jest z poziomu ustawień konta lub poprzez
                kontakt na adres{' '}
                <a
                  href="mailto:kontakt@szponthub.pl"
                  className="text-violet-400 hover:underline"
                >
                  kontakt@szponthub.pl
                </a>
                .
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                7. Pliki cookies
              </h2>
              <p>
                Serwis używa wyłącznie niezbędnych plików cookies technicznych,
                koniecznych do prawidłowego działania aplikacji (np. sesja
                uwierzytelniania). Nie stosujemy cookies śledzących, reklamowych ani
                cookies podmiotów trzecich.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                8. Polityka zwrotów
              </h2>
              <p>
                Użytkownik będący konsumentem ma prawo odstąpić od umowy w terminie
                14&nbsp;dni od dnia zawarcia umowy (rozpoczęcia subskrypcji) bez
                podania przyczyny, zgodnie z ustawą o prawach konsumenta. W celu
                skorzystania z prawa odstąpienia należy skontaktować się na adres{' '}
                <a
                  href="mailto:kontakt@szponthub.pl"
                  className="text-violet-400 hover:underline"
                >
                  kontakt@szponthub.pl
                </a>{' '}
                lub anulować subskrypcję w ustawieniach konta. Zwrot środków nastąpi
                na oryginalną metodę płatności w ciągu 14 dni roboczych.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                9. Zmiany w polityce prywatności
              </h2>
              <p>
                Usługodawca zastrzega sobie prawo do aktualizacji niniejszej polityki
                prywatności. O istotnych zmianach Użytkownicy zostaną poinformowani
                drogą e&#8209;mailową. Aktualna wersja polityki jest zawsze dostępna
                pod adresem{' '}
                <Link
                  href="/polityka-prywatnosci"
                  className="text-violet-400 hover:underline"
                >
                  szponthub.pl/polityka-prywatnosci
                </Link>
                .
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                10. Kontakt
              </h2>
              <p>
                W sprawach dotyczących ochrony danych osobowych prosimy o kontakt:
              </p>
              <ul className="list-none pl-0 mt-2 flex flex-col gap-1">
                <li>Hubert Kolejko</li>
                <li>ul. Stanisława Leszczyńskiego 25/403, 20&#8209;400 Lublin</li>
                <li>
                  E&#8209;mail:{' '}
                  <a
                    href="mailto:kontakt@szponthub.pl"
                    className="text-violet-400 hover:underline"
                  >
                    kontakt@szponthub.pl
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
