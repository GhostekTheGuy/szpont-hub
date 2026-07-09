import type { Article } from './types';

const article: Article = {
  slug: 'jak-liczyc-stawke-godzinowa-freelancer',
  title: 'Jak policzyć stawkę godzinową freelancera — wzór i przykłady',
  description:
    'Ile brać za godzinę pracy jako freelancer? Gotowy wzór na stawkę godzinową, uwzględnienie podatków, składek i czasu niefakturowanego oraz przykładowe wyliczenia.',
  category: 'freelancer',
  tags: ['stawka godzinowa', 'freelancer', 'wycena', 'śledzenie czasu pracy', 'faktury'],
  tldr:
    'Stawki godzinowej nie liczy się od pensji etatowej podzielonej przez 160 godzin. Musisz uwzględnić, że fakturujesz tylko część czasu (zwykle 50–70%), a z przychodu opłacasz podatek, składki ZUS, koszty narzędzi, urlop i chorobę. Realny wzór to: docelowy dochód netto plus wszystkie koszty roczne, podzielone przez liczbę godzin, które faktycznie zafakturujesz w roku.',
  keyTakeaways: [
    'Fakturujesz 50–70% czasu pracy, nie 100% — reszta to sprzedaż, administracja, przerwy.',
    'Do stawki wliczasz podatek, ZUS, koszty narzędzi, urlop, chorobę i bufor na okresy bez zleceń.',
    'Stawka etatowa podzielona przez 160 h zaniża realną stawkę freelancera nawet dwukrotnie.',
    'Śledź czas pracy, by znać swoją realną liczbę godzin fakturowanych i rentowność zleceń.',
    'Regularnie porównuj stawkę zakładaną z realnie osiągniętą — różnica pokazuje, gdzie tracisz.',
    'Policz stawkę osobno dla swojej formy opodatkowania — ryczałt, liniowy i skala dają różny narzut.',
    'Podnoś stawkę o 10-20 procent rocznie na nowych zapytaniach, gdy domykasz niemal każdą wycenę.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Ustalenie stawki godzinowej to jedna z najważniejszych decyzji freelancera — i jedna z najczęściej zaniżanych. Większość osób liczy ją intuicyjnie albo kopiuje od innych, przez co pracuje poniżej realnych kosztów. W tym poradniku znajdziesz konkretny wzór, który uwzględnia wszystko, co pochłania Twój przychód, oraz przykładowe wyliczenia.</p>

<h2>Dlaczego pensja etatowa to zły punkt odniesienia</h2>
<p>Najczęstszy błąd to wzięcie oczekiwanej pensji netto (np. 8000 zł) i podzielenie jej przez standardowe 160 godzin roboczych w miesiącu, co daje 50 zł za godzinę. Ta liczba jest kompletnie oderwana od rzeczywistości freelancera z dwóch powodów.</p>
<p>Po pierwsze, jako freelancer nie fakturujesz 160 godzin miesięcznie. Część czasu pochłania pozyskiwanie klientów, wyceny, faktury, księgowość, nauka i przerwy. Realnie fakturowalne jest zwykle 50–70% czasu pracy. Po drugie, z każdej zafakturowanej złotówki opłacasz podatek, składki ZUS, koszty narzędzi i oprogramowania, a także finansujesz własny urlop i chorobowe, których nikt Ci nie zapłaci.</p>

<h2>Wzór na stawkę godzinową freelancera</h2>
<p>Realną stawkę liczymy w skali roku, bo tylko wtedy uwzględnimy urlop, chudsze miesiące i koszty roczne. Wzór wygląda tak:</p>
<blockquote>Stawka godzinowa = (docelowy dochód netto + podatek i składki + koszty roczne + bufor) ÷ liczba godzin fakturowanych w roku</blockquote>
<p>Rozłóżmy każdy element na czynniki:</p>
<ul>
<li><strong>Docelowy dochód netto</strong> — ile chcesz „na rękę” rocznie, po wszystkich odliczeniach.</li>
<li><strong>Podatek i składki</strong> — PIT (liniowy, skala lub ryczałt), składki ZUS i zdrowotna. Zależą od formy działalności.</li>
<li><strong>Koszty roczne</strong> — sprzęt, oprogramowanie, biuro/coworking, księgowość, szkolenia, marketing.</li>
<li><strong>Bufor</strong> — na okresy bez zleceń, niezapłacone faktury i nieprzewidziane koszty (10–20%).</li>
<li><strong>Godziny fakturowane</strong> — realna liczba godzin, za które wystawisz faktury w ciągu roku.</li>
</ul>

<h3>Ile godzin faktycznie fakturujesz</h3>
<p>Rok ma około 2000 godzin roboczych (250 dni × 8 h). Odejmij urlop (np. 20 dni = 160 h), dni chorobowe i święta, a następnie przyjmij, że tylko 50–70% pozostałego czasu jest fakturowane. Przy współczynniku 60% i 1700 godzinach dostępnych realnie zafakturujesz około 1000 godzin rocznie. To właśnie ta liczba, a nie 2000, jest mianownikiem we wzorze.</p>

<h2>Przykładowe wyliczenie</h2>
<p>Załóżmy freelancera na działalności, który chce 90 000 zł netto rocznie.</p>
<table>
<thead>
<tr><th>Pozycja</th><th>Kwota roczna</th></tr>
</thead>
<tbody>
<tr><td>Docelowy dochód netto</td><td>90 000 zł</td></tr>
<tr><td>Podatek i składki (szacunkowo)</td><td>35 000 zł</td></tr>
<tr><td>Koszty (sprzęt, software, księgowość)</td><td>12 000 zł</td></tr>
<tr><td>Bufor 15%</td><td>20 550 zł</td></tr>
<tr><td><strong>Razem do zarobienia</strong></td><td><strong>157 550 zł</strong></td></tr>
<tr><td>Godziny fakturowane w roku</td><td>1000 h</td></tr>
<tr><td><strong>Minimalna stawka godzinowa</strong></td><td><strong>≈ 158 zł/h</strong></td></tr>
</tbody>
</table>
<p>Zwróć uwagę na skalę różnicy: intuicyjne „50 zł za godzinę” z początku artykułu jest ponad trzykrotnie za niskie. To dokładnie ten mechanizm sprawia, że wielu freelancerów pracuje dużo, a na koncie zostaje mało.</p>

<h2>Jak forma opodatkowania zmienia stawkę</h2>
<p>Element „podatek i składki” w mianowniku różni się zależnie od formy działalności. To nie jest szczegół księgowy — potrafi przesunąć minimalną stawkę o kilkanaście złotych na godzinie. Poniżej poglądowe porównanie dla przychodu rzędu 200 000 zł rocznie. Traktuj je jako materiał informacyjny, a konkretne progi skonsultuj z księgową, bo stawki i limity zmieniają się co roku.</p>
<table>
<thead>
<tr><th>Forma</th><th>Charakter obciążeń</th><th>Kiedy zwykle korzystna</th></tr>
</thead>
<tbody>
<tr><td>Ryczałt</td><td>Procent od przychodu, bez kosztów</td><td>Niskie koszty, wysoka marża usługi</td></tr>
<tr><td>Podatek liniowy 19 procent</td><td>Od dochodu, składka zdrowotna 4,9 procent</td><td>Wysoki dochód, spore koszty</td></tr>
<tr><td>Skala 12/32 procent</td><td>Kwota wolna, próg 120 000 zł</td><td>Niższy dochód, ulgi rodzinne</td></tr>
</tbody>
</table>
<p>Wniosek praktyczny: policz stawkę osobno dla swojej realnej formy opodatkowania, bo przeniesienie założeń od kolegi na ryczałcie do własnej działalności na skali potrafi zaniżyć wycenę. Więcej o samym planowaniu obciążeń znajdziesz w poradniku <a href="/poradniki/jak-planowac-podatki-freelancer">jak planować podatki jako freelancer</a>.</p>

<h2>Od stawki godzinowej do wyceny projektu</h2>
<p>Stawka godzinowa jest narzędziem wewnętrznym — klientowi częściej podajesz cenę za projekt. Przeliczenie robisz w czterech krokach:</p>
<ol>
<li>Oszacuj liczbę godzin dla każdego etapu projektu, osobno dla części pewnej i ryzykownej.</li>
<li>Dodaj narzut na rozmowy, poprawki i administrację — zwykle 20-30 procent godzin merytorycznych.</li>
<li>Pomnóż sumę godzin przez swoją minimalną stawkę, tu 158 zł/h.</li>
<li>Dołóż bufor na ryzyko przekroczenia, jeśli zakres jest nieostry.</li>
</ol>
<p>Przykład: projekt szacowany na 30 godzin merytorycznych plus 8 godzin narzutu to 38 godzin. Przy 158 zł/h wychodzi około 6000 zł. Jeśli zakres jest mglisty, wycena 6500-7000 zł chroni Cię przed pracą poniżej progu.</p>

<h2>Stawka zakładana a realnie osiągnięta</h2>
<p>Ustalenie stawki to dopiero połowa pracy. Druga połowa to sprawdzanie, czy faktycznie ją osiągasz. Jeśli wyceniasz projekt ryczałtem, a zajmie Ci on dwa razy więcej godzin niż zakładałeś, Twoja realna stawka spada o połowę — nawet jeśli faktura opiewa na „dobrą” kwotę.</p>
<p>Dlatego warto śledzić czas pracy przy każdym zleceniu i porównywać go z przychodem. W SzpontHub możesz uruchomić licznik czasu (timer) dla konkretnego zlecenia i przypisać stawkę godzinową — po zakończeniu pracy zobaczysz realny zarobek za godzinę i od razu wychwycisz projekty, które wyglądały opłacalnie, a w praktyce były pod kreską.</p>

<h2>Jak podnosić stawkę bez utraty klientów</h2>
<ul>
<li><strong>Podnoś stawkę nowym klientom.</strong> Dotychczasowych możesz informować o zmianie z wyprzedzeniem, ale najmniej ryzykowne jest testowanie wyższej stawki na nowych zapytaniach.</li>
<li><strong>Wyceniaj wartość, nie godziny.</strong> Jeśli Twoja praca oszczędza klientowi czas lub przynosi mu przychód, wycena wartościowa (za efekt) bywa korzystniejsza niż godzinowa.</li>
<li><strong>Pokazuj konkret.</strong> Portfolio, wyniki i terminowość uzasadniają wyższą stawkę bardziej niż sama liczba lat doświadczenia.</li>
<li><strong>Znaj swój próg.</strong> Wiedząc, jaka jest Twoja minimalna opłacalna stawka, łatwiej odmówić zleceniom poniżej niej bez poczucia winy.</li>
</ul>

<h2>Częste błędy przy ustalaniu stawki</h2>
<p>Poza liczeniem od pensji etatowej freelancerzy wpadają w kilka innych pułapek zaniżających stawkę:</p>
<ul>
<li><strong>Pomijanie chudych miesięcy.</strong> Wakacje i grudzień bywają puste, a koszty życia zostają. Bufor to nie ostrożność, to konieczność.</li>
<li><strong>Zapominanie o składce zdrowotnej.</strong> Przy liniowym i skali potrafi urosnąć proporcjonalnie do dochodu i wielu zaskakuje przy rozliczeniu.</li>
<li><strong>Wycena według stawki konkurencji.</strong> Cudza stawka nie zna Twoich kosztów ani Twojego progu — to punkt odniesienia, nie wzór.</li>
<li><strong>Brak rewizji stawki.</strong> Inflacja i rosnące doświadczenie oznaczają, że stawka sprzed dwóch lat dziś realnie zubaża.</li>
<li><strong>Traktowanie 100 procent czasu jako fakturowanego.</strong> Bez współczynnika 50-70 procent cała kalkulacja się rozjeżdża.</li>
</ul>

<h2>Kiedy i o ile podnosić stawkę</h2>
<p>Nie ma jednej reguły, ale są wyraźne sygnały, że pora na rewizję w górę:</p>
<ul>
<li><strong>Masz więcej zapytań, niż jesteś w stanie obsłużyć.</strong> Popyt przewyższa podaż — rynek akceptuje wyższą cenę.</li>
<li><strong>Domykasz niemal każdą wycenę.</strong> Stuprocentowa skuteczność ofert zwykle znaczy, że jesteś za tani.</li>
<li><strong>Twoje koszty wzrosły.</strong> Nowy sprzęt, droższe oprogramowanie, wyższy ZUS — stawka musi za tym nadążyć.</li>
</ul>
<p>Rozsądny krok to 10-20 procent rocznie na nowych zapytaniach. Jeśli skuteczność ofert spadnie do około 50-60 procent, prawdopodobnie trafiłeś w stawkę rynkową.</p>

<h2>Podsumowanie</h2>
<p>Stawka godzinowa freelancera to nie pensja podzielona przez godziny etatu, lecz roczny koszt Twojej działalności i życia podzielony przez godziny, które realnie zafakturujesz. Policz ją uczciwie, a potem pilnuj, czy ją osiągasz — śledzenie czasu i przychodu w jednym miejscu zamienia wycenę z domysłu w decyzję opartą na danych.</p>
`,
  faq: [
    {
      q: 'Jak policzyć stawkę godzinową freelancera?',
      a: 'Zsumuj docelowy dochód netto, podatek i składki, koszty roczne oraz bufor na okresy bez zleceń, a następnie podziel tę kwotę przez liczbę godzin, które realnie zafakturujesz w roku (zwykle 50–70% czasu pracy). To daje minimalną opłacalną stawkę.',
    },
    {
      q: 'Dlaczego nie można liczyć stawki jak pensji etatowej?',
      a: 'Bo jako freelancer nie fakturujesz całego czasu pracy i sam opłacasz podatek, składki, narzędzia, urlop oraz chorobę. Pensja netto podzielona przez 160 godzin zaniża realną stawkę freelancera nawet dwu-, trzykrotnie.',
    },
    {
      q: 'Ile procent czasu pracy freelancer realnie fakturuje?',
      a: 'Zwykle 50–70%. Reszta to pozyskiwanie klientów, wyceny, faktury, księgowość, nauka i przerwy. Przy planowaniu stawki bezpiecznie przyjąć około 60% czasu jako fakturowane.',
    },
    {
      q: 'Co powinno wchodzić w koszty przy wyliczaniu stawki?',
      a: 'Sprzęt i jego amortyzacja, oprogramowanie i subskrypcje, biuro lub coworking, księgowość, szkolenia, marketing oraz bufor na okresy bez zleceń i niezapłacone faktury. Wszystkie te koszty pokrywasz z przychodu.',
    },
    {
      q: 'Jak sprawdzić, czy osiągam założoną stawkę?',
      a: 'Śledź czas pracy przy każdym zleceniu i porównuj go z przychodem z tego zlecenia. Jeśli projekt ryczałtowy zajmie dwa razy więcej godzin niż zakładałeś, realna stawka spada o połowę. Licznik czasu z przypisaną stawką pokazuje realny zarobek za godzinę.',
    },
    {
      q: 'Jak podnieść stawkę godzinową bez utraty klientów?',
      a: 'Testuj wyższą stawkę na nowych zapytaniach, wyceniaj wartość i efekt zamiast samych godzin, pokazuj konkretne wyniki w portfolio i znaj swój próg opłacalności, by spokojnie odmawiać zleceniom poniżej niego.',
    },
    {
      q: 'Jak przeliczyć stawkę godzinową na wycenę projektu?',
      a: 'Oszacuj godziny dla każdego etapu, dodaj 20-30 procent narzutu na rozmowy, poprawki i administrację, pomnóż sumę przez swoją minimalną stawkę i dołóż bufor, jeśli zakres jest nieostry. Projekt na 30 godzin merytorycznych plus 8 narzutu przy stawce 158 zł/h to około 6000 zł.',
    },
    {
      q: 'Czy forma opodatkowania wpływa na stawkę godzinową?',
      a: 'Tak, bo zmienia wielkość obciążeń, które pokrywasz z przychodu. Ryczałt liczy procent od przychodu bez kosztów, liniowy 19 procent od dochodu plus składka zdrowotna, a skala ma kwotę wolną i próg 120 000 zł. Policz stawkę osobno dla swojej formy, bo różnica sięga kilkunastu złotych na godzinie.',
    },
  ],
};

export default article;
