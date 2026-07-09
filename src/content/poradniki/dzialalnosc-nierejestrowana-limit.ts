import type { Article } from './types';

const article: Article = {
  slug: 'dzialalnosc-nierejestrowana-limit',
  title: 'Działalność nierejestrowana — limit i zasady w praktyce',
  description:
    'Ile można zarobić na działalności nierejestrowanej, jaki jest limit przychodu, kiedy trzeba założyć firmę i jak rozliczyć podatek. Konkretne kwoty i przykłady.',
  category: 'freelancer',
  tags: ['działalność nierejestrowana', 'freelancer', 'limit przychodu', 'podatki', 'ZUS'],
  tldr:
    'Działalność nierejestrowana pozwala legalnie zarabiać bez zakładania firmy, o ile miesięczny przychód nie przekroczy 75% minimalnego wynagrodzenia i w ostatnich 60 miesiącach nie prowadziłeś działalności gospodarczej. Nie płacisz z niej składek ZUS, a przychód rozliczasz raz w roku w zeznaniu PIT według skali podatkowej. Po przekroczeniu limitu w danym miesiącu masz 7 dni na zarejestrowanie działalności gospodarczej.',
  keyTakeaways: [
    'Limit przychodu to 75% minimalnego wynagrodzenia miesięcznie — liczy się przychód, nie zysk.',
    'Nie płacisz składek ZUS ani zaliczek na podatek w trakcie roku.',
    'Warunek: brak działalności gospodarczej w ostatnich 60 miesiącach.',
    'Po przekroczeniu limitu masz 7 dni na rejestrację działalności w CEIDG.',
    'Przychód rozliczasz raz w roku w PIT-36 według skali (12% i 32%).',
    'Nadal musisz wystawiać rachunki lub faktury na żądanie i prowadzić prostą ewidencję sprzedaży.',
    'W 2025 roku limit to 3499,50 zł miesięcznie (75% z 4666 zł minimalnego wynagrodzenia).',
    'Do limitu liczy się kwota należna w danym miesiącu, nawet jeśli klient jeszcze nie zapłacił.',
  ],
  published: '2026-07-09',
  readingMinutes: 12,
  bodyHtml: `
<p>Działalność nierejestrowana to najprostszy legalny sposób, by zacząć zarabiać na własnych usługach bez zakładania firmy, opłacania ZUS i comiesięcznej księgowości. To dobre rozwiązanie na testowanie pomysłu, dorywcze zlecenia albo pierwsze kroki freelancera. Ma jednak sztywne granice, których przekroczenie oznacza obowiązek rejestracji działalności gospodarczej. W tym poradniku znajdziesz aktualne zasady, limit przychodu i przykładowe wyliczenia.</p>

<p>To materiał informacyjny, a nie porada podatkowa. Przepisy i kwoty zmieniają się co roku, więc przed ważną decyzją warto zweryfikować szczegóły w aktualnych źródłach lub u księgowego.</p>

<h2>Czym jest działalność nierejestrowana</h2>
<p>Działalność nierejestrowana (nazywana też nieewidencjonowaną) to zarobkowa aktywność osoby fizycznej, która nie wymaga wpisu do CEIDG, o ile spełnia dwa warunki: przychód nie przekracza ustawowego limitu oraz w ostatnich 60 miesiącach nie prowadziłeś działalności gospodarczej. Mimo braku formalnej firmy działasz legalnie, możesz wystawiać rachunki i przyjmować płatności od klientów.</p>
<p>Najważniejsza korzyść to brak składek ZUS oraz brak zaliczek na podatek w trakcie roku. Nie zgłaszasz działalności do urzędu, nie prowadzisz pełnej księgowości i nie płacisz co miesiąc do ZUS. Rozliczasz się dopiero raz w roku w zeznaniu rocznym.</p>

<h2>Jaki jest limit przychodu</h2>
<p>Limit miesięcznego przychodu z działalności nierejestrowanej wynosi <strong>75% minimalnego wynagrodzenia</strong> obowiązującego w danym roku. Ponieważ płaca minimalna rośnie co roku (a bywa aktualizowana także w połowie roku), kwota limitu również się zmienia. Zawsze sprawdź wartość obowiązującą w bieżącym miesiącu.</p>
<p>Konkretnie: w 2025 roku minimalne wynagrodzenie wynosi 4666 zł brutto, więc limit działalności nierejestrowanej to <strong>3499,50 zł</strong> miesięcznie (75% z 4666 zł). To kwota przychodu należnego, jaki możesz wykazać w jednym miesiącu, zanim będziesz musiał zarejestrować firmę. Poniższa tabela pokazuje, jak limit rósł wraz z płacą minimalną w ostatnich latach.</p>
<table>
<thead>
<tr><th>Rok</th><th>Minimalne wynagrodzenie</th><th>Limit miesięczny (75%)</th></tr>
</thead>
<tbody>
<tr><td>2023 (od lipca)</td><td>3600 zł</td><td>2700 zł</td></tr>
<tr><td>2024 (od lipca)</td><td>4300 zł</td><td>3225 zł</td></tr>
<tr><td>2025</td><td>4666 zł</td><td>3499,50 zł</td></tr>
</tbody>
</table>
<p>Kluczowe jest to, że liczy się <strong>przychód</strong>, czyli suma należności ze sprzedaży, a nie zysk po odjęciu kosztów. Przykład: sprzedajesz rękodzieło za 3400 zł w miesiącu, ale materiały kosztowały Cię 1500 zł. Twój faktyczny zysk to 1900 zł, ale do limitu wlicza się pełne 3400 zł. Zostaje Ci więc tylko 99,50 zł zapasu do granicy 3499,50 zł — kolejne zlecenie w tym miesiącu może oznaczać przekroczenie limitu.</p>

<table>
<thead>
<tr><th>Pojęcie</th><th>Co oznacza</th><th>Czy wlicza się do limitu</th></tr>
</thead>
<tbody>
<tr><td>Przychód należny</td><td>Kwota, którą klient ma zapłacić za usługę lub towar</td><td>Tak</td></tr>
<tr><td>Koszty</td><td>Wydatki na materiały, narzędzia, dojazd</td><td>Nie odejmujesz ich od limitu</td></tr>
<tr><td>Kwota faktycznie otrzymana</td><td>To, co wpłynęło na konto</td><td>Liczy się kwota należna, nawet niezapłacona</td></tr>
</tbody>
</table>

<p>Uwaga na subtelność: do limitu wlicza się kwota <strong>należna</strong>, czyli wymagalna w danym miesiącu, nawet jeśli klient jeszcze nie zapłacił. Jeśli wystawisz rachunek z terminem płatności w tym miesiącu, ta kwota liczy się do limitu tego miesiąca.</p>

<h2>Kto może prowadzić działalność nierejestrowaną</h2>
<p>Z tej formy skorzystasz, jeśli spełniasz łącznie następujące warunki:</p>
<ul>
<li>Jesteś osobą fizyczną i działasz samodzielnie (nie w spółce).</li>
<li>Twój miesięczny przychód nie przekracza 75% minimalnego wynagrodzenia.</li>
<li>W ostatnich 60 miesiącach (5 lat) nie prowadziłeś działalności gospodarczej.</li>
<li>Twoja działalność nie wymaga koncesji, licencji ani pozwolenia (np. nie jest to sprzedaż alkoholu czy usługi ochrony).</li>
</ul>
<p>Działalność nierejestrowaną możesz prowadzić równolegle z etatem. Pracodawca nie ma z tym nic wspólnego, o ile nie łamiesz zakazu konkurencji. To częsty scenariusz dla osób, które testują freelancing obok stałej pracy.</p>

<h2>Podatki i rozliczenie roczne</h2>
<p>Przychód z działalności nierejestrowanej rozliczasz raz w roku w zeznaniu <strong>PIT-36</strong>, w rubryce przeznaczonej dla tego rodzaju działalności. Dochód (czyli przychód pomniejszony o udokumentowane koszty) opodatkowany jest według skali podatkowej: 12% do progu i 32% powyżej. Sumuje się on z innymi Twoimi dochodami, na przykład z etatu.</p>
<p>W trakcie roku nie płacisz zaliczek na podatek — całość rozliczasz dopiero w zeznaniu do końca kwietnia. Warto jednak odkładać część przychodu na przyszły podatek, żeby rozliczenie nie było nieprzyjemną niespodzianką. Zasady odliczania wydatków są podobne jak przy firmie — więcej o tym w poradniku <a href="/poradniki/koszty-uzyskania-przychodu-freelancer">koszty uzyskania przychodu freelancera</a>.</p>

<blockquote>Limit działalności nierejestrowanej dotyczy przychodu, nie zysku. Do 75% minimalnego wynagrodzenia miesięcznie liczy się cała kwota należna od klientów, zanim odejmiesz jakiekolwiek koszty.</blockquote>

<h3>Obowiązki, o których się zapomina</h3>
<p>Brak rejestracji nie oznacza całkowitego braku formalności. Musisz:</p>
<ul>
<li>Prowadzić uproszczoną ewidencję sprzedaży (choćby zwykłą tabelę z datą i kwotą), żeby pilnować limitu.</li>
<li>Wystawiać rachunek lub fakturę na żądanie klienta — a wobec firm często jest to standard.</li>
<li>Przestrzegać praw konsumenta, w tym prawa do odstąpienia od umowy przy sprzedaży na odległość.</li>
</ul>
<p>Jeśli wystawiasz dokumenty firmom, zajrzyj do poradnika <a href="/poradniki/jak-wystawic-fakture-freelancer">jak wystawić fakturę jako freelancer</a> — zasady są w dużej mierze wspólne.</p>

<h2>Co się dzieje po przekroczeniu limitu</h2>
<p>Jeśli w którymś miesiącu przychód przekroczy 75% minimalnego wynagrodzenia, działalność nierejestrowana automatycznie staje się działalnością gospodarczą. Od tego momentu masz <strong>7 dni na złożenie wniosku o wpis do CEIDG</strong>. Nie tracisz prawa do wcześniejszych miesięcy rozliczanych jako nierejestrowana — zmiana dotyczy przyszłości.</p>
<p>Po rejestracji wchodzisz w reżim składek ZUS, ale na starcie przysługują Ci ulgi obniżające ich wysokość. Dokładnie opisujemy je w poradniku <a href="/poradniki/zus-dla-freelancera">ZUS dla freelancera krok po kroku</a>.</p>

<h3>Przykładowe wyliczenie limitu miesięcznego</h3>
<p>Przyjmijmy limit 3499,50 zł miesięcznie obowiązujący w 2025 roku.</p>
<table>
<thead>
<tr><th>Miesiąc</th><th>Przychód należny</th><th>Status</th></tr>
</thead>
<tbody>
<tr><td>Styczeń</td><td>1800 zł</td><td>W limicie (zapas 1699,50 zł)</td></tr>
<tr><td>Luty</td><td>3200 zł</td><td>W limicie (zapas 299,50 zł)</td></tr>
<tr><td>Marzec</td><td>3900 zł</td><td>Przekroczenie o 400,50 zł — rejestracja w 7 dni</td></tr>
</tbody>
</table>
<p>W styczniu i lutym rozliczasz się jako działalność nierejestrowana. W marcu, po przekroczeniu limitu, zakładasz firmę w CEIDG i od tego momentu działasz na zasadach działalności gospodarczej. Limit rozlicza się osobno dla każdego miesiąca — niewykorzystany zapas ze stycznia nie przechodzi na luty.</p>

<h2>Rozliczenie roczne w zł — pełny przykład</h2>
<p>Prześledźmy, ile realnie zapłacisz podatku. Załóżmy, że przez cały 2025 rok prowadziłeś działalność nierejestrowaną, mieściłeś się w limicie i osiągnąłeś następujące wyniki.</p>
<table>
<thead>
<tr><th>Pozycja</th><th>Kwota w roku</th></tr>
</thead>
<tbody>
<tr><td>Przychód należny (suma z 12 miesięcy)</td><td>30 000 zł</td></tr>
<tr><td>Udokumentowane koszty (materiały, narzędzia)</td><td>8 000 zł</td></tr>
<tr><td>Dochód (przychód minus koszty)</td><td>22 000 zł</td></tr>
</tbody>
</table>
<p>Ten dochód dopisujesz do zeznania PIT-36 i sumujesz z innymi źródłami. Jak liczy się podatek według skali:</p>
<ol>
<li>Jeśli działalność nierejestrowana to Twój jedyny dochód (22 000 zł), mieści się w kwocie wolnej od podatku (30 000 zł rocznie) — podatek wyniesie <strong>0 zł</strong>.</li>
<li>Jeśli masz też etat, np. 60 000 zł dochodu rocznie, łączna podstawa to 82 000 zł. Kwota wolna jest już zużyta przez etat, więc dochód 22 000 zł z działalności opodatkujesz stawką 12%, co daje około <strong>2 640 zł</strong> podatku (jeszcze w pierwszym progu, bo 82 000 zł jest poniżej progu 120 000 zł).</li>
<li>Dopiero po przekroczeniu łącznej podstawy 120 000 zł nadwyżka opodatkowana jest stawką 32%.</li>
</ol>
<p>Wniosek praktyczny: przy niskich dochodach i braku etatu realny podatek często wynosi zero. Ale jeśli dokładasz działalność do dobrze płatnego etatu, licz się z tym, że cały dochód z niej wpadnie od razu w 12% (a przy wysokich zarobkach nawet 32%). Dlatego warto odkładać na osobne konto około 12% każdego przychodu na przyszły podatek.</p>

<h2>Najczęstsze błędy, które kończą się problemem</h2>
<p>Prostota działalności nierejestrowanej bywa zwodnicza. Oto pułapki, które najczęściej kosztują nerwy lub pieniądze:</p>
<ul>
<li><strong>Liczenie wpłat zamiast należności.</strong> Wystawiasz rachunek na 3400 zł z terminem w tym miesiącu, klient płaci dopiero za trzy tygodnie. Do limitu bieżącego miesiąca liczy się cała kwota należna, a nie moment wpływu na konto.</li>
<li><strong>Mylenie przychodu z zyskiem.</strong> Odejmowanie kosztów przed sprawdzeniem limitu to najczęstszy błąd — limit dotyczy przychodu, koszty odliczasz dopiero w rozliczeniu podatku.</li>
<li><strong>Brak ewidencji sprzedaży.</strong> Bez prostej tabeli z datami i kwotami łatwo przeoczyć moment przekroczenia limitu i spóźnić się z rejestracją.</li>
<li><strong>Przegapienie 7-dniowego terminu.</strong> Po przekroczeniu limitu masz tylko 7 dni na wpis do CEIDG. Działanie bez wpisu to już nielegalna działalność gospodarcza.</li>
<li><strong>Prowadzenie działalności wymagającej koncesji.</strong> Niektórych usług (np. ochrona, sprzedaż alkoholu) nie wolno prowadzić w tej formie niezależnie od kwoty przychodu.</li>
</ul>

<h2>Scenariusz: freelancer dorabiający obok etatu</h2>
<p>Anna pracuje na etacie i wieczorami projektuje grafiki. W 2025 roku jej zlecenia rosną. Zobaczmy, jak wygląda jej rok:</p>
<ul>
<li>Od stycznia do września przychód z grafiki waha się między 1200 a 3000 zł miesięcznie — mieści się w limicie 3499,50 zł, więc rozlicza się jako działalność nierejestrowana.</li>
<li>W październiku dostaje dużą kampanię za 4500 zł — przekracza limit. Ma 7 dni na rejestrację w CEIDG i od października działa jako działalność gospodarcza.</li>
<li>Za miesiące styczeń-wrzesień rozlicza dochód w PIT-36 jako działalność nierejestrowana. Ponieważ ma etat, cały ten dochód opodatkuje stawką 12%.</li>
</ul>
<p>Wniosek: gdy przychody stabilnie zbliżają się do limitu, warto z wyprzedzeniem przygotować się na rejestrację i policzyć, czy działalność gospodarcza z ulgą na start (np. Ulga na start i preferencyjny ZUS) nie będzie korzystniejsza. Więcej w poradniku <a href="/poradniki/zus-dla-freelancera">ZUS dla freelancera krok po kroku</a>.</p>

<h2>Checklista przed startem</h2>
<p>Zanim przyjmiesz pierwsze zlecenie, sprawdź, czy masz to ogarnięte:</p>
<ol>
<li>Potwierdź, że w ostatnich 60 miesiącach nie prowadziłeś działalności gospodarczej.</li>
<li>Sprawdź aktualny limit (75% minimalnego wynagrodzenia) na bieżący rok.</li>
<li>Upewnij się, że Twoja usługa nie wymaga koncesji ani licencji.</li>
<li>Załóż prostą ewidencję sprzedaży — data, opis, kwota należna.</li>
<li>Ustal, jak będziesz wystawiać rachunki na żądanie klienta.</li>
<li>Odkładaj około 12% każdego przychodu na przyszły podatek.</li>
<li>Zaznacz w kalendarzu, że po przekroczeniu limitu masz tylko 7 dni na rejestrację.</li>
</ol>

<h2>Dla kogo działalność nierejestrowana ma sens</h2>
<p>Ta forma sprawdza się, gdy dopiero zaczynasz i nie wiesz, czy Twoje usługi się przyjmą, gdy dorabiasz obok etatu albo gdy Twoje zlecenia są nieregularne i drobne. Jeśli jednak Twoje przychody stabilnie zbliżają się do limitu, warto od razu policzyć, czy rejestracja z ulgami ZUS nie da Ci więcej możliwości — na przykład odliczania większych kosztów czy wystawiania faktur VAT.</p>
<p>Główna zaleta to prostota: zero składek co miesiąc, brak zaliczek, minimum formalności. Główne ograniczenie to sztywny limit przychodu, który przy rosnących zleceniach szybko staje się ciasny.</p>

<h2>Jak SzpontHub pomaga pilnować limitu</h2>
<p>Największym ryzykiem działalności nierejestrowanej jest przypadkowe przekroczenie limitu, bo liczy się przychód należny, a nie wpłaty na konto. W SzpontHub możesz rejestrować każde zlecenie jako transakcję w wybranej kategorii i na bieżąco widzieć sumę przychodu w danym miesiącu na tle limitu. Dzięki temu, że transakcje, faktury i salda są w jednym miejscu, w każdej chwili wiesz, ile jeszcze możesz zafakturować, zanim konieczna stanie się rejestracja firmy.</p>
`,
  faq: [
    {
      q: 'Ile można zarobić na działalności nierejestrowanej?',
      a: 'Miesięczny przychód nie może przekroczyć 75% minimalnego wynagrodzenia obowiązującego w danym roku. Liczy się przychód należny, czyli cała kwota od klientów, a nie zysk po odjęciu kosztów. Kwota limitu zmienia się wraz z płacą minimalną.',
    },
    {
      q: 'Czy od działalności nierejestrowanej płaci się ZUS?',
      a: 'Nie. Działalność nierejestrowana jest zwolniona ze składek ZUS, zarówno społecznych, jak i zdrowotnej. Nie płacisz też zaliczek na podatek w trakcie roku — rozliczasz się dopiero w rocznym zeznaniu PIT-36.',
    },
    {
      q: 'Jak rozlicza się podatek z działalności nierejestrowanej?',
      a: 'Dochód, czyli przychód pomniejszony o udokumentowane koszty, wykazujesz raz w roku w zeznaniu PIT-36 i opodatkowujesz według skali podatkowej (12% i 32%). Sumuje się on z innymi dochodami, na przykład z etatu.',
    },
    {
      q: 'Co zrobić po przekroczeniu limitu działalności nierejestrowanej?',
      a: 'Od miesiąca przekroczenia Twoja działalność staje się działalnością gospodarczą i masz 7 dni na złożenie wniosku o wpis do CEIDG. Wcześniejsze miesiące pozostają rozliczone jako nierejestrowana, a zmiana dotyczy przyszłości.',
    },
    {
      q: 'Czy działalność nierejestrowaną można prowadzić obok etatu?',
      a: 'Tak. Możesz prowadzić ją równolegle z pracą na etacie, o ile nie łamiesz zakazu konkurencji wobec pracodawcy. To popularny sposób na testowanie freelancingu bez rezygnacji ze stałej pensji.',
    },
    {
      q: 'Czy muszę wystawiać faktury przy działalności nierejestrowanej?',
      a: 'Musisz wystawić rachunek lub fakturę na żądanie klienta, a wobec firm jest to zwykle standard. Powinieneś też prowadzić uproszczoną ewidencję sprzedaży, żeby na bieżąco kontrolować, czy nie przekraczasz miesięcznego limitu.',
    },
    {
      q: 'Ile wynosi limit działalności nierejestrowanej w 2025 roku?',
      a: 'W 2025 roku minimalne wynagrodzenie to 4666 zł brutto, więc limit miesięcznego przychodu wynosi 3499,50 zł (75% z tej kwoty). Limit rozlicza się osobno dla każdego miesiąca, a niewykorzystany zapas z jednego miesiąca nie przechodzi na kolejny.',
    },
    {
      q: 'Czy do limitu liczy się kwota niezapłacona przez klienta?',
      a: 'Tak. Do limitu wlicza się przychód należny, czyli kwota wymagalna w danym miesiącu, nawet jeśli klient jeszcze nie przelał pieniędzy. Jeśli wystawisz rachunek z terminem płatności w tym miesiącu, cała ta kwota liczy się do limitu tego miesiąca.',
    },
  ],
};

export default article;
