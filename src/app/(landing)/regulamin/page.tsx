import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regulamin — $zpont Hub',
  description:
    'Regulamin serwisu $zpont Hub — warunki korzystania, płatności, polityka zwrotów i anulowania subskrypcji.',
};

export default function RegulaminPage() {
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
          <span className="text-sm text-muted-foreground">Regulamin</span>
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
            Regulamin
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Ostatnia aktualizacja: 24 lutego 2026
          </p>

          <div className="flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                1. Postanowienia ogólne
              </h2>
              <p>
                Niniejszy regulamin określa zasady korzystania z serwisu $zpont Hub
                dostępnego pod adresem szponthub.pl. Operatorem serwisu jest Hubert
                Kolejko, adres: ul.&nbsp;Stanisława Leszczyńskiego 25/403,
                20&#8209;400&nbsp;Lublin, e&#8209;mail:{' '}
                <a
                  href="mailto:kontakt@szponthub.pl"
                  className="text-violet-400 hover:underline"
                >
                  kontakt@szponthub.pl
                </a>
                . Rejestracja w serwisie oznacza akceptację niniejszego regulaminu.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                2. Definicje
              </h2>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                <li>
                  <strong className="text-foreground">Usługodawca</strong> — Hubert
                  Kolejko prowadzący serwis $zpont Hub.
                </li>
                <li>
                  <strong className="text-foreground">Użytkownik</strong> — osoba
                  fizyczna korzystająca z serwisu po dokonaniu rejestracji.
                </li>
                <li>
                  <strong className="text-foreground">Serwis</strong> — aplikacja
                  webowa $zpont Hub dostępna pod adresem szponthub.pl.
                </li>
                <li>
                  <strong className="text-foreground">Subskrypcja</strong> — płatny
                  dostęp do funkcji Planu Pro na okres miesięczny lub roczny.
                </li>
                <li>
                  <strong className="text-foreground">Plan Pro</strong> — rozszerzony
                  plan oferujący dodatkowe narzędzia AI i funkcje.
                </li>
                <li>
                  <strong className="text-foreground">Konto</strong> — indywidualne
                  konto Użytkownika w Serwisie, chronione adresem e&#8209;mail i
                  hasłem.
                </li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                3. Konto użytkownika
              </h2>
              <p>
                Użytkownik zobowiązany jest do podania prawdziwego adresu e&#8209;mail
                podczas rejestracji. Konto jest osobiste i nie może być udostępniane
                osobom trzecim. Użytkownik ponosi odpowiedzialność za zachowanie
                poufności danych logowania.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                4. Plan darmowy i Pro
              </h2>
              <p>
                Plan darmowy zapewnia pełen dostęp do podstawowych funkcji serwisu,
                w tym ręcznego zarządzania finansami. Plan Pro (19&nbsp;zł/mies. lub
                190&nbsp;zł/rok) oferuje dodatkowe narzędzia AI, automatyczne
                kategoryzowanie transakcji, inteligentne raporty i priorytetowe
                wsparcie. Subskrypcję można anulować w dowolnym momencie z poziomu
                ustawień konta.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                5. Warunki płatności
              </h2>
              <p>
                Wszystkie ceny podane w serwisie wyrażone są w złotych polskich (PLN)
                i są cenami brutto. Płatności realizowane są za pośrednictwem platformy
                Stripe, która obsługuje przelewy online Przelewy24 oraz karty płatnicze
                (Visa, Mastercard). Obciążenie następuje na początku każdego okresu
                rozliczeniowego (miesięcznego lub rocznego).
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                6. Automatyczne odnawianie
              </h2>
              <p>
                Subskrypcja odnawia się automatycznie na koniec każdego okresu
                rozliczeniowego. Użytkownik zostanie powiadomiony e&#8209;mailem
                o&nbsp;zbliżającym się odnowieniu. Aby uniknąć kolejnego obciążenia,
                należy anulować subskrypcję przed datą odnowienia w ustawieniach konta
                lub kontaktując się na adres{' '}
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
                7. Polityka zwrotów i anulowania
              </h2>
              <p>
                Zgodnie z ustawą z dnia 30 maja 2014 r. o prawach konsumenta,
                Użytkownik będący konsumentem ma prawo odstąpić od umowy w terminie
                14&nbsp;dni od dnia zawarcia umowy (rozpoczęcia subskrypcji) bez
                podania przyczyny. Aby skorzystać z prawa odstąpienia, należy
                poinformować Usługodawcę drogą mailową na adres{' '}
                <a
                  href="mailto:kontakt@szponthub.pl"
                  className="text-violet-400 hover:underline"
                >
                  kontakt@szponthub.pl
                </a>{' '}
                lub anulować subskrypcję w ustawieniach konta. Zwrot środków nastąpi
                w ciągu 14 dni roboczych na oryginalną metodę płatności.
              </p>
              <p className="mt-2">
                Po upływie 14&#8209;dniowego okresu odstąpienia, anulowanie subskrypcji
                skutkuje brakiem odnowienia na kolejny okres — dostęp do Planu Pro
                pozostaje aktywny do końca opłaconego okresu rozliczeniowego.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                8. Odpowiedzialność
              </h2>
              <p>
                $zpont Hub nie ponosi odpowiedzialności za decyzje finansowe podjęte na
                podstawie danych prezentowanych w aplikacji. Serwis ma charakter
                informacyjny i organizacyjny — nie stanowi doradztwa finansowego ani
                inwestycyjnego.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                9. Własność intelektualna
              </h2>
              <p>
                Wszelkie treści, grafiki, kod źródłowy oraz inne elementy serwisu
                stanowią własność intelektualną Usługodawcy i są chronione prawem
                autorskim. Kopiowanie, rozpowszechnianie lub wykorzystywanie
                materiałów bez zgody Usługodawcy jest zabronione.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                10. Usunięcie konta
              </h2>
              <p>
                Użytkownik może w każdej chwili usunąć konto z poziomu ustawień.
                Wszystkie dane osobowe zostaną trwale usunięte w ciągu 30 dni od
                złożenia żądania. Usunięcie konta w trakcie aktywnej subskrypcji nie
                uprawnia do zwrotu za niewykorzystany okres, chyba że Użytkownik
                skorzysta z prawa odstąpienia (pkt&nbsp;7).
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                11. Zmiany regulaminu
              </h2>
              <p>
                Usługodawca zastrzega sobie prawo do zmiany regulaminu. O istotnych
                zmianach Użytkownicy zostaną poinformowani drogą e&#8209;mailową
                z&nbsp;co najmniej 14&#8209;dniowym wyprzedzeniem. Kontynuowanie
                korzystania z serwisu po wejściu zmian w życie oznacza ich akceptację.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                12. Prawo właściwe
              </h2>
              <p>
                Niniejszy regulamin podlega prawu polskiemu. W sprawach
                nieuregulowanych zastosowanie mają przepisy Kodeksu cywilnego oraz
                ustawy o prawach konsumenta. Konsument może skorzystać z platformy ODR
                (Online Dispute Resolution) dostępnej pod adresem{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:underline"
                >
                  ec.europa.eu/consumers/odr
                </a>
                .
              </p>
            </section>

            {/* 13 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-2">
                13. Kontakt
              </h2>
              <p>
                W sprawach związanych z regulaminem i działaniem serwisu prosimy
                o&nbsp;kontakt:
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
