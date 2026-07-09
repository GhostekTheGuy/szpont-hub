import type { Article } from './types';

const article: Article = {
  slug: 'jak-wycenic-projekt',
  title: 'Jak wycenić projekt — ryczałt czy stawka godzinowa',
  description:
    'Jak wycenić projekt jako freelancer: ryczałt czy stawka godzinowa, wycena wartościowa i kiedy co wybrać. Konkretna tabela porównawcza, wzory i przykłady.',
  category: 'freelancer',
  tags: ['wycena projektu', 'freelancer', 'ryczałt', 'stawka godzinowa', 'rentowność'],
  tldr:
    'Wybór między ryczałtem a stawką godzinową zależy od tego, jak dobrze da się określić zakres pracy. Ryczałt (stała cena za cały projekt) sprawdza się przy jasnym, zamkniętym zakresie i premiuje Twoją efektywność, ale przerzuca na Ciebie ryzyko niedoszacowania. Stawka godzinowa pasuje do projektów o zmiennym lub nieznanym zakresie i chroni przed pracą za darmo, lecz karze za szybkość. Ryczałt zawsze licz jako przewidywane godziny razy stawka godzinowa plus bufor.',
  keyTakeaways: [
    'Ryczałt pasuje do jasnego, zamkniętego zakresu; stawka godzinowa do zakresu zmiennego lub nieznanego.',
    'Podstawą każdej wyceny jest znajomość własnej stawki godzinowej — także przy ryczałcie.',
    'Ryczałt = przewidywane godziny x stawka godzinowa + bufor na niedoszacowanie (15–30%).',
    'Ryczałt premiuje efektywność, ale przerzuca na Ciebie ryzyko przekroczenia czasu.',
    'Stawka godzinowa chroni przed pracą za darmo, lecz karze za szybkość i budzi obawy klienta o koszt.',
    'Wycena wartościowa (za efekt) bywa najkorzystniejsza, gdy praca wprost przynosi klientowi przychód.',
    'Sposób prezentacji ceny liczy się jak sama kwota — najpierw pokaż wartość, potem podaj liczbę.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Pytanie "ile to będzie kosztować" pada na początku każdej współpracy, a od odpowiedzi zależy Twoja rentowność. Wybór modelu wyceny — ryczałt, stawka godzinowa czy wycena za efekt — to nie kwestia gustu, lecz dopasowania do konkretnego projektu i jego ryzyka. Zły model potrafi zamienić dobrze płatne zlecenie w pracę pod kreską. W tym poradniku rozłożymy każdą metodę na plusy, minusy i sytuacje, w których wygrywa.</p>

<h2>Fundament: znaj swoją stawkę godzinową</h2>
<p>Niezależnie od tego, który model wybierzesz, punktem wyjścia zawsze jest Twoja realna stawka godzinowa. Nawet przy wycenie ryczałtowej, gdzie klient widzi jedną kwotę za całość, pod spodem musisz wiedzieć, ile godzin zajmie praca i ile jest warta Twoja godzina. Bez tej liczby wyceniasz na oślep.</p>
<p>Stawka godzinowa to nie pensja etatowa podzielona przez godziny — musi uwzględniać podatki, składki, koszty narzędzi, urlop i czas niefakturowany. Jeśli jeszcze jej nie policzyłeś, zacznij od poradnika <a href="/poradniki/jak-liczyc-stawke-godzinowa-freelancer">jak policzyć stawkę godzinową freelancera</a>, bo cała reszta wyceny się na niej opiera.</p>

<h2>Ryczałt — stała cena za cały projekt</h2>
<p>Ryczałt (fixed price) to jedna kwota za zdefiniowany rezultat, niezależnie od tego, ile godzin faktycznie zajmie praca. Klienci go lubią, bo znają koszt z góry i nie boją się rosnącego rachunku. Dla Ciebie ryczałt ma jedną wielką zaletę: premiuje efektywność. Jeśli zrobisz projekt szybciej, niż zakładałeś, Twoja realna stawka godzinowa rośnie.</p>
<p>Druga strona medalu to ryzyko. Przy ryczałcie to Ty ponosisz konsekwencje niedoszacowania — jeśli projekt zajmie dwa razy więcej czasu, Twój zarobek na godzinę spada o połowę, a kwoty na fakturze nie zmienisz. Dlatego ryczałt jest bezpieczny tylko wtedy, gdy zakres jest jasny i zamknięty, a Ty masz dane, ile podobne projekty zajmowały wcześniej.</p>

<blockquote>Ryczałt = przewidywane godziny x stawka godzinowa + bufor na niedoszacowanie (zwykle 15–30%). Bufor nie jest chciwością, lecz ceną ryzyka, które bierzesz na siebie.</blockquote>

<h2>Stawka godzinowa — płatność za czas</h2>
<p>W modelu godzinowym rozliczasz się za faktycznie przepracowane godziny po ustalonej stawce. Największa zaleta to ochrona przed pracą za darmo — jeśli zakres rośnie albo pojawiają się poprawki, po prostu naliczasz kolejne godziny. To naturalny wybór dla projektów, których zakresu nie da się z góry domknąć.</p>
<p>Wady są dwie. Po pierwsze, model godzinowy karze za szybkość: im sprawniej pracujesz, tym mniej zarabiasz na tym samym rezultacie. Po drugie, klienci obawiają się nieprzewidywalnego rachunku, dlatego często proszą o limit godzin lub szacunek z góry. Rozwiązaniem bywa podanie widełek i informowanie, gdy zbliżasz się do górnej granicy.</p>

<h3>Porównanie modeli wyceny</h3>
<table>
<thead>
<tr><th>Kryterium</th><th>Ryczałt</th><th>Stawka godzinowa</th></tr>
</thead>
<tbody>
<tr><td>Najlepszy przy zakresie</td><td>Jasnym, zamkniętym</td><td>Zmiennym, nieznanym</td></tr>
<tr><td>Kto ponosi ryzyko niedoszacowania</td><td>Ty</td><td>Klient</td></tr>
<tr><td>Nagradza efektywność</td><td>Tak</td><td>Nie</td></tr>
<tr><td>Przewidywalność kosztu dla klienta</td><td>Wysoka</td><td>Niska</td></tr>
<tr><td>Ochrona przed rosnącym zakresem</td><td>Słaba</td><td>Silna</td></tr>
<tr><td>Wymaga dobrego oszacowania godzin</td><td>Krytycznie</td><td>Mniej</td></tr>
</tbody>
</table>

<h2>Wycena wartościowa — za efekt, nie za czas</h2>
<p>Trzeci model wyłamuje się z logiki godzin. W wycenie wartościowej (value-based) cena zależy od wartości, jaką praca przynosi klientowi, a nie od czasu jej wykonania. Jeśli kampania czy system oszczędza klientowi setki godzin albo generuje wymierny przychód, jego skłonność do zapłaty jest znacznie wyższa niż suma Twoich godzin.</p>
<p>Ten model bywa najbardziej dochodowy, ale wymaga dwóch rzeczy: pracy, której efekt da się powiązać z pieniędzmi klienta, oraz Twojej umiejętności pokazania tej wartości. Nie sprawdzi się przy zadaniach czysto wykonawczych, gdzie trudno wskazać mierzalny efekt. Tam wracasz do ryczałtu lub stawki godzinowej.</p>

<h2>Jak wybrać model do konkretnego projektu</h2>
<p>Decyzję najłatwiej podjąć, odpowiadając na kilka pytań o charakter zlecenia. Nie ma jednego dobrego modelu — jest model dopasowany do sytuacji.</p>
<ol>
<li><strong>Czy zakres jest jasny i zamknięty?</strong> Jeśli tak i masz dane o pracochłonności — ryczałt. Jeśli nie — stawka godzinowa.</li>
<li><strong>Czy przewidujesz zmiany i poprawki?</strong> Duża zmienność przemawia za rozliczeniem godzinowym, które chroni przed pracą za darmo.</li>
<li><strong>Czy efekt pracy da się powiązać z przychodem klienta?</strong> Jeśli tak i potrafisz to pokazać — rozważ wycenę wartościową.</li>
<li><strong>Czy masz historię podobnych projektów?</strong> Bez danych o czasie ryczałt jest ryzykowny — zacznij od godzinowego, aż zbudujesz punkt odniesienia.</li>
</ol>

<h3>Model hybrydowy</h3>
<p>W praktyce często najlepiej sprawdza się połączenie. Możesz wycenić rdzeń projektu o jasnym zakresie ryczałtem, a wszystko poza nim — dodatkowe rundy poprawek, zmiany zakresu, prace serwisowe — rozliczać godzinowo. Taki układ daje klientowi przewidywalność kosztu podstawowego, a Ciebie chroni przed nieograniczonym rozrostem zakresu. To rozsądny kompromis, gdy część pracy jest domknięta, a część nie.</p>

<h2>Najczęstsze błędy przy wycenie</h2>
<ul>
<li><strong>Ryczałt bez bufora.</strong> Wycena "dokładnie na styk" zamienia każde niedoszacowanie w stratę. Bufor to cena ryzyka, nie fanaberia.</li>
<li><strong>Wycena bez znajomości własnej stawki.</strong> Bez realnej stawki godzinowej każda kwota jest zgadywaniem.</li>
<li><strong>Ryczałt przy niejasnym zakresie.</strong> Otwarty zakres plus stała cena to przepis na pracę za darmo przy kolejnych poprawkach.</li>
<li><strong>Brak zapisu zakresu w umowie.</strong> Bez spisanego zakresu klient i Ty inaczej rozumiecie, co obejmuje cena.</li>
<li><strong>Nierewidowanie wyceny.</strong> Jeśli po projekcie nie sprawdzasz, ile realnie zajął, powtarzasz te same błędy w kolejnych wycenach.</li>
</ul>

<h2>Przykład liczbowy: ta sama praca w trzech modelach</h2>
<p>Weźmy konkret. Projektujesz i wdrażasz landing page dla lokalnej firmy. Twoja realna stawka godzinowa to 120 zł, a praca zajmuje 25 godzin. Klient dzięki stronie spodziewa się 30 tysięcy zł dodatkowego przychodu rocznie. Zobacz, jak różni się wynik w zależności od modelu.</p>
<table>
<thead>
<tr><th>Model</th><th>Podstawa wyceny</th><th>Kwota dla klienta</th><th>Twoja realna stawka</th></tr>
</thead>
<tbody>
<tr><td>Stawka godzinowa</td><td>25 h x 120 zł</td><td>3000 zł</td><td>120 zł/h</td></tr>
<tr><td>Ryczałt z buforem 20 procent</td><td>25 h x 120 zł + bufor</td><td>3600 zł</td><td>144 zł/h (jeśli zdążysz w 25 h)</td></tr>
<tr><td>Wycena wartościowa</td><td>Ok. 20 procent rocznej korzyści klienta</td><td>6000 zł</td><td>240 zł/h</td></tr>
</tbody>
</table>
<p>Ta sama praca warta jest od 3000 do 6000 zł w zależności od tego, jak ją wycenisz. Kluczowa obserwacja: przy ryczałcie bufor 600 zł podnosi Twoją stawkę do 144 zł/h, jeśli zmieścisz się w czasie, ale jeśli projekt urośnie do 40 godzin, realna stawka spada do 90 zł/h. Przy wycenie wartościowej klient patrzy nie na Twoje godziny, lecz na zwrot z inwestycji — 6000 zł przy spodziewanych 30 tysiącach przychodu to dla niego wciąż świetny interes.</p>

<h2>Scenariusze: który model wygrywa w praktyce</h2>
<p>Teoria dopasowuje się do rzeczywistości najlepiej na przykładach typowych zleceń. Poniżej cztery częste sytuacje i rekomendowany model.</p>
<ul>
<li><strong>Sklep internetowy na gotowym szablonie, jasna specyfikacja.</strong> Zakres zamknięty, masz dane z podobnych wdrożeń — ryczałt z buforem 15 procent.</li>
<li><strong>Rozbudowa istniejącego systemu, zakres odkrywany w trakcie.</strong> Nie wiadomo, na co natrafisz w kodzie — stawka godzinowa z limitem informacyjnym co tydzień.</li>
<li><strong>Kampania reklamowa z jasnym celem sprzedażowym.</strong> Efekt wprost przekłada się na przychód — wycena wartościowa lub ryczałt plus premia od wyniku.</li>
<li><strong>Długa współpraca serwisowa bez końcowej daty.</strong> Pakiet godzin miesięcznie (abonament) — przewidywalny dla obu stron.</li>
</ul>

<h2>Jak rozmawiać z klientem o cenie</h2>
<p>Nawet najlepsza wycena przepadnie, jeśli źle ją przedstawisz. Sposób komunikacji ceny wpływa na to, czy klient widzi koszt, czy inwestycję.</p>
<ol>
<li><strong>Najpierw wartość, potem cena.</strong> Zanim podasz kwotę, opisz, co klient dzięki pracy zyska. Cena podana bez kontekstu zawsze wydaje się za wysoka.</li>
<li><strong>Podawaj jedną rekomendowaną opcję plus warianty.</strong> Trzy pakiety (podstawowy, standardowy, rozszerzony) przesuwają rozmowę z czy na który, i podnoszą średnią wartość zlecenia.</li>
<li><strong>Nie tłumacz się ze stawki.</strong> Podaj kwotę spokojnie i zamilcz. Nadmiar uzasadnień sygnalizuje niepewność co do własnej wartości.</li>
<li><strong>Zamiast schodzić z ceny, zmniejsz zakres.</strong> Gdy budżet nie domyka się, tnij zakres, nie stawkę — inaczej uczysz klienta, że Twoja cena jest umowna.</li>
</ol>

<h2>Checklista przed wysłaniem wyceny</h2>
<p>Zanim klikniesz wyślij, przejdź tę listę. Większość nierentownych projektów przegrywa się już na etapie oferty, a nie wykonania.</p>
<ul>
<li><strong>Znasz swoją realną stawkę godzinową</strong> z uwzględnieniem podatków, składek i czasu niefakturowanego.</li>
<li><strong>Oszacowałeś godziny na podstawie danych</strong> z podobnych zleceń, nie optymistycznego przeczucia.</li>
<li><strong>Dodałeś bufor</strong> adekwatny do niepewności zakresu (15-30 procent przy ryczałcie).</li>
<li><strong>Zakres jest spisany</strong> punkt po punkcie, z jasnym określeniem, co nie wchodzi w cenę.</li>
<li><strong>Ustaliłeś zasady poprawek</strong> — ile rund jest w cenie i jak rozliczane są kolejne.</li>
<li><strong>Masz zapisane warunki płatności</strong> — zaliczka, terminy, konsekwencje opóźnienia.</li>
</ul>

<h2>Jak SzpontHub pomaga trafnie wyceniać projekty</h2>
<p>Dobra wycena opiera się na danych z przeszłych zleceń, a te daje śledzenie czasu. W SzpontHub uruchamiasz licznik czasu (timer) dla każdego projektu i przypisujesz stawkę godzinową, dzięki czemu po zakończeniu widzisz, ile realnie zajął i czy Twój ryczałt się opłacił. Rozliczanie zleceń i tygodni pokazuje realną stawkę za każdy projekt, więc kolejną wycenę opierasz na twardych liczbach, a nie na przeczuciu. Im więcej zleceń zmierzysz, tym celniejsze stają się Twoje ryczałty.</p>
`,
  faq: [
    {
      q: 'Ryczałt czy stawka godzinowa — co wybrać?',
      a: 'Wybór zależy od zakresu. Ryczałt sprawdza się przy jasnym, zamkniętym zakresie i premiuje Twoją efektywność, ale przerzuca na Ciebie ryzyko niedoszacowania. Stawka godzinowa pasuje do projektów o zmiennym lub nieznanym zakresie i chroni przed pracą za darmo, lecz karze za szybkość i budzi obawy klienta o końcowy koszt.',
    },
    {
      q: 'Jak policzyć ryczałt za projekt?',
      a: 'Oszacuj przewidywaną liczbę godzin, pomnóż ją przez swoją realną stawkę godzinową i dodaj bufor na niedoszacowanie, zwykle 15–30 procent. Bufor to cena ryzyka, które bierzesz na siebie, bo przy ryczałcie każde przekroczenie czasu obniża Twój zarobek na godzinę, a kwoty na fakturze już nie zmienisz.',
    },
    {
      q: 'Czym jest wycena wartościowa?',
      a: 'To model, w którym cena zależy od wartości, jaką praca przynosi klientowi, a nie od czasu jej wykonania. Jeśli efekt oszczędza klientowi godziny lub generuje przychód, jego skłonność do zapłaty jest wyższa niż suma Twoich godzin. Sprawdza się tam, gdzie efekt da się powiązać z pieniędzmi klienta.',
    },
    {
      q: 'Kiedy ryczałt jest ryzykowny?',
      a: 'Gdy zakres projektu jest niejasny lub otwarty, a Ty nie masz danych o pracochłonności podobnych zleceń. Wtedy łatwo o niedoszacowanie, a każda dodatkowa runda poprawek to praca za darmo. W takiej sytuacji bezpieczniejsza jest stawka godzinowa albo model hybrydowy z rdzeniem w ryczałcie i resztą rozliczaną za godziny.',
    },
    {
      q: 'Czy można łączyć ryczałt ze stawką godzinową?',
      a: 'Tak, to częsty i rozsądny kompromis. Rdzeń projektu o jasnym zakresie wyceniasz ryczałtem, a dodatkowe poprawki, zmiany zakresu czy prace serwisowe rozliczasz godzinowo. Klient zyskuje przewidywalność kosztu podstawowego, a Ty chronisz się przed nieograniczonym rozrostem zakresu poza pierwotne ustalenia.',
    },
    {
      q: 'Jak poprawić trafność wycen na przyszłość?',
      a: 'Mierz czas przy każdym zleceniu i po zakończeniu porównuj realne godziny z wyceną. Dzięki archiwum danych o pracochłonności następne ryczałty oprzesz na faktach, a nie na przeczuciu, które systematycznie zaniża czas. Im więcej projektów zmierzysz, tym celniejsze i bezpieczniejsze stają się Twoje wyceny.',
    },
    {
      q: 'Jak przedstawić klientowi cenę, żeby jej nie negocjował w dół?',
      a: 'Najpierw opisz wartość i efekt pracy, dopiero potem podaj kwotę — cena bez kontekstu zawsze wydaje się wysoka. Zaproponuj kilka wariantów pakietowych, żeby rozmowa dotyczyła wyboru opcji, a nie tego, czy w ogóle. Gdy klient naciska na niższą cenę, tnij zakres, a nie stawkę, bo obniżanie stawki uczy go, że Twoja cena jest umowna.',
    },
  ],
};

export default article;
