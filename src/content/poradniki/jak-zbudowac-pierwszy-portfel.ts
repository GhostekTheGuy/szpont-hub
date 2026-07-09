import type { Article } from './types';

const article: Article = {
  slug: 'jak-zbudowac-pierwszy-portfel',
  title: 'Jak zbudować pierwszy portfel inwestycyjny — poradnik krok po kroku',
  description:
    'Jak zbudować pierwszy portfel inwestycyjny od zera? Poznaj kolejność kroków, prosty podział aktywów, gotowe przykłady portfeli i najczęstsze błędy początkujących.',
  category: 'inwestycje',
  tags: ['pierwszy portfel', 'inwestowanie dla początkujących', 'dywersyfikacja', 'ETF', 'alokacja aktywów'],
  tldr:
    'Pierwszy portfel inwestycyjny zbuduj dopiero po zebraniu poduszki finansowej i spłacie drogich długów. Zacznij od jednego, szeroko zdywersyfikowanego funduszu ETF na akcje globalne, dodaj część bezpieczną (obligacje lub gotówka) proporcjonalnie do swojej tolerancji ryzyka i inwestuj regularnie tę samą kwotę co miesiąc. Prostota i konsekwencja biją skomplikowane strategie — nie musisz wybierać pojedynczych spółek, żeby dobrze inwestować.',
  keyTakeaways: [
    'Najpierw poduszka finansowa i spłata drogich długów, dopiero potem inwestowanie.',
    'Prosty portfel z jednego globalnego ETF na akcje jest lepszy niż skomplikowany, którego nie rozumiesz.',
    'Podział na część akcyjną i bezpieczną ustaw według horyzontu i tolerancji ryzyka, nie według przeczuć.',
    'Inwestuj regularnie stałą kwotę (DCA) zamiast czekać na idealny moment.',
    'Rebalansuj raz do roku, żeby przywrócić założone proporcje portfela.',
    'Czas liczy się bardziej niż wysokość wpłaty — procent składany działa najsilniej przy długim horyzoncie.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Budowa pierwszego portfela inwestycyjnego wydaje się skomplikowana, bo w internecie znajdziesz setki sprzecznych strategii. W rzeczywistości dobry start jest prostszy, niż myślisz — liczy się kolejność kroków, kilka rozsądnych zasad i konsekwencja. W tym poradniku przejdziemy przez cały proces: od tego, czy w ogóle jesteś gotowy inwestować, po gotowe przykłady portfeli i błędy, które kosztują początkujących najwięcej.</p>

<h2>Zanim zaczniesz inwestować — trzy warunki wstępne</h2>
<p>Inwestowanie ma sens dopiero wtedy, gdy Twoje finanse mają solidny fundament. Bez tego pierwszy kryzys zmusi Cię do sprzedaży aktywów w najgorszym momencie.</p>
<ol>
<li><strong>Masz poduszkę finansową.</strong> Od 3 do 6 miesięcy niezbędnych wydatków na koncie oszczędnościowym. To ona, a nie portfel, ratuje Cię przy utracie dochodu. Szczegóły znajdziesz w poradniku <a href="/poradniki/poduszka-finansowa-ile-odkladac">ile odkładać na poduszkę finansową</a>.</li>
<li><strong>Spłaciłeś drogie długi.</strong> Karta kredytowa czy chwilówka potrafią kosztować kilkanaście–kilkadziesiąt procent rocznie. Żaden bezpieczny portfel tyle nie zarobi, więc spłata długu to gwarantowana stopa zwrotu.</li>
<li><strong>Znasz swój horyzont.</strong> Pieniądze, których będziesz potrzebować w ciągu 2–3 lat, nie powinny trafić na giełdę. Inwestuj tylko środki, które możesz zostawić w spokoju na wiele lat.</li>
</ol>

<blockquote>Inwestowanie nie jest pierwszym krokiem w finansach, tylko jednym z ostatnich. Najpierw bezpieczeństwo, potem wzrost.</blockquote>

<h2>Zrozum trzy podstawowe klasy aktywów</h2>
<p>Zanim zbudujesz portfel, musisz wiedzieć, z czego się składa. Dla początkującego liczą się przede wszystkim trzy klasy.</p>
<ul>
<li><strong>Akcje</strong> — udziały w firmach. Dają najwyższy długoterminowy zwrot, ale też największą zmienność. To silnik wzrostu portfela.</li>
<li><strong>Obligacje</strong> — pożyczki dla państwa lub firm, oddawane z odsetkami. Bezpieczniejsze i mniej zmienne, stabilizują portfel. Więcej w poradniku <a href="/poradniki/akcje-czy-obligacje">akcje czy obligacje</a>.</li>
<li><strong>Gotówka i jej ekwiwalenty</strong> — konto oszczędnościowe, obligacje krótkoterminowe. Płynność i bezpieczeństwo kosztem niskiego zwrotu.</li>
</ul>
<p>Dla większości początkujących najlepszym narzędziem ekspozycji na akcje jest fundusz ETF, który jednym zakupem daje udział w setkach lub tysiącach spółek. Nie musisz wybierać pojedynczych firm ani zgadywać, która urośnie — kupujesz cały rynek naraz i płacisz za to grosze rocznie.</p>

<h2>Ustal podział portfela według tolerancji ryzyka</h2>
<p>Najważniejsza decyzja to proporcja między częścią akcyjną (wzrost) a bezpieczną (stabilizacja). Punktem wyjścia bywa horyzont: im dłużej nie ruszasz pieniędzy, tym więcej akcji możesz mieć, bo masz czas na przeczekanie spadków.</p>

<table>
<thead>
<tr><th>Profil</th><th>Akcje (ETF)</th><th>Część bezpieczna</th><th>Dla kogo</th></tr>
</thead>
<tbody>
<tr><td>Ostrożny</td><td>40%</td><td>60%</td><td>Krótszy horyzont, niska tolerancja spadków</td></tr>
<tr><td>Zrównoważony</td><td>60%</td><td>40%</td><td>Horyzont 7–10 lat, umiarkowane ryzyko</td></tr>
<tr><td>Agresywny</td><td>80–100%</td><td>0–20%</td><td>Długi horyzont, spokój przy dużych wahaniach</td></tr>
</tbody>
</table>

<p>Nie ma jednej dobrej odpowiedzi — kluczowe jest, żebyś przy spadku o 30% nie sprzedał wszystkiego w panice. Jeśli nie wiesz, jak zniesiesz stratę, zacznij ostrożniej. Portfel, którego się trzymasz, zawsze pobije genialny portfel, który porzucasz w kryzysie.</p>

<h2>Gotowe przykłady prostych portfeli</h2>
<p>Oto trzy szkielety, od najprostszego do nieco bardziej rozbudowanego. Wszystkie da się zbudować z ETF-ów dostępnych dla polskiego inwestora.</p>
<ol>
<li><strong>Portfel jednofunduszowy.</strong> 100% w jednym globalnym ETF na akcje całego świata. Maksymalna prostota, pełna dywersyfikacja geograficzna, zero decyzji. Idealny na start.</li>
<li><strong>Portfel dwuskładnikowy.</strong> Globalny ETF na akcje plus ETF na obligacje w wybranej proporcji (np. 70/30). Dodaje stabilizację i pozwala rebalansować.</li>
<li><strong>Portfel trzyskładnikowy.</strong> Akcje globalne, obligacje i niewielki dodatek (np. do 10% na złoto jako zabezpieczenie — patrz <a href="/poradniki/zloto-jako-inwestycja">złoto jako inwestycja</a>). Dla osób, które chcą nieco więcej kontroli.</li>
</ol>
<p>Zwróć uwagę, że nawet najprostszy wariant jest w pełni zdywersyfikowany. Więcej składników nie znaczy lepszy portfel — znaczy tylko więcej rzeczy do pilnowania.</p>

<h2>Inwestuj regularnie zamiast łapać dołki</h2>
<p>Próba trafienia w idealny moment zakupu (tzw. timing rynku) przegrywa z prostą regułą: inwestuj stałą kwotę w stałym rytmie, na przykład co miesiąc w dniu wypłaty. Ta metoda, zwana uśrednianiem ceny lub DCA, sprawia, że kupujesz więcej jednostek, gdy jest tanio, i mniej, gdy drogo — automatycznie, bez zgadywania. Rozłożenie zakupów opisaliśmy szerzej w poradniku <a href="/poradniki/usrednianie-ceny-dca">uśrednianie ceny (DCA)</a>.</p>
<p>Regularność ma jeszcze jedną zaletę: zamienia inwestowanie w nawyk. Zamiast raz w roku zastanawiać się nad wielką decyzją, podejmujesz jedną małą co miesiąc. To znacznie łatwiejsze do utrzymania.</p>

<h2>Rebalansowanie — jak pilnować proporcji</h2>
<p>Z czasem części portfela rosną w różnym tempie i proporcje się rozjeżdżają. Jeśli akcje mocno urosną, mogą stanowić 75% portfela zamiast założonych 60%, przez co poziom ryzyka jest wyższy, niż chciałeś. Rebalansowanie to przywrócenie pierwotnych proporcji: sprzedajesz to, czego jest za dużo, i dokupujesz to, czego brakuje.</p>
<p>Dla początkującego wystarczy robić to raz w roku albo gdy któraś część odchyli się o więcej niż 5–10 punktów procentowych. Rebalansowanie wymusza kupowanie tanio i sprzedawanie drogo — dokładnie odwrotnie, niż podpowiadają emocje.</p>

<h2>Najczęstsze błędy pierwszego portfela</h2>
<ul>
<li><strong>Inwestowanie bez poduszki.</strong> Pierwszy nagły wydatek zmusi Cię do sprzedaży ze stratą.</li>
<li><strong>Zbyt skomplikowany portfel.</strong> Dziesięć funduszy, których nie rozumiesz, to nie dywersyfikacja, tylko chaos.</li>
<li><strong>Reagowanie na nagłówki.</strong> Sprzedaż w panice przy spadku zamienia chwilową stratę w trwałą. Warto zawczasu poznać <a href="/poradniki/jak-nie-panikowac-przy-spadkach">jak nie panikować przy spadkach</a>.</li>
<li><strong>Ignorowanie kosztów.</strong> Wysokie opłaty funduszu potrafią zjeść znaczną część zysku w długim terminie. Wybieraj tanie ETF-y.</li>
</ul>

<h2>Ile mogłby urosnąć portfel — ilustracja liczbowa</h2>
<p>Aby pokazać, dlaczego czas jest najważniejszym sprzymierzeńcem inwestora, weźmy prostą ilustrację: wpłacasz 500 zł miesięcznie. Poniższa tabela zestawia samą sumę wpłat z wartością przy założonej średniej stopie zwrotu 6 procent rocznie. To założenie hipotetyczne, przyjęte wyłącznie dla pokazania mechanizmu procentu składanego.</p>
<table>
<thead>
<tr><th>Okres</th><th>Suma wpłat</th><th>Wartość przy hipotetycznych 6 procent rocznie</th></tr>
</thead>
<tbody>
<tr><td>10 lat</td><td>60 000 zł</td><td>ok. 82 000 zł</td></tr>
<tr><td>20 lat</td><td>120 000 zł</td><td>ok. 231 000 zł</td></tr>
<tr><td>30 lat</td><td>180 000 zł</td><td>ok. 502 000 zł</td></tr>
</tbody>
</table>
<p>Zwróć uwagę na proporcje: po 30 latach wpłaciłeś 180 tysięcy zł, a portfel wart jest ponad pół miliona. Różnicę zrobił procent składany, który potrzebuje przede wszystkim czasu, a nie wysokich kwot. To materiał informacyjny, a nie obietnica wyniku — realne stopy zwrotu bywają wyższe lub niższe, a niektóre lata przynoszą straty. Wniosek pozostaje jednak stały: im wcześniej zaczniesz, tym mniej musisz wpłacać, by osiągnąć ten sam cel.</p>

<h2>Gdzie trzymać portfel — konto zwykłe czy opakowanie podatkowe</h2>
<p>Miejsce, w którym prowadzisz portfel, wpływa na to, ile zysku oddasz fiskusowi. W Polsce dostępne są konta maklerskie zwykłe oraz opakowania z preferencjami podatkowymi. Poniżej ogólne porównanie w ujęciu informacyjnym.</p>
<table>
<thead>
<tr><th>Rodzaj konta</th><th>Podatek od zysków</th><th>Uwaga</th></tr>
</thead>
<tbody>
<tr><td>Zwykłe konto maklerskie</td><td>Podatek Belki od zysków i dywidend</td><td>Pełna elastyczność, brak limitów wpłat</td></tr>
<tr><td>Konto z preferencją emerytalną</td><td>Ulgi lub zwolnienie przy spełnieniu warunków</td><td>Roczne limity wpłat, ograniczona wypłata przed czasem</td></tr>
</tbody>
</table>
<p>Opakowania z preferencją podatkową bywają korzystne dla długoterminowego, emerytalnego celu, ale wiążą się z limitami i warunkami wypłaty. To materiał informacyjny, a nie porada podatkowa — szczegóły i aktualne limity warto sprawdzić przed założeniem konta lub skonsultować z doradcą. Dla pierwszego portfela najważniejsze jest jednak, żeby w ogóle zacząć; wybór opakowania możesz zoptymalizować później.</p>

<h2>Checklista przed pierwszym zakupem</h2>
<p>Zanim klikniesz kup, upewnij się, że masz odhaczone wszystkie fundamenty. Ta lista chroni przed najczęstszymi, najkosztowniejszymi błędami startu.</p>
<ol>
<li><strong>Masz poduszkę finansową</strong> na 3-6 miesięcy wydatków, odłożoną osobno od portfela.</li>
<li><strong>Spłaciłeś drogie długi</strong>, zwłaszcza karty i chwilówki o wysokim oprocentowaniu.</li>
<li><strong>Inwestujesz tylko środki na wiele lat</strong> — nie pieniądze potrzebne w ciągu 2-3 lat.</li>
<li><strong>Wybrałeś prosty, tani ETF</strong> zamiast dziesięciu funduszy, których nie rozumiesz.</li>
<li><strong>Ustaliłeś podział</strong> na część akcyjną i bezpieczną zgodny z Twoją tolerancją spadków.</li>
<li><strong>Zaplanowałeś regularną wpłatę</strong> stałej kwoty co miesiąc, najlepiej automatyczną.</li>
</ol>

<h2>Jak SzpontHub pomaga prowadzić pierwszy portfel</h2>
<p>Największym wrogiem początkującego inwestora jest brak przejrzystości — trudno trzymać się planu, gdy nie widzisz, gdzie faktycznie jesteś. W SzpontHub dodasz swoje aktywa i inwestycje (akcje, ETF-y, krypto) do jednego widoku, z bieżącą wyceną, udziałem każdej pozycji i zyskiem po uwzględnieniu podatku Belki. Dzięki temu od razu zauważysz, gdy proporcje portfela wymagają rebalansowania, a regularne wpłaty rozliczysz w kontekście całego budżetu. To materiał informacyjny, a nie porada inwestycyjna — decyzje podejmujesz samodzielnie, ale w oparciu o pełny i aktualny obraz swoich finansów.</p>
`,
  faq: [
    {
      q: 'Od czego zacząć budowę pierwszego portfela inwestycyjnego?',
      a: 'Najpierw zbierz poduszkę finansową na 3–6 miesięcy wydatków i spłać drogie długi. Dopiero potem zacznij inwestować regularnie stałą kwotę w jeden szeroko zdywersyfikowany ETF na akcje globalne, dokładając część bezpieczną według swojej tolerancji ryzyka.',
    },
    {
      q: 'Ile pieniędzy potrzeba, żeby zacząć inwestować?',
      a: 'Zacząć można od bardzo małych kwot, nawet 50–100 zł miesięcznie, bo ETF-y kupuje się w niewielkich porcjach. Ważniejsza od kwoty startowej jest regularność — stała, comiesięczna wpłata buduje portfel skuteczniej niż jednorazowy większy zakup na start.',
    },
    {
      q: 'Czy początkujący powinien kupować pojedyncze akcje?',
      a: 'Zwykle nie. Wybór pojedynczych spółek wymaga wiedzy, czasu i wiąże się z dużym ryzykiem. Dla początkującego znacznie bezpieczniejszy jest globalny ETF, który jednym zakupem daje udział w setkach firm, więc pojedyncza słaba spółka nie zaważy na całości.',
    },
    {
      q: 'Jaki podział na akcje i obligacje wybrać na start?',
      a: 'Zależy od horyzontu i tolerancji ryzyka. Przy długim horyzoncie i spokojnym podejściu można mieć 80% akcji i 20% części bezpiecznej, przy ostrożniejszym nastawieniu 40–60% akcji. Kluczowe, by przy spadku nie sprzedać wszystkiego w panice.',
    },
    {
      q: 'Czy lepiej wpłacić wszystko naraz, czy inwestować co miesiąc?',
      a: 'Dla początkującego bezpieczniejsze jest inwestowanie stałej kwoty co miesiąc (DCA), bo uniezależnia od trafiania w idealny moment i buduje nawyk. Wrzucanie całości naraz bywa statystycznie opłacalne, ale psychicznie trudne, jeśli rynek zaraz spadnie.',
    },
    {
      q: 'Jak często rebalansować portfel?',
      a: 'Dla pierwszego portfela wystarczy raz w roku lub gdy któraś część odchyli się od założonych proporcji o więcej niż 5–10 punktów procentowych. Rebalansowanie polega na sprzedaży nadwyżki i dokupieniu tego, czego jest za mało, co utrzymuje ryzyko na planowanym poziomie.',
    },
    {
      q: 'Czy portfel lepiej prowadzić na zwykłym koncie, czy na koncie z ulgą podatkową?',
      a: 'Zwykłe konto maklerskie daje pełną elastyczność i brak limitów wpłat, ale zyski obciąża podatek Belki. Konta z preferencją emerytalną oferują ulgi lub zwolnienie przy spełnieniu warunków, w zamian za roczne limity wpłat i ograniczenia wcześniejszej wypłaty. To materiał informacyjny, nie porada podatkowa — dla pierwszego portfela najważniejsze jest, żeby zacząć, a opakowanie podatkowe zoptymalizować później.',
    },
  ],
};

export default article;
