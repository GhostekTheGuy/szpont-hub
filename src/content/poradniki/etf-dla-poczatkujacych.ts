import type { Article } from './types';

const article: Article = {
  slug: 'etf-dla-poczatkujacych',
  title: 'ETF dla początkujących — jak zacząć i co wybrać',
  description:
    'Co to jest ETF, jak działa i jak wybrać pierwszy fundusz: akumulujący czy dystrybucyjny, koszty TER, replikacja. Prosty plan startu i tabela porównawcza.',
  category: 'inwestycje',
  tags: ['ETF', 'fundusze indeksowe', 'inwestowanie pasywne', 'początkujący inwestor'],
  tldr:
    'ETF to fundusz notowany na giełdzie, który jednym zakupem daje Ci udział w całym koszyku spółek lub obligacji — najczęściej odwzorowuje indeks, na przykład globalny rynek akcji. Dla początkującego najprostszym startem jest jeden szeroki, tani ETF akcyjny (niski wskaźnik kosztów TER) w wersji akumulującej, kupowany regularnie. Wybierając fundusz, patrz na indeks bazowy, koszt roczny, sposób replikacji i to, czy dywidendy są reinwestowane, czy wypłacane.',
  keyTakeaways: [
    'ETF jednym zakupem daje ekspozycję na cały koszyk spółek — to gotowa dywersyfikacja.',
    'Wskaźnik kosztów TER to najważniejsza opłata: im niższy, tym więcej zostaje Tobie.',
    'ETF akumulujący reinwestuje dywidendy automatycznie; dystrybucyjny wypłaca je na konto.',
    'Na start wystarczy jeden szeroki, tani ETF na globalny indeks akcji, kupowany regularnie.',
    'ETF to inwestowanie pasywne — nie próbujesz pobić rynku, tylko podążasz za nim tanim kosztem.',
    'Różnica TER 0,20% vs 1,50% rocznie to po 20 latach dziesiątki tysięcy zł mniej w portfelu.',
    'Od zysku i dywidend zapłacisz 19% podatku Belki — w ETF akumulującym podatek od dywidend jest odroczony.',
  ],
  published: '2026-07-09',
  readingMinutes: 12,
  bodyHtml: `
<p>ETF-y stały się domyślnym narzędziem inwestowania pasywnego i nie bez powodu — jednym zakupem kupujesz udział w setkach spółek, płacisz niewielkie opłaty i nie musisz analizować pojedynczych firm. Dla początkującego to zwykle najrozsądniejszy sposób wejścia na rynek. W tym poradniku wyjaśnimy, czym jest ETF, jak wybrać pierwszy fundusz i na co uważać.</p>

<h2>Co to jest ETF</h2>
<p>ETF (exchange-traded fund) to fundusz notowany na giełdzie, którym handluje się jak akcją. Zamiast kupować pojedyncze spółki, kupujesz jednostkę funduszu, a ten w środku trzyma cały koszyk aktywów. Większość popularnych ETF-ów jest pasywna, czyli odwzorowuje konkretny indeks — na przykład globalny indeks akcji obejmujący tysiące spółek z całego świata.</p>
<p>Efekt jest taki, że za jednym zakupem dostajesz gotową dywersyfikację. Nie musisz wybierać zwycięzców ani przewidywać, która branża wystrzeli — masz udział w całym rynku proporcjonalnie do wielkości spółek. To fundamentalna zaleta i główny powód, dla którego ETF-y tak dobrze pasują do początkujących z małym kapitałem. Szerzej o samej idei rozkładania ryzyka piszemy w tekście o <a href="/poradniki/dywersyfikacja-portfela-inwestycyjnego">dywersyfikacji portfela</a>.</p>

<h2>Dlaczego ETF, a nie aktywnie zarządzany fundusz</h2>
<p>Alternatywą dla ETF-u jest fundusz aktywnie zarządzany, w którym zarządzający próbuje pobić rynek, wybierając spółki. Problem w tym, że w długim terminie większość takich funduszy przegrywa z tanim indeksem — głównie przez wyższe opłaty. Kilka punktów procentowych rocznej różnicy w kosztach w ciągu dekad zamienia się w ogromną różnicę kapitału, bo działa na nie procent składany, który opisujemy w poradniku <a href="/poradniki/procent-skladany-jak-dziala">procent składany — jak działa</a>.</p>
<blockquote>W inwestowaniu pasywnym nie próbujesz być mądrzejszy od rynku — akceptujesz jego przeciętny zwrot przy minimalnych kosztach, a to w długim terminie bije większość aktywnych strategii.</blockquote>

<h2>Ile realnie kosztuje TER — przykład w zł</h2>
<p>Wskaźnik kosztów TER to procent, który fundusz pobiera co roku od Twojego kapitału. Brzmi niewinnie, ale w długim terminie różnica między tanim ETF-em a drogim funduszem jest ogromna. Załóżmy, że inwestujesz 50 000 zł przy założeniu tego samego zwrotu brutto 7% rocznie przez 20 lat i porównajmy trzy poziomy opłat.</p>
<table>
<thead>
<tr><th>Roczna opłata</th><th>Typowy produkt</th><th>Wartość po 20 latach</th><th>Utracone na opłatach</th></tr>
</thead>
<tbody>
<tr><td>0,20% (TER taniego ETF)</td><td>Szeroki ETF akcyjny</td><td>około 186 000 zł</td><td>około 7 000 zł</td></tr>
<tr><td>0,50%</td><td>Droższy ETF sektorowy</td><td>około 176 000 zł</td><td>około 17 000 zł</td></tr>
<tr><td>1,50% (opłata funduszu aktywnego)</td><td>Fundusz aktywnie zarządzany</td><td>około 146 000 zł</td><td>około 47 000 zł</td></tr>
</tbody>
</table>
<p>To ta sama inwestycja, ten sam rynek — różni je wyłącznie opłata. Fundusz z opłatą 1,50% zabiera około 40 000 zł więcej niż tani ETF z TER 0,20%. Dlatego przy wyborze ETF-u TER jest jednym z pierwszych parametrów, na które patrzysz.</p>

<h2>Na co patrzeć, wybierając ETF</h2>
<p>Nazwy ETF-ów bywają mylące, dlatego warto wiedzieć, które parametry naprawdę się liczą.</p>
<ul>
<li><strong>Indeks bazowy.</strong> To, co fundusz odwzorowuje. Dla początkującego najsensowniejszy jest szeroki, globalny indeks akcji, a nie wąski sektor czy jeden kraj.</li>
<li><strong>Wskaźnik kosztów TER.</strong> Roczna opłata za zarządzanie, wyrażona w procentach. Dla szerokich ETF-ów akcyjnych bywa bardzo niska. Im niższy TER, tym więcej zysku zostaje u Ciebie.</li>
<li><strong>Sposób replikacji.</strong> Fizyczna (fundusz faktycznie kupuje spółki z indeksu) jest prostsza i bardziej przejrzysta niż syntetyczna (oparta na instrumentach pochodnych).</li>
<li><strong>Polityka dywidend.</strong> Akumulująca (reinwestuje dywidendy w funduszu) lub dystrybucyjna (wypłaca je na Twoje konto).</li>
<li><strong>Wielkość i płynność funduszu.</strong> Większe, dłużej działające fundusze są zwykle tańsze w obrocie i mniej narażone na likwidację.</li>
</ul>

<h3>Akumulujący czy dystrybucyjny</h3>
<p>To jedno z pierwszych rozstrzygnięć. ETF akumulujący (accumulating) automatycznie reinwestuje dywidendy wewnątrz funduszu — nie widzisz wypłaty, ale rośnie wartość jednostki. ETF dystrybucyjny (distributing) wypłaca dywidendy na Twoje konto maklerskie.</p>
<table>
<thead>
<tr><th>Cecha</th><th>Akumulujący</th><th>Dystrybucyjny</th></tr>
</thead>
<tbody>
<tr><td>Dywidendy</td><td>Reinwestowane automatycznie</td><td>Wypłacane na konto</td></tr>
<tr><td>Procent składany</td><td>Działa bez Twojej pracy</td><td>Musisz sam reinwestować</td></tr>
<tr><td>Podatek od dywidendy</td><td>Odroczony do sprzedaży</td><td>Płacony przy każdej wypłacie</td></tr>
<tr><td>Dla kogo</td><td>Faza budowania kapitału</td><td>Gdy chcesz bieżący dochód</td></tr>
</tbody>
</table>
<p>Dla osoby budującej kapitał na lata zwykle wygodniejszy jest wariant akumulujący — dywidendy reinwestują się same, a podatek jest odroczony do momentu sprzedaży. O samym mechanizmie piszemy w tekście o <a href="/poradniki/reinwestowanie-dywidend">reinwestowaniu dywidend</a>.</p>

<h2>Jak zacząć krok po kroku</h2>
<ol>
<li><strong>Załóż konto maklerskie</strong> z dostępem do zagranicznych ETF-ów i niskimi prowizjami.</li>
<li><strong>Wybierz jeden szeroki ETF akcyjny</strong> na globalny indeks, o niskim TER, najlepiej akumulujący i z replikacją fizyczną.</li>
<li><strong>Ustal stałą kwotę i rytm.</strong> Kupuj regularnie, metodą <a href="/poradniki/usrednianie-ceny-dca">uśredniania ceny (DCA)</a>, zamiast czekać na idealny moment.</li>
<li><strong>Ogranicz liczbę transakcji.</strong> Przy małych kwotach rzadsze, większe zakupy zmniejszają wpływ prowizji minimalnej.</li>
<li><strong>Trzymaj długo.</strong> ETF to strategia na lata, nie na szybki obrót. Sprawdzaj portfel raz na kwartał, nie codziennie.</li>
</ol>
<p>Jeśli dysponujesz niewielkim kapitałem, przyda Ci się też poradnik <a href="/poradniki/jak-zaczac-inwestowac-male-kwoty">jak zacząć inwestować małe kwoty</a>, który pokazuje cały plan startu.</p>

<h2>Rodzaje ETF-ów, które warto znać</h2>
<p>Choć na start wystarczy jeden szeroki fundusz akcyjny, warto rozumieć krajobraz, żeby nie dać się złapać na wąskie, ryzykowne produkty udające bezpieczny start.</p>
<ul>
<li><strong>ETF na szeroki indeks akcji.</strong> Globalny lub na duży rynek rozwinięty. To rdzeń portfela początkującego — tysiące spółek w jednej pozycji.</li>
<li><strong>ETF obligacyjny.</strong> Koszyk obligacji skarbowych lub korporacyjnych. Stabilizuje portfel i obniża jego zmienność.</li>
<li><strong>ETF sektorowy lub tematyczny.</strong> Jedna branża, na przykład technologia czy energetyka odnawialna. To skoncentrowany zakład, nie fundament — dodatek co najwyżej dla części kapitału.</li>
<li><strong>ETF na rynki wschodzące.</strong> Ekspozycja na szybciej rosnące, ale bardziej zmienne gospodarki. Bywa dodatkiem do rdzenia globalnego.</li>
<li><strong>ETF surowcowy.</strong> Na przykład na złoto. Bywa używany jako element dywersyfikacji, ale nie generuje dywidend ani odsetek.</li>
</ul>
<p>Zasada dla początkującego jest prosta: buduj rdzeń z szerokich, tanich funduszy, a produkty wąskie i modne traktuj z rezerwą. Im węższy temat, tym bardziej fundusz przypomina zakład na jeden trend, a nie inwestowanie w cały rynek.</p>

<h2>ETF kontra inne sposoby wejścia na rynek</h2>
<p>Żeby zobaczyć, gdzie leży przewaga ETF-u, warto zestawić go z alternatywami, po które sięgają początkujący.</p>
<table>
<thead>
<tr><th>Sposób</th><th>Dywersyfikacja</th><th>Typowy koszt</th><th>Wysiłek</th></tr>
</thead>
<tbody>
<tr><td>Pojedyncze akcje</td><td>Zależna od Ciebie, łatwo o koncentrację</td><td>Prowizje od każdej transakcji</td><td>Wysoki — analiza spółek</td></tr>
<tr><td>Fundusz aktywny</td><td>Wysoka</td><td>Wysoki (często ponad 1,5% rocznie)</td><td>Niski</td></tr>
<tr><td>Szeroki ETF</td><td>Wysoka, gotowa</td><td>Niski (TER rzędu 0,2%)</td><td>Niski</td></tr>
</tbody>
</table>
<p>ETF łączy zalety, które w pozostałych opcjach się wykluczają: daje szeroką dywersyfikację jak fundusz aktywny, ale przy niskim koszcie i minimalnym wysiłku. To dlatego stał się domyślnym wyborem inwestora pasywnego. Pojedyncze akcje mają sens dopiero, gdy świadomie chcesz poświęcić czas na analizę i zaakceptować wyższe ryzyko koncentracji.</p>

<h2>Portfel z kilku ETF-ów — proste warianty</h2>
<p>Gdy urośnie kapitał, jeden fundusz można rozbudować w prosty portfel. Nie trzeba komplikować — dwa lub trzy szerokie ETF-y w zupełności wystarczą.</p>
<table>
<thead>
<tr><th>Wariant</th><th>Skład</th><th>Dla kogo</th></tr>
</thead>
<tbody>
<tr><td>Jeden fundusz</td><td>100% globalny ETF akcyjny</td><td>Start i długi horyzont, maksymalna prostota</td></tr>
<tr><td>Dwa fundusze</td><td>Globalny ETF akcyjny + ETF obligacyjny</td><td>Gdy chcesz obniżyć zmienność</td></tr>
<tr><td>Trzy fundusze</td><td>Rynki rozwinięte + wschodzące + obligacje</td><td>Większy kapitał i chęć kontroli proporcji</td></tr>
</tbody>
</table>
<p>Więcej niż trzy–cztery fundusze rzadko ma sens dla inwestora indywidualnego — dokładanie kolejnych zwykle tylko powiela te same spółki i utrudnia rebalancing. Prostota jest tu zaletą, nie kompromisem: im mniej ruchomych części, tym łatwiej trzymać się planu przez lata.</p>

<h2>Regularne wpłaty na liczbach</h2>
<p>Siła ETF-ów ujawnia się przy systematycznym kupowaniu. Załóżmy wpłatę 500 zł miesięcznie do globalnego ETF-a akcyjnego przy założeniu średniego zwrotu 7% rocznie. To założenie poglądowe — rynek w praktyce faluje, a nie rośnie równo.</p>
<ul>
<li><strong>Po 10 latach.</strong> Wpłacone 60 000 zł, wartość portfela około 86 000 zł.</li>
<li><strong>Po 20 latach.</strong> Wpłacone 120 000 zł, wartość portfela około 260 000 zł.</li>
<li><strong>Po 30 latach.</strong> Wpłacone 180 000 zł, wartość portfela około 610 000 zł.</li>
</ul>
<p>Zwróć uwagę, jak przewaga narasta w czasie: przez pierwsze lata portfel jest niewiele większy od sumy wpłat, ale po dwóch–trzech dekadach zysk z rynku wyraźnie przewyższa to, co samodzielnie wpłaciłeś. To efekt procentu składanego, dla którego niskie opłaty ETF-u mają kluczowe znaczenie — każdy punkt procentowy pobrany rocznie przez fundusz to ujęty kawałek tej końcowej kwoty. Pamiętaj też, że przy sprzedaży od zysku zapłacisz 19% podatku Belki.</p>

<h2>Częste błędy początkujących z ETF-ami</h2>
<ul>
<li><strong>Kupowanie wielu nakładających się ETF-ów.</strong> Trzy fundusze zawierające w większości te same spółki to złudzenie dywersyfikacji.</li>
<li><strong>Pogoń za wąskimi, modnymi tematami.</strong> ETF na jedną gorącą branżę to skoncentrowany zakład, nie bezpieczny start.</li>
<li><strong>Ignorowanie TER i prowizji.</strong> Pozornie drobne opłaty w długim terminie zjadają istotną część zysku.</li>
<li><strong>Częsty handel.</strong> Kupowanie i sprzedawanie ETF-ów pod wpływem emocji niweczy przewagę taniego, pasywnego podejścia.</li>
</ul>

<h2>Jak czytać nazwę ETF-u</h2>
<p>Nazwy funduszy wyglądają jak ciąg skrótów, ale każdy element coś znaczy. Rozszyfrowanie nazwy pozwala od razu ocenić, czy fundusz pasuje do Twojej strategii, bez wchodzenia w kartę produktu.</p>
<ul>
<li><strong>Nazwa dostawcy.</strong> Pierwszy człon wskazuje instytucję prowadzącą fundusz. Więksi, uznani dostawcy zwykle oznaczają większą płynność.</li>
<li><strong>Indeks bazowy.</strong> Środek nazwy mówi, co fundusz odwzorowuje — globalny rynek, rynek rozwinięty, konkretny region lub sektor.</li>
<li><strong>Skrót polityki dywidend.</strong> Oznaczenie w rodzaju Acc (akumulujący) lub Dist (dystrybucyjny) mówi, co dzieje się z dywidendami.</li>
<li><strong>Waluta jednostki.</strong> Informuje, w jakiej walucie notowany jest fundusz — ważne przy przeliczaniu na złote i ocenie ryzyka walutowego.</li>
</ul>
<p>Uwaga na częste nieporozumienie: waluta, w której notowany jest ETF, nie jest tym samym co ryzyko walutowe. Fundusz notowany w euro, który w środku trzyma globalne akcje, i tak ma ekspozycję na wiele walut spółek. Waluta notowania wpływa głównie na to, jak przeliczasz wartość na złote, a nie na to, na jakie gospodarki realnie stawiasz.</p>

<h2>Kiedy ETF to nie najlepszy wybór</h2>
<p>Choć ETF-y pasują do większości początkujących, są sytuacje, w których warto się wstrzymać albo zacząć inaczej. Uczciwy poradnik pokazuje też granice narzędzia.</p>
<ol>
<li><strong>Nie masz poduszki finansowej.</strong> Zanim zainwestujesz, zbuduj bufor na nagłe wydatki. Inwestowanie bez poduszki zmusza do sprzedaży w najgorszym momencie.</li>
<li><strong>Masz drogie długi.</strong> Spłata karty kredytowej oprocentowanej wysoko daje pewny zwrot, którego żaden ETF nie zagwarantuje.</li>
<li><strong>Twój horyzont jest krótszy niż kilka lat.</strong> Pieniędzy potrzebnych wkrótce nie wkładasz w akcje, bo rynek może akurat spaść.</li>
<li><strong>Nie zniesiesz spadku wartości.</strong> Jeśli widok portfela na minusie skłoniłby Cię do panicznej sprzedaży, zacznij od mniejszej kwoty, żeby oswoić zmienność.</li>
</ol>
<p>ETF jest narzędziem długoterminowym i pasywnym. Wykorzystany do krótkoterminowej spekulacji albo przy braku finansowych fundamentów traci swoją główną przewagę. Najpierw porządek w budżecie i poduszka, dopiero potem regularne, spokojne inwestowanie.</p>

<h2>Jak SzpontHub pomaga śledzić ETF-y</h2>
<p>Gdy inwestujesz regularnie, warto widzieć realną wartość i zysk swoich funduszy w jednym miejscu. W SzpontHub dodasz swoje ETF-y i inne aktywa do portfela, a aplikacja pokaże ich wartość w czasie oraz zysk z uwzględnieniem podatku Belki — bez ręcznego liczenia. Ponieważ portfele są wielowalutowe, łatwiej ogarniesz fundusze notowane w USD czy EUR obok złotówkowego budżetu. To materiał informacyjny, a nie doradztwo inwestycyjne — wybór konkretnego funduszu dopasuj do własnego celu, horyzontu i tolerancji ryzyka.</p>
`,
  faq: [
    {
      q: 'Co to jest ETF w prostych słowach?',
      a: 'ETF to fundusz notowany na giełdzie, którym handluje się jak akcją, ale w środku trzyma cały koszyk spółek lub obligacji. Najczęściej odwzorowuje indeks, więc jednym zakupem dostajesz udział w setkach firm i gotową dywersyfikację.',
    },
    {
      q: 'Jaki ETF wybrać na początek?',
      a: 'Dla początkującego najprostszy jest jeden szeroki, tani ETF akcyjny na globalny indeks, najlepiej w wersji akumulującej i z replikacją fizyczną. Taki fundusz daje ekspozycję na cały światowy rynek akcji przy niskich kosztach rocznych.',
    },
    {
      q: 'Czym różni się ETF akumulujący od dystrybucyjnego?',
      a: 'Akumulujący reinwestuje dywidendy automatycznie wewnątrz funduszu, a podatek jest odroczony do sprzedaży. Dystrybucyjny wypłaca dywidendy na Twoje konto, od których podatek płacisz na bieżąco. W fazie budowania kapitału zwykle wygodniejszy jest akumulujący.',
    },
    {
      q: 'Co oznacza wskaźnik TER w ETF?',
      a: 'TER to roczny wskaźnik kosztów funduszu wyrażony w procentach wartości inwestycji. Obejmuje opłatę za zarządzanie i pobierany jest automatycznie. Im niższy TER, tym mniej płacisz i tym więcej zysku zostaje u Ciebie, co w długim terminie ma duże znaczenie.',
    },
    {
      q: 'Czy ETF jest bezpieczny dla początkującego?',
      a: 'Szeroki ETF akcyjny nie eliminuje ryzyka rynkowego, ale dzięki dywersyfikacji usuwa ryzyko związane z pojedynczą spółką. To jedno z bezpieczniejszych narzędzi dla początkującego, o ile inwestujesz długoterminowo i nie handlujesz nim pod wpływem emocji.',
    },
    {
      q: 'Czy od zysku z ETF trzeba zapłacić podatek?',
      a: 'Tak, zysk ze sprzedaży ETF-u oraz wypłacone dywidendy podlegają w Polsce 19% podatkowi Belki. W ETF akumulującym podatek od dywidend jest odroczony do momentu sprzedaży jednostek, co sprzyja działaniu procentu składanego.',
    },
  ],
};

export default article;
