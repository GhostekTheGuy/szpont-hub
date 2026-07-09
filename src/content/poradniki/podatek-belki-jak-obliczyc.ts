import type { Article } from './types';

const article: Article = {
  slug: 'podatek-belki-jak-obliczyc',
  title: 'Podatek Belki — jak obliczyć i kiedy go zapłacić',
  description:
    'Podatek Belki krok po kroku: ile wynosi, od czego się go płaci, jak obliczyć 19% od zysków z lokat, giełdy i krypto oraz kiedy i jak go rozliczyć. Przykłady i tabela.',
  category: 'inwestycje',
  tags: ['podatek Belki', 'podatek od zysków kapitałowych', 'inwestycje', 'giełda', 'lokaty'],
  tldr:
    'Podatek Belki to 19% podatek od zysków kapitałowych: odsetek z lokat i kont oszczędnościowych, zysków z giełdy, funduszy, obligacji, dywidend oraz zysków z kryptowalut. Od lokat i kont bank pobiera go automatycznie, więc dostajesz kwotę netto. Od zysków z giełdy, funduszy i krypto rozliczasz się samodzielnie w rocznym zeznaniu (PIT-38) i płacisz podatek do 30 kwietnia następnego roku. Podstawą jest dochód, czyli przychód pomniejszony o koszty, a przy inwestycjach możesz odliczyć stratę z lat poprzednich.',
  keyTakeaways: [
    'Podatek Belki wynosi 19% i dotyczy zysków kapitałowych, nie zainwestowanego kapitału.',
    'Od lokat i kont oszczędnościowych bank pobiera podatek automatycznie.',
    'Zyski z giełdy, funduszy i krypto rozliczasz sam w PIT-38 do 30 kwietnia.',
    'Podstawą jest dochód: przychód minus koszty nabycia i prowizje.',
    'Stratę z inwestycji możesz rozliczyć z zyskami w kolejnych latach.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Podatek Belki to potoczna nazwa podatku od zysków kapitałowych, z którym prędzej czy później spotyka się każdy oszczędzający i inwestor. Dla części produktów rozlicza go za Ciebie bank, a dla innych musisz zrobić to sam w rocznym zeznaniu. Niewiedza w tym drugim przypadku bywa kosztowna, bo obowiązek istnieje niezależnie od tego, czy o nim pamiętasz. W tym poradniku wyjaśnimy, ile wynosi podatek Belki, od czego się go płaci, jak obliczyć go krok po kroku i kiedy trzeba go rozliczyć.</p>
<p>To materiał informacyjny, a nie porada podatkowa ani inwestycyjna. Szczegóły rozliczenia zależą od Twojej sytuacji i rodzaju inwestycji, dlatego przy większych kwotach lub nietypowych przypadkach warto potwierdzić rozliczenie z księgowym lub doradcą podatkowym.</p>

<h2>Ile wynosi podatek Belki i od czego się go płaci</h2>
<p>Podatek Belki to 19% od osiągniętego zysku kapitałowego. Kluczowe słowo to zysk — podatek płacisz od tego, co zarobiłeś, a nie od całej zainwestowanej kwoty. Jeśli włożyłeś 10 000 zł, a wypłacasz 11 000 zł, podatek liczysz od 1000 zł zysku, nie od 11 000 zł.</p>
<p>Podatek obejmuje szeroki zakres dochodów z kapitału:</p>
<ul>
<li><strong>Odsetki z lokat i kont oszczędnościowych</strong> — bank pobiera podatek automatycznie.</li>
<li><strong>Zyski ze sprzedaży akcji, ETF i funduszy</strong> — rozliczasz samodzielnie w PIT-38.</li>
<li><strong>Dywidendy i odsetki z obligacji</strong> — często pobierane u źródła, ale bywają wyjątki.</li>
<li><strong>Zyski z kryptowalut</strong> — rozliczasz samodzielnie, według odrębnych zasad.</li>
</ul>

<blockquote>Podstawowa zasada: podatek Belki to 19% od dochodu, czyli od zysku po odjęciu kosztów, a nie od zainwestowanego kapitału.</blockquote>

<h3>Kto rozlicza podatek — bank czy Ty</h3>
<p>Zanim policzysz cokolwiek, ustal, kto odpowiada za pobór podatku od danego produktu. Od tego zależy, czy w ogóle musisz cokolwiek robić przed 30 kwietnia. Poniższa tabela porządkuje najczęstsze źródła zysków i sposób ich rozliczenia.</p>

<table>
<thead>
<tr><th>Źródło zysku</th><th>Kto pobiera podatek</th><th>Formularz</th></tr>
</thead>
<tbody>
<tr><td>Lokata bankowa</td><td>Bank, automatycznie</td><td>Brak — dostajesz netto</td></tr>
<tr><td>Konto oszczędnościowe</td><td>Bank, automatycznie</td><td>Brak — dostajesz netto</td></tr>
<tr><td>Akcje i ETF</td><td>Ty samodzielnie</td><td>PIT-38 (na podstawie PIT-8C)</td></tr>
<tr><td>Fundusze inwestycyjne (TFI)</td><td>Zwykle fundusz przy umorzeniu</td><td>Często brak lub PIT-38</td></tr>
<tr><td>Dywidendy z akcji polskich</td><td>Płatnik u źródła</td><td>Brak — dostajesz netto</td></tr>
<tr><td>Dywidendy zagraniczne</td><td>Ty dopłacasz różnicę</td><td>PIT-38</td></tr>
<tr><td>Kryptowaluty</td><td>Ty samodzielnie</td><td>PIT-38</td></tr>
</tbody>
</table>

<p>Praktyczny wniosek: jeśli trzymasz tylko lokaty i polskie akcje dywidendowe, prawdopodobnie nie masz nic do zrobienia. Obowiązek samodzielnego rozliczenia pojawia się głównie przy sprzedaży akcji, ETF, dywidendach zagranicznych i kryptowalutach.</p>

<h2>Jak obliczyć podatek Belki od lokaty</h2>
<p>Przy lokacie i koncie oszczędnościowym nie musisz robić nic — bank wylicza i pobiera podatek przy naliczeniu odsetek, a Ty dostajesz kwotę netto. Wystarczy jednak umieć sprawdzić, ile realnie zostaje, bo reklamowe oprocentowanie jest zawsze przed podatkiem.</p>

<table>
<thead>
<tr><th>Pozycja</th><th>Wartość</th></tr>
</thead>
<tbody>
<tr><td>Kwota lokaty</td><td>10 000 zł</td></tr>
<tr><td>Oprocentowanie roczne</td><td>5%</td></tr>
<tr><td>Odsetki brutto</td><td>500 zł</td></tr>
<tr><td>Podatek Belki 19%</td><td>95 zł</td></tr>
<tr><td>Odsetki netto (na rękę)</td><td>405 zł</td></tr>
</tbody>
</table>

<p>Dlatego porównując lokaty, patrz na realny zysk po podatku. Lokata na 5% daje faktycznie około 4,05% w kieszeni. To ta sama różnica, którą trzeba uwzględnić, oceniając, czy oprocentowanie chroni oszczędności przed inflacją.</p>
<p>Prosty wzór, którym policzysz zysk netto z dowolnej lokaty: odsetki netto = kapitał × oprocentowanie × 0,81. Współczynnik 0,81 to po prostu 100% minus 19% podatku. Dla 20 000 zł na 6% roczne otrzymasz 20 000 × 0,06 × 0,81 = 972 zł na rękę zamiast 1200 zł brutto. Różnica 228 zł to właśnie podatek Belki, który bank odprowadził za Ciebie.</p>
<p>Uwaga na lokaty krótsze niż rok: oprocentowanie w reklamie jest zawsze w skali roku. Lokata trzymiesięczna na 6% daje odsetki za trzy miesiące, czyli około jednej czwartej tej kwoty, a podatek liczony jest od faktycznie naliczonych odsetek. Przy 10 000 zł na 6% na 3 miesiące odsetki brutto to około 150 zł, podatek około 28 zł, a na rękę zostaje około 122 zł.</p>

<h2>Jak obliczyć podatek od zysków z giełdy</h2>
<p>Przy akcjach, ETF i funduszach podstawą jest dochód, czyli przychód ze sprzedaży pomniejszony o koszty nabycia i prowizje. Liczysz go w skali całego roku, sumując wszystkie transakcje — zyskowne i stratne.</p>
<p>Przykład: kupiłeś akcje za 8000 zł plus 40 zł prowizji, sprzedałeś za 11 000 zł minus 50 zł prowizji. Koszt to 8040 zł, przychód netto 10 950 zł, więc dochód wynosi 2910 zł. Podatek Belki to 19% z 2910 zł, czyli około 553 zł. Broker prowadzący rachunek zwykle przysyła Ci informację PIT-8C z podsumowaniem, którą przepisujesz do zeznania PIT-38.</p>

<h3>Rozliczanie straty</h3>
<p>Inwestycje bywają stratne i tu podatek Belki działa na Twoją korzyść. Stratę z danego roku możesz rozliczyć z zyskami w kolejnych latach, obniżając przyszły podatek. Jeśli w jednym roku stracisz 3000 zł, a w następnym zarobisz 5000 zł, możesz pomniejszyć podstawę o wcześniejszą stratę, płacąc podatek od niższej kwoty. Zasady i limity odliczania straty warto sprawdzić dla swojej sytuacji.</p>

<h2>Przykład krok po kroku — pełne rozliczenie roku na giełdzie</h2>
<p>Załóżmy realny rok inwestora, który zawarł kilka transakcji: część zyskownych, część stratnych, plus dywidendę. Zobacz, jak z pojedynczych operacji powstaje jedna kwota podatku.</p>

<table>
<thead>
<tr><th>Transakcja</th><th>Przychód</th><th>Koszt (z prowizją)</th><th>Wynik</th></tr>
</thead>
<tbody>
<tr><td>Sprzedaż akcji A</td><td>12 000 zł</td><td>9 500 zł</td><td>+2 500 zł</td></tr>
<tr><td>Sprzedaż akcji B</td><td>4 000 zł</td><td>6 200 zł</td><td>−2 200 zł</td></tr>
<tr><td>Sprzedaż ETF</td><td>18 000 zł</td><td>15 000 zł</td><td>+3 000 zł</td></tr>
<tr><td>Razem dochód</td><td>—</td><td>—</td><td>+3 300 zł</td></tr>
</tbody>
</table>

<p>Sumujesz wszystkie wyniki: 2500 − 2200 + 3000 = 3300 zł dochodu za rok. Podatek Belki to 19% z 3300 zł, czyli 627 zł. Gdyby inwestor miał z poprzedniego roku 1800 zł nierozliczonej straty, mógłby obniżyć podstawę do 1500 zł, a podatek spadłby do 285 zł. To pokazuje, dlaczego warto pamiętać o stratach z lat ubiegłych — realnie zmniejszają rachunek.</p>
<p>Krok po kroku wygląda to tak:</p>
<ol>
<li><strong>Zsumuj przychody</strong> ze wszystkich sprzedaży w danym roku.</li>
<li><strong>Zsumuj koszty</strong> nabycia wraz z prowizjami kupna i sprzedaży.</li>
<li><strong>Odejmij koszty od przychodów</strong>, aby uzyskać dochód lub stratę roku.</li>
<li><strong>Odejmij stratę z lat poprzednich</strong>, jeśli ją masz i chcesz rozliczyć.</li>
<li><strong>Pomnóż podstawę przez 19%</strong> — to Twój podatek do zapłaty.</li>
</ol>

<h2>Podatek Belki od kryptowalut</h2>
<p>Zyski z kryptowalut również obejmuje stawka 19%, ale rozlicza się je według odrębnych reguł niż akcje. Opodatkowany jest dochód, czyli różnica między przychodem z odpłatnego zbycia krypto a kosztami jego nabycia. Co istotne, sama zamiana jednej kryptowaluty na drugą zwykle nie jest traktowana jak przychód — kluczowy jest moment wyjścia do waluty tradycyjnej lub zapłaty krypto za towar czy usługę. To obszar o wielu szczegółach, dlatego omawia go osobno poradnik <a href="/poradniki/jak-rozliczyc-podatek-od-krypto">jak rozliczyć podatek od krypto</a>.</p>

<h2>Konto IKE i IKZE — jak legalnie nie płacić podatku Belki</h2>
<p>Jest legalny sposób, by w ogóle uniknąć podatku od zysków z giełdy: inwestowanie przez konto emerytalne IKE lub IKZE. Zyski wypracowane na takim rachunku nie są objęte 19% podatkiem Belki, o ile dotrzymasz warunków wypłaty związanych z wiekiem emerytalnym.</p>
<ul>
<li><strong>IKE</strong> — przy wypłacie po osiągnięciu wymaganego wieku nie płacisz podatku Belki od wypracowanych zysków.</li>
<li><strong>IKZE</strong> — dodatkowo obniżasz bieżący PIT o wpłaty, ale przy wypłacie obowiązuje zryczałtowany podatek według odrębnych zasad.</li>
<li><strong>Limity roczne</strong> — obie formy mają ustawowe limity wpłat, które co roku się zmieniają, dlatego sprawdź aktualne wartości przed wpłatą.</li>
</ul>
<p>Dla inwestora długoterminowego różnica jest odczuwalna: 19% zysku, które co roku zostaje w portfelu zamiast trafiać do urzędu, przez kilkanaście lat i przy procencie składanym urasta do znaczącej kwoty. To najprostsza legalna optymalizacja podatku Belki dostępna dla osoby prywatnej.</p>

<h2>Kiedy i jak zapłacić podatek Belki</h2>
<p>Termin zależy od źródła zysku. Dla lokat i kont sprawa jest zamknięta w momencie wypłaty odsetek. Dla inwestycji, które rozliczasz sam, obowiązuje roczny cykl.</p>
<ol>
<li><strong>Zbierz dokumenty</strong> — informacje PIT-8C od brokerów oraz własne zestawienia transakcji, w tym z rynku krypto.</li>
<li><strong>Wypełnij PIT-38</strong> — wykazujesz przychody, koszty i dochód lub stratę za dany rok.</li>
<li><strong>Rozlicz stratę</strong> — jeśli masz stratę z lat poprzednich, uwzględnij ją w podstawie.</li>
<li><strong>Zapłać podatek do 30 kwietnia</strong> — to termin złożenia zeznania i zapłaty podatku za poprzedni rok.</li>
</ol>
<p>Najczęstszy błąd to założenie, że skoro pieniądze zostały na rachunku maklerskim i ich nie wypłaciłeś na konto bankowe, podatku nie ma. Obowiązek powstaje w momencie sprzedaży z zyskiem, niezależnie od tego, gdzie trzymasz środki.</p>

<h3>Checklista przed 30 kwietnia</h3>
<p>Zanim złożysz zeznanie, sprawdź te punkty — pomijanie ich to najczęstsza przyczyna dopłat i korekt:</p>
<ul>
<li><strong>Masz wszystkie PIT-8C</strong> od każdego brokera, na którym handlowałeś w danym roku.</li>
<li><strong>Uwzględniłeś rachunki zagraniczne</strong> — brokerzy spoza Polski często nie wystawiają PIT-8C, a dochód i tak trzeba wykazać samodzielnie.</li>
<li><strong>Przeliczyłeś transakcje walutowe</strong> po właściwym kursie na dzień operacji.</li>
<li><strong>Doliczyłeś dywidendy zagraniczne</strong>, od których w Polsce może brakować pobranego podatku.</li>
<li><strong>Odłożyłeś gotówkę na podatek</strong> — sprzedaż z zyskiem w grudniu oznacza podatek płatny dopiero w kwietniu.</li>
</ul>

<h2>Częste scenariusze — ile realnie zapłacisz</h2>
<p>Poniższe przykłady pokazują, jak stawka 19% przekłada się na konkretne kwoty w typowych sytuacjach.</p>
<ul>
<li><strong>Konto oszczędnościowe 30 000 zł na 4%</strong> — odsetki brutto 1200 zł, podatek 228 zł, na rękę 972 zł. Rozlicza bank.</li>
<li><strong>Sprzedaż akcji z zyskiem 5000 zł</strong> — podatek 950 zł, płatny w PIT-38 do 30 kwietnia.</li>
<li><strong>Zysk z krypto 8000 zł</strong> — podatek 1520 zł, samodzielne rozliczenie w PIT-38.</li>
<li><strong>Zysk 5000 zł i strata 5000 zł w tym samym roku</strong> — dochód 0 zł, podatek 0 zł. Transakcje się kompensują.</li>
</ul>

<h2>Najczęstsze błędy przy podatku Belki</h2>
<ul>
<li><strong>Liczenie podatku od kapitału zamiast od zysku</strong> — podatek dotyczy wyłącznie dochodu.</li>
<li><strong>Pominięcie rozliczenia straty</strong> — tracisz możliwość obniżenia przyszłego podatku.</li>
<li><strong>Zignorowanie zysków niewypłaconych z rachunku</strong> — obowiązek powstaje przy sprzedaży, nie przy wypłacie.</li>
<li><strong>Porównywanie lokat po oprocentowaniu brutto</strong> — realny zysk to kwota po odjęciu 19%.</li>
<li><strong>Zapomnienie o brokerze zagranicznym</strong> — brak PIT-8C nie zwalnia z obowiązku wykazania dochodu.</li>
</ul>

<h2>Jak SzpontHub pomaga panować nad podatkiem Belki</h2>
<p>Rozliczenie jest proste, gdy masz uporządkowaną historię transakcji i widzisz zysk na bieżąco. W SzpontHub prowadzisz aktywa i inwestycje — akcje oraz kryptowaluty — z uwzględnieniem podatku Belki, dzięki czemu widzisz szacowany zysk oraz orientacyjne obciążenie podatkowe, zanim nadejdzie termin rozliczenia. Trzymając transakcje inwestycyjne razem z resztą finansów, łatwiej zebrać dane potrzebne do PIT-38 i odłożyć środki na podatek z wyprzedzeniem.</p>
`,
  faq: [
    {
      q: 'Ile wynosi podatek Belki?',
      a: 'Podatek Belki wynosi 19% i jest naliczany od zysku kapitałowego, a nie od zainwestowanej kwoty. Obejmuje odsetki z lokat i kont oszczędnościowych, zyski z akcji, ETF, funduszy, obligacji, dywidendy oraz zyski z kryptowalut.',
    },
    {
      q: 'Jak obliczyć podatek Belki od lokaty?',
      a: 'Pomnóż odsetki brutto przez 19%. Przy lokacie 10 000 zł na 5% odsetki brutto to 500 zł, podatek 95 zł, a na rękę zostaje 405 zł. W praktyce liczy go i pobiera bank, więc dostajesz od razu kwotę netto.',
    },
    {
      q: 'Kiedy trzeba zapłacić podatek Belki od giełdy?',
      a: 'Zyski z akcji, ETF i funduszy rozliczasz samodzielnie w rocznym zeznaniu PIT-38, a podatek płacisz do 30 kwietnia roku następnego. Obowiązek powstaje w momencie sprzedaży z zyskiem, nawet jeśli nie wypłaciłeś środków z rachunku maklerskiego.',
    },
    {
      q: 'Czy podatek Belki płaci się od całej kwoty czy od zysku?',
      a: 'Wyłącznie od zysku, czyli od dochodu po odjęciu kosztów nabycia i prowizji. Jeśli zainwestowałeś 10 000 zł, a sprzedałeś za 11 000 zł, podatek liczysz od 1000 zł zysku, a nie od pełnej kwoty wypłaty.',
    },
    {
      q: 'Czy stratę z inwestycji można odliczyć od podatku Belki?',
      a: 'Tak. Stratę z danego roku możesz rozliczyć z zyskami w kolejnych latach, obniżając przyszłą podstawę opodatkowania i podatek. Zasady oraz limity odliczania straty warto sprawdzić dla swojej konkretnej sytuacji.',
    },
    {
      q: 'Czy od zysków z kryptowalut też płaci się podatek Belki?',
      a: 'Tak, obowiązuje stawka 19%, ale krypto rozlicza się według odrębnych reguł. Opodatkowany jest dochód z odpłatnego zbycia, a sama zamiana jednej kryptowaluty na inną zwykle nie jest przychodem — liczy się moment wyjścia do waluty tradycyjnej lub zapłaty za towar czy usługę.',
    },
  ],
};

export default article;
