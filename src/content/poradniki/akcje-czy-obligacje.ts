import type { Article } from './types';

const article: Article = {
  slug: 'akcje-czy-obligacje',
  title: 'Akcje czy obligacje — co wybrać i w jakich proporcjach',
  description:
    'Akcje czy obligacje: czym się różnią, jak łączą się w portfelu i jakie proporcje pasują do Twojego horyzontu. Tabela porównawcza, przykłady i najczęstsze błędy.',
  category: 'inwestycje',
  tags: ['akcje', 'obligacje', 'alokacja aktywów', 'ryzyko inwestycyjne', 'portfel'],
  tldr:
    'To nie jest pytanie albo-albo — akcje i obligacje pełnią w portfelu różne role i najczęściej warto mieć jedno i drugie. Akcje dają wyższy oczekiwany zwrot, ale większą zmienność; obligacje są spokojniejsze i stabilizują portfel, choć zarabiają mniej. Proporcję dobiera się do horyzontu i tolerancji ryzyka: im dłużej pieniądze mogą pracować i im spokojniej znosisz spadki, tym większy udział akcji ma sens.',
  keyTakeaways: [
    'Akcje to udział we własności spółek — wyższy potencjalny zysk, ale większa zmienność.',
    'Obligacje to pożyczka dla emitenta — niższy zysk, za to większa stabilność i przewidywalność.',
    'Akcje i obligacje często reagują różnie na te same zdarzenia, więc razem łagodzą wahania portfela.',
    'Proporcję dobiera się do horyzontu i tolerancji ryzyka, nie do bieżącej mody rynkowej.',
    'Im krótszy horyzont i większa awersja do ryzyka, tym większy udział obligacji i gotówki.',
    'Rebalancing raz lub dwa razy w roku przywraca założone proporcje i wymusza kupno taniej, sprzedaż drożej.',
    'Nie licz na jeden magiczny podział — najpierw ustal cel i horyzont, dopiero potem procenty.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Akcje czy obligacje to jedno z pierwszych pytań, które zadaje sobie początkujący inwestor. Problem w tym, że postawione jako wybór jednego kosztem drugiego jest źle sformułowane. W praktyce oba instrumenty pełnią w portfelu odmienne role i najczęściej warto mieć jedno i drugie — pytanie brzmi raczej w jakich proporcjach. W tym poradniku wyjaśnimy różnice, pokażemy, jak się uzupełniają, i jak dobrać alokację do siebie.</p>

<h2>Czym są akcje</h2>
<p>Akcja to udział we własności spółki. Kupując akcje, stajesz się współwłaścicielem firmy i masz prawo do części jej zysków (dywidenda) oraz do wzrostu jej wartości. Potencjał zysku jest wysoki — historycznie szeroki rynek akcji dawał w długim terminie wyraźnie więcej niż obligacje. Ceną za to jest zmienność: kursy akcji potrafią spaść o kilkadziesiąt procent w bessie i długo odrabiać straty.</p>
<p>Akcje to instrument dla kapitału, który może pracować latami. W krótkim terminie ich wynik jest nieprzewidywalny, ale im dłuższy horyzont, tym większa szansa, że wzrost gospodarczy i procent składany zadziałają na Twoją korzyść.</p>
<p>Prosty przykład skali procentu składanego: 10 000 zł zainwestowane przy średnim rocznym zwrocie 7% rośnie do około 19 700 zł po 10 latach, około 38 700 zł po 20 latach i około 76 100 zł po 30 latach. Ten sam kapitał przy 3% (bliżej wyniku spokojnych obligacji) daje po 30 latach około 24 300 zł. Różnica — ponad 51 000 zł — to właśnie cena, jaką w długim terminie płaci się za rezygnację z akcji. Haczyk w tym, że po drodze trzeba przetrwać spadki: w typowej bessie szeroki rynek akcji potrafi zniżkować o 30–50%, a odrabianie strat zajmuje czasem kilka lat.</p>

<h2>Czym są obligacje</h2>
<p>Obligacja to pożyczka, której udzielasz emitentowi — państwu (obligacje skarbowe) lub firmie (obligacje korporacyjne). W zamian emitent zobowiązuje się wypłacać odsetki i zwrócić kapitał w ustalonym terminie. Zysk jest zwykle niższy niż z akcji, ale bardziej przewidywalny, a ryzyko mniejsze — zwłaszcza w przypadku obligacji skarbowych.</p>
<p>W Polsce popularne są detaliczne obligacje skarbowe, w tym warianty indeksowane inflacją, które chronią realną wartość oszczędności. Piszemy o nich w poradniku <a href="/poradniki/obligacje-skarbowe-antyinflacyjne">obligacje skarbowe antyinflacyjne</a>. Obligacje pełnią w portfelu funkcję stabilizatora — łagodzą wahania i dają poduszkę na czas, gdy akcje spadają.</p>
<p>Warto rozróżnić dwa główne rodzaje ryzyka przy obligacjach. Pierwsze to ryzyko kredytowe — czy emitent w ogóle odda pieniądze. Przy obligacjach skarbowych dużego, stabilnego państwa jest ono niskie; przy obligacjach korporacyjnych mniejszych firm potrafi być spore i dlatego oferują one wyższe odsetki. Drugie to ryzyko stopy procentowej — ceny obligacji notowanych na rynku spadają, gdy stopy rosną, i rosną, gdy stopy spadają. Detaliczne obligacje skarbowe trzymane do wykupu są na to odporne, bo odkupisz je po wartości nominalnej powiększonej o narosłe odsetki.</p>

<h2>Akcje vs obligacje — porównanie</h2>
<table>
<thead>
<tr><th>Cecha</th><th>Akcje</th><th>Obligacje</th></tr>
</thead>
<tbody>
<tr><td>Charakter</td><td>Udział we własności spółki</td><td>Pożyczka dla emitenta</td></tr>
<tr><td>Potencjalny zysk</td><td>Wyższy</td><td>Niższy</td></tr>
<tr><td>Zmienność / ryzyko</td><td>Duże</td><td>Mniejsze</td></tr>
<tr><td>Przewidywalność</td><td>Niska w krótkim terminie</td><td>Wysoka</td></tr>
<tr><td>Rola w portfelu</td><td>Silnik wzrostu</td><td>Stabilizator</td></tr>
<tr><td>Zalecany horyzont</td><td>Wieloletni</td><td>Krótki i średni</td></tr>
</tbody>
</table>

<h2>Dlaczego warto mieć jedno i drugie</h2>
<p>Kluczowa zaleta łączenia obu klas polega na tym, że często reagują różnie na te same wydarzenia. Gdy rynek akcji spada w obawie o gospodarkę, kapitał bywa przenoszony do bezpieczniejszych obligacji, co podnosi ich ceny. Dzięki tej niskiej korelacji portfel łączący akcje i obligacje waha się łagodniej niż sam portfel akcji, a mimo to zachowuje istotną część potencjału wzrostu.</p>
<blockquote>Akcje odpowiadają za wzrost, obligacje za spokój. Dobrze dobrana proporcja daje Ci tyle zwrotu, ile potrzebujesz, przy takim poziomie wahań, jaki jesteś w stanie znieść.</blockquote>
<p>To jeden z filarów dywersyfikacji, którą szerzej omawiamy w tekście o <a href="/poradniki/dywersyfikacja-portfela-inwestycyjnego">dywersyfikacji portfela</a>.</p>

<h2>Jak dobrać proporcje</h2>
<p>Nie ma jednej właściwej alokacji — zależy ona od Twojego horyzontu, celu i tego, jak reagujesz na spadki. Dwie najważniejsze zmienne to czas i tolerancja ryzyka.</p>
<ul>
<li><strong>Horyzont.</strong> Im dłużej pieniądze mogą pracować, tym większy udział akcji ma sens, bo masz czas na przeczekanie bess.</li>
<li><strong>Tolerancja ryzyka.</strong> Jeśli spadek o 30% odbierze Ci sen i skłoni do panicznej sprzedaży, większy udział obligacji ochroni Cię przed najgorszym błędem — wyjściem w dołku.</li>
<li><strong>Cel.</strong> Pieniądze potrzebne za dwa lata (np. na wkład własny) powinny być głównie w obligacjach i gotówce; te na emeryturę za 30 lat mogą być mocno w akcjach.</li>
</ul>
<h3>Przykładowe alokacje</h3>
<table>
<thead>
<tr><th>Profil i horyzont</th><th>Akcje</th><th>Obligacje</th></tr>
</thead>
<tbody>
<tr><td>Krótki horyzont / ostrożny</td><td>30%</td><td>70%</td></tr>
<tr><td>Średni horyzont / zrównoważony</td><td>60%</td><td>40%</td></tr>
<tr><td>Długi horyzont / dynamiczny</td><td>80%</td><td>20%</td></tr>
</tbody>
</table>
<p>To jedynie przykłady poglądowe. Popularna reguła orientacyjna mówi, że udział obligacji w procentach może być zbliżony do Twojego wieku — ale to duże uproszczenie, a nie zasada, którą trzeba stosować dosłownie. Zanim ustalisz proporcje, warto ocenić własną odporność na wahania, o czym piszemy w poradniku <a href="/poradniki/ryzyko-inwestycyjne-jak-oceniac">ryzyko inwestycyjne — jak oceniać</a>.</p>

<h2>Mini-case: jak proporcja zmienia wynik i wahania</h2>
<p>Załóżmy trzy portfele po 100 000 zł i rok spadkowy, w którym akcje tracą 20%, a obligacje zyskują 3%. Zobacz, jak sama proporcja zmienia głębokość obsunięcia.</p>
<table>
<thead>
<tr><th>Portfel</th><th>Akcje / obligacje</th><th>Wartość po roku spadków</th><th>Zmiana</th></tr>
</thead>
<tbody>
<tr><td>Ostrożny</td><td>30% / 70%</td><td>96 100 zł</td><td>-3,9%</td></tr>
<tr><td>Zrównoważony</td><td>60% / 40%</td><td>89 200 zł</td><td>-10,8%</td></tr>
<tr><td>Dynamiczny</td><td>80% / 20%</td><td>84 600 zł</td><td>-15,4%</td></tr>
</tbody>
</table>
<p>Teraz dobry rok, w którym akcje rosną o 20%, a obligacje o 3%. Portfel dynamiczny urośnie o 16,6% (do 116 600 zł), zrównoważony o 13,2% (113 200 zł), a ostrożny o 8,1% (108 100 zł). Widać regułę: większy udział akcji to i głębsze dołki, i wyższe szczyty. Twoim zadaniem nie jest wybór najwyższego zwrotu na papierze, lecz takiej huśtawki, przy której nie sprzedasz w panice na dnie.</p>

<h2>Rebalancing krok po kroku</h2>
<p>Rebalancing to okresowe przywracanie założonych proporcji. Bez niego portfel z czasem dryfuje: po dobrej hossie akcje urosną ponad plan i portfel „zrównoważony” po cichu staje się „dynamiczny”, obarczony ryzykiem, którego nie akceptowałeś. Prosty schemat wygląda tak:</p>
<ol>
<li><strong>Ustal docelowy podział</strong> — na przykład 60% akcji i 40% obligacji.</li>
<li><strong>Sprawdź aktualne udziały</strong> — powiedzmy po hossie akcje to już 70%, a obligacje 30%.</li>
<li><strong>Policz odchylenie</strong> — 10 punktów procentowych ponad plan po stronie akcji.</li>
<li><strong>Przywróć proporcje</strong> — sprzedaj część akcji i dokup obligacji, albo skieruj nowe wpłaty w niedoważoną klasę.</li>
<li><strong>Ustal regułę powtarzania</strong> — raz w roku lub gdy odchylenie przekroczy 5 punktów procentowych.</li>
</ol>
<p>Rebalancing wymusza dyscyplinę odwrotną do emocji: każe sprzedawać to, co drogo urosło, i dokupować to, co potaniało. Jeśli regularnie dopłacasz do portfela, najtańszą metodą jest kierowanie nowych wpłat do klasy, której akurat brakuje — wtedy często unikniesz sprzedaży i podatku Belki od zysku.</p>

<h2>Scenariusze według horyzontu</h2>
<p>Poniżej trzy typowe sytuacje i alokacja, która zwykle do nich pasuje. Traktuj je jako punkt wyjścia, nie sztywny nakaz.</p>
<ul>
<li><strong>Wkład własny za 2 lata (cel krótkoterminowy).</strong> Priorytetem jest ochrona kapitału, nie jego pomnażanie. Przewaga obligacji skarbowych i gotówki, akcje najwyżej symbolicznie — bo dwuletni horyzont nie daje czasu na przeczekanie bessy.</li>
<li><strong>Budowa majątku na 10–15 lat (cel średni).</strong> Portfel zrównoważony w okolicach 60/40. Jest miejsce na wzrost z akcji i poduszka obligacyjna, która pozwala spać spokojnie i rebalansować w dołkach.</li>
<li><strong>Emerytura za 30 lat (cel długi).</strong> Duży udział akcji (70–80%), bo długi horyzont premiuje procent składany, a obligacje pełnią rolę bufora, który ułatwia dokupowanie akcji po spadkach.</li>
</ul>

<h2>Checklista przed ustaleniem alokacji</h2>
<p>Zanim wpiszesz procenty, odpowiedz sobie na pięć pytań:</p>
<ul>
<li>Na kiedy potrzebuję tych pieniędzy — za 2, 10 czy 30 lat?</li>
<li>Czy spadek wartości o 30% skłoniłby mnie do sprzedaży, czy do dokupienia?</li>
<li>Czy mam osobną poduszkę bezpieczeństwa poza portfelem inwestycyjnym?</li>
<li>Czy część obligacyjna chroni mnie przed inflacją, czy tylko przed zmiennością?</li>
<li>Kiedy i według jakiej reguły będę rebalansować?</li>
</ul>
<p>Jeśli nie znasz odpowiedzi na pytanie o reakcję na spadek, przyjmij ostrożniejszą wersję. Łatwiej z czasem dołożyć akcji, gdy poczujesz się pewniej, niż odrobić błąd sprzedaży całego portfela w najgorszym momencie.</p>

<h2>Najczęstsze błędy</h2>
<ul>
<li><strong>Wszystko w jednej klasie.</strong> 100% akcji przy krótkim horyzoncie albo 100% obligacji przy długim to skrajności, które albo za bardzo ryzykują, albo za bardzo hamują wzrost.</li>
<li><strong>Dobór pod emocje, nie pod horyzont.</strong> Zwiększanie udziału akcji po hossie i ucieczka w obligacje po spadkach to kupowanie drogo i sprzedawanie tanio.</li>
<li><strong>Ignorowanie inflacji przy obligacjach.</strong> Same nominalne odsetki nie wystarczą, jeśli inflacja zjada realny zysk — stąd popularność wariantów indeksowanych inflacją.</li>
<li><strong>Brak rebalancingu.</strong> Bez okresowego przywracania proporcji portfel z czasem sam się przesuwa w stronę większego ryzyka.</li>
</ul>

<h2>Gdzie w tym wszystkim jest gotówka</h2>
<p>Alokacja to nie tylko akcje kontra obligacje — trzecim, często pomijanym elementem jest gotówka i jej odpowiedniki. Zanim zaczniesz inwestować, warto mieć poduszkę bezpieczeństwa w wysokości 3–6 miesięcznych wydatków, trzymaną poza portfelem inwestycyjnym. Dzięki niej nagły wydatek nie zmusi Cię do sprzedaży akcji w najgorszym momencie. Dopiero gdy poduszka stoi, dobierasz proporcję akcji i obligacji dla kapitału, który faktycznie może pracować.</p>
<p>Krótkie podsumowanie ról każdej z trzech warstw:</p>
<ul>
<li><strong>Gotówka i poduszka</strong> — na nagłe wydatki i cele w horyzoncie do roku; zero zmienności, zero ryzyka wymuszonej sprzedaży.</li>
<li><strong>Obligacje</strong> — stabilizator i bufor na spadki akcji; źródło środków do rebalancingu w bessie.</li>
<li><strong>Akcje</strong> — silnik długoterminowego wzrostu, którego zmienność akceptujesz w zamian za wyższy oczekiwany zwrot.</li>
</ul>

<h2>Jak SzpontHub pomaga zarządzać alokacją</h2>
<p>Żeby świadomie utrzymywać proporcje między akcjami a obligacjami, musisz widzieć jedno i drugie w jednym miejscu. W SzpontHub dodasz swoje aktywa i inwestycje do portfeli wielowalutowych i zobaczysz realny podział kapitału oraz jego wartość i zysk po uwzględnieniu podatku Belki. Dzięki temu łatwiej wychwycisz, że akcje urosły ponad zakładany udział, i w porę zrównoważysz portfel. To materiał informacyjny, a nie doradztwo inwestycyjne — docelową alokację dopasuj do własnego celu, horyzontu i tolerancji ryzyka.</p>
`,
  faq: [
    {
      q: 'Akcje czy obligacje — co jest lepsze?',
      a: 'To nie jest wybór albo-albo. Akcje dają wyższy potencjalny zysk przy większej zmienności, a obligacje są spokojniejsze, lecz zarabiają mniej. W większości portfeli warto mieć jedno i drugie w proporcji dobranej do horyzontu i tolerancji ryzyka.',
    },
    {
      q: 'Czym różnią się akcje od obligacji?',
      a: 'Akcja to udział we własności spółki i prawo do jej zysków oraz wzrostu wartości. Obligacja to pożyczka dla emitenta, który wypłaca odsetki i zwraca kapitał w terminie. Akcje są bardziej ryzykowne i dochodowe, obligacje bezpieczniejsze i bardziej przewidywalne.',
    },
    {
      q: 'W jakich proporcjach łączyć akcje i obligacje?',
      a: 'Zależy to od horyzontu i tolerancji ryzyka. Przy krótkim horyzoncie przeważają obligacje i gotówka, przy długim akcje. Orientacyjna alokacja to na przykład 60% akcji i 40% obligacji dla profilu zrównoważonego, ale proporcje warto dopasować do siebie.',
    },
    {
      q: 'Dlaczego warto mieć w portfelu obligacje?',
      a: 'Obligacje stabilizują portfel, bo często zachowują się inaczej niż akcje w tych samych warunkach. Gdy akcje spadają, obligacje bywają wsparciem i łagodzą wahania. Dają też przewidywalny dochód z odsetek i miejsce dla pieniędzy potrzebnych w krótszym terminie.',
    },
    {
      q: 'Czy przy długim horyzoncie warto mieć tylko akcje?',
      a: 'Przy bardzo długim horyzoncie i wysokiej tolerancji ryzyka duży udział akcji ma sens, ale całkowita rezygnacja z obligacji zwiększa ryzyko panicznej sprzedaży w bessie. Nawet niewielki udział obligacji ułatwia przetrwanie spadków bez kosztownych błędów.',
    },
    {
      q: 'Czy obligacje chronią przed inflacją?',
      a: 'Zwykłe obligacje o stałym oprocentowaniu niekoniecznie, bo inflacja może zjeść ich realny zysk. Chronią dopiero obligacje indeksowane inflacją, których oprocentowanie rośnie wraz z nią. Dlatego przy wysokiej inflacji to właśnie warianty antyinflacyjne cieszą się popularnością.',
    },
    {
      q: 'Czym jest rebalancing i jak często go robić?',
      a: 'Rebalancing to przywracanie założonych proporcji, gdy rynek je rozjedzie — na przykład powrót z 70/30 do docelowego 60/40 po hossie akcji. Najczęściej robi się go raz w roku albo gdy udział którejś klasy odchyli się o więcej niż 5 punktów procentowych. Najtaniej rebalansować kierowaniem nowych wpłat w niedoważoną klasę, bez sprzedaży i podatku od zysku.',
    },
    {
      q: 'Jak duży spadek akcji trzeba być gotowym przetrwać?',
      a: 'W typowej bessie szeroki rynek akcji potrafi spaść o 30–50%, a odrabianie strat zajmuje czasem kilka lat. Dlatego przed ustaleniem dużego udziału akcji warto szczerze ocenić, czy taki spadek skłoniłby Cię do sprzedaży, czy do spokojnego dokupienia. Jeśli do sprzedaży, bezpieczniejszy jest większy udział obligacji.',
    },
  ],
};

export default article;
