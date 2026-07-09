import type { Article } from './types';

const article: Article = {
  slug: 'jak-rozliczac-zagranicznych-klientow',
  title: 'Jak rozliczać się z zagranicznymi klientami — poradnik',
  description:
    'Jak wystawiać faktury zagranicznym klientom, przeliczać walutę na PLN, rozliczać VAT i podatek. Zasady dla klientów z UE i spoza niej, kursy i przykłady.',
  category: 'freelancer',
  tags: ['zagraniczni klienci', 'faktura walutowa', 'freelancer', 'VAT', 'kurs waluty'],
  tldr:
    'Fakturę dla zagranicznego klienta możesz wystawić w walucie obcej, ale do celów podatkowych przeliczasz ją na złote według kursu średniego NBP z ostatniego dnia roboczego poprzedzającego dzień wystawienia faktury. Przy usługach dla firm z UE zwykle stosuje się mechanizm odwrotnego obciążenia (klient rozlicza VAT u siebie), a Ty wykazujesz sprzedaż w informacji podsumowującej. Przychód i tak opodatkowujesz w Polsce według swojej formy rozliczenia.',
  keyTakeaways: [
    'Fakturę wystawiasz w dowolnej walucie, ale do podatku przeliczasz ją na PLN po kursie NBP.',
    'Kurs to średni NBP z ostatniego dnia roboczego przed dniem wystawienia faktury.',
    'Usługi B2B dla firm z UE to zwykle odwrotne obciążenie — VAT rozlicza nabywca.',
    'Do transakcji wewnątrz UE zwykle potrzebujesz rejestracji VAT-UE i numeru VAT-UE kontrahenta.',
    'Różnice kursowe między wystawieniem a zapłatą też wpływają na rozliczenie.',
    'Przychód z zagranicy opodatkowujesz w Polsce według wybranej formy (ryczałt, liniowy, skala).',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Praca dla klientów z zagranicy otwiera dostęp do wyższych stawek, ale wprowadza kilka dodatkowych kroków w rozliczeniu: waluty, kursy przeliczeniowe, VAT i informacje podsumowujące. Dobra wiadomość jest taka, że reguły są powtarzalne — gdy raz je zrozumiesz, obsługa zagranicznej faktury jest niemal tak prosta jak krajowej. W tym poradniku pokażemy, jak to poukładać, z konkretnymi liczbami w zł, EUR i USD.</p>

<p><strong>To materiał informacyjny, a nie porada podatkowa.</strong> Rozliczenia międzynarodowe mają wiele wyjątków zależnych od rodzaju usługi, statusu klienta i kraju — konkretne liczby (stawki, progi, formularze) potwierdź z księgowym przed wystawieniem pierwszej faktury.</p>

<h2>W jakiej walucie wystawić fakturę</h2>
<p>Fakturę dla zagranicznego klienta możesz wystawić w walucie obcej — najczęściej w euro lub dolarach, w zależności od umowy. Przepisy tego nie zabraniają. Kwota podatku VAT (jeśli w ogóle występuje) musi jednak być wyrażona również w złotych, dlatego zawsze potrzebujesz przeliczenia na PLN.</p>
<p>W praktyce wygląda to tak: klient płaci Ci w swojej walucie, a Ty na potrzeby księgowości i podatku przeliczasz tę kwotę na złote według właściwego kursu. To przeliczenie decyduje o wysokości przychodu wykazanego w Polsce. Sama faktura może pozostać w euro czy dolarach — na potrzeby ewidencji obok kwoty walutowej zapisujesz jej równowartość w złotych.</p>

<h2>Jaki kurs zastosować</h2>
<p>Do przeliczenia przychodu na złote stosujesz <strong>średni kurs NBP z ostatniego dnia roboczego poprzedzającego dzień powstania przychodu lub wystawienia faktury</strong>. W typowym przypadku freelancera będzie to kurs z dnia roboczego przed datą wystawienia faktury. Kursy średnie NBP publikuje w tabeli A każdego dnia roboczego około południa.</p>

<table>
<thead>
<tr><th>Zdarzenie</th><th>Zastosowany kurs</th></tr>
</thead>
<tbody>
<tr><td>Przychód (wystawienie faktury)</td><td>Średni NBP z ostatniego dnia roboczego przed datą faktury</td></tr>
<tr><td>Koszt w walucie (faktura zakupowa)</td><td>Średni NBP z ostatniego dnia roboczego przed datą kosztu</td></tr>
<tr><td>Zapłata w innym dniu niż faktura</td><td>Powstają różnice kursowe do rozliczenia</td></tr>
</tbody>
</table>

<p>Przykład: wystawiasz fakturę 10 lipca na 1000 euro. Bierzesz średni kurs NBP z 9 lipca (lub wcześniejszego dnia roboczego, jeśli 9 lipca był wolny). Jeśli kurs wynosił 4,30 zł, Twój przychód to 4300 zł — i tę kwotę wykazujesz w rozliczeniu. Więcej o mechanice przeliczeń znajdziesz w poradniku <a href="/poradniki/faktura-walutowa-przeliczanie-kursu">faktura walutowa i przeliczanie kursu</a>.</p>

<blockquote>Przychód z faktury w walucie obcej przeliczasz na złote po średnim kursie NBP z ostatniego dnia roboczego poprzedzającego dzień wystawienia faktury. To ten kurs, a nie kurs z dnia zapłaty, wyznacza wartość przychodu.</blockquote>

<h2>Krok po kroku: od faktury do zapłaty podatku</h2>
<p>Weźmy konkretny przypadek: freelancer na ryczałcie 12 procent obsługuje klienta z Niemiec i wystawia fakturę na 2000 EUR. Oto pełna ścieżka od wystawienia do wykazania przychodu.</p>
<ol>
<li><strong>Ustal dzień wystawienia faktury.</strong> Załóżmy 6 sierpnia. Kurs bierzesz z ostatniego dnia roboczego przed tą datą, czyli z 5 sierpnia.</li>
<li><strong>Sprawdź średni kurs NBP.</strong> Powiedzmy, że EUR z 5 sierpnia to 4,28 zł.</li>
<li><strong>Przelicz przychód.</strong> 2000 EUR razy 4,28 zł daje 8560 zł przychodu wykazanego w Polsce.</li>
<li><strong>Wystaw fakturę bez VAT z adnotacją reverse charge</strong> (usługa B2B do firmy z UE) i wykaż ją w informacji podsumowującej VAT-UE.</li>
<li><strong>Policz podatek.</strong> Przy ryczałcie 12 procent to 8560 zł razy 0,12, czyli około 1027 zł zaliczki za dany miesiąc.</li>
<li><strong>Zaksięguj wpływ i różnicę kursową</strong> w dniu, w którym pieniądze faktycznie wpłyną.</li>
</ol>
<p>Ta sama logika działa dla dolarów. Faktura na 3000 USD przy kursie 3,95 zł to 11 850 zł przychodu. Zmienia się tylko waluta i kurs — schemat pozostaje identyczny.</p>

<h2>VAT przy klientach z Unii Europejskiej</h2>
<p>Dla usług świadczonych firmom z innych krajów UE najczęściej stosuje się mechanizm <strong>odwrotnego obciążenia</strong> (reverse charge). Oznacza to, że VAT rozlicza nabywca w swoim kraju, a Ty wystawiasz fakturę bez polskiego VAT, z odpowiednią adnotacją. Żeby to zadziałało prawidłowo, zwykle musisz:</p>
<ul>
<li>Zarejestrować się jako podatnik VAT-UE (formularz VAT-R) i uzyskać numer VAT-UE poprzedzony prefiksem PL.</li>
<li>Uzyskać i zweryfikować numer VAT-UE kontrahenta w systemie VIES — zapisz sobie datę i wynik weryfikacji na wypadek kontroli.</li>
<li>Umieścić na fakturze adnotację o odwrotnym obciążeniu (na przykład „reverse charge”) i oba numery VAT-UE.</li>
<li>Wykazać transakcję w informacji podsumowującej VAT-UE, którą składasz co miesiąc do 25. dnia następnego miesiąca.</li>
</ul>
<p>To rozwiązanie działa dla usług między firmami (B2B). Sprzedaż na rzecz zagranicznych konsumentów (osób prywatnych) rządzi się innymi zasadami i częściej wymaga rozliczenia VAT — na przykład przy usługach elektronicznych do konsumentów w UE w grę wchodzi procedura VAT OSS. Jeśli świadczysz usługi dla osób prywatnych, potwierdź swój przypadek z księgowym, bo tu wyjątków jest najwięcej.</p>

<h2>Klienci spoza Unii Europejskiej</h2>
<p>Przy usługach dla firm spoza UE (na przykład z USA, Wielkiej Brytanii czy Szwajcarii) miejsce opodatkowania VAT zwykle znajduje się poza Polską, więc fakturę wystawiasz bez polskiego VAT. Nie wykazujesz takiej transakcji w informacji podsumowującej VAT-UE, bo ta dotyczy wyłącznie obrotu wewnątrz Unii. Zasady zależą jednak od rodzaju usługi i kraju klienta, a niektóre usługi mają szczególne reguły ustalania miejsca świadczenia. To obszar, w którym warto potwierdzić szczegóły, zanim wystawisz pierwszą fakturę.</p>
<p>Uwaga na formularze klienta: firmy z USA często proszą o wypełnienie formularza W-8BEN, który potwierdza, że nie jesteś rezydentem podatkowym USA. Dzięki umowie o unikaniu podwójnego opodatkowania zwykle pozwala on uniknąć amerykańskiego podatku u źródła. To formalność po stronie klienta, ale bez niej wypłata może zostać pomniejszona.</p>
<p>Niezależnie od VAT, <strong>przychód i tak opodatkowujesz w Polsce</strong> według swojej formy rozliczenia — ryczałtem, liniowo lub według skali. Jeśli wahasz się między formami, pomoże poradnik <a href="/poradniki/ryczalt-czy-podatek-liniowy-freelancer">ryczałt czy podatek liniowy</a>.</p>

<h2>Różnice kursowe — jak je policzyć</h2>
<p>Ponieważ kurs w dniu wystawienia faktury różni się zwykle od kursu w dniu zapłaty, powstają różnice kursowe. Jeśli między wystawieniem a zapłatą złoty osłabnie, otrzymasz w przeliczeniu więcej niż wykazany przychód — powstaje dodatnia różnica (przychód). Gdy złoty się umocni, różnica jest ujemna (koszt). Przy ryczałcie sytuacja jest uproszczona i dodatnie różnice kursowe zwykle nie zwiększają podstawy ryczałtu, natomiast przy księdze przychodów i rozchodów różnice kursowe rozlicza się osobno po każdej płatności.</p>
<p>Wzór jest prosty: <strong>różnica kursowa = kwota w walucie razy (kurs z dnia zapłaty minus kurs z dnia faktury)</strong>. Dla 1000 EUR, kursu faktury 4,30 zł i kursu zapłaty 4,35 zł: 1000 razy (4,35 minus 4,30) = 50 zł dodatniej różnicy.</p>

<h3>Praktyczny przykład</h3>
<table>
<thead>
<tr><th>Krok</th><th>Data</th><th>Kurs NBP</th><th>Kwota w PLN</th></tr>
</thead>
<tbody>
<tr><td>Faktura 1000 EUR</td><td>10 lipca</td><td>4,30 zł</td><td>4300 zł (przychód)</td></tr>
<tr><td>Zapłata 1000 EUR</td><td>25 lipca</td><td>4,35 zł</td><td>4350 zł wpływu</td></tr>
<tr><td>Różnica kursowa</td><td>-</td><td>-</td><td>+50 zł dodatnia</td></tr>
</tbody>
</table>

<p>Gdyby złoty się umocnił i kurs w dniu zapłaty wyniósł 4,24 zł, otrzymasz 4240 zł, czyli o 60 zł mniej niż wykazany przychód — to ujemna różnica kursowa, którą (przy KPiR) księgujesz jako koszt.</p>

<h2>Jak odebrać pieniądze: porównanie metod płatności</h2>
<p>Sposób przyjmowania płatności realnie wpływa na to, ile zostaje w kieszeni. Przy fakturze na 1000 EUR różnica między metodami potrafi wynieść kilkadziesiąt złotych na każdej transakcji. Poniżej orientacyjne porównanie — dokładne stawki sprawdź u konkretnego dostawcy, bo się zmieniają.</p>

<table>
<thead>
<tr><th>Metoda</th><th>Typowy koszt</th><th>Kurs wymiany</th><th>Kiedy się sprawdza</th></tr>
</thead>
<tbody>
<tr><td>Przelew SEPA na konto EUR</td><td>Niski lub zerowy</td><td>Twój bank przy wymianie</td><td>Klienci z UE, konto walutowe</td></tr>
<tr><td>Przelew SWIFT (spoza UE)</td><td>Kilkadziesiąt zł opłat</td><td>Kurs banku</td><td>Duże, rzadkie płatności</td></tr>
<tr><td>Wise / konto wielowalutowe</td><td>Niska prowizja procentowa</td><td>Blisko kursu rynkowego</td><td>Regularna praca dla zagranicy</td></tr>
<tr><td>PayPal</td><td>Wyższa prowizja plus spread</td><td>Niekorzystny kurs PayPala</td><td>Szybkie, drobne płatności</td></tr>
</tbody>
</table>

<p>Reguła praktyczna: im większe i częstsze przelewy, tym bardziej opłaca się konto walutowe lub multiwalutowe zamiast automatycznego przewalutowania po kursie operatora. Na fakturze 1000 EUR spread PayPala rzędu 3-4 procent to około 130-170 zł straty względem kursu rynkowego.</p>

<h2>Konto walutowe czy przewalutowanie</h2>
<p>Przy regularnej pracy dla zagranicy warto rozważyć konto walutowe, żeby nie tracić na przewalutowaniu przy każdej wpłacie. Trzymając euro lub dolary, wymieniasz je wtedy, gdy kurs jest korzystny, a nie automatycznie po kursie banku. Jak zarządzać wieloma walutami bez chaosu, opisujemy w poradniku <a href="/poradniki/portfel-wielowalutowy-jak-zarzadzac">portfel wielowalutowy — jak zarządzać</a>.</p>

<h2>Mini-case: freelancer z klientem z UE i z USA w jednym miesiącu</h2>
<p>Zobaczmy, jak wszystko składa się razem. Anna projektuje interfejsy na ryczałcie i w sierpniu obsłużyła dwóch klientów: agencję z Holandii i startup z USA.</p>
<ul>
<li><strong>Klient z Holandii (B2B, UE):</strong> faktura na 2500 EUR z 8 sierpnia. Kurs NBP z 7 sierpnia to 4,29 zł, więc przychód to 10 725 zł. Faktura bez VAT z adnotacją reverse charge, wykazana w informacji podsumowującej VAT-UE.</li>
<li><strong>Klient z USA (B2B, spoza UE):</strong> faktura na 3200 USD z 20 sierpnia. Kurs NBP z 19 sierpnia to 3,92 zł, więc przychód to 12 544 zł. Faktura bez polskiego VAT, bez informacji podsumowującej, z wcześniej wypełnionym W-8BEN.</li>
</ul>
<p>Łączny przychód sierpnia to 23 269 zł. Przy ryczałcie 12 procent zaliczka wynosi około 2792 zł. Do tego dochodzą składki ZUS i zdrowotna, liczone według zasad wybranej formy. Gdy pod koniec miesiąca dolary i euro faktycznie wpłyną, Anna zaksięguje ewentualne różnice kursowe względem kursów z dni wystawienia faktur.</p>

<h2>Checklista przed wystawieniem pierwszej faktury zagranicznej</h2>
<ol>
<li>Ustal status klienta: firma czy osoba prywatna, z UE czy spoza UE.</li>
<li>Jeśli klient jest z UE i jest firmą — zarejestruj VAT-UE (VAT-R) i sprawdź jego numer w VIES.</li>
<li>Uzgodnij walutę faktury i sposób płatności (SEPA, SWIFT, Wise, PayPal).</li>
<li>Przygotuj adnotacje na fakturze: reverse charge dla UE, brak polskiego VAT dla spoza UE.</li>
<li>Dla klientów z USA sprawdź, czy poproszą o W-8BEN.</li>
<li>Zapisz dzień wystawienia faktury i odczytaj kurs NBP z poprzedniego dnia roboczego.</li>
<li>Przelicz przychód na PLN i zaksięguj go według tego kursu.</li>
<li>Po wpływie pieniędzy policz i zaksięguj różnicę kursową.</li>
<li>Pamiętaj o terminach: informacja podsumowująca VAT-UE do 25. dnia następnego miesiąca.</li>
</ol>

<h2>Najczęstsze błędy</h2>
<ul>
<li>Przeliczanie przychodu po kursie z dnia zapłaty zamiast z dnia poprzedzającego wystawienie faktury.</li>
<li>Wystawianie faktur do UE bez rejestracji VAT-UE i bez weryfikacji numeru kontrahenta w VIES.</li>
<li>Pominięcie informacji podsumowującej VAT-UE przy transakcjach wewnątrzunijnych.</li>
<li>Wpisywanie klienta spoza UE do informacji podsumowującej — ta dotyczy wyłącznie obrotu w Unii.</li>
<li>Ignorowanie różnic kursowych, które wpływają na wynik podatkowy przy KPiR.</li>
<li>Odbieranie każdej płatności przez PayPala i tracenie na spreadzie zamiast użyć konta walutowego.</li>
<li>Zakładanie, że skoro klient jest z zagranicy, to przychodu nie trzeba rozliczać w Polsce.</li>
</ul>

<h2>Jak SzpontHub pomaga w rozliczeniach walutowych</h2>
<p>Praca dla zagranicy oznacza salda w kilku walutach i faktury do przeliczenia. W SzpontHub prowadzisz portfele wielowalutowe w PLN, USD i EUR oraz wystawiasz faktury (w integracji z Kugaru), dzięki czemu przychody z zagranicy i ich przeliczenia trzymasz w jednym miejscu. Widząc salda walutowe obok kwot w złotych, łatwiej kontrolujesz, ile realnie zarobiłeś po przeliczeniu i kiedy opłaca się wymienić walutę.</p>
`,
  faq: [
    {
      q: 'W jakiej walucie wystawić fakturę zagranicznemu klientowi?',
      a: 'Możesz wystawić fakturę w walucie obcej, najczęściej w euro lub dolarach, zgodnie z umową. Do celów podatkowych i tak przeliczasz kwotę na złote według średniego kursu NBP, a ewentualny VAT musi być wyrażony również w PLN.',
    },
    {
      q: 'Jaki kurs stosować do przeliczenia faktury walutowej?',
      a: 'Średni kurs NBP z ostatniego dnia roboczego poprzedzającego dzień wystawienia faktury lub powstania przychodu. To ten kurs wyznacza wartość przychodu w złotych, niezależnie od kursu z dnia faktycznej zapłaty.',
    },
    {
      q: 'Czy do faktur dla firm z UE potrzebuję VAT-UE?',
      a: 'Zwykle tak. Do usług wewnątrzunijnych między firmami rejestrujesz się jako podatnik VAT-UE, weryfikujesz numer VAT-UE kontrahenta w systemie VIES i stosujesz mechanizm odwrotnego obciążenia, w którym VAT rozlicza nabywca. Transakcję wykazujesz w informacji podsumowującej.',
    },
    {
      q: 'Czy przychód od zagranicznego klienta rozlicza się w Polsce?',
      a: 'Tak. Niezależnie od tego, jak wygląda rozliczenie VAT, przychód opodatkowujesz w Polsce według swojej formy: ryczałtem, podatkiem liniowym lub według skali. Fakt, że klient jest z zagranicy, nie zwalnia z podatku dochodowego w kraju.',
    },
    {
      q: 'Co to są różnice kursowe i kiedy powstają?',
      a: 'To różnica między wartością przychodu przeliczoną w dniu wystawienia faktury a kwotą faktycznie otrzymaną po kursie z dnia zapłaty. Gdy złoty osłabnie między tymi datami, powstaje dodatnia różnica, gdy się umocni — ujemna. Wpływają one na wynik podatkowy.',
    },
    {
      q: 'Jak rozliczyć klienta spoza Unii Europejskiej, na przykład z USA?',
      a: 'Przy usługach B2B dla firm spoza UE miejsce opodatkowania VAT zwykle jest poza Polską, więc fakturę wystawiasz bez polskiego VAT. Szczegóły zależą od rodzaju usługi i kraju klienta, a przychód i tak opodatkowujesz w Polsce według wybranej formy.',
    },
  ],
};

export default article;
