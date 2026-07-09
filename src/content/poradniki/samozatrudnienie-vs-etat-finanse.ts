import type { Article } from './types';

const article: Article = {
  slug: 'samozatrudnienie-vs-etat-finanse',
  title: 'Samozatrudnienie a etat — porównanie finansów krok po kroku',
  description:
    'Ile realnie zarabiasz na B2B, a ile na etacie? Porównanie kosztów, składek, podatków i świadczeń, tabela przeliczeń oraz kiedy samozatrudnienie się opłaca.',
  category: 'freelancer',
  tags: ['samozatrudnienie', 'etat', 'B2B', 'podatki', 'ZUS'],
  tldr:
    'Samozatrudnienie zwykle daje wyższą kwotę na rękę przy tej samej wartości dla firmy, bo niższe są podatki (ryczałt lub liniowy) i większa kontrola nad kosztami. W zamian tracisz świadczenia etatu: płatny urlop, chorobowe, ochronę przed zwolnieniem i składki opłacane przez pracodawcę. Realne porównanie wymaga doliczenia do stawki B2B wartości tych świadczeń oraz własnej poduszki na okresy bez zleceń.',
  keyTakeaways: [
    'Nie porównuj stawki B2B brutto z pensją netto — dolicz do B2B urlop, chorobowe i koszty, które na etacie masz w cenie.',
    'Samozatrudnienie daje wyższą kwotę na rękę dzięki niższym podatkom i odliczaniu kosztów uzyskania przychodu.',
    'Na etacie płacisz spokojem: płatny urlop, chorobowe, ochronę zatrudnienia i składki finansowane przez pracodawcę.',
    'Przy B2B sam finansujesz urlop, chorobę, poduszkę na okresy bez zleceń i własną emeryturę.',
    'Punkt opłacalności B2B zaczyna się zwykle od stawki wyraźnie wyższej niż odpowiadające jej wynagrodzenie etatowe.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Wybór między etatem a samozatrudnieniem sprowadza się często do jednego pytania: gdzie zostaje więcej pieniędzy. Odpowiedź nie jest tak prosta, jak porównanie dwóch kwot, bo etat i B2B różnią się nie tylko wysokością wpływów, ale też tym, co za te pieniądze dostajesz. W tym poradniku rozłożymy oba modele na czynniki i pokażemy, jak policzyć realne porównanie zamiast mylącego zestawienia stawki brutto z pensją netto.</p>

<h2>Dlaczego nie da się porównać samych kwot</h2>
<p>Najczęstszy błąd to zestawienie stawki B2B (np. 15 000 zł) z pensją etatową netto (np. 8000 zł) i wniosek, że samozatrudnienie jest dwa razy lepsze. To porównanie jabłek z gruszkami. Ze stawki B2B sam opłacasz składki, podatek i koszty, a dodatkowo finansujesz urlop i chorobę, które na etacie masz wliczone. Etat kosztuje pracodawcę znacznie więcej niż Twoja pensja netto — różnicę pochłaniają składki i podatki, których na co dzień nie widzisz.</p>
<blockquote>Uczciwe porównanie: stawka B2B minus wszystkie jej koszty i minus wartość świadczeń, które na etacie dostajesz gratis, kontra pensja netto plus wartość tych świadczeń.</blockquote>

<h2>Co dostajesz na etacie poza pensją</h2>
<p>Etat to nie tylko przelew co miesiąc. To pakiet świadczeń, które mają realną wartość pieniężną, choć nie widnieją na pasku wypłaty jako osobne kwoty:</p>
<ul>
<li><strong>Płatny urlop</strong> — 20 lub 26 dni, w czasie których dostajesz pensję, nie pracując.</li>
<li><strong>Wynagrodzenie chorobowe i zasiłek</strong> — gdy zachorujesz, nie tracisz całego dochodu.</li>
<li><strong>Składki opłacane przez pracodawcę</strong> — część składek ZUS i emerytalnych finansuje pracodawca.</li>
<li><strong>Ochrona zatrudnienia</strong> — okres wypowiedzenia i ograniczenia w zwalnianiu dają przewidywalność.</li>
<li><strong>Brak ryzyka administracyjnego</strong> — nie prowadzisz księgowości, nie martwisz się o faktury i terminy podatkowe.</li>
</ul>
<p>Te elementy mają wartość, którą przy przejściu na B2B musisz sfinansować sam — dlatego stawka B2B równa pensji brutto oznacza w praktyce spadek realnych korzyści.</p>

<h2>Co zyskujesz na samozatrudnieniu</h2>
<p>Samozatrudnienie odwdzięcza się w innych obszarach. Największe korzyści finansowe to niższe efektywne opodatkowanie i możliwość odliczania kosztów:</p>
<ul>
<li><strong>Niższe podatki</strong> — ryczałt lub podatek liniowy 19% bywają korzystniejsze niż skala podatkowa przy wyższych dochodach. Który wybrać, opisujemy w poradniku <a href="/poradniki/ryczalt-czy-podatek-liniowy-freelancer">ryczałt czy podatek liniowy</a>.</li>
<li><strong>Koszty uzyskania przychodu</strong> — sprzęt, oprogramowanie, samochód czy biuro obniżają podstawę opodatkowania. Więcej w poradniku <a href="/poradniki/koszty-uzyskania-przychodu-freelancer">koszty uzyskania przychodu</a>.</li>
<li><strong>Skalowalność</strong> — możesz mieć wielu klientów i podnosić stawki, czego etat nie umożliwia.</li>
<li><strong>Elastyczność</strong> — sam decydujesz, ile i dla kogo pracujesz.</li>
</ul>

<h2>Porównanie finansowe na liczbach</h2>
<p>Poniższa tabela pokazuje uproszczone zestawienie dla osoby, której praca ma dla firmy wartość około 16 000 zł miesięcznie. Kwoty są orientacyjne i zależą od formy opodatkowania oraz roku — traktuj je jako ilustrację mechanizmu, nie dokładne wyliczenie.</p>
<table>
<thead>
<tr><th>Pozycja</th><th>Etat (UoP)</th><th>Samozatrudnienie (B2B)</th></tr>
</thead>
<tbody>
<tr><td>Kwota wyjściowa</td><td>16 000 zł brutto</td><td>16 000 zł netto faktury</td></tr>
<tr><td>Składki ZUS</td><td>Część płaci pracodawca</td><td>W całości po Twojej stronie</td></tr>
<tr><td>Podatek</td><td>Skala 12/32%</td><td>Liniowy 19% lub ryczałt</td></tr>
<tr><td>Koszty (sprzęt, software)</td><td>Nieodliczalne</td><td>Obniżają podstawę podatku</td></tr>
<tr><td>Płatny urlop</td><td>Tak, wliczony</td><td>Finansujesz sam</td></tr>
<tr><td>Chorobowe</td><td>Tak</td><td>Zależy od dobrowolnych składek</td></tr>
<tr><td>Na rękę (orientacyjnie)</td><td>Niższe</td><td>Wyższe</td></tr>
</tbody>
</table>
<p>Wniosek: przy tej samej wartości dla firmy B2B daje zwykle więcej na rękę, ale różnica częściowo pokrywa koszty świadczeń, które na etacie były w cenie. Ten materiał ma charakter informacyjny — przed decyzją warto policzyć własny przypadek z księgowym.</p>

<h3>Ile doliczyć do stawki B2B, żeby porównanie było uczciwe</h3>
<p>Praktyczna metoda: do wymaganej stawki B2B dolicz wartość utraconych świadczeń. Płatny urlop to około 8–10% rocznej pracy, rezerwa na chorobę kilka procent, poduszka na okresy bez zleceń kolejne kilka. W sumie stawka B2B powinna być o kilkanaście do dwudziestu kilku procent wyższa niż odpowiadające jej wynagrodzenie etatowe, żeby faktycznie wyjść na swoje.</p>

<h2>Ukryte koszty samozatrudnienia</h2>
<p>Poza księgowością i składkami samozatrudnienie niesie koszty, które łatwo przeoczyć w euforii wyższej kwoty na fakturze:</p>
<ol>
<li><strong>Okresy bez zleceń.</strong> Nikt nie zapłaci Ci za miesiąc, w którym nie masz klienta — potrzebujesz poduszki finansowej. Jak dużej, opisujemy w poradniku <a href="/poradniki/jak-zarzadzac-nieregularnym-dochodem">jak zarządzać nieregularnym dochodem</a>.</li>
<li><strong>Własna emerytura.</strong> Niższe składki dziś oznaczają niższą emeryturę — różnicę warto inwestować samodzielnie.</li>
<li><strong>Ryzyko niepłacących klientów.</strong> Na etacie pensja jest pewna, przy B2B egzekwujesz płatności sam.</li>
<li><strong>Czas administracyjny.</strong> Faktury, podatki i księgowość to godziny, których nikt Ci nie fakturuje.</li>
</ol>

<h2>Konkretny przykład w złotówkach</h2>
<p>Przełóżmy mechanizm na liczby. Załóżmy, że Twoja praca jest warta dla firmy około 16 000 zł miesięcznie i porównujemy trzy warianty: etat, B2B na podatku liniowym oraz B2B na ryczałcie 12%. Kwoty są mocno uproszczone i pomijają część odliczeń oraz zmienne progi — pokazują skalę różnic, nie dokładne rozliczenie.</p>
<table>
<thead>
<tr><th>Pozycja miesięczna</th><th>Etat (UoP)</th><th>B2B liniowy 19%</th><th>B2B ryczałt 12%</th></tr>
</thead>
<tbody>
<tr><td>Kwota wyjściowa</td><td>16 000 zł brutto</td><td>16 000 zł netto faktury</td><td>16 000 zł netto faktury</td></tr>
<tr><td>Składki ZUS (orientacyjnie)</td><td>ok. 2 200 zł po Twojej stronie</td><td>ok. 1 600 zł</td><td>ok. 1 600 zł</td></tr>
<tr><td>Podatek (orientacyjnie)</td><td>ok. 2 400 zł</td><td>ok. 2 700 zł</td><td>ok. 1 900 zł</td></tr>
<tr><td>Na rękę przed rezerwami</td><td>ok. 11 400 zł</td><td>ok. 11 700 zł</td><td>ok. 12 500 zł</td></tr>
<tr><td>Rezerwa na urlop i chorobę</td><td>0 zł (wliczone)</td><td>ok. 1 300 zł</td><td>ok. 1 300 zł</td></tr>
<tr><td>Realnie porównywalne na rękę</td><td>ok. 11 400 zł</td><td>ok. 10 400 zł</td><td>ok. 11 200 zł</td></tr>
</tbody>
</table>
<p>Zwróć uwagę na ostatni wiersz. Zanim doliczysz rezerwy, B2B wygląda wyraźnie lepiej. Po uwzględnieniu urlopu, chorobowego i okresów bez zleceń przewaga topnieje, a przy niekorzystnej formie opodatkowania etat potrafi wręcz wygrać w kwocie faktycznie porównywalnej. To pokazuje, dlaczego stawka z faktury sama w sobie jest myląca. To materiał informacyjny — realne progi, składki i ulgi policz z księgowym dla swojego przypadku.</p>

<h2>Ile odkładać na rezerwy przy B2B</h2>
<p>Na etacie rezerwy tworzy za Ciebie system. Przy B2B musisz je zbudować samodzielnie, inaczej pierwszy chory tydzień albo miesiąc bez zlecenia rozbije Twój budżet. Praktyczny podział procentowy każdej faktury wygląda zwykle tak.</p>
<ul>
<li><strong>Podatek i ZUS</strong> — odkładaj od razu po wpłynięciu faktury na osobne konto, żeby nie wydać pieniędzy fiskusa. Przy stawce 16 000 zł to zwykle 3 500–4 500 zł miesięcznie.</li>
<li><strong>Rezerwa urlopowa</strong> — około 8–10% przychodu, czyli około 1 300–1 600 zł, na miesiąc wolnego bez utraty dochodu.</li>
<li><strong>Rezerwa chorobowa i poduszka</strong> — kolejne kilka procent, docelowo bufor 3–6 miesięcy kosztów życia na okresy bez zleceń.</li>
<li><strong>Emerytura we własnym zakresie</strong> — różnica między niskimi składkami a docelową emeryturą to kwota, którą warto inwestować samodzielnie.</li>
</ul>

<h2>Częste błędy przy przejściu na B2B</h2>
<p>Najwięcej rozczarowań bierze się nie z samej matematyki, lecz z przeoczeń przy przejściu na samozatrudnienie.</p>
<ol>
<li><strong>Wydawanie pieniędzy fiskusa.</strong> Kwota na koncie firmowym nie jest Twoja — część należy do urzędu skarbowego i ZUS. Bez odkładania na bieżąco zaległość urośnie w skali roku.</li>
<li><strong>Ustalenie stawki B2B równej pensji brutto.</strong> To realny spadek korzyści, bo tracisz świadczenia, które trzeba dofinansować.</li>
<li><strong>Brak poduszki na start.</strong> Pierwsze faktury bywają płatne z opóźnieniem, a niektórzy klienci znikają — bez bufora wpadasz w pętlę pilnych zleceń po zaniżonej stawce.</li>
<li><strong>Zaniedbanie kredytu hipotecznego.</strong> Banki inaczej oceniają zdolność przy krótkim stażu B2B. Jeśli planujesz kredyt, sprawdź to przed zmianą formy.</li>
</ol>

<h2>Które koszty realnie obniżają podatek na B2B</h2>
<p>Jedną z głównych przewag samozatrudnienia jest możliwość odliczania kosztów uzyskania przychodu, które obniżają podstawę opodatkowania. Uwaga: to działa przy podatku liniowym i skali, ale nie przy ryczałcie, gdzie płacisz procent od przychodu bez odliczania kosztów. Poniższa tabela pokazuje typowe koszty i ich orientacyjną skalę u freelancera pracującego zdalnie.</p>
<table>
<thead>
<tr><th>Kategoria kosztu</th><th>Przykład</th><th>Orientacyjnie / rok</th></tr>
</thead>
<tbody>
<tr><td>Sprzęt</td><td>Laptop, monitor, telefon</td><td>4 000–10 000 zł</td></tr>
<tr><td>Oprogramowanie</td><td>Licencje, subskrypcje, narzędzia</td><td>1 200–4 000 zł</td></tr>
<tr><td>Biuro lub część mieszkania</td><td>Coworking lub proporcja czynszu</td><td>3 000–12 000 zł</td></tr>
<tr><td>Samochód i paliwo</td><td>Leasing, paliwo, serwis</td><td>zależne od użycia</td></tr>
<tr><td>Rozwój</td><td>Kursy, książki, konferencje</td><td>1 000–5 000 zł</td></tr>
</tbody>
</table>
<p>Prosty przykład: przy dochodzie i koszcie 12 000 zł rocznie na sprzęt i oprogramowanie oraz podatku liniowym 19% te koszty realnie zmniejszają podatek o około 2 280 zł. Na etacie te same zakupy pokrywasz z pieniędzy już opodatkowanych, więc kosztują Cię pełną kwotę. To realna, choć często pomijana część przewagi B2B — pod warunkiem że wybrana forma opodatkowania w ogóle pozwala odliczać koszty. Ten materiał ma charakter informacyjny; zakres kosztów uznawanych za podatkowe potwierdź z księgowym.</p>

<h2>Forma opodatkowania a wynik — ryczałt, liniowy czy skala</h2>
<p>Sama decyzja o B2B to dopiero początek — realny wynik finansowy w dużej mierze zależy od wybranej formy opodatkowania. Nie ma jednej najlepszej; wybór zależy od poziomu dochodu, wysokości kosztów i branży.</p>
<ul>
<li><strong>Ryczałt</strong> — niski procent od przychodu, bez odliczania kosztów. Opłaca się przy wysokim dochodzie i niskich kosztach, typowo w usługach.</li>
<li><strong>Podatek liniowy 19%</strong> — stała stawka niezależnie od dochodu, z odliczaniem kosztów. Korzystny przy wysokich dochodach i realnych kosztach.</li>
<li><strong>Skala podatkowa</strong> — 12% i 32% powyżej progu, z kwotą wolną. Bywa najlepsza przy niższych dochodach lub gdy korzystasz z ulg.</li>
</ul>
<p>Kluczowy wniosek: ta sama stawka z faktury daje różną kwotę na rękę zależnie od formy. Dlatego porównanie B2B z etatem trzeba robić dla konkretnej, wybranej formy opodatkowania, a nie ogólnie. Który wariant wypada najlepiej w Twoim przypadku, ustalisz najpewniej z księgowym na podstawie realnych liczb.</p>

<h2>Jak SzpontHub pomaga porównać i ogarnąć oba modele</h2>
<p>Przy samozatrudnieniu największym wyzwaniem jest nieregularność wpływów i konieczność samodzielnego pilnowania podatków oraz poduszki. W SzpontHub prowadzisz portfele, w których widzisz realny dochód po odłożeniu na podatek i ZUS, a nie mylącą kwotę z faktury. Kalendarz pracy z licznikiem czasu i stawką godzinową pokazuje, ile faktycznie zarabiasz za godzinę na B2B, co ułatwia porównanie z pensją etatową. Cele finansowe pomagają zbudować poduszkę na okresy bez zleceń, a raporty AI podsumowują, ile realnie zostaje Ci po wszystkich kosztach.</p>

<h2>Kiedy opłaca się samozatrudnienie, a kiedy etat</h2>
<p>Samozatrudnienie zwykle wygrywa finansowo przy wyższych stawkach, wielu klientach i realnych kosztach do odliczenia oraz gdy cenisz elastyczność i akceptujesz ryzyko. Etat jest lepszy, gdy zależy Ci na przewidywalności, planujesz kredyt hipoteczny, potrzebujesz stabilności przy jednym źródle dochodu lub nie chcesz zajmować się księgowością i egzekwowaniem płatności. Nie ma odpowiedzi uniwersalnej — liczy się Twoja stawka, sytuacja życiowa i tolerancja ryzyka.</p>

<h2>Podsumowanie</h2>
<p>Porównanie samozatrudnienia z etatem to nie zestawienie dwóch kwot, lecz całych pakietów. B2B daje zwykle więcej na rękę dzięki niższym podatkom i odliczaniu kosztów, ale w zamian sam finansujesz urlop, chorobę, poduszkę i emeryturę. Żeby wybór był świadomy, dolicz do stawki B2B wartość utraconych świadczeń i policz realny dochód po odłożeniu na podatek i ZUS — dopiero wtedy porównujesz to samo z tym samym.</p>
`,
  faq: [
    {
      q: 'Czy na samozatrudnieniu zarabia się więcej niż na etacie?',
      a: 'Zwykle tak w kwocie na rękę, dzięki niższym podatkom (ryczałt lub liniowy) i możliwości odliczania kosztów. Ale część tej różnicy pokrywa świadczenia, które na etacie dostajesz gratis: płatny urlop, chorobowe i składki opłacane przez pracodawcę. Uczciwe porównanie wymaga doliczenia wartości tych świadczeń.',
    },
    {
      q: 'O ile wyższa musi być stawka B2B niż pensja etatowa?',
      a: 'Zwykle o kilkanaście do dwudziestu kilku procent, żeby wyjść na swoje. Do wynagrodzenia etatowego trzeba doliczyć wartość płatnego urlopu (około 8–10%), rezerwę na chorobę oraz poduszkę na okresy bez zleceń, które przy B2B finansujesz sam.',
    },
    {
      q: 'Co tracę, przechodząc z etatu na B2B?',
      a: 'Płatny urlop, wynagrodzenie chorobowe, ochronę zatrudnienia oraz składki finansowane przez pracodawcę. Sam ponosisz też koszty księgowości, ryzyko niepłacących klientów i okresów bez zleceń oraz musisz samodzielnie zadbać o poduszkę finansową i emeryturę.',
    },
    {
      q: 'Kiedy opłaca się przejść na samozatrudnienie?',
      a: 'Przy wyższych stawkach, wielu klientach i realnych kosztach do odliczenia oraz gdy cenisz elastyczność i akceptujesz ryzyko nieregularnych wpływów. Etat pozostaje lepszy przy potrzebie stabilności, planowaniu kredytu hipotecznego lub niechęci do prowadzenia księgowości.',
    },
    {
      q: 'Czy przy B2B trzeba samemu odkładać na emeryturę?',
      a: 'W praktyce tak. Niższe składki dziś oznaczają niższą emeryturę z systemu, dlatego różnicę warto inwestować samodzielnie, na przykład w ramach IKE lub IKZE. To materiał informacyjny, więc konkretny plan warto omówić z doradcą.',
    },
    {
      q: 'Jak policzyć realny dochód na B2B?',
      a: 'Od kwoty z faktury odejmij składki ZUS, podatek według wybranej formy oraz koszty prowadzenia działalności, a następnie odłóż rezerwę na urlop, chorobę i okresy bez zleceń. Dopiero ta kwota jest porównywalna z pensją etatową na rękę.',
    },
  ],
};

export default article;
