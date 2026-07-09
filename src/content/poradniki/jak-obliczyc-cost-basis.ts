import type { Article } from './types';

const article: Article = {
  slug: 'jak-obliczyc-cost-basis',
  title: 'Jak obliczyć cost basis (podstawę kosztową) inwestycji',
  description:
    'Cost basis, czyli podstawa kosztowa, decyduje o wysokości podatku od zysków. Dowiedz się, jak ją policzyć przy wielu zakupach, metodą FIFO i średniej ważonej.',
  category: 'inwestycje',
  tags: ['cost basis', 'podstawa kosztowa', 'podatek Belki', 'rozliczanie inwestycji', 'FIFO'],
  tldr:
    'Cost basis (podstawa kosztowa) to łączny koszt nabycia aktywa wraz z prowizjami, od którego liczy się zysk lub stratę przy sprzedaży. Zysk do opodatkowania to cena sprzedaży minus cost basis. Gdy kupowałeś w kilku transakcjach po różnych cenach, podstawę ustala się metodą FIFO (najpierw sprzedane najstarsze) lub średniej ważonej. Dokładne liczenie cost basis chroni przed przepłaceniem podatku.',
  keyTakeaways: [
    'Cost basis to koszt nabycia aktywa powiększony o prowizje i opłaty transakcyjne.',
    'Zysk do opodatkowania to cena sprzedaży minus cost basis, a nie sama cena sprzedaży.',
    'Przy wielu zakupach po różnych cenach stosuje się metodę FIFO lub średniej ważonej.',
    'W Polsce od zysku kapitałowego zapłacisz 19 procent podatku Belki — cost basis go pomniejsza.',
    'Zaniżona podstawa kosztowa oznacza zawyżony podatek, dlatego warto rejestrować każdy zakup.',
    'Reinwestowane dywidendy i zakupy w obcej walucie też wchodzą do podstawy kosztowej i trzeba je rozliczyć.',
    'Strata z jednej sprzedaży pomniejsza zysk z innej w tym samym roku, więc obniża łączny podatek.',
  ],
  published: '2026-07-09',
  readingMinutes: 12,
  bodyHtml: `
<p>Gdy sprzedajesz akcje, ETF czy kryptowalutę z zyskiem, podatek liczy się nie od całej otrzymanej kwoty, lecz od zysku. Żeby ten zysk poprawnie ustalić, musisz znać cost basis, czyli podstawę kosztową inwestycji. Błąd w jej wyliczeniu prowadzi wprost do zapłaty za wysokiego lub za niskiego podatku. W tym poradniku pokażemy, czym jest cost basis, jak ją policzyć przy wielu zakupach i jakie metody stosuje się w praktyce.</p>
<p>Zastrzeżenie: to materiał informacyjny, a nie porada podatkowa. Szczegóły rozliczenia zależą od Twojej sytuacji i przepisów — w razie wątpliwości skonsultuj się z księgowym lub doradcą podatkowym.</p>

<h2>Czym jest cost basis</h2>
<p>Cost basis, po polsku podstawa kosztowa, to łączny koszt, jaki poniosłeś, nabywając dane aktywo. Obejmuje nie tylko cenę zakupu, ale też prowizje maklerskie i inne opłaty transakcyjne związane z nabyciem. To od tej wartości odejmuje się przychód ze sprzedaży, żeby ustalić zysk lub stratę.</p>
<blockquote>Zysk do opodatkowania = przychód ze sprzedaży (po odjęciu kosztów sprzedaży) minus cost basis (koszt nabycia z prowizjami).</blockquote>
<p>Przykład: kupujesz 10 akcji po 100 zł i płacisz 5 zł prowizji. Twój cost basis to 1005 zł. Jeśli sprzedasz je za 1500 zł, płacąc 5 zł prowizji od sprzedaży, zysk wyniesie 1500 minus 5 minus 1005, czyli 490 zł. To od tych 490 zł, a nie od 1500 zł, liczy się podatek.</p>

<h2>Dlaczego cost basis jest tak ważny podatkowo</h2>
<p>W Polsce zysk ze sprzedaży akcji, ETF czy krypto podlega 19-procentowemu podatkowi od zysków kapitałowych, potocznie zwanemu podatkiem Belki. Podstawą jego naliczenia jest właśnie zysk, czyli różnica między przychodem a cost basis. Im dokładniej ustalisz podstawę kosztową, tym trafniej policzysz należny podatek. Szczegóły samego podatku opisujemy w poradniku o tym, <a href="/poradniki/podatek-belki-jak-obliczyc">jak obliczyć podatek Belki</a>.</p>
<p>Konsekwencja jest praktyczna: jeśli zapomnisz uwzględnić część kosztów nabycia albo zaniżysz podstawę, zapłacisz wyższy podatek, niż powinieneś. Dlatego rejestrowanie każdej transakcji z ceną i prowizją to nie biurokracja, lecz realna oszczędność.</p>

<h2>Jak liczyć cost basis przy wielu zakupach</h2>
<p>Sprawa jest prosta, gdy kupiłeś wszystko raz. Komplikuje się, gdy nabywałeś to samo aktywo w kilku transzach po różnych cenach — na przykład stosując <a href="/poradniki/usrednianie-ceny-dca">uśrednianie ceny (DCA)</a> — a teraz sprzedajesz tylko część. Wtedy trzeba zdecydować, które konkretnie jednostki sprzedajesz. Stosuje się dwie główne metody.</p>

<h3>Metoda FIFO (pierwsze weszło, pierwsze wyszło)</h3>
<p>FIFO zakłada, że sprzedajesz najpierw najstarsze posiadane jednostki. To domyślne podejście w wielu rozliczeniach. Przy sprzedaży bierzesz cost basis z najwcześniejszych zakupów, aż do wyczerpania sprzedawanej liczby.</p>

<h3>Metoda średniej ważonej</h3>
<p>Tu liczysz średni koszt jednej jednostki, dzieląc łączny koszt wszystkich zakupów przez łączną liczbę nabytych jednostek. Ta średnia staje się cost basis każdej sprzedawanej jednostki, niezależnie od kolejności zakupów.</p>

<table>
<thead>
<tr><th>Zakup</th><th>Liczba</th><th>Cena za sztukę</th><th>Koszt</th></tr>
</thead>
<tbody>
<tr><td>Styczeń</td><td>10</td><td>100 zł</td><td>1000 zł</td></tr>
<tr><td>Marzec</td><td>10</td><td>120 zł</td><td>1200 zł</td></tr>
<tr><td>Maj</td><td>10</td><td>140 zł</td><td>1400 zł</td></tr>
<tr><td><strong>Razem</strong></td><td><strong>30</strong></td><td><strong>—</strong></td><td><strong>3600 zł</strong></td></tr>
</tbody>
</table>

<p>Załóżmy, że sprzedajesz 15 sztuk. Przy metodzie FIFO sprzedajesz 10 sztuk ze stycznia (koszt 1000 zł) i 5 sztuk z marca (koszt 600 zł), więc cost basis wynosi 1600 zł. Przy metodzie średniej ważonej średni koszt jednej sztuki to 3600 podzielone przez 30, czyli 120 zł, więc cost basis 15 sztuk to 1800 zł. Wybór metody wpływa na wykazany zysk, a więc na podatek.</p>

<h2>Porównanie metod na liczbach: ile podatku zapłacisz</h2>
<p>Wróćmy do przykładu z trzema zakupami po 30 sztuk łącznie za 3600 zł. Sprzedajesz 15 sztuk po 160 zł, czyli za 2400 zł przychodu. Zobacz, jak wybór metody zmienia cost basis, zysk i podatek Belki (19 procent). Dla uproszczenia pomijamy tu prowizje.</p>
<table>
<thead>
<tr><th>Metoda</th><th>Cost basis 15 szt.</th><th>Przychód</th><th>Zysk</th><th>Podatek 19%</th></tr>
</thead>
<tbody>
<tr><td>FIFO (10 szt. ze stycznia + 5 szt. z marca)</td><td>1600 zł</td><td>2400 zł</td><td>800 zł</td><td>152 zł</td></tr>
<tr><td>Średnia ważona (120 zł za szt.)</td><td>1800 zł</td><td>2400 zł</td><td>600 zł</td><td>114 zł</td></tr>
</tbody>
</table>
<p>Różnica w podatku to 38 zł na jednej transakcji, wynikająca wyłącznie z metody przypisania kosztu. Uwaga: to nie jest realna oszczędność, tylko przesunięcie w czasie. Jednostki, których teraz nie przypiszesz do sprzedaży, zachowają swój koszt na przyszłość. Przy metodzie FIFO w portfelu zostaje 15 sztuk z wyższym średnim kosztem (z maja i z części marca), więc następna sprzedaż wykaże mniejszy zysk. Ważne jest, aby dla danego aktywa trzymać się jednej, spójnej metody i nie zmieniać jej z transakcji na transakcję.</p>

<h2>Przykład krok po kroku: pełne rozliczenie sprzedaży</h2>
<p>Prześledźmy realistyczny scenariusz z prowizjami, żeby zobaczyć każdy element wzoru osobno. Załóżmy trzy zakupy akcji jednej spółki, a potem częściową sprzedaż metodą FIFO.</p>
<ol>
<li><strong>Zakup 1:</strong> 20 akcji po 50 zł = 1000 zł, prowizja 8 zł. Cost basis transzy = 1008 zł.</li>
<li><strong>Zakup 2:</strong> 20 akcji po 65 zł = 1300 zł, prowizja 10 zł. Cost basis transzy = 1310 zł.</li>
<li><strong>Sprzedaż:</strong> 30 akcji po 90 zł = 2700 zł przychodu, prowizja od sprzedaży 15 zł.</li>
</ol>
<p>Metodą FIFO sprzedajesz najpierw wszystkie 20 akcji z zakupu 1 (koszt 1008 zł) oraz 10 akcji z zakupu 2. Koszt 10 akcji z drugiej transzy to połowa z 1310 zł, czyli 655 zł. Łączny cost basis sprzedanych 30 akcji wynosi 1008 + 655 = 1663 zł.</p>
<p>Przychód pomniejszasz o prowizję od sprzedaży: 2700 minus 15 = 2685 zł. Zysk do opodatkowania to 2685 minus 1663 = 1022 zł. Podatek Belki (19 procent) wynosi 194,18 zł. Po transakcji w portfelu zostaje 10 akcji z drugiej transzy o zachowanym cost basis 655 zł — ta wartość posłuży do rozliczenia przy kolejnej sprzedaży.</p>

<h2>Cost basis w obcej walucie: przykład w USD</h2>
<p>Gdy kupujesz akcje amerykańskie za dolary, do rozliczenia w Polsce koszt i przychód przeliczasz na złote po kursie z dnia poprzedzającego transakcję. To częste źródło błędów, bo kurs zmienia się między zakupem a sprzedażą.</p>
<table>
<thead>
<tr><th>Zdarzenie</th><th>Kwota w USD</th><th>Kurs USD/PLN</th><th>Wartość w zł</th></tr>
</thead>
<tbody>
<tr><td>Zakup 10 akcji</td><td>1000 USD</td><td>3,90</td><td>3900 zł</td></tr>
<tr><td>Prowizja zakupu</td><td>5 USD</td><td>3,90</td><td>19,50 zł</td></tr>
<tr><td>Sprzedaż 10 akcji</td><td>1200 USD</td><td>4,10</td><td>4920 zł</td></tr>
</tbody>
</table>
<p>Cost basis to 3900 + 19,50 = 3919,50 zł. Przychód po przeliczeniu to 4920 zł. Zysk wynosi 4920 minus 3919,50 = 1000,50 zł, a podatek 190,10 zł. Zwróć uwagę na efekt kursowy: w dolarach zarobiłeś 200 USD (20 procent), ale w złotych zysk jest wyższy, bo dolar w międzyczasie się umocnił. Gdyby kurs spadł, część zysku dolarowego mogłaby zniknąć w przeliczeniu na złote. Dlatego przy aktywach walutowych zawsze zapisuj kwotę, walutę, datę i kurs.</p>

<h2>Scenariusze, które komplikują cost basis</h2>
<p>Poza zwykłym kupnem i sprzedażą pojawiają się zdarzenia, które zmieniają podstawę kosztową. Warto je znać, żeby nie policzyć zysku błędnie.</p>
<ul>
<li><strong>Reinwestycja dywidend.</strong> Jeśli dywidenda automatycznie kupuje kolejne jednostki, każdy taki zakup ma własny cost basis równy zainwestowanej kwocie. To nowa transza, którą trzeba dopisać do rejestru.</li>
<li><strong>Split akcji.</strong> Podział akcji (np. 1 na 2) nie zmienia łącznego cost basis, ale rozkłada go na większą liczbę tańszych jednostek. Koszt na sztukę spada, całkowita podstawa zostaje ta sama.</li>
<li><strong>Częściowa sprzedaż.</strong> Po sprzedaży części pozycji musisz wiedzieć, które jednostki zostały w portfelu i z jakim kosztem, bo one wejdą do następnego rozliczenia.</li>
<li><strong>Kompensacja straty.</strong> Strata z jednej sprzedaży pomniejsza zysk z innej w tym samym roku podatkowym. Rzetelny cost basis pozwala tę stratę udokumentować i realnie obniżyć podatek.</li>
</ul>

<h2>Najczęstsze błędy przy liczeniu cost basis</h2>
<ul>
<li><strong>Pomijanie prowizji.</strong> Prowizje od zakupu powiększają cost basis, a od sprzedaży pomniejszają przychód. Ich pominięcie zawyża zysk.</li>
<li><strong>Ignorowanie różnicy kursowej.</strong> Przy zakupach w USD lub EUR koszt przelicza się na złote po odpowiednim kursie z dnia transakcji — pominięcie tego zniekształca podstawę.</li>
<li><strong>Mieszanie metod.</strong> Raz FIFO, raz średnia — dla jednego aktywa trzymaj się jednej, spójnej metody.</li>
<li><strong>Brak rejestru zakupów.</strong> Bez zapisanych dat, cen i prowizji odtworzenie cost basis po latach jest bardzo trudne.</li>
<li><strong>Wycena po cenie zakupu zamiast po transzach.</strong> Przy częściowej sprzedaży nie dziel kosztu całej pozycji na oko — przypisz konkretne transze zgodnie z wybraną metodą.</li>
</ul>

<h2>Checklista: policz cost basis w pięciu krokach</h2>
<p>Zanim wpiszesz zysk do rozliczenia, przejdź tę listę dla każdej sprzedaży. Fragment jest samowystarczalny — możesz go stosować niezależnie od aktywa.</p>
<ol>
<li><strong>Zbierz transze zakupu.</strong> Wypisz datę, liczbę jednostek, cenę i prowizję każdego zakupu danego aktywa.</li>
<li><strong>Wybierz metodę.</strong> FIFO albo średnia ważona — jedna i ta sama dla całego aktywa.</li>
<li><strong>Przypisz koszt sprzedawanych jednostek.</strong> Zsumuj cost basis dokładnie tylu jednostek, ile sprzedajesz, wraz z prowizjami zakupu.</li>
<li><strong>Policz przychód netto.</strong> Cena sprzedaży minus prowizja od sprzedaży, po przeliczeniu na złote, jeśli waluta jest obca.</li>
<li><strong>Odejmij i opodatkuj.</strong> Zysk = przychód netto minus cost basis. Podatek to 19 procent zysku, a straty z roku możesz skompensować.</li>
</ol>

<h2>Jak SzpontHub pomaga liczyć cost basis</h2>
<p>Ręczne odtwarzanie podstawy kosztowej z wielu zakupów po różnych cenach i w różnych walutach jest żmudne i podatne na pomyłki. W SzpontHub rejestrujesz każdy zakup akcji lub krypto z ceną i datą, a aplikacja prowadzi Twoje aktywa w portfelach wielowalutowych (PLN, USD, EUR) i uwzględnia podatek Belki przy wyliczaniu wyniku. Dzięki temu masz uporządkowaną historię transakcji w jednym miejscu, na podstawie której łatwiej ustalisz zysk i realny koszt nabycia. To materiał informacyjny — ostateczne rozliczenie podatkowe warto potwierdzić z księgowym.</p>
`,
  faq: [
    {
      q: 'Co to jest cost basis?',
      a: 'Cost basis, czyli podstawa kosztowa, to łączny koszt nabycia aktywa wraz z prowizjami i opłatami transakcyjnymi. Od tej wartości odejmuje się przychód ze sprzedaży, żeby ustalić zysk lub stratę. To ona decyduje o wysokości podatku od zysków kapitałowych.',
    },
    {
      q: 'Jak obliczyć zysk do opodatkowania z inwestycji?',
      a: 'Zysk to przychód ze sprzedaży pomniejszony o koszty sprzedaży i o cost basis, czyli koszt nabycia z prowizjami. Na przykład przy zakupie za 1005 zł i sprzedaży za 1495 zł netto zysk wynosi 490 zł. Podatek liczy się od zysku, a nie od całej kwoty sprzedaży.',
    },
    {
      q: 'Czym różni się metoda FIFO od średniej ważonej?',
      a: 'FIFO zakłada, że sprzedajesz najpierw najstarsze jednostki, więc cost basis pochodzi z najwcześniejszych zakupów. Metoda średniej ważonej używa średniego kosztu jednej jednostki z wszystkich zakupów. Wybór metody wpływa na wykazany zysk, a więc na należny podatek.',
    },
    {
      q: 'Czy prowizje wliczają się do cost basis?',
      a: 'Tak. Prowizje i opłaty poniesione przy zakupie powiększają cost basis, a prowizje od sprzedaży pomniejszają przychód. Pominięcie ich zawyża wykazany zysk i prowadzi do zapłaty wyższego podatku, niż powinieneś.',
    },
    {
      q: 'Jaki podatek płaci się od zysku z inwestycji w Polsce?',
      a: 'Od zysku ze sprzedaży akcji, ETF czy kryptowalut obowiązuje 19-procentowy podatek od zysków kapitałowych, potocznie zwany podatkiem Belki. Jego podstawą jest zysk, czyli różnica między przychodem a cost basis. To materiał informacyjny, a nie porada podatkowa.',
    },
    {
      q: 'Jak liczyć cost basis przy zakupach w obcej walucie?',
      a: 'Koszt nabycia w USD lub EUR przelicza się na złote po odpowiednim kursie z dnia transakcji, zgodnie z zasadami rozliczenia. Pominięcie różnic kursowych zniekształca podstawę kosztową. Warto rejestrować kwotę, walutę i datę każdego zakupu.',
    },
    {
      q: 'Czy strata z inwestycji obniża podatek od innych zysków?',
      a: 'Tak. Strata ze sprzedaży jednego aktywa pomniejsza zysk z innego w tym samym roku podatkowym, więc zmniejsza łączny podatek Belki. Żeby móc ją wykazać, potrzebujesz rzetelnie policzonego cost basis obu transakcji. To materiał informacyjny, a nie porada podatkowa.',
    },
    {
      q: 'Jak split akcji wpływa na cost basis?',
      a: 'Podział akcji nie zmienia łącznej podstawy kosztowej — rozkłada ją tylko na większą liczbę tańszych jednostek. Jeśli miałeś 10 akcji o koszcie 1000 zł, po splicie 1 na 2 masz 20 akcji nadal o łącznym koszcie 1000 zł, czyli 50 zł za sztukę. Reinwestowana dywidenda działa inaczej: tworzy nową transzę z własnym kosztem.',
    },
  ],
};

export default article;
