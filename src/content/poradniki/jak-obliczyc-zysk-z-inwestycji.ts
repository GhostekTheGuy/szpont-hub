import type { Article } from './types';

const article: Article = {
  slug: 'jak-obliczyc-zysk-z-inwestycji',
  title: 'Jak obliczyć zysk z inwestycji i realną stopę zwrotu',
  description:
    'Jak policzyć zysk z inwestycji, stopę zwrotu, wynik roczny (CAGR) i realny zysk po inflacji i podatku Belki. Wzory, przykłady i tabela z gotowymi wyliczeniami.',
  category: 'inwestycje',
  tags: ['stopa zwrotu', 'zysk z inwestycji', 'CAGR', 'inflacja', 'podatek Belki'],
  tldr:
    'Zysk z inwestycji liczysz jako różnicę między wartością końcową a początkową, a stopę zwrotu jako ten zysk podzielony przez kwotę zainwestowaną i pomnożony przez 100%. Aby porównać inwestycje o różnym czasie trwania, sprowadź wynik do skali rocznej (CAGR). Realny zysk poznasz dopiero po odjęciu inflacji, podatku Belki i wszystkich kosztów — dopiero ta liczba mówi, ile faktycznie zarobiłeś.',
  keyTakeaways: [
    'Prosta stopa zwrotu = (wartość końcowa minus początkowa) podzielona przez wartość początkową razy 100%.',
    'Do porównania inwestycji o różnej długości używaj rocznej stopy zwrotu (CAGR), nie sumy procentów.',
    'Realny zysk to wynik po odjęciu inflacji, podatku Belki (19%) i kosztów (prowizje, spready).',
    'Uwzględniaj dopłaty i wypłaty w trakcie — inaczej stopa zwrotu jest zafałszowana.',
    'Nominalny zysk 8% przy inflacji 6% to realnie mniej niż 2% — liczy się siła nabywcza.',
  ],
  published: '2026-07-09',
  readingMinutes: 10,
  bodyHtml: `
<p>Wielu inwestorów patrzy tylko na jedną liczbę: ile urosła wartość portfela. To za mało, żeby ocenić, czy inwestycja była dobra. Prawdziwy obraz daje dopiero stopa zwrotu sprowadzona do skali rocznej i policzona realnie, czyli po inflacji, podatku i kosztach. W tym poradniku pokażemy krok po kroku, jak policzyć zysk z inwestycji poprawnie, na konkretnych liczbach i wzorach. To materiał informacyjny, a nie porada inwestycyjna — decyzje podejmujesz na własną odpowiedzialność.</p>

<h2>Zysk nominalny — najprostsza miara</h2>
<p>Zysk nominalny to najprostsza rzecz do policzenia: odejmujesz od wartości końcowej wartość początkową. Jeśli kupiłeś aktywa za 10 000 zł, a dziś są warte 12 500 zł, Twój zysk nominalny wynosi 2500 zł. Ta liczba mówi jednak niewiele, dopóki nie odniesiesz jej do kwoty, którą zainwestowałeś, i do czasu, przez jaki pieniądze pracowały.</p>
<p>Dlatego zamiast samej kwoty używamy stopy zwrotu wyrażonej w procentach. Ona pozwala porównać inwestycje o różnej wielkości — bo 2500 zł zysku z 10 000 zł to zupełnie coś innego niż 2500 zł z 100 000 zł.</p>

<h2>Prosta stopa zwrotu (ROI)</h2>
<p>Podstawowy wzór na stopę zwrotu wygląda tak:</p>
<blockquote>Stopa zwrotu = (wartość końcowa minus wartość początkowa) podzielona przez wartość początkową razy 100%</blockquote>
<p>W naszym przykładzie: (12 500 minus 10 000) podzielone przez 10 000, razy 100% daje 25%. Twoja inwestycja przyniosła 25% zysku. Jeśli po drodze otrzymałeś dodatkowo dywidendy albo odsetki, dolicz je do wartości końcowej — to część zwrotu, którą łatwo pominąć.</p>
<p>Uwaga na dopłaty i wypłaty. Jeśli w trakcie dokładałeś pieniądze do portfela, nie możesz po prostu porównać salda początkowego z końcowym, bo część wzrostu to Twoje wpłaty, a nie zysk. W takiej sytuacji trzeba policzyć zysk osobno dla zainwestowanego kapitału albo użyć stopy zwrotu ważonej czasem. Regularne, drobne dopłaty to zresztą osobny temat — opisujemy go w tekście o <a href="/poradniki/usrednianie-ceny-dca">uśrednianiu ceny zakupu (DCA)</a>.</p>

<h2>Roczna stopa zwrotu (CAGR) — do porównań</h2>
<p>Sama informacja, że inwestycja dała 25%, jest bezużyteczna bez kontekstu czasu. 25% w rok to świetny wynik. 25% przez pięć lat to słaby wynik. Żeby porównywać inwestycje uczciwie, sprowadzamy je do wspólnej skali rocznej, czyli liczymy CAGR (składaną roczną stopę wzrostu).</p>
<p>Nie możesz po prostu podzielić 25% przez 5 lat i powiedzieć 5% rocznie — to błąd, bo pomija procent składany. Poprawnie CAGR liczy się jako pierwiastek n-tego stopnia z ilorazu wartości końcowej i początkowej, minus jeden. Dla naszego przykładu (12 500 z 10 000 przez 5 lat) CAGR wynosi około 4,56% rocznie. To, jak procent składany rozpędza wynik w dłuższym okresie, tłumaczymy w tekście o <a href="/poradniki/procent-skladany-jak-dziala">procencie składanym</a>.</p>

<table>
<thead>
<tr><th>Inwestycja</th><th>Wpłata</th><th>Wartość końcowa</th><th>Czas</th><th>Zysk całkowity</th><th>CAGR</th></tr>
</thead>
<tbody>
<tr><td>A</td><td>10 000 zł</td><td>12 500 zł</td><td>1 rok</td><td>25%</td><td>25%</td></tr>
<tr><td>B</td><td>10 000 zł</td><td>12 500 zł</td><td>5 lat</td><td>25%</td><td>4,56%</td></tr>
<tr><td>C</td><td>10 000 zł</td><td>16 000 zł</td><td>5 lat</td><td>60%</td><td>9,86%</td></tr>
</tbody>
</table>
<p>Ta sama końcowa wartość (A i B) daje diametralnie różny wynik roczny, bo różni się czasem. Dlatego przy ocenie funduszy, ETF-ów czy własnego portfela zawsze patrz na wynik roczny, a nie na sumę procentów z całego okresu.</p>

<h2>Stopa zwrotu przy dopłatach — przykład krok po kroku</h2>
<p>Najczęstszy błąd w liczeniu zysku pojawia się, gdy w trakcie roku dokładasz do portfela. Wyobraź sobie, że 1 stycznia masz 10 000 zł, w lipcu dopłacasz 5 000 zł, a 31 grudnia portfel jest wart 17 000 zł. Kusi, by powiedzieć: włożyłem 15 000 zł, mam 17 000 zł, czyli zarobiłem 2 000 zł i 13,3%. To błąd, bo dopłata pracowała tylko przez pół roku.</p>
<p>Prostą, ale uczciwą metodą jest stopa zwrotu ważona kapitałem i czasem. Kapitał 10 000 zł pracował 12 miesięcy, a 5 000 zł tylko 6 miesięcy, więc średni zaangażowany kapitał to 10 000 plus 5 000 razy 6/12, czyli 12 500 zł. Zysk 2 000 zł odniesiony do 12 500 zł daje realną stopę zwrotu około 16%, a nie 13,3%. Różnica wynika wyłącznie z tego, kiedy dołożyłeś pieniądze.</p>
<table>
<thead>
<tr><th>Pozycja</th><th>Kwota</th><th>Czas pracy</th><th>Kapitał ważony</th></tr>
</thead>
<tbody>
<tr><td>Wpłata początkowa</td><td>10 000 zł</td><td>12 mies.</td><td>10 000 zł</td></tr>
<tr><td>Dopłata w lipcu</td><td>5 000 zł</td><td>6 mies.</td><td>2 500 zł</td></tr>
<tr><td><strong>Średni kapitał</strong></td><td><strong>15 000 zł</strong></td><td></td><td><strong>12 500 zł</strong></td></tr>
</tbody>
</table>
<p>Jeśli masz wiele dopłat i wypłat w ciągu roku, dokładny wynik daje dopiero wewnętrzna stopa zwrotu (IRR), którą policzy arkusz kalkulacyjny funkcją XIRR. Do szybkiej oceny wystarczy jednak metoda kapitału ważonego czasem pokazana wyżej, bo oddziela ona wynik samej inwestycji od momentu, w którym dokładałeś pieniądze.</p>

<h2>Zysk realny — po inflacji</h2>
<p>Nawet dodatnia stopa zwrotu nie oznacza, że się wzbogaciłeś. Jeśli Twój portfel urósł o 8%, a ceny w gospodarce wzrosły o 6%, Twoja realna siła nabywcza zwiększyła się tylko o niecałe 2%. To zysk realny — i tylko on mówi, czy naprawdę stać Cię na więcej niż rok temu.</p>
<blockquote>Zysk realny w przybliżeniu = stopa zwrotu nominalna minus stopa inflacji</blockquote>
<p>Dokładny wzór dzieli, a nie odejmuje: (1 plus stopa nominalna) podzielone przez (1 plus inflacja), minus 1. Przy 8% zysku i 6% inflacji dokładny wynik to około 1,89%. Przybliżenie przez odejmowanie (2%) wystarcza do szybkiej oceny, ale przy wysokiej inflacji różnica rośnie. Jak inflacja zjada oszczędności i jak się przed tym bronić, rozwijamy w poradniku o <a href="/poradniki/inflacja-jak-chronic-oszczednosci">ochronie oszczędności przed inflacją</a>.</p>

<h2>Zysk po podatku i kosztach</h2>
<p>Ostatnie dwa czynniki, które obniżają Twój faktyczny wynik, to podatek i koszty. Od zysków kapitałowych w Polsce płacisz 19% podatku Belki. Oznacza to, że z zysku 2500 zł do Ciebie trafia 2025 zł, a 475 zł idzie do urzędu. Mechanizm i wyjątki (na przykład konto IKE) opisujemy w tekście o <a href="/poradniki/podatek-belki-jak-obliczyc">podatku Belki</a>.</p>
<p>Do tego dochodzą koszty transakcyjne: prowizje maklerskie, spready walutowe przy zakupie aktywów w obcej walucie, opłaty za zarządzanie w funduszach. Pojedynczo wyglądają niepozornie, ale przy częstym handlu potrafią zjeść znaczną część wyniku.</p>
<ul>
<li><strong>Prowizja od transakcji</strong> — zwykle 0,2–0,4% wartości u brokera akcyjnego, czasem stała kwota minimalna.</li>
<li><strong>Spread walutowy</strong> — różnica kursu kupna i sprzedaży waluty, istotna przy aktywach w USD czy EUR.</li>
<li><strong>Opłata za zarządzanie</strong> — w funduszach i niektórych ETF-ach liczona rocznie od wartości aktywów.</li>
<li><strong>Podatek Belki</strong> — 19% od zrealizowanego zysku, płatny po sprzedaży (poza kontami emerytalnymi).</li>
</ul>

<h3>Pełne wyliczenie na przykładzie</h3>
<p>Zbierzmy wszystko razem. Inwestujesz 10 000 zł, po roku portfel jest wart 10 800 zł (8% nominalnie), inflacja w tym czasie wyniosła 6%.</p>
<table>
<thead>
<tr><th>Krok</th><th>Wartość</th></tr>
</thead>
<tbody>
<tr><td>Zysk nominalny</td><td>800 zł (8%)</td></tr>
<tr><td>Podatek Belki 19% od zysku</td><td>minus 152 zł</td></tr>
<tr><td>Zysk po podatku</td><td>648 zł</td></tr>
<tr><td>Realna wartość po inflacji 6%</td><td>siła nabywcza rośnie o około 1,7%</td></tr>
<tr><td><strong>Realny zysk po podatku i inflacji</strong></td><td><strong>około 170 zł</strong></td></tr>
</tbody>
</table>
<p>Z pozornie przyzwoitych 800 zł zostaje realnie około 170 zł wzrostu siły nabywczej. To nie znaczy, że inwestowanie się nie opłaca — przeciwnie, gotówka trzymana bez oprocentowania straciłaby na inflacji całe 6%. To pokazuje jednak, dlaczego liczby nominalne bywają mylące i dlaczego warto patrzeć na wynik realny.</p>

<h2>Zysk zrealizowany a niezrealizowany</h2>
<p>Ważne rozróżnienie, o którym łatwo zapomnieć: zysk na papierze to nie to samo co zysk w kieszeni. Dopóki nie sprzedasz aktywa, Twój zysk jest niezrealizowany — istnieje tylko jako bieżąca wycena, która może jeszcze wzrosnąć albo spaść. Zysk zrealizowany powstaje dopiero w momencie sprzedaży i to od niego naliczany jest podatek Belki.</p>
<p>Ma to dwie praktyczne konsekwencje. Po pierwsze, dopóki nie sprzedajesz, cały kapitał pracuje dalej, bez uszczuplenia o podatek — to jedna z cichych sił długoterminowego inwestowania, bo odroczony podatek zostaje w grze i sam generuje zysk. Po drugie, planując wypłatę, licz kwotę netto: jeśli chcesz wyjąć 10 000 zł czystego zysku, musisz sprzedać aktywa dające około 12 346 zł zysku brutto, bo 19% (2 346 zł) zabierze podatek Belki.</p>

<h2>Porównanie klas aktywów na liczbach</h2>
<p>Żeby zobaczyć, dlaczego realny wynik jest ważniejszy od nominalnego, porównajmy cztery typowe sposoby ulokowania 10 000 zł na rok przy założonej inflacji 6%. Liczby są przykładowe i służą wyłącznie ilustracji mechanizmu, a nie prognozie.</p>
<table>
<thead>
<tr><th>Sposób</th><th>Zysk nominalny</th><th>Po podatku Belki</th><th>Realnie po inflacji 6%</th></tr>
</thead>
<tbody>
<tr><td>Gotówka w szufladzie</td><td>0 zł (0%)</td><td>0 zł</td><td>około minus 566 zł</td></tr>
<tr><td>Lokata 5%</td><td>500 zł</td><td>405 zł</td><td>około minus 184 zł</td></tr>
<tr><td>Obligacje 7%</td><td>700 zł</td><td>567 zł</td><td>około minus 31 zł</td></tr>
<tr><td>ETF 10%</td><td>1 000 zł</td><td>810 zł</td><td>około plus 198 zł</td></tr>
</tbody>
</table>
<p>Wniosek jest wymowny: nawet obligacje o 7% nominalnie ledwie bronią wartości pieniądza przy 6% inflacji, bo podatek Belki zabiera 19% zysku. Dopiero wynik wyraźnie powyżej sumy inflacji i podatku daje realny przyrost siły nabywczej. Gotówka trzymana bezczynnie traci najwięcej, mimo że jej saldo nominalne się nie zmienia.</p>

<h2>Najczęstsze błędy przy liczeniu zysku</h2>
<ul>
<li><strong>Dzielenie sumy zysku przez liczbę lat</strong> zamiast liczenia CAGR — pomija procent składany i zawyża wynik.</li>
<li><strong>Pomijanie dopłat i wypłat</strong> — traktowanie własnych wpłat jak zysku zawyża stopę zwrotu.</li>
<li><strong>Ignorowanie podatku i prowizji</strong> — realny wynik potrafi być o kilkanaście procent niższy niż na wyciągu.</li>
<li><strong>Porównywanie inwestycji o różnym czasie</strong> bez sprowadzenia do skali rocznej.</li>
<li><strong>Patrzenie tylko na cenę aktywa</strong> z pominięciem dywidend i odsetek, które są częścią zwrotu.</li>
</ul>

<h2>Jak SzpontHub pomaga liczyć zysk</h2>
<p>Ręczne liczenie stopy zwrotu przy kilku aktywach w różnych walutach szybko robi się uciążliwe. W SzpontHub prowadzisz aktywa i inwestycje (akcje, krypto) w jednym miejscu, a aplikacja pokazuje wynik z uwzględnieniem podatku Belki. Dzięki portfelom wielowalutowym (PLN, USD, EUR) widzisz wartość pozycji przeliczoną na wspólną walutę, co ułatwia policzenie realnego zysku bez rozjeżdżających się arkuszy. Jak konsekwentnie monitorować całość, opisujemy w poradniku o <a href="/poradniki/jak-sledzic-portfel-inwestycyjny">śledzeniu portfela inwestycyjnego</a>.</p>
`,
  faq: [
    {
      q: 'Jak obliczyć stopę zwrotu z inwestycji?',
      a: 'Odejmij wartość początkową od końcowej, podziel wynik przez wartość początkową i pomnóż przez 100%. Na przykład dla wpłaty 10 000 zł i wartości końcowej 12 500 zł stopa zwrotu wynosi 25%. Do wartości końcowej dolicz otrzymane dywidendy i odsetki.',
    },
    {
      q: 'Czym jest CAGR i po co się go liczy?',
      a: 'CAGR to składana roczna stopa wzrostu, czyli średnie tempo zysku w skali roku z uwzględnieniem procentu składanego. Liczy się go, aby porównać inwestycje o różnym czasie trwania. Nie można po prostu podzielić całkowitego zysku przez liczbę lat, bo pomija to efekt składania.',
    },
    {
      q: 'Jak policzyć realny zysk z inwestycji po inflacji?',
      a: 'W przybliżeniu odejmij stopę inflacji od nominalnej stopy zwrotu. Dokładniej podziel (1 plus stopa nominalna) przez (1 plus inflacja) i odejmij 1. Przy zysku 8% i inflacji 6% realny zysk wynosi około 1,9%, bo liczy się wzrost siły nabywczej, a nie sama liczba na koncie.',
    },
    {
      q: 'Ile wynosi podatek od zysku z inwestycji w Polsce?',
      a: 'Standardowo 19% od zrealizowanego zysku kapitałowego, czyli tak zwany podatek Belki. Płaci się go po sprzedaży aktywów z zyskiem. Wyjątkiem są konta emerytalne IKE i IKZE, które pozwalają odroczyć lub uniknąć tego podatku na określonych zasadach.',
    },
    {
      q: 'Czy do stopy zwrotu wliczać dywidendy?',
      a: 'Tak. Dywidendy i odsetki są częścią całkowitego zwrotu z inwestycji. Jeśli policzysz zysk wyłącznie ze zmiany ceny aktywa, zaniżysz realny wynik. Dolicz wypłacone dywidendy do wartości końcowej albo licz je osobno jako dochód z inwestycji.',
    },
    {
      q: 'Jak uwzględnić dopłaty do portfela przy liczeniu zysku?',
      a: 'Nie porównuj wtedy prostego salda początkowego z końcowym, bo część wzrostu to Twoje wpłaty, a nie zysk. Policz zysk osobno dla każdej transzy kapitału albo zastosuj stopę zwrotu ważoną czasem, która oddziela wynik inwestycji od momentu i wielkości dopłat.',
    },
  ],
};

export default article;
