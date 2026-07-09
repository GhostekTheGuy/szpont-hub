import type { Article } from './types';

const article: Article = {
  slug: 'ryczalt-czy-podatek-liniowy-freelancer',
  title: 'Ryczałt czy podatek liniowy — co wybrać jako freelancer',
  description:
    'Ryczałt czy podatek liniowy dla freelancera? Porównanie stawek, składki zdrowotnej i kosztów, tabela z wyliczeniami oraz zasady, które formę wybrać.',
  category: 'freelancer',
  tags: ['ryczałt', 'podatek liniowy', 'freelancer', 'podatki', 'forma opodatkowania'],
  tldr:
    'Ryczałt opłaca się freelancerom o niskich kosztach i wysokiej marży, bo płacisz procent od przychodu (najczęściej 8,5%, 12% lub 15%) i nie odliczasz kosztów. Podatek liniowy (19% od dochodu) wygrywa, gdy masz wysokie koszty firmowe, bo płacisz od zysku, a nie od obrotu. O wyborze decydują trzy liczby: stawka ryczałtu dla Twojej usługi, udział kosztów w przychodzie oraz wysokość składki zdrowotnej w każdej z form.',
  keyTakeaways: [
    'Ryczałt to podatek od przychodu — nie odliczasz kosztów, ale stawki bywają niskie (8,5–15%).',
    'Podatek liniowy to 19% od dochodu — opłaca się przy wysokich kosztach firmowych.',
    'Składka zdrowotna liczy się inaczej w każdej formie i potrafi przeważyć szalę.',
    'Progu 32% w liniowym nie ma — stawka jest stała niezależnie od wysokości dochodu.',
    'Formę wybierasz na cały rok, a zmienić ją możesz zwykle do 20. dnia miesiąca po pierwszym przychodzie w roku.',
    'Kluczowe pytanie: jaki procent przychodu stanowią Twoje realne koszty.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Wybór formy opodatkowania to jedna z najbardziej kosztownych decyzji freelancera — potrafi zmienić roczny podatek o kilkanaście tysięcy złotych. Dwie najpopularniejsze opcje to ryczałt od przychodów ewidencjonowanych i podatek liniowy. W tym poradniku pokażemy, czym się różnią, dla kogo która jest korzystniejsza i jak policzyć to na konkretnych liczbach w złotówkach.</p>

<p><strong>To materiał informacyjny, a nie porada podatkowa.</strong> Stawki, limity i zasady liczenia składki zdrowotnej zmieniają się z roku na rok, a Twoja sytuacja może mieć niuanse (kilka źródeł przychodu, ulgi, wspólne rozliczenie). Wszystkie kwoty poniżej są orientacyjne i uproszczone — przed decyzją zweryfikuj aktualne przepisy i skonsultuj się z księgowym lub doradcą podatkowym.</p>

<h2>Ryczałt i podatek liniowy w skrócie</h2>
<p>Najważniejsza różnica dotyczy tego, od czego liczysz podatek. Przy <strong>ryczałcie</strong> płacisz procent od przychodu i nie odliczasz kosztów uzyskania przychodu. Przy <strong>podatku liniowym</strong> płacisz 19% od dochodu, czyli od przychodu pomniejszonego o koszty.</p>
<p>Ta jedna różnica prowadzi do prostej reguły: im więcej masz realnych kosztów firmowych, tym bardziej opłaca się liniowy. Im mniej kosztów i im niższa stawka ryczałtu dla Twojej branży, tym bardziej wygrywa ryczałt.</p>

<table>
<thead>
<tr><th>Cecha</th><th>Ryczałt</th><th>Podatek liniowy</th></tr>
</thead>
<tbody>
<tr><td>Podstawa opodatkowania</td><td>Przychód</td><td>Dochód (przychód minus koszty)</td></tr>
<tr><td>Stawka</td><td>Zależna od branży (najczęściej 8,5%, 12%, 15%)</td><td>19% niezależnie od dochodu</td></tr>
<tr><td>Odliczanie kosztów</td><td>Nie</td><td>Tak</td></tr>
<tr><td>Kwota wolna od podatku</td><td>Nie</td><td>Nie</td></tr>
<tr><td>Wspólne rozliczenie z małżonkiem</td><td>Nie</td><td>Nie</td></tr>
<tr><td>Księgowość</td><td>Ewidencja przychodów</td><td>Podatkowa księga przychodów i rozchodów</td></tr>
</tbody>
</table>

<h2>Ile wynoszą stawki ryczałtu według branż</h2>
<p>Stawka ryczałtu zależy od rodzaju wykonywanej usługi, a nie od wysokości przychodu. Poniżej najczęstsze stawki dla freelancerów i typowe rodzaje działalności, których dotyczą:</p>
<table>
<thead>
<tr><th>Stawka</th><th>Przykładowe usługi</th></tr>
</thead>
<tbody>
<tr><td><strong>8,5%</strong></td><td>Część usług niematerialnych: wybrana edukacja, najem, część działalności twórczej i usługowej</td></tr>
<tr><td><strong>12%</strong></td><td>Część usług IT: programowanie, tworzenie i rozwój oprogramowania, usługi związane z oprogramowaniem</td></tr>
<tr><td><strong>14%</strong></td><td>Wybrane usługi w ochronie zdrowia oraz usługi architektoniczne i inżynierskie</td></tr>
<tr><td><strong>15%</strong></td><td>Niektóre usługi doradcze, reklamowe, pośrednictwa i przetwarzania danych</td></tr>
</tbody>
</table>
<p>Zaklasyfikowanie usługi do właściwej stawki bywa trudne i zależy od szczegółowego opisu tego, co robisz, oraz od odpowiedniego kodu PKWiU. Ta sama osoba może wykonywać czynności objęte różnymi stawkami — na przykład programista piszący kod (12%) i jednocześnie prowadzący szkolenia (8,5%). To jeden z punktów, w których warto potwierdzić klasyfikację z księgowym, bo błędna stawka oznacza dopłatę z odsetkami, a w razie wątpliwości pomaga interpretacja indywidualna.</p>

<h2>Składka zdrowotna — ukryty koszt decyzji</h2>
<p>Po zmianach w systemie składka zdrowotna przestała być stałą, symboliczną kwotą i stała się realnym elementem porównania. Liczy się ją inaczej w każdej z form, dlatego samą stawkę podatku trzeba zawsze zestawiać razem ze składką.</p>
<p>Przy <strong>ryczałcie</strong> składka zdrowotna zależy od rocznego przychodu i ma trzy progi (kwoty orientacyjne, zmieniają się co roku wraz z przeciętnym wynagrodzeniem):</p>
<table>
<thead>
<tr><th>Roczny przychód</th><th>Orientacyjna składka zdrowotna (rocznie)</th></tr>
</thead>
<tbody>
<tr><td>do 60 000 zł</td><td>ok. 5 000 zł</td></tr>
<tr><td>60 000 – 300 000 zł</td><td>ok. 8 400 zł</td></tr>
<tr><td>powyżej 300 000 zł</td><td>ok. 15 100 zł</td></tr>
</tbody>
</table>
<p>Przy <strong>podatku liniowym</strong> składka zdrowotna to 4,9% od dochodu, ale nie mniej niż minimum liczone od minimalnego wynagrodzenia (orientacyjnie ok. 4 700 zł rocznie). Część zapłaconej składki możesz odliczyć w ograniczonym rocznym limicie. Przy ryczałcie z kolei można pomniejszyć przychód o połowę zapłaconych składek zdrowotnych.</p>
<p>Wniosek praktyczny: <strong>porównuj sumę „podatek plus składka zdrowotna”</strong>. Dwie formy z podobnym podatkiem mogą różnić się o kilka tysięcy złotych właśnie na składce.</p>

<blockquote>Ryczałt opłaca się przy niskich kosztach i wysokiej marży. Podatek liniowy wygrywa, gdy koszty firmowe stanowią dużą część przychodu. O wszystkim decyduje udział kosztów w przychodzie i suma podatku ze składką zdrowotną.</blockquote>

<h2>Przykładowe porównanie na liczbach</h2>
<p>Weźmy freelancera z rocznym przychodem 180 000 zł i stawką ryczałtu 12%. Porównajmy dwa scenariusze kosztów: niskie (10 000 zł rocznie) i wysokie (70 000 zł rocznie). Kwoty dotyczą samego podatku, bez składki zdrowotnej.</p>
<table>
<thead>
<tr><th>Pozycja</th><th>Ryczałt 12%</th><th>Liniowy 19% (niskie koszty)</th><th>Liniowy 19% (wysokie koszty)</th></tr>
</thead>
<tbody>
<tr><td>Przychód</td><td>180 000 zł</td><td>180 000 zł</td><td>180 000 zł</td></tr>
<tr><td>Koszty</td><td>nie odliczasz</td><td>10 000 zł</td><td>70 000 zł</td></tr>
<tr><td>Podstawa podatku</td><td>180 000 zł</td><td>170 000 zł</td><td>110 000 zł</td></tr>
<tr><td>Sam podatek (bez zdrowotnej)</td><td>21 600 zł</td><td>32 300 zł</td><td>20 900 zł</td></tr>
</tbody>
</table>
<p>Przy niskich kosztach ryczałt 12% jest wyraźnie tańszy niż liniowy. Ale gdy koszty rosną do 70 000 zł, liniowy zbliża się do ryczałtu, a po doliczeniu różnic w składce zdrowotnej może go wyprzedzić. To pokazuje mechanizm: <strong>im więcej realnych kosztów, tym bardziej liniowy się broni</strong>. Zanim zdecydujesz, warto poznać, jakie wydatki w ogóle możesz odliczyć — opisujemy to w poradniku <a href="/poradniki/koszty-uzyskania-przychodu-freelancer">koszty uzyskania przychodu freelancera</a>.</p>

<h2>Wyliczenia dla różnych poziomów przychodu</h2>
<p>Żeby zobaczyć, jak decyzja skaluje się z przychodem, porównajmy sam podatek dla trzech poziomów przychodu. Zakładamy stawkę ryczałtu 12% oraz koszty na poziomie 15% przychodu w wariancie liniowym.</p>
<table>
<thead>
<tr><th>Roczny przychód</th><th>Ryczałt 12% (podatek)</th><th>Liniowy 19% przy kosztach 15%</th><th>Różnica</th></tr>
</thead>
<tbody>
<tr><td>100 000 zł</td><td>12 000 zł</td><td>16 150 zł</td><td>ryczałt tańszy o 4 150 zł</td></tr>
<tr><td>200 000 zł</td><td>24 000 zł</td><td>32 300 zł</td><td>ryczałt tańszy o 8 300 zł</td></tr>
<tr><td>300 000 zł</td><td>36 000 zł</td><td>48 450 zł</td><td>ryczałt tańszy o 12 450 zł</td></tr>
</tbody>
</table>
<p>Kluczowa obserwacja: przy kosztach na poziomie tylko 15% przychodu ryczałt 12% wygrywa na każdym poziomie, a jego przewaga rośnie razem z przychodem. Liniowy zaczyna nadganiać dopiero wtedy, gdy koszty stają się naprawdę duże. Dlatego następny krok to policzenie progu opłacalności.</p>

<h2>Próg opłacalności — ile kosztów musisz mieć</h2>
<p>Istnieje prosty wzór na punkt, w którym sam podatek liniowy zrównuje się z ryczałtem. Porównujemy stawkę ryczałtu (r) ze stawką liniową 19% i szukamy udziału kosztów (k) w przychodzie, przy którym oba podatki są równe:</p>
<ul>
<li><strong>Ryczałt 12% kontra liniowy:</strong> koszty muszą przekroczyć około <strong>37% przychodu</strong>, żeby liniowy dawał niższy podatek.</li>
<li><strong>Ryczałt 8,5% kontra liniowy:</strong> próg jest znacznie wyżej — koszty musiałyby przekroczyć około <strong>55% przychodu</strong>.</li>
<li><strong>Ryczałt 15% kontra liniowy:</strong> próg spada do około <strong>21% przychodu</strong> — tu liniowy staje się realną alternatywą już przy umiarkowanych kosztach.</li>
</ul>
<p>To liczy sam podatek. Po uwzględnieniu składki zdrowotnej progi się przesuwają, ale kierunek jest ten sam: im niższa Twoja stawka ryczałtu, tym więcej kosztów potrzebujesz, żeby liniowy się opłacił. Jeśli Twoja stawka to 8,5% i nie kupujesz drogiego sprzętu, liniowy prawie na pewno przegra.</p>

<h2>Kiedy wybrać ryczałt</h2>
<ul>
<li>Twoja usługa ma niską stawkę ryczałtu (8,5% lub 12%) i pracujesz głównie własną pracą, bez dużych zakupów.</li>
<li>Twoje koszty firmowe są niskie — nie kupujesz drogiego sprzętu, materiałów ani nie podnajmujesz podwykonawców.</li>
<li>Cenisz prostotę księgowości: przy ryczałcie prowadzisz tylko ewidencję przychodów, bez zbierania faktur kosztowych.</li>
<li>Chcesz przewidywalności — podatek liczysz wprost jako procent od tego, co wpłynęło.</li>
</ul>

<h2>Kiedy wybrać podatek liniowy</h2>
<ul>
<li>Masz wysokie i regularne koszty: sprzęt, oprogramowanie, podwykonawcy, biuro, towar.</li>
<li>Twoja stawka ryczałtu byłaby wysoka (15% lub więcej), co zmniejsza jego przewagę.</li>
<li>Twój dochód jest na tyle wysoki, że stały 19% jest korzystniejszy niż skala z progiem 32%.</li>
<li>Planujesz duże jednorazowe inwestycje w firmę, które chcesz zaliczyć do kosztów.</li>
</ul>

<h2>Częste błędy przy wyborze formy</h2>
<p>Najkosztowniejsze pomyłki nie wynikają z braku wiedzy o stawkach, tylko z porównywania niewłaściwych liczb:</p>
<ul>
<li><strong>Porównywanie samych stawek podatku</strong> zamiast sumy podatku i składki zdrowotnej — to najczęstszy błąd, potrafi odwrócić wynik o kilka tysięcy złotych.</li>
<li><strong>Przeszacowanie kosztów</strong> — freelancer zakłada, że ma wysokie koszty, a po zsumowaniu faktur okazuje się, że to zaledwie 10–15% przychodu i ryczałt był tańszy.</li>
<li><strong>Zła klasyfikacja stawki ryczałtu</strong> — przyjęcie 8,5% tam, gdzie usługa kwalifikuje się do 12% lub 15%, kończy się dopłatą z odsetkami.</li>
<li><strong>Ignorowanie kwoty wolnej i wspólnego rozliczenia</strong> — przy niskich dochodach lub jednym zarabiającym małżonku skala podatkowa (której tu nie porównujemy w szczegółach) bywa korzystniejsza niż obie te formy.</li>
<li><strong>Decyzja raz na zawsze</strong> — sytuacja zmienia się co roku, a formę można zmienić na kolejny rok; warto liczyć ją na nowo, gdy rośnie przychód albo zmienia się struktura kosztów.</li>
</ul>

<h2>Checklista wyboru formy</h2>
<p>Zanim złożysz oświadczenie, przejdź przez pięć kroków:</p>
<ol>
<li>Ustal <strong>stawkę ryczałtu</strong> dla swojej usługi (8,5%, 12%, 14% lub 15%) — w razie wątpliwości potwierdź ją z księgowym.</li>
<li>Zsumuj <strong>realne koszty firmowe</strong> z ostatnich 12 miesięcy i policz, jaki procent przychodu stanowią.</li>
<li>Porównaj ten procent z <strong>progiem opłacalności</strong> dla swojej stawki (ok. 37% dla 12%, ok. 55% dla 8,5%, ok. 21% dla 15%).</li>
<li>Doliczy do każdego wariantu <strong>orientacyjną składkę zdrowotną</strong> i porównaj sumy, a nie same podatki.</li>
<li>Sprawdź <strong>aktualny termin</strong> złożenia oświadczenia i zweryfikuj bieżące stawki oraz limity przed decyzją.</li>
</ol>

<h2>Kiedy i jak wybiera się formę</h2>
<p>Formę opodatkowania wybierasz przy zakładaniu firmy lub zmieniasz na kolejny rok. Zmiany zwykle dokonuje się w oświadczeniu do naczelnika urzędu skarbowego w terminie do 20. dnia miesiąca następującego po miesiącu pierwszego przychodu w danym roku. Terminy bywają zmieniane, więc potwierdź aktualny przed decyzją. Wybrana forma obowiązuje przez cały rok, dlatego warto policzyć wszystkie scenariusze z wyprzedzeniem — pomoże w tym poradnik <a href="/poradniki/jak-planowac-podatki-freelancer">jak planować podatki jako freelancer</a>.</p>

<h2>Jak SzpontHub pomaga podjąć decyzję</h2>
<p>Żeby porównać ryczałt z liniowym, potrzebujesz dwóch liczb: rocznego przychodu i realnego udziału kosztów. W SzpontHub rejestrujesz przychody z faktur i wydatki firmowe w kategoriach, dzięki czemu w każdej chwili widzisz, ile faktycznie wydajesz na działalność i jaki procent przychodu stanowią koszty. To dokładnie te dane, które przeważają o opłacalności formy — zamiast szacować z głowy, opierasz decyzję na własnej historii transakcji, którą podstawisz do progu opłacalności z tego poradnika.</p>
`,
  faq: [
    {
      q: 'Ryczałt czy podatek liniowy — co się bardziej opłaca freelancerowi?',
      a: 'Zależy od udziału kosztów w przychodzie. Ryczałt opłaca się przy niskich kosztach i niskiej stawce (8,5–12%), bo płacisz procent od przychodu. Podatek liniowy 19% wygrywa, gdy masz wysokie koszty firmowe, bo liczysz podatek od dochodu, a nie od obrotu.',
    },
    {
      q: 'Czy przy ryczałcie można odliczać koszty?',
      a: 'Nie. Ryczałt to podatek od przychodu, więc nie odliczasz kosztów uzyskania przychodu. To jego główna wada dla firm z dużymi wydatkami i zarazem zaleta prostoty — prowadzisz tylko ewidencję przychodów.',
    },
    {
      q: 'Ile wynosi stawka ryczałtu dla usług IT?',
      a: 'Dla części usług IT, w tym programowania i tworzenia oprogramowania, stawka ryczałtu wynosi zwykle 12%. Zaklasyfikowanie konkretnej usługi zależy od szczegółowego opisu tego, co robisz, dlatego warto potwierdzić stawkę z księgowym.',
    },
    {
      q: 'Czy przy podatku liniowym jest próg 32%?',
      a: 'Nie. Podatek liniowy to stałe 19% niezależnie od wysokości dochodu, więc nie wchodzisz w wyższy próg jak przy skali podatkowej. To zaleta przy wysokich dochodach, ale liniowy nie daje kwoty wolnej ani wspólnego rozliczenia z małżonkiem.',
    },
    {
      q: 'Jak składka zdrowotna wpływa na wybór formy?',
      a: 'Składkę zdrowotną liczy się inaczej przy ryczałcie (progi zależne od przychodu) niż przy liniowym (procent od dochodu). Porównując formy, trzeba sumować podatek i składkę zdrowotną razem, bo to ona często przeważa o realnym koszcie.',
    },
    {
      q: 'Kiedy można zmienić formę opodatkowania?',
      a: 'Formę zmienia się zwykle w oświadczeniu do urzędu skarbowego do 20. dnia miesiąca następującego po miesiącu pierwszego przychodu w roku. Wybór obowiązuje przez cały rok, dlatego warto policzyć scenariusze z wyprzedzeniem. Terminy bywają aktualizowane, więc sprawdź obowiązujący.',
    },
  ],
};

export default article;
