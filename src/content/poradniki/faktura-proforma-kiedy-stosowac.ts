import type { Article } from './types';

const article: Article = {
  slug: 'faktura-proforma-kiedy-stosowac',
  title: 'Faktura proforma — kiedy i jak stosować ją jako freelancer',
  description:
    'Czym jest faktura proforma, czym różni się od zwykłej faktury i kiedy warto ją wystawić. Praktyczne zastosowania, tabela porównawcza i typowe błędy.',
  category: 'freelancer',
  tags: ['faktura proforma', 'freelancer', 'faktury', 'zaliczka', 'rozliczenia'],
  tldr:
    'Faktura proforma to dokument informacyjny, który zapowiada płatność, ale nie jest dokumentem księgowym ani podstawą do zapłaty podatku. Wystawia się ją najczęściej przed otrzymaniem zaliczki lub jako ofertę do zapłaty dla nowego klienta. Po zaksięgowaniu wpłaty wystawiasz właściwą fakturę VAT lub fakturę. Proforma nie rodzi obowiązku podatkowego i nie zastępuje faktury końcowej.',
  keyTakeaways: [
    'Faktura proforma to dokument informacyjny, nie księgowy — nie rodzi obowiązku podatkowego.',
    'Stosuje się ją głównie przed zaliczką i jako podstawę do zapłaty dla nowego klienta.',
    'Po otrzymaniu płatności wystawiasz właściwą fakturę — proforma jej nie zastępuje.',
    'Proforma nie trafia do księgowości i nie księguje się jej jako przychodu.',
    'Musi być wyraźnie oznaczona jako proforma, żeby nie została pomylona z fakturą właściwą.',
    'Proforma nie ma sztywnego terminu ważności — warto samodzielnie wpisać datę, do której oferta obowiązuje.',
  ],
  published: '2026-07-09',
  readingMinutes: 12,
  bodyHtml: `
<p>Faktura proforma budzi u wielu freelancerów wątpliwości: czy to prawdziwa faktura, czy trzeba od niej płacić podatek, kiedy ją wystawić zamiast zwykłej. W praktyce to proste i przydatne narzędzie, o ile rozumiesz jego jedną kluczową cechę: proforma nie jest dokumentem księgowym. W tym poradniku wyjaśnimy, czym dokładnie jest, kiedy warto ją stosować i jak uniknąć typowych pomyłek.</p>

<h2>Czym jest faktura proforma</h2>
<p>Faktura proforma to dokument informacyjny, który wygląda jak faktura, ale nie pełni jej funkcji księgowej. Zawiera te same dane co zwykła faktura (strony, opis usługi, kwotę), lecz służy wyłącznie do zapowiedzenia płatności lub przedstawienia oferty do zapłaty. Nie jest podstawą do zaksięgowania przychodu ani do rozliczenia podatku. Można powiedzieć, że to zaproszenie do zapłaty, a nie sam dokument sprzedaży.</p>
<blockquote>Najważniejsza zasada: proforma nie rodzi obowiązku podatkowego. Podatek rozliczasz dopiero na podstawie faktury właściwej, wystawionej po otrzymaniu płatności.</blockquote>
<p>Dlatego proformy nie wpisujesz do ewidencji sprzedaży ani nie płacisz od niej podatku. Dopóki nie wystawisz faktury końcowej, dla urzędu skarbowego transakcja jeszcze się nie wydarzyła.</p>

<h2>Proforma a faktura właściwa — różnice</h2>
<p>Oba dokumenty łatwo pomylić, bo wyglądają podobnie. Różnica leży w funkcji i skutkach księgowych.</p>
<table>
<thead>
<tr><th>Cecha</th><th>Faktura proforma</th><th>Faktura właściwa</th></tr>
</thead>
<tbody>
<tr><td>Charakter</td><td>Informacyjny, zapowiedź płatności</td><td>Księgowy, dokument sprzedaży</td></tr>
<tr><td>Obowiązek podatkowy</td><td>Nie rodzi</td><td>Rodzi</td></tr>
<tr><td>Wpis do ewidencji</td><td>Nie</td><td>Tak</td></tr>
<tr><td>Podstawa do zapłaty</td><td>Tak, ale niewiążąca księgowo</td><td>Tak</td></tr>
<tr><td>Kiedy wystawiana</td><td>Przed płatnością</td><td>Po transakcji lub zaliczce</td></tr>
<tr><td>Oznaczenie</td><td>Wyraźnie proforma</td><td>Faktura / Faktura VAT</td></tr>
</tbody>
</table>
<p>Jeśli nie masz pewności, czym różni się faktura od rachunku, warto zacząć od poradnika <a href="/poradniki/faktura-a-rachunek-roznice">faktura a rachunek — różnice</a>.</p>

<h2>Kiedy warto wystawić fakturę proforma</h2>
<p>Proforma ma kilka praktycznych zastosowań, w których sprawdza się lepiej niż zwykła faktura:</p>
<ul>
<li><strong>Przed zaliczką.</strong> Chcesz otrzymać zaliczkę przed rozpoczęciem prac, ale nie chcesz jeszcze księgować przychodu. Wystawiasz proformę jako podstawę do wpłaty, a po jej otrzymaniu fakturę zaliczkową.</li>
<li><strong>Dla nowego klienta.</strong> Proforma działa jak formalna oferta do zapłaty — klient widzi dokładną kwotę i dane do przelewu, a Ty nie generujesz obowiązku podatkowego, zanim pieniądze wpłyną.</li>
<li><strong>Gdy klient potrzebuje dokumentu do akceptacji wewnętrznej.</strong> W większych firmach dział zakupów często wymaga dokumentu do uruchomienia płatności — proforma spełnia tę rolę.</li>
<li><strong>Przy płatności z góry.</strong> Gdy warunki współpracy zakładają zapłatę przed wykonaniem usługi, proforma jest naturalnym dokumentem otwierającym rozliczenie.</li>
</ul>
<p>Wspólny mianownik: proformę stosujesz wtedy, gdy chcesz zainicjować płatność, ale jeszcze nie chcesz lub nie możesz wystawić dokumentu księgowego.</p>

<h3>Proforma a ochrona przed niepłacącym klientem</h3>
<p>Proforma bywa też elementem bezpiecznej współpracy z nowym klientem. Wysyłasz proformę na zaliczkę, a prace zaczynasz dopiero po zaksięgowaniu wpłaty. Dzięki temu nie księgujesz przychodu, którego jeszcze nie masz, a jednocześnie testujesz wiarygodność klienta. Więcej takich zabezpieczeń opisujemy w poradniku <a href="/poradniki/jak-zabezpieczyc-sie-przed-nieplacacym-klientem">jak zabezpieczyć się przed niepłacącym klientem</a>.</p>

<h2>Jak wystawić fakturę proforma</h2>
<p>Proforma zawiera praktycznie te same elementy co faktura właściwa, z jedną kluczową różnicą — musi być wyraźnie oznaczona.</p>
<ol>
<li><strong>Oznaczenie proforma.</strong> Widoczny napis, że to faktura proforma, żeby nikt nie pomylił jej z dokumentem księgowym.</li>
<li><strong>Dane stron.</strong> Sprzedawca i nabywca z danymi identyfikacyjnymi.</li>
<li><strong>Opis usługi lub towaru.</strong> Konkretnie to, za co klient ma zapłacić.</li>
<li><strong>Kwota i sposób płatności.</strong> Wartość, ewentualny VAT, numer konta i termin.</li>
<li><strong>Data wystawienia.</strong> I opcjonalnie termin ważności oferty.</li>
</ol>
<p>Po otrzymaniu wpłaty wystawiasz właściwą fakturę — to ona trafia do księgowości i na jej podstawie rozliczasz podatek. Proforma zostaje jedynie jako dokument pomocniczy.</p>

<h2>Proforma a oferta i umowa — co je odróżnia</h2>
<p>Freelancerzy często używają zamiennie słów oferta, proforma i umowa, choć każdy z tych dokumentów pełni inną rolę w procesie sprzedaży. Zrozumienie różnic pomaga wybrać właściwe narzędzie na danym etapie rozmowy z klientem.</p>
<table>
<thead>
<tr><th>Dokument</th><th>Rola</th><th>Kiedy w procesie</th></tr>
</thead>
<tbody>
<tr><td>Oferta</td><td>Przedstawia zakres i cenę, zaprasza do współpracy</td><td>Na początku, przed ustaleniami</td></tr>
<tr><td>Umowa</td><td>Wiąże strony prawnie, opisuje obowiązki i terminy</td><td>Po uzgodnieniu warunków</td></tr>
<tr><td>Faktura proforma</td><td>Wskazuje kwotę i dane do zapłaty, inicjuje przelew</td><td>Tuż przed płatnością lub zaliczką</td></tr>
<tr><td>Faktura właściwa</td><td>Dokumentuje sprzedaż i rozlicza podatek</td><td>Po wpłacie lub wykonaniu usługi</td></tr>
</tbody>
</table>
<p>W praktyce te dokumenty często następują po sobie: oferta rozpoczyna rozmowę, umowa porządkuje zobowiązania, proforma uruchamia płatność, a faktura właściwa zamyka rozliczenie. Przy drobnych zleceniach cały ten łańcuch skraca się do dwóch kroków — proforma i faktura końcowa — ale przy większych projektach warto rozdzielić role, bo proforma sama w sobie nie zabezpiecza Cię prawnie tak jak umowa.</p>

<h2>Jak sformułować treść proformy, żeby klient szybko zapłacił</h2>
<p>Dobrze napisana proforma skraca czas do przelewu, bo nie zostawia klientowi wątpliwości. Kilka konkretów robi tu różnicę.</p>
<ul>
<li><strong>Jasny opis usługi.</strong> Zamiast usługi zgodnie z ustaleniami wpisz konkret, na przykład projekt logo wraz z dwiema turami poprawek. Klient nie musi wtedy dopytywać, za co płaci.</li>
<li><strong>Widoczna kwota brutto.</strong> Podaj sumę, którą klient ma realnie przelać, wyróżnioną tak, by nie trzeba jej było liczyć.</li>
<li><strong>Pełne dane do przelewu.</strong> Numer konta, tytuł przelewu i termin płatności w jednym miejscu przyspieszają wykonanie przelewu.</li>
<li><strong>Termin ważności oferty.</strong> Data, do której cena obowiązuje, delikatnie motywuje do szybszej decyzji.</li>
<li><strong>Wyraźne oznaczenie proforma.</strong> Chroni obie strony przed pomyleniem dokumentu z fakturą księgową.</li>
</ul>
<p>Przykład tytułu przelewu, który ułatwia Ci później powiązanie wpłaty: proforma nr 5 z lipca, projekt logo. Gdy pieniądze wpłyną z takim tytułem, od razu wiesz, której proformy dotyczą i dla której trzeba wystawić fakturę końcową. To drobiazg, który przy kilkunastu klientach oszczędza sporo czasu przy rozliczeniu.</p>

<h2>Cały cykl rozliczenia z zaliczką — na liczbach</h2>
<p>Najlepiej zrozumieć rolę proformy, śledząc pełny cykl jednej współpracy. Załóżmy zlecenie na projekt strony za <strong>4000 zł</strong>, w którym umawiasz się na 50 procent zaliczki z góry. Oto kolejność dokumentów i przepływ pieniędzy.</p>
<table>
<thead>
<tr><th>Etap</th><th>Dokument</th><th>Kwota</th><th>Skutek podatkowy</th></tr>
</thead>
<tbody>
<tr><td>1. Zamówienie</td><td>Faktura proforma</td><td>2000 zł (zaliczka)</td><td>Brak — tylko zapowiedź płatności</td></tr>
<tr><td>2. Wpływ zaliczki</td><td>Faktura zaliczkowa</td><td>2000 zł</td><td>Powstaje obowiązek od 2000 zł</td></tr>
<tr><td>3. Zakończenie prac</td><td>Faktura końcowa</td><td>2000 zł (dopłata)</td><td>Rozlicza pozostałą część</td></tr>
</tbody>
</table>
<p>Zwróć uwagę na sekwencję. Proforma na 2000 zł otwiera współpracę i mówi klientowi, ile i gdzie wpłacić — ale dopóki pieniądze nie wpłyną, nic nie księgujesz. Dopiero wpływ zaliczki uruchamia fakturę zaliczkową i obowiązek podatkowy od tej kwoty. Po oddaniu projektu wystawiasz fakturę końcową na pozostałe 2000 zł. Gdyby zaliczka pokrywała całość zlecenia, faktura zaliczkowa rozliczyłaby całą kwotę i faktura końcowa nie byłaby potrzebna. Proforma pojawia się tylko na starcie i nigdy nie zastępuje dwóch kolejnych dokumentów.</p>

<h2>Proforma w różnych scenariuszach współpracy</h2>
<p>W praktyce freelancera proforma pełni różne role zależnie od układu współpracy. Poniżej najczęstsze warianty i to, co proforma w każdym z nich załatwia.</p>
<ul>
<li><strong>Pełna płatność z góry.</strong> Przy drobnych, jednorazowych zleceniach wystawiasz proformę na całą kwotę, a po wpłacie od razu fakturę końcową. Prosto i bezpiecznie przy nowych klientach.</li>
<li><strong>Zaliczka i dopłata.</strong> Przy większych projektach dzielisz płatność: proforma na zaliczkę, potem faktura zaliczkowa, a na końcu faktura końcowa na resztę. Rozkłada ryzyko na obie strony.</li>
<li><strong>Współpraca z dużą firmą.</strong> Dział zakupów często potrzebuje dokumentu, by w ogóle uruchomić przelew. Proforma pełni tu rolę formalnej podstawy płatności bez przedwczesnego księgowania.</li>
<li><strong>Rozliczenie zagraniczne.</strong> Proforma bywa używana w obrocie międzynarodowym jako dokument wskazujący wartość i warunki, na podstawie którego kontrahent inicjuje płatność.</li>
</ul>
<p>W każdym z tych przypadków logika jest ta sama: proforma inicjuje pieniądze, a dokument księgowy podąża za nimi dopiero wtedy, gdy realnie wpłyną albo usługa zostanie wykonana.</p>

<h2>Czego proforma nie robi</h2>
<p>Równie ważne jak zastosowania jest to, czego od proformy oczekiwać nie należy. Kilka rozpowszechnionych przekonań prowadzi do błędów w rozliczeniach.</p>
<ol>
<li><strong>Nie jest dowodem sprzedaży.</strong> Sama proforma nie potwierdza, że transakcja doszła do skutku — to robi dopiero faktura właściwa.</li>
<li><strong>Nie zabezpiecza prawnie zapłaty.</strong> Proforma to nie umowa ani wezwanie do zapłaty; realnym zabezpieczeniem jest umowa i warunek rozpoczęcia prac po wpływie zaliczki.</li>
<li><strong>Nie odracza obowiązku podatkowego w nieskończoność.</strong> Gdy pieniądze wpłyną, obowiązek powstaje niezależnie od tego, czy wystawiłeś już fakturę właściwą — dlatego po wpłacie nie zwlekaj z dokumentem księgowym.</li>
<li><strong>Nie musi mieć kolejnego numeru z serii faktur.</strong> Proformy zwykle numeruje się osobno, żeby nie mieszać ich z dokumentami księgowymi.</li>
</ol>

<h2>Jak SzpontHub pomaga w obiegu faktur</h2>
<p>Przy pracy z proformami najłatwiej pogubić się w tym, która płatność została już zaksięgowana właściwą fakturą, a która wciąż czeka. W SzpontHub wystawisz dokumenty dzięki integracji z Kugaru, a wpływy przypiszesz do portfela, żeby na bieżąco widzieć, za które proformy klienci już zapłacili i dla których trzeba wystawić fakturę końcową. Terminy płatności wpiszesz do kalendarza, a dzięki temu, że transakcje i faktury masz w jednym miejscu, łatwiej dopilnujesz, by żadna zaliczka nie została bez właściwego rozliczenia.</p>

<h2>Najczęstsze błędy przy fakturze proforma</h2>
<ul>
<li><strong>Traktowanie proformy jak faktury końcowej.</strong> Proforma nie zastępuje faktury właściwej — po płatności trzeba wystawić dokument księgowy.</li>
<li><strong>Księgowanie proformy jako przychodu.</strong> Proforma nie trafia do ewidencji i nie jest podstawą podatku.</li>
<li><strong>Brak wyraźnego oznaczenia.</strong> Bez napisu proforma dokument może zostać pomylony z fakturą i błędnie zaksięgowany.</li>
<li><strong>Zapominanie o fakturze końcowej.</strong> Po otrzymaniu wpłaty łatwo przeoczyć wystawienie właściwej faktury, zwłaszcza przy wielu klientach.</li>
</ul>

<h2>Podsumowanie</h2>
<p>Faktura proforma to wygodne narzędzie do inicjowania płatności — zwłaszcza zaliczek i rozliczeń z nowymi klientami — które nie rodzi obowiązku podatkowego i nie trafia do księgowości. Pamiętaj o jej jednej kluczowej cesze: to dokument informacyjny, a nie księgowy. Po otrzymaniu wpłaty zawsze wystawiasz właściwą fakturę, bo to ona rozlicza podatek. Stosowana rozsądnie, proforma porządkuje współpracę i chroni Cię przed księgowaniem przychodu, którego jeszcze nie masz.</p>
`,
  faq: [
    {
      q: 'Czy od faktury proforma trzeba zapłacić podatek?',
      a: 'Nie. Faktura proforma to dokument informacyjny, który nie rodzi obowiązku podatkowego i nie trafia do ewidencji. Podatek rozliczasz dopiero na podstawie faktury właściwej, wystawionej po otrzymaniu płatności. Do tego momentu transakcja księgowo się nie wydarzyła.',
    },
    {
      q: 'Kiedy wystawić fakturę proforma?',
      a: 'Najczęściej przed otrzymaniem zaliczki, jako podstawę do zapłaty dla nowego klienta lub gdy firma klienta potrzebuje dokumentu do uruchomienia płatności. Proformę stosujesz wtedy, gdy chcesz zainicjować płatność, ale jeszcze nie chcesz lub nie możesz wystawić dokumentu księgowego.',
    },
    {
      q: 'Czy faktura proforma zastępuje zwykłą fakturę?',
      a: 'Nie. Proforma jedynie zapowiada płatność i nie jest dokumentem sprzedaży. Po otrzymaniu wpłaty musisz wystawić właściwą fakturę, bo to ona trafia do księgowości i stanowi podstawę rozliczenia podatku. Proforma zostaje dokumentem pomocniczym.',
    },
    {
      q: 'Czym różni się faktura proforma od faktury właściwej?',
      a: 'Proforma ma charakter informacyjny, nie rodzi obowiązku podatkowego i nie trafia do ewidencji, a wystawia się ją przed płatnością. Faktura właściwa jest dokumentem księgowym, rodzi obowiązek podatkowy i powstaje po transakcji lub zaliczce. Proforma musi być wyraźnie oznaczona, by ich nie pomylić.',
    },
    {
      q: 'Czy fakturę proforma trzeba księgować?',
      a: 'Nie. Proformy nie wpisuje się do ewidencji sprzedaży ani nie księguje jako przychodu. Do księgowości trafia dopiero właściwa faktura wystawiona po otrzymaniu płatności. Traktowanie proformy jak dokumentu księgowego to jeden z najczęstszych błędów.',
    },
    {
      q: 'Co musi zawierać faktura proforma?',
      a: 'Wyraźne oznaczenie proforma, dane sprzedawcy i nabywcy, opis usługi lub towaru, kwotę wraz z ewentualnym VAT, numer konta i termin płatności oraz datę wystawienia. Kluczowe jest oznaczenie, które odróżnia ją od faktury właściwej i zapobiega błędnemu zaksięgowaniu.',
    },
    {
      q: 'Jak długo jest ważna faktura proforma?',
      a: 'Przepisy nie narzucają proformie sztywnego terminu ważności, bo nie jest ona dokumentem księgowym. W praktyce warto samodzielnie wpisać datę, do której oferta i podana cena obowiązują, na przykład 7 lub 14 dni. Po tym terminie, jeśli klient nie zapłacił, po prostu wystawiasz nową proformę z aktualnymi warunkami.',
    },
  ],
};

export default article;
