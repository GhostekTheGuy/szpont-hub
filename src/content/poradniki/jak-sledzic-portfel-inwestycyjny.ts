import type { Article } from './types';

const article: Article = {
  slug: 'jak-sledzic-portfel-inwestycyjny',
  title: 'Jak śledzić portfel inwestycyjny — metody, wskaźniki, narzędzia',
  description:
    'Jak monitorować portfel inwestycyjny: co śledzić, jak liczyć wynik i alokację, jak często zaglądać i jak robić rebalancing. Tabela wskaźników i praktyczny system.',
  category: 'inwestycje',
  tags: ['portfel inwestycyjny', 'monitorowanie inwestycji', 'alokacja', 'rebalancing'],
  tldr:
    'Śledzenie portfela to regularne kontrolowanie jego wartości, wyniku (stopy zwrotu), alokacji między klasami aktywów oraz odchylenia od założonego planu. Nie chodzi o codzienne zaglądanie w ceny, lecz o okresowy przegląd (raz na kwartał lub pół roku), który pozwala policzyć realny zysk po kosztach i podatku oraz wykonać rebalancing. Kluczowe jest mierzenie całego portfela w jednej walucie i porównywanie z celem, a nie śledzenie pojedynczych aktywów w oderwaniu od reszty. To materiał informacyjny.',
  keyTakeaways: [
    'Śledź cztery rzeczy: wartość, stopę zwrotu, alokację i odchylenie od planu.',
    'Codzienne sprawdzanie cen szkodzi — wystarczy przegląd raz na kwartał lub pół roku.',
    'Licz wynik realny: po kosztach, podatku Belki i z uwzględnieniem walut.',
    'Rebalancing przywraca założone proporcje, gdy jedna klasa aktywów urośnie za mocno.',
    'Najważniejsze jest widzenie całego portfela w jednym miejscu i w jednej walucie.',
  ],
  published: '2026-07-09',
  readingMinutes: 9,
  bodyHtml: `
<p>Zbudowanie portfela to dopiero początek. Bez regularnego monitorowania nie wiesz, czy realizujesz swój plan, czy Twoja alokacja się nie rozjechała i czy faktycznie zarabiasz po kosztach i podatku. Jednocześnie śledzenie portfela nie oznacza gapienia się na wykresy co godzinę — to szkodzi. W tym poradniku pokażemy, co, jak i jak często śledzić, żeby mieć kontrolę bez nerwów. To materiał informacyjny, a nie doradztwo inwestycyjne — decyzje o zakupie lub sprzedaży aktywów podejmujesz na własną odpowiedzialność.</p>

<h2>Co właściwie śledzić</h2>
<p>Śledzenie portfela sprowadza się do czterech wielkości. Reszta to szum.</p>
<ul>
<li><strong>Wartość całkowita</strong> — ile wart jest cały portfel dziś, w jednej walucie odniesienia (najczęściej w złotych).</li>
<li><strong>Stopa zwrotu</strong> — ile zarobiłeś lub straciłeś, najlepiej w ujęciu rocznym i realnym. Jak ją liczyć, opisujemy w tekście o tym, <a href="/poradniki/jak-obliczyc-zysk-z-inwestycji">jak obliczyć zysk z inwestycji</a>.</li>
<li><strong>Alokacja</strong> — jaki procent kapitału siedzi w każdej klasie aktywów (akcje, obligacje, gotówka, krypto).</li>
<li><strong>Odchylenie od planu</strong> — jak daleko bieżąca alokacja odbiegła od tej, którą założyłeś na starcie.</li>
</ul>
<p>Te cztery liczby wystarczą, by odpowiedzieć na jedyne pytanie, które naprawdę się liczy: czy portfel wciąż realizuje mój cel przy ryzyku, które akceptuję. Cała reszta — dzienne notowania, nagłówki, komentarze analityków — to informacje, na które i tak nie zareagujesz sensownie przy horyzoncie liczonym w latach.</p>

<blockquote>Nie śledzisz cen po to, by reagować na każdy ruch. Śledzisz alokację i wynik, by pilnować, czy portfel wciąż realizuje Twój plan.</blockquote>

<h2>Jak liczyć wynik uczciwie</h2>
<p>Największy błąd to patrzenie na saldo bez kontekstu wpłat. Jeśli portfel urósł z 40 000 zł do 50 000 zł, ale w międzyczasie dopłaciłeś 8000 zł, Twój realny zysk to 2000 zł, a nie 10 000 zł. Dlatego przy każdym przeglądzie oddzielaj wpłaty od zysku.</p>
<p>Uczciwy wynik uwzględnia też koszty i podatki. Prowizje maklerskie, spready walutowe i 19% podatku Belki od zysku potrafią zauważalnie obniżyć rezultat widoczny na wyciągu. Jeśli inwestujesz w walutach obcych, przelicz wszystko na jedną walutę, bo inaczej wynik jest zniekształcony przez zmiany kursów.</p>
<p>Prosty wzór na wynik brutto wygląda tak: <strong>zysk = wartość końcowa − wartość początkowa − suma wpłat + suma wypłat</strong>. Dopiero od tak policzonego zysku odejmujesz koszty i podatek, żeby otrzymać rezultat netto. Przykład: portfel startuje z 30 000 zł, kończy rok na 41 000 zł, w trakcie dopłaciłeś 7000 zł. Zysk brutto to 41 000 − 30 000 − 7000 = 4000 zł. Po podatku Belki (19% z 4000 zł, czyli 760 zł) zostaje 3240 zł, a jeśli inflacja wyniosła 4%, to realna wartość zysku spada o kolejne około 1600 zł liczone od całego kapitału. Widać, jak łatwo pomylić 11 000 zł przyrostu salda z realnym zarobkiem.</p>

<table>
<thead>
<tr><th>Wskaźnik</th><th>Co mówi</th><th>Jak liczyć</th></tr>
</thead>
<tbody>
<tr><td>Wartość portfela</td><td>ile masz łącznie dziś</td><td>suma pozycji w jednej walucie</td></tr>
<tr><td>Zysk realny</td><td>ile zarobiłeś po kosztach i inflacji</td><td>wynik minus wpłaty, koszty, podatek, inflacja</td></tr>
<tr><td>Stopa zwrotu roczna (CAGR)</td><td>tempo zysku w skali roku</td><td>uśredniony wynik roczny z uwzględnieniem składania</td></tr>
<tr><td>Alokacja</td><td>rozkład ryzyka</td><td>udział każdej klasy aktywów w procentach</td></tr>
<tr><td>Odchylenie od celu</td><td>czy trzeba rebalansować</td><td>różnica między bieżącą a docelową alokacją</td></tr>
<tr><td>Maksymalne obsunięcie</td><td>najgłębszy spadek od szczytu</td><td>największa różnica między szczytem a późniejszym dołkiem</td></tr>
</tbody>
</table>
<p>Maksymalne obsunięcie (drawdown) to wskaźnik, który wielu inwestorów pomija, a mówi więcej o realnym ryzyku niż sama stopa zwrotu. Portfel, który zarobił 8% rocznie, ale po drodze spadał o 35% od szczytu, jest zupełnie inny niż taki, który dał te same 8% przy obsunięciu 12%. Ten drugi łatwiej wytrzymać psychicznie i mniejsze jest ryzyko, że sprzedasz w panice na dołku.</p>

<h2>Alokacja aktywów — jak ją ustalić i mierzyć</h2>
<p>Alokacja to najważniejsza decyzja w całym procesie, bo to ona, a nie wybór konkretnych spółek, w największym stopniu decyduje o zmienności i długoterminowym wyniku portfela. Ustalasz ją raz, na podstawie horyzontu i tolerancji ryzyka, a potem tylko pilnujesz, żeby się nie rozjechała.</p>
<p>Pomiar jest prosty: udział klasy aktywów = wartość tej klasy podzielona przez wartość całego portfela, razy 100%. Portfel wart 100 000 zł, w którym akcje to 68 000 zł, ma 68% w akcjach. Poniżej trzy przykładowe profile — to punkty odniesienia, nie rekomendacja dla Twojej sytuacji.</p>
<table>
<thead>
<tr><th>Profil</th><th>Akcje</th><th>Obligacje</th><th>Gotówka</th><th>Krypto/inne</th></tr>
</thead>
<tbody>
<tr><td>Ostrożny (krótki horyzont)</td><td>30%</td><td>50%</td><td>15%</td><td>5%</td></tr>
<tr><td>Zrównoważony</td><td>55%</td><td>30%</td><td>10%</td><td>5%</td></tr>
<tr><td>Ofensywny (długi horyzont)</td><td>75%</td><td>10%</td><td>5%</td><td>10%</td></tr>
</tbody>
</table>
<p>Kiedy masz zapisaną docelową alokację, śledzenie sprowadza się do porównania: ile procent w każdej klasie masz dziś kontra ile chciałeś mieć. Różnica w punktach procentowych to Twoje odchylenie — sygnał, kiedy sięgnąć po rebalancing.</p>

<h2>Jak często zaglądać do portfela</h2>
<p>Częstotliwość przeglądu powinna zależeć od Twojego horyzontu, a nie od emocji. Dla inwestora długoterminowego codzienne sprawdzanie cen jest wręcz szkodliwe: podbija stres, prowokuje pochopne decyzje i wystawia Cię na tak zwaną awersję do straty, która sprawia, że spadki bolą bardziej, niż cieszą wzrosty.</p>
<table>
<thead>
<tr><th>Typ inwestora</th><th>Zalecana częstotliwość przeglądu</th></tr>
</thead>
<tbody>
<tr><td>Długoterminowy (emerytura, ETF-y)</td><td>raz na kwartał lub pół roku</td></tr>
<tr><td>Aktywny, mieszany portfel</td><td>raz w miesiącu</td></tr>
<tr><td>Krótkoterminowy, spekulacyjny</td><td>częściej, ale świadomie ograniczaj</td></tr>
</tbody>
</table>
<p>Dla większości osób budujących majątek na lata przegląd kwartalny w zupełności wystarcza. O tym, jak nie ulegać emocjom między przeglądami, piszemy w tekście o <a href="/poradniki/bledy-poznawcze-inwestora">błędach poznawczych inwestora</a>. Dobra zasada: ustal z góry stały dzień przeglądu (np. pierwszy weekend kwartału) i trzymaj się go niezależnie od tego, czy rynek rośnie, czy spada. Przeglądy robione pod wpływem nagłówków niemal zawsze kończą się gorszymi decyzjami niż te robione według kalendarza.</p>

<h2>Rebalancing — przywracanie proporcji</h2>
<p>Z czasem alokacja portfela zmienia się sama, bo różne aktywa rosną w różnym tempie. Jeśli założyłeś 60% akcji i 40% obligacji, a akcje mocno urosły, możesz mieć nagle 75% akcji — a więc znacznie więcej ryzyka, niż planowałeś. Rebalancing to sprzedaż części tego, co urosło, i dokupienie tego, co zostało w tyle, żeby wrócić do docelowych proporcji.</p>
<ol>
<li><strong>Ustal docelową alokację</strong> na starcie (np. 60/40) i zapisz ją.</li>
<li><strong>Sprawdzaj odchylenie</strong> przy każdym okresowym przeglądzie.</li>
<li><strong>Rebalansuj po przekroczeniu progu</strong>, na przykład gdy klasa aktywów odchyli się o więcej niż 5 punktów procentowych.</li>
<li><strong>Rozważ rebalancing wpłatami</strong> — zamiast sprzedawać, kieruj nowe wpłaty do klasy, która została w tyle. To ogranicza podatek i prowizje.</li>
</ol>
<p>Nie rebalansuj zbyt często — każda transakcja to prowizja i potencjalnie podatek Belki od realizowanego zysku. Dwa sprawdzone podejścia to rebalancing kalendarzowy (raz w roku, niezależnie od odchyleń) i rebalancing progowy (dopiero gdy odchylenie przekroczy 5 punktów procentowych). W praktyce dobrze łączyć oba: sprawdzasz co kwartał, ale realnie ruszasz portfel tylko wtedy, gdy próg zostanie przekroczony.</p>

<h2>Przykład: przegląd portfela 100 000 zł krok po kroku</h2>
<p>Załóżmy plan 60% akcji i 40% obligacji przy kapitale 100 000 zł, czyli docelowo 60 000 zł akcji i 40 000 zł obligacji. Po roku dobrej hossy akcje urosły do 78 000 zł, a obligacje spadły do 37 000 zł. Portfel jest wart 115 000 zł, ale jego struktura się rozjechała.</p>
<table>
<thead>
<tr><th>Klasa aktywów</th><th>Cel</th><th>Stan po roku</th><th>Udział bieżący</th><th>Odchylenie</th></tr>
</thead>
<tbody>
<tr><td>Akcje</td><td>60%</td><td>78 000 zł</td><td>68%</td><td>+8 pkt</td></tr>
<tr><td>Obligacje</td><td>40%</td><td>37 000 zł</td><td>32%</td><td>−8 pkt</td></tr>
<tr><td>Razem</td><td>100%</td><td>115 000 zł</td><td>100%</td><td>—</td></tr>
</tbody>
</table>
<p>Odchylenie 8 punktów przekracza próg 5 punktów, więc rebalancing jest uzasadniony. Docelowo chcesz 60% z 115 000 zł, czyli 69 000 zł w akcjach i 46 000 zł w obligacjach. Trzeba sprzedać akcje za 9000 zł i za tę kwotę dokupić obligacji. Jeśli sprzedaż akcji realizuje zysk, zapłacisz od niego 19% podatku Belki — dlatego, jeśli akurat planujesz nową wpłatę, taniej jest skierować świeże 9000 zł na obligacje i uniknąć sprzedaży w ogóle. Efekt ten sam, koszt podatkowy zerowy.</p>

<h2>Porównanie metod śledzenia portfela</h2>
<p>Nie istnieje jedna słuszna metoda — wybór zależy od liczby aktywów i tego, ile masz cierpliwości do ręcznej pracy. Poniżej trzy najpopularniejsze podejścia.</p>
<table>
<thead>
<tr><th>Metoda</th><th>Zalety</th><th>Wady</th></tr>
</thead>
<tbody>
<tr><td>Arkusz kalkulacyjny</td><td>darmowy, pełna kontrola, dowolne wzory</td><td>ręczne wpisywanie kursów, łatwo o błąd, brak automatyzacji podatku</td></tr>
<tr><td>Panel maklera</td><td>dane aktualne automatycznie</td><td>widzi tylko aktywa z tego jednego konta, pomija krypto i gotówkę</td></tr>
<tr><td>Aplikacja do portfela (np. SzpontHub)</td><td>całość w jednej walucie, podatek Belki, wiele kont razem</td><td>trzeba raz skonfigurować i wprowadzić pozycje</td></tr>
</tbody>
</table>
<p>Dla portfela z jednego konta maklerskiego panel brokera zwykle wystarcza. Gdy aktywa są rozproszone — akcje u jednego brokera, ETF-y u drugiego, krypto na giełdzie, gotówka w banku — arkusz szybko robi się nie do utrzymania, a aplikacja spinająca wszystko w jednym widoku oszczędza kilka godzin miesięcznie i eliminuje błędy przepisywania.</p>

<h2>Checklista kwartalnego przeglądu</h2>
<p>Przejdź przez te punkty przy każdym przeglądzie — cała procedura zajmuje kilkanaście minut.</p>
<ol>
<li>Zsumuj wartość wszystkich aktywów w jednej walucie (PLN).</li>
<li>Odejmij wpłaty z kwartału, żeby zobaczyć realny wynik, a nie przyrost z dopłat.</li>
<li>Policz udział każdej klasy aktywów i porównaj z docelową alokacją.</li>
<li>Sprawdź, czy odchylenie którejkolwiek klasy przekroczyło próg (np. 5 punktów procentowych).</li>
<li>Jeśli tak — rebalansuj, najlepiej wpłatami, by ograniczyć podatek i prowizje.</li>
<li>Zapisz wartość i wynik, żeby mieć historię do porównania w kolejnym kwartale.</li>
</ol>

<h2>Najczęstsze błędy w śledzeniu portfela</h2>
<ul>
<li><strong>Codzienne sprawdzanie cen</strong> — stres i pochopne decyzje bez korzyści dla wyniku.</li>
<li><strong>Mylenie wpłat z zyskiem</strong> — zawyżanie realnego rezultatu przez traktowanie własnych dopłat jak zarobku.</li>
<li><strong>Śledzenie aktywów osobno</strong> zamiast całości — traci się z oczu alokację i ryzyko portfela.</li>
<li><strong>Ignorowanie walut</strong> — brak przeliczenia na jedną walutę zniekształca wynik.</li>
<li><strong>Brak rebalancingu</strong> — portfel z czasem staje się bardziej ryzykowny, niż zakładałeś.</li>
<li><strong>Pomijanie podatku i kosztów</strong> — wynik brutto wygląda ładniej, ale na konto trafia kwota po prowizjach i po podatku Belki.</li>
<li><strong>Brak zapisanej historii</strong> — bez wcześniejszych danych nie ocenisz, czy portfel faktycznie się rozwija.</li>
</ul>

<h2>Jak SzpontHub pomaga śledzić portfel</h2>
<p>Największą przeszkodą w monitorowaniu portfela jest rozproszenie danych: część aktywów na jednej giełdzie, część na drugiej, gotówka w banku, krypto osobno. W SzpontHub prowadzisz aktywa i inwestycje (akcje, krypto) razem z portfelami wielowalutowymi (PLN, USD, EUR), więc widzisz całą wartość w jednej walucie i realny udział każdej klasy aktywów. Aplikacja uwzględnia podatek Belki, a raporty AI pomagają spojrzeć na wynik i alokację całościowo, zamiast liczyć wszystko ręcznie w arkuszu. Jak potem oceniać ryzyko takiej struktury, opisujemy w tekście o tym, <a href="/poradniki/ryzyko-inwestycyjne-jak-oceniac">jak oceniać ryzyko inwestycyjne</a>.</p>
`,
  faq: [
    {
      q: 'Jak śledzić portfel inwestycyjny?',
      a: 'Regularnie kontroluj cztery rzeczy: łączną wartość portfela w jednej walucie, stopę zwrotu (najlepiej roczną i realną), alokację między klasami aktywów oraz odchylenie od założonego planu. Nie chodzi o codzienne patrzenie w ceny, lecz o okresowy przegląd, zwykle raz na kwartał.',
    },
    {
      q: 'Jak często sprawdzać portfel inwestycyjny?',
      a: 'Dla inwestora długoterminowego wystarczy przegląd raz na kwartał lub pół roku. Codzienne sprawdzanie cen zwiększa stres i prowokuje pochopne decyzje bez poprawy wyniku. Częstotliwość powinna zależeć od horyzontu inwestycji, a nie od emocji.',
    },
    {
      q: 'Co to jest rebalancing portfela?',
      a: 'To przywracanie założonych proporcji między klasami aktywów. Gdy jedna z nich mocno urośnie, jej udział przekracza plan, zwiększając ryzyko. Rebalancing polega na sprzedaży części tego, co urosło, i dokupieniu tego, co zostało w tyle, albo na kierowaniu nowych wpłat do niedoważonej klasy.',
    },
    {
      q: 'Jak policzyć realny wynik portfela?',
      a: 'Oddziel wpłaty od zysku, bo dopłaty nie są zarobkiem. Następnie uwzględnij koszty (prowizje, spready), podatek Belki 19% od zysku oraz przelicz aktywa w obcych walutach na jedną walutę. Dopiero taki wynik, najlepiej pomniejszony jeszcze o inflację, pokazuje realny rezultat.',
    },
    {
      q: 'Czy trzeba przeliczać portfel na jedną walutę?',
      a: 'Tak, jeśli masz aktywa w różnych walutach. Bez przeliczenia na wspólną walutę wynik jest zniekształcony przez zmiany kursów i trudno porównać pozycje. Najczęściej portfel sprowadza się do złotego, aby zobaczyć realną wartość i alokację całości.',
    },
    {
      q: 'Kiedy robić rebalancing?',
      a: 'Najczęściej przy okresowym przeglądzie, gdy alokacja odchyli się od celu o ustalony próg, na przykład ponad 5 punktów procentowych. Dobrym, tańszym podatkowo sposobem jest rebalancing wpłatami, czyli kierowanie nowych środków do klasy aktywów, która została w tyle.',
    },
  ],
};

export default article;
