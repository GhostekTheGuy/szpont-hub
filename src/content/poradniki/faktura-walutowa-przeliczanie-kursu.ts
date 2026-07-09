import type { Article } from './types';

const article: Article = {
  slug: 'faktura-walutowa-przeliczanie-kursu',
  title: 'Faktura walutowa — jak przeliczać kurs waluty na złote',
  description:
    'Jak przeliczyć fakturę walutową na złote: który kurs NBP zastosować, z jakiego dnia, jak liczyć VAT i przychód oraz jak rozliczyć różnice kursowe. Przykłady i tabela.',
  category: 'freelancer',
  tags: ['faktura walutowa', 'kurs waluty', 'różnice kursowe', 'NBP', 'freelancer'],
  tldr:
    'Fakturę walutową co do zasady przeliczasz na złote po średnim kursie NBP z ostatniego dnia roboczego poprzedzającego dzień powstania przychodu, czyli zwykle dzień przed datą wystawienia faktury. Ten sam kurs stosujesz dla przychodu w PIT, a dla VAT (jeśli występuje) przeliczasz według kursu z dnia poprzedzającego obowiązek podatkowy. Gdy zapłata wpłynie po innym kursie niż przyjęty na fakturze, powstają różnice kursowe, które również ujmujesz w rozliczeniu.',
  keyTakeaways: [
    'Podstawą jest średni kurs NBP z ostatniego dnia roboczego przed powstaniem przychodu.',
    'Przychód w PIT i podstawę VAT przelicza się osobno, ale zwykle po zbliżonym kursie NBP.',
    'Różnica między kursem z faktury a kursem zapłaty tworzy różnice kursowe.',
    'Różnice dodatnie zwiększają przychód, ujemne są kosztem — trzeba je ewidencjonować.',
    'Kurs i datę warto zapisywać przy każdej fakturze, by rozliczenie się zgadzało.',
    'Ten sam kurs NBP przelicza fakturę niezależnie od tego, ile złotych faktycznie wpłynie po kursie banku.',
    'Numer tabeli NBP, kurs i datę najlepiej notować od razu przy wystawieniu faktury — nie odtwarzać ich wstecz.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Faktury w euro czy dolarach to codzienność freelancerów pracujących dla zagranicznych klientów. Problem zaczyna się przy rozliczeniu: podatek płacisz w złotych, więc każdą kwotę trzeba przeliczyć po właściwym kursie i w odpowiednim dniu. Pomyłka na tym etapie zaniża albo zawyża przychód i potrafi wygenerować niepotrzebne różnice w księgowości. W tym poradniku pokażemy, który kurs zastosować, z jakiego dnia i jak rozliczyć różnice kursowe, gdy zapłata wpłynie po innym kursie.</p>
<p>To materiał informacyjny, a nie porada podatkowa — przy nietypowych sytuacjach lub większych kwotach skonsultuj rozliczenie z księgowym lub doradcą podatkowym.</p>

<h2>Który kurs zastosować do faktury walutowej</h2>
<p>Do przeliczenia przychodu w walucie obcej stosuje się średni kurs Narodowego Banku Polskiego z ostatniego dnia roboczego poprzedzającego dzień uzyskania przychodu. W praktyce dla freelancera dniem powstania przychodu jest zwykle dzień wykonania usługi lub wystawienia faktury, w zależności od tego, co nastąpi wcześniej. Dlatego najczęściej stosujesz średni kurs NBP z dnia poprzedzającego datę wystawienia faktury.</p>
<p>Kluczowe jest słowo „poprzedzający”. Nie bierzesz kursu z dnia faktury, tylko z ostatniego dnia roboczego przed nim. Jeśli faktura ma datę poniedziałkową, właściwy będzie kurs z piątku, bo w weekend NBP nie publikuje tabeli.</p>

<blockquote>Zasada bazowa: przychód w walucie obcej przeliczasz po średnim kursie NBP z ostatniego dnia roboczego poprzedzającego dzień powstania przychodu.</blockquote>

<h2>Gdzie znaleźć właściwy kurs</h2>
<p>Średnie kursy walut publikuje NBP w tabeli A, aktualizowanej w każdy dzień roboczy. To jedyne źródło, które ma znaczenie dla rozliczenia podatkowego — kurs z kantoru, banku komercyjnego czy platformy płatniczej służy tylko do faktycznej wymiany pieniędzy, a nie do wyliczenia podatku. Warto od razu zapisywać numer tabeli i kurs przy każdej fakturze, żeby przy rozliczeniu nie odtwarzać go wstecz.</p>

<h2>Przykładowe przeliczenie</h2>
<p>Załóżmy fakturę na 1000 euro wystawioną w środę. Właściwy jest średni kurs NBP z wtorku. Przyjmijmy, że wynosił on 4,30 zł za euro.</p>

<table>
<thead>
<tr><th>Pozycja</th><th>Wartość</th></tr>
</thead>
<tbody>
<tr><td>Kwota faktury</td><td>1000 EUR</td></tr>
<tr><td>Data wystawienia</td><td>środa</td></tr>
<tr><td>Kurs NBP (wtorek, dzień poprzedzający)</td><td>4,30 zł/EUR</td></tr>
<tr><td>Przychód w złotych</td><td>4300 zł</td></tr>
</tbody>
</table>

<p>W księgach wykazujesz przychód 4300 zł niezależnie od tego, ile złotych faktycznie dostaniesz po przewalutowaniu na koncie. To ważne rozróżnienie: podatek liczysz od kwoty przeliczonej po kursie NBP, a nie od tego, co wpłynęło po kursie banku.</p>

<h2>VAT na fakturze walutowej</h2>
<p>Jeśli transakcja podlega VAT, kwotę podatku VAT wykazujesz na fakturze w złotych, nawet gdy wartość netto jest w walucie obcej. Do przeliczenia podstawy VAT stosuje się średni kurs NBP z ostatniego dnia roboczego poprzedzającego dzień powstania obowiązku podatkowego w VAT. W wielu sytuacjach data ta pokrywa się z datą sprzedaży, więc kurs bywa taki sam jak przy przychodzie w PIT, ale nie jest to reguła — obowiązek w VAT i moment przychodu w PIT to dwie odrębne kwestie.</p>
<p>W typowym przypadku usług dla zagranicznego przedsiębiorcy VAT często rozlicza nabywca w swoim kraju (mechanizm odwrotnego obciążenia), a na fakturze pojawia się adnotacja zamiast kwoty VAT. To, czy i jak naliczasz VAT, zależy od statusu klienta i miejsca świadczenia usługi — więcej o samych zasadach współpracy zagranicznej znajdziesz w poradniku <a href="/poradniki/jak-rozliczac-zagranicznych-klientow">jak rozliczać zagranicznych klientów</a>.</p>

<h2>Przeliczenie krok po kroku</h2>
<p>Każdą fakturę walutową przeliczysz według tego samego schematu. Poniżej pełna sekwencja na przykładzie faktury na 2500 USD wystawionej w czwartek 3 lipca, gdy usługa została wykonana tego samego dnia.</p>
<ol>
<li><strong>Ustal dzień powstania przychodu.</strong> Tu jest to 3 lipca (dzień wykonania usługi i wystawienia faktury).</li>
<li><strong>Znajdź ostatni dzień roboczy przed tą datą.</strong> Dzień poprzedzający to środa 2 lipca — bierzesz kurs z tej tabeli, nie z 3 lipca.</li>
<li><strong>Odczytaj średni kurs NBP z tabeli A.</strong> Przyjmijmy 3,95 zł za dolara.</li>
<li><strong>Pomnóż kwotę faktury przez kurs.</strong> 2500 USD × 3,95 zł = 9875 zł. Tę kwotę wykazujesz jako przychód.</li>
<li><strong>Zapisz numer tabeli, datę i kurs.</strong> Bez tego przy rozliczeniu rocznym odtwarzanie kursu zajmuje czas i grozi pomyłką.</li>
</ol>
<p>Gdyby faktura miała datę poniedziałkową, w kroku drugim cofasz się do piątku, bo w sobotę i niedzielę NBP nie publikuje tabeli. Ta sama zasada dotyczy dni świątecznych — zawsze szukasz ostatniego dnia roboczego, w którym tabela faktycznie się ukazała.</p>

<h2>Różnice kursowe — skąd się biorą</h2>
<p>Różnica kursowa powstaje, bo między dniem wystawienia faktury a dniem zapłaty kurs waluty się zmienia. Przychód zaksięgowałeś po jednym kursie NBP, a pieniądze wpłynęły, gdy kurs był inny. Ta różnica ma swoje skutki podatkowe.</p>
<ul>
<li><strong>Dodatnia różnica kursowa</strong> — gdy w dniu zapłaty otrzymujesz więcej złotych niż wynikało z faktury. Zwiększa przychód.</li>
<li><strong>Ujemna różnica kursowa</strong> — gdy otrzymujesz mniej złotych niż z faktury. Stanowi koszt uzyskania przychodu.</li>
</ul>
<p>Przykład: fakturę na 1000 euro przeliczyłeś po 4,30 zł, czyli 4300 zł przychodu. Zapłata wpłynęła dwa tygodnie później, gdy średni kurs NBP z dnia poprzedzającego wynosił 4,38 zł. Faktycznie „warta” jest 4380 zł, więc powstaje dodatnia różnica kursowa 80 zł, którą doliczasz do przychodu.</p>

<h3>Kiedy różnic kursowych nie ma</h3>
<p>Jeśli klient płaci w tej samej walucie, a Ty nie przewalutowujesz środków, tylko trzymasz je na koncie walutowym i wydajesz w euro, praktyczna różnica kursowa może się nie zrealizować aż do momentu wymiany. Sposób ustalania różnic zależy jednak od przyjętej metody i formy rozliczenia, dlatego to obszar, który najlepiej ustalić z księgowym.</p>

<h2>Scenariusze różnic kursowych na liczbach</h2>
<p>Ta sama faktura na 1000 EUR przeliczona po kursie 4,30 zł (przychód 4300 zł) daje różne skutki w zależności od tego, jaki kurs obowiązuje w dniu zapłaty. Poniższa tabela pokazuje trzy typowe scenariusze.</p>
<table>
<thead>
<tr><th>Kurs w dniu zapłaty</th><th>Wartość wpłaty w zł</th><th>Różnica kursowa</th><th>Skutek podatkowy</th></tr>
</thead>
<tbody>
<tr><td>4,38 zł/EUR</td><td>4380 zł</td><td>+80 zł</td><td>Dodatnia — zwiększa przychód</td></tr>
<tr><td>4,30 zł/EUR</td><td>4300 zł</td><td>0 zł</td><td>Brak różnicy kursowej</td></tr>
<tr><td>4,22 zł/EUR</td><td>4220 zł</td><td>-80 zł</td><td>Ujemna — koszt uzyskania przychodu</td></tr>
</tbody>
</table>
<p>Widać stąd zasadę: w podatku dochodowym cały czas bazujesz na przychodzie 4300 zł z faktury, a rozbieżność względem faktycznej wpłaty ujmujesz osobno jako różnicę kursową. Nie „poprawiasz” pierwotnego przychodu — dokładasz do rozliczenia dodatkowy przychód albo koszt.</p>

<h2>EUR czy USD — czy waluta zmienia zasady</h2>
<p>Sam mechanizm jest identyczny dla każdej waluty obcej: zawsze średni kurs NBP z dnia poprzedzającego. Różni się tylko wysokość kursu, więc ta sama kwota netto daje inny przychód w złotych. Poniżej to samo zlecenie o wartości 1000 jednostek waluty przy przykładowych kursach.</p>
<table>
<thead>
<tr><th>Waluta</th><th>Kwota faktury</th><th>Przykładowy kurs NBP</th><th>Przychód w zł</th></tr>
</thead>
<tbody>
<tr><td>EUR</td><td>1000 EUR</td><td>4,30 zł</td><td>4300 zł</td></tr>
<tr><td>USD</td><td>1000 USD</td><td>3,95 zł</td><td>3950 zł</td></tr>
<tr><td>GBP</td><td>1000 GBP</td><td>5,05 zł</td><td>5050 zł</td></tr>
</tbody>
</table>
<p>Jeśli fakturujesz w walucie, dla której NBP nie publikuje kursu w tabeli A, stosuje się kurs pośredni przez inną walutę (np. tabelę B). To rzadka sytuacja u freelancerów rozliczających się w EUR, USD czy GBP, ale warto o niej pamiętać przy egzotycznych walutach.</p>

<h2>Checklista przy każdej fakturze walutowej</h2>
<p>Zanim uznasz fakturę za rozliczoną, sprawdź pięć rzeczy — to wystarcza, by uniknąć większości błędów przy kontroli lub rozliczeniu rocznym.</p>
<ul>
<li><strong>Data przychodu</strong> — czy ustalona poprawnie (wykonanie usługi lub wystawienie faktury, co wcześniej).</li>
<li><strong>Kurs z właściwego dnia</strong> — z ostatniego dnia roboczego przed datą przychodu, nie z dnia faktury.</li>
<li><strong>Zapisany numer tabeli NBP</strong> — data i kurs zanotowane przy fakturze.</li>
<li><strong>VAT (jeśli występuje)</strong> — przeliczony po kursie z dnia poprzedzającego obowiązek w VAT i wykazany w złotych.</li>
<li><strong>Różnica kursowa po zapłacie</strong> — porównany kurs z dnia wpłaty i zaksięgowana ewentualna różnica.</li>
</ul>

<h2>Koszty w walucie obcej — ta sama logika</h2>
<p>Przeliczanie dotyczy nie tylko przychodów, ale i kosztów. Gdy kupujesz zagraniczne narzędzia, subskrypcje czy sprzęt i dostajesz fakturę w euro lub dolarach, koszt też przeliczasz na złote według kursu NBP — z tą różnicą, że bierzesz kurs z ostatniego dnia roboczego poprzedzającego dzień poniesienia kosztu, czyli zwykle datę wystawienia faktury zakupowej.</p>
<table>
<thead>
<tr><th>Rodzaj dokumentu</th><th>Data przeliczenia</th><th>Kurs</th></tr>
</thead>
<tbody>
<tr><td>Faktura sprzedaży (przychód)</td><td>Dzień powstania przychodu</td><td>Kurs NBP z dnia poprzedzającego</td></tr>
<tr><td>Faktura zakupu (koszt)</td><td>Dzień poniesienia kosztu</td><td>Kurs NBP z dnia poprzedzającego</td></tr>
</tbody>
</table>
<p>Przykład: subskrypcja narzędzia za 50 USD z faktury wystawionej w środę. Bierzesz średni kurs NBP z wtorku, powiedzmy 3,95 zł, więc koszt w księgach to 197,50 zł. Tak jak przy sprzedaży, nie liczy się tu, ile złotych faktycznie pobrała Ci karta po kursie banku — do rozliczenia podatkowego stosujesz kurs NBP. Różnica między kursem NBP a kursem, po którym bank obciążył kartę, jest po prostu Twoim realnym kosztem lub oszczędnością na przewalutowaniu, ale nie zmienia kwoty kosztu w rozliczeniu.</p>

<h2>Zaliczka w walucie i faktura wystawiona z wyprzedzeniem</h2>
<p>Dwie sytuacje wymagają szczególnej uwagi, bo zmieniają dzień, z którego bierzesz kurs.</p>
<ul>
<li><strong>Zaliczka wpłacona przed usługą.</strong> Jeśli najpierw dostajesz zaliczkę w walucie, obowiązek dla tej części może powstać już w momencie wpływu — wtedy kurs bierzesz z dnia poprzedzającego otrzymanie zaliczki, a nie datę faktury końcowej.</li>
<li><strong>Faktura wystawiona przed wykonaniem usługi.</strong> Gdy fakturę wystawiasz z wyprzedzeniem, dniem powstania przychodu bywa data wystawienia, więc kurs liczysz od dnia ją poprzedzającego, nawet jeśli usługę wykonasz później.</li>
<li><strong>Płatność w ratach.</strong> Każda transza może mieć własny dzień powstania przychodu i własny kurs, dlatego raty przelicza się osobno, a nie jednym kursem dla całości.</li>
</ul>
<p>W praktyce reguła jest stała: najpierw ustal, kiedy powstaje przychód lub obowiązek podatkowy dla danej kwoty, a dopiero potem cofnij się o jeden dzień roboczy po kurs. Gdy w grę wchodzą zaliczki i raty, ustalasz tę datę osobno dla każdej płatności. To najczęstsze źródło pomyłek przy większych, rozłożonych w czasie zleceniach, dlatego przy takich rozliczeniach warto potwierdzić szczegóły z księgowym.</p>

<h2>Najczęstsze błędy przy fakturach walutowych</h2>
<ul>
<li><strong>Kurs z dnia faktury zamiast z dnia poprzedzającego</strong> — zawyża lub zaniża przychód o różnicę jednego dnia.</li>
<li><strong>Kurs banku zamiast NBP</strong> — do podatku liczy się wyłącznie średni kurs NBP.</li>
<li><strong>Pominięcie różnic kursowych</strong> — zapłata po innym kursie tworzy przychód lub koszt, którego nie wolno ignorować.</li>
<li><strong>Brak zapisanego kursu i tabeli</strong> — odtwarzanie kursu po miesiącach jest pracochłonne i podatne na błędy.</li>
</ul>

<h2>Jak SzpontHub pomaga przy fakturach walutowych</h2>
<p>Rozliczenie walutowe jest proste, gdy salda i kursy masz w jednym miejscu. W SzpontHub prowadzisz portfele wielowalutowe w PLN, USD i EUR, więc widzisz środki w oryginalnej walucie i ich wartość w złotych bez ręcznego przeliczania. Funkcja faktur z integracją Kugaru pozwala trzymać dokumenty razem z transakcjami, dzięki czemu łatwiej powiązać wpłatę z konkretną fakturą i zapanować nad kwotami potrzebnymi do rozliczenia różnic kursowych.</p>
`,
  faq: [
    {
      q: 'Po jakim kursie przeliczyć fakturę walutową na złote?',
      a: 'Po średnim kursie NBP z ostatniego dnia roboczego poprzedzającego dzień powstania przychodu, czyli najczęściej z dnia przed datą wystawienia faktury. To ten sam kurs, którego używasz do wykazania przychodu w PIT.',
    },
    {
      q: 'Z którego dnia brać kurs NBP do faktury?',
      a: 'Z ostatniego dnia roboczego poprzedzającego powstanie przychodu, a nie z dnia faktury. Jeśli faktura ma datę poniedziałkową, właściwy jest kurs z piątku, bo w weekend NBP nie publikuje tabeli walut.',
    },
    {
      q: 'Czy do podatku można użyć kursu z banku lub kantoru?',
      a: 'Nie. Do rozliczenia podatkowego stosuje się wyłącznie średni kurs NBP z tabeli A. Kurs banku czy kantoru dotyczy tylko faktycznej wymiany pieniędzy i nie ma znaczenia dla wyliczenia przychodu w podatku.',
    },
    {
      q: 'Co to są różnice kursowe na fakturze walutowej?',
      a: 'To różnica między wartością faktury przeliczoną po kursie z dnia przychodu a wartością zapłaty przeliczoną po kursie z dnia jej otrzymania. Różnica dodatnia zwiększa przychód, ujemna jest kosztem uzyskania przychodu.',
    },
    {
      q: 'Jak przeliczyć VAT na fakturze w walucie obcej?',
      a: 'Kwotę VAT wykazuje się w złotych, przeliczając podstawę po średnim kursie NBP z dnia poprzedzającego powstanie obowiązku podatkowego w VAT. Data ta bywa zbieżna z datą przychodu, ale to dwie odrębne kwestie i warto sprawdzić je osobno.',
    },
    {
      q: 'Czy muszę rozliczać różnice kursowe, jeśli trzymam euro na koncie walutowym?',
      a: 'Sposób ustalania różnic zależy od przyjętej metody i tego, czy oraz kiedy przewalutowujesz środki. Jeśli trzymasz walutę bez wymiany, praktyczna różnica może się zrealizować dopiero przy wymianie. To obszar, który najlepiej ustalić z księgowym.',
    },
    {
      q: 'Czy zasady przeliczania różnią się dla dolara i euro?',
      a: 'Nie — mechanizm jest identyczny dla każdej waluty obcej: zawsze średni kurs NBP z dnia poprzedzającego powstanie przychodu. Zmienia się tylko wysokość kursu, więc ta sama kwota netto daje inny przychód w złotych. Faktura na 1000 EUR po 4,30 zł to 4300 zł, a na 1000 USD po 3,95 zł to 3950 zł.',
    },
  ],
};

export default article;
