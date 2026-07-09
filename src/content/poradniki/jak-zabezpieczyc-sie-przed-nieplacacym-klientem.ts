import type { Article } from './types';

const article: Article = {
  slug: 'jak-zabezpieczyc-sie-przed-nieplacacym-klientem',
  title: 'Jak zabezpieczyć się przed niepłacącym klientem',
  description:
    'Zaliczka, umowa, weryfikacja klienta i ścieżka windykacji. Konkretne sposoby, jak zabezpieczyć się przed niepłacącym klientem i odzyskać należność.',
  category: 'freelancer',
  tags: ['niepłacący klient', 'freelancer', 'umowa', 'zaliczka', 'windykacja'],
  tldr:
    'Przed niepłacącym klientem chronisz się przede wszystkim zanim zaczniesz pracę: pisemną umową, zaliczką i płatnościami etapowymi. Zaliczka 30–50% oraz rozliczanie większych projektów w kamieniach milowych sprawiają, że nigdy nie pracujesz za darmo więcej niż jeden etap. Gdy mimo to klient nie zapłaci, działasz według ścieżki: przypomnienie, wezwanie do zapłaty, odsetki, a w ostateczności e-sąd i windykacja.',
  keyTakeaways: [
    'Najlepsze zabezpieczenie to zaliczka i płatności etapowe — działasz, zanim powstanie dług.',
    'Pisemna umowa z terminem płatności i odsetkami jest podstawą dochodzenia należności.',
    'Weryfikuj klienta przed startem: dane firmy, opinie, historia płatności.',
    'Przy braku zapłaty masz prawo do odsetek ustawowych za opóźnienie w transakcjach.',
    'Ścieżka odzyskiwania: przypomnienie, wezwanie do zapłaty, e-sąd, komornik.',
    'Faktura z potwierdzeniem odbioru usługi to dowód, który liczy się w sądzie.',
    'Odzyskiwanie długu kosztuje czas i kilkaset złotych — zapobieganie niemal zawsze wychodzi taniej.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Niezapłacona faktura to nie tylko utrata pieniędzy, ale i czasu, który już włożyłeś w pracę. Dla freelancera jeden niepłacący klient potrafi zachwiać całym miesiącem. Dobra wiadomość: większości takich sytuacji da się zapobiec, zanim w ogóle zaczniesz pracę. W tym poradniku pokażemy, jak zabezpieczyć się z wyprzedzeniem i co zrobić, gdy zapłata mimo wszystko nie przychodzi.</p>

<h2>Najlepsza obrona to zapobieganie</h2>
<p>Kluczowa zasada brzmi: <strong>nie pracuj za darmo dłużej, niż jesteś gotów stracić</strong>. Cała strategia zabezpieczeń sprowadza się do tego, żeby w każdym momencie projektu klient był Ci winien jak najmniej. Osiągasz to trzema narzędziami: zaliczką, płatnościami etapowymi i umową. Windykacja to ostateczność — dobry system sprawia, że rzadko jej potrzebujesz.</p>

<h2>Zaliczka — pierwsza linia obrony</h2>
<p>Zaliczka przed rozpoczęciem pracy to najprostsze i najskuteczniejsze zabezpieczenie. Standardem jest <strong>30–50% wartości projektu</strong> płatne z góry, przed startem. Ma to dwie funkcje: pokrywa Twój czas na wypadek rezygnacji klienta i filtruje klientów niepoważnych, którzy nie zamierzali płacić.</p>
<ul>
<li><strong>Nowy klient</strong> — zaliczka jest obowiązkowa, im wyższa, tym lepiej. Nie znasz jeszcze jego historii płatności.</li>
<li><strong>Sprawdzony klient</strong> — możesz zejść z zaliczki lub ją obniżyć, skoro znasz jego rzetelność.</li>
<li><strong>Duży projekt</strong> — zaliczka plus rozbicie reszty na etapy.</li>
</ul>

<h2>Płatności etapowe przy większych projektach</h2>
<p>Przy dłuższych zleceniach nie czekaj z całą płatnością do końca. Podziel projekt na kamienie milowe i fakturuj po każdym z nich. Dzięki temu w najgorszym scenariuszu tracisz tylko jeden etap, a nie całą pracę.</p>
<table>
<thead>
<tr><th>Etap</th><th>Zakres</th><th>Płatność</th></tr>
</thead>
<tbody>
<tr><td>Start</td><td>Podpisanie umowy</td><td>Zaliczka 30%</td></tr>
<tr><td>Kamień milowy 1</td><td>Pierwsza część prac odebrana</td><td>30%</td></tr>
<tr><td>Kamień milowy 2</td><td>Druga część prac odebrana</td><td>30%</td></tr>
<tr><td>Zakończenie</td><td>Wydanie całości</td><td>10%</td></tr>
</tbody>
</table>
<p>Ważna zasada: <strong>wydawaj efekt pracy dopiero po zapłacie za dany etap</strong>. Jeśli oddasz gotowy plik, projekt czy kod przed przelewem, tracisz najsilniejszy argument negocjacyjny.</p>

<blockquote>Zabezpieczasz się nie umową do sądu, lecz strukturą płatności. Zaliczka plus rozliczanie etapów sprawiają, że w najgorszym wypadku tracisz jeden etap pracy, a nie cały projekt.</blockquote>

<h2>Umowa, która chroni</h2>
<p>Nawet prosta pisemna umowa (albo potwierdzone mailem warunki) diametralnie poprawia Twoją pozycję. Powinna zawierać co najmniej:</p>
<ul>
<li>Dokładny zakres prac i to, co nie wchodzi w zakres.</li>
<li>Harmonogram płatności: zaliczka, etapy, kwoty i terminy.</li>
<li>Termin płatności faktury i wysokość odsetek za opóźnienie.</li>
<li>Zasady przekazania praw i efektu pracy dopiero po pełnej zapłacie.</li>
<li>Warunki rozwiązania umowy i rozliczenia wykonanej części.</li>
</ul>
<p>Więcej o konstrukcji takiej umowy znajdziesz w poradniku <a href="/poradniki/umowa-z-klientem-co-zawiera">umowa z klientem — co powinna zawierać</a>, a o samych terminach i formach płatności w poradniku <a href="/poradniki/jak-ustalic-warunki-platnosci">jak ustalić warunki płatności</a>.</p>

<h2>Weryfikacja klienta przed startem</h2>
<p>Zanim podpiszesz umowę, poświęć kilka minut na sprawdzenie klienta. Sygnały ostrzegawcze często widać z góry.</p>
<ul>
<li>Sprawdź dane firmy w publicznych rejestrach (CEIDG, KRS) i czy w ogóle istnieje.</li>
<li>Poszukaj opinii i śladów w sieci — inni wykonawcy bywają szczerzy o zatorach płatniczych.</li>
<li>Zwróć uwagę na czerwone flagi: pośpiech, niechęć do umowy, opór wobec zaliczki, mgliste ustalenia.</li>
</ul>

<h2>Co zrobić, gdy klient nie płaci</h2>
<p>Jeśli mimo zabezpieczeń faktura jest przeterminowana, działaj według ścieżki od najłagodniejszej do najostrzejszej. Trzymanie się kolejności zwiększa szansę na polubowne odzyskanie należności.</p>
<ol>
<li><strong>Uprzejme przypomnienie.</strong> Krótka wiadomość kilka dni po terminie. Czasem to zwykłe przeoczenie.</li>
<li><strong>Oficjalne wezwanie do zapłaty.</strong> Pisemne, z nowym terminem i wskazaniem odsetek oraz dalszych kroków.</li>
<li><strong>Naliczenie odsetek.</strong> Za opóźnienie w transakcjach handlowych przysługują Ci odsetki ustawowe — masz do nich prawo z mocy przepisów.</li>
<li><strong>Postępowanie sądowe.</strong> Dla bezspornych należności działa elektroniczne postępowanie upominawcze (e-sąd), szybkie i tańsze niż zwykły proces.</li>
<li><strong>Windykacja i komornik.</strong> Po uzyskaniu tytułu wykonawczego sprawę prowadzi komornik lub firma windykacyjna.</li>
</ol>
<p>To materiał informacyjny, a nie porada prawna — przy większych kwotach lub sporach warto skonsultować się z prawnikiem.</p>

<h2>Dowody, które liczą się później</h2>
<p>Gdyby doszło do sporu, Twoja pozycja zależy od dokumentacji. Zadbaj o nią od początku każdego zlecenia.</p>
<ul>
<li>Pisemna umowa lub potwierdzone mailem warunki.</li>
<li>Faktura z jasnym terminem płatności i danymi stron.</li>
<li>Potwierdzenie odbioru pracy lub akceptacji etapu (mail, wiadomość).</li>
<li>Historia korespondencji dokumentująca ustalenia i przypomnienia.</li>
</ul>

<h2>Ile realnie kosztuje niepłacący klient</h2>
<p>Strata z niezapłaconej faktury to nie tylko sama kwota. Doliczyć trzeba czas na przypomnienia, koszty ewentualnego postępowania i utracony przychód z pracy, którą mogłeś w tym czasie wykonać. Zobacz, jak wygląda pełny rachunek na przykładzie faktury na 5000 zł.</p>
<table>
<thead>
<tr><th>Pozycja</th><th>Szacowany koszt</th></tr>
</thead>
<tbody>
<tr><td>Niezapłacona należność</td><td>5000 zł</td></tr>
<tr><td>Czas na przypomnienia i wezwania (ok. 6 h x 120 zł)</td><td>720 zł</td></tr>
<tr><td>Opłata od pozwu w e-sądzie (5 procent wartości)</td><td>250 zł</td></tr>
<tr><td>Utracony przychód z odłożonej pracy</td><td>trudny do odzyskania</td></tr>
<tr><td>Realny koszt sporu</td><td>ok. 970 zł ponad samą fakturę</td></tr>
</tbody>
</table>
<p>Wniosek jest prosty: nawet wygrana sprawa oznacza kilkaset złotych kosztów i tygodnie zaangażowania. Dlatego zaliczka 30-50 procent i płatności etapowe niemal zawsze wychodzą taniej niż najlepiej poprowadzona windykacja. Zapobieganie kosztuje kilka minut, odzyskiwanie długu — tygodnie.</p>

<h2>Czerwone flagi klienta, których nie wolno ignorować</h2>
<p>Większość niepłacących klientów daje sygnały ostrzegawcze jeszcze przed podpisaniem umowy. Im więcej poniższych punktów widzisz, tym wyższa powinna być zaliczka albo tym poważniej rozważ rezygnację.</p>
<ul>
<li><strong>Opór wobec zaliczki.</strong> Uczciwy klient rozumie zaliczkę. Silny sprzeciw wobec każdej formy przedpłaty to najczęstsza zapowiedź problemów.</li>
<li><strong>Niechęć do spisania warunków.</strong> Zdanie po co nam umowa, przecież się dogadamy zostawia Cię bez dowodów w razie sporu.</li>
<li><strong>Sztuczny pośpiech.</strong> Presja zacznijmy od zaraz, szczegóły ustalimy później służy pominięciu zabezpieczeń.</li>
<li><strong>Mgliste określenie zakresu.</strong> Klient, który unika konkretów, później twierdzi, że praca miała obejmować więcej za tę samą cenę.</li>
<li><strong>Historia zmienianych wykonawców.</strong> Jeśli poprzedni współpracownicy szybko odchodzili, powód często leży po stronie płatności.</li>
<li><strong>Brak śladu w rejestrach.</strong> Firma, której nie ma w CEIDG ani KRS, utrudnia dochodzenie należności.</li>
</ul>

<h2>Ścieżka odzyskiwania krok po kroku — czas i koszt</h2>
<p>Gdy zabezpieczenia zawiodą, warto wiedzieć, ile trwa i kosztuje każdy etap. To materiał informacyjny, a nie porada prawna, ale daje realistyczny obraz procesu.</p>
<table>
<thead>
<tr><th>Etap</th><th>Orientacyjny czas</th><th>Koszt dla Ciebie</th></tr>
</thead>
<tbody>
<tr><td>Przypomnienie mailowe</td><td>1 dzień</td><td>brak</td></tr>
<tr><td>Wezwanie do zapłaty</td><td>7-14 dni terminu</td><td>brak lub znaczek</td></tr>
<tr><td>Pozew w e-sądzie</td><td>kilka tygodni</td><td>5 procent wartości</td></tr>
<tr><td>Egzekucja komornicza</td><td>od kilku tygodni</td><td>zaliczka na koszty, zwykle odzyskiwana</td></tr>
</tbody>
</table>
<p>Kluczowa uwaga: nigdy nie przeskakuj etapów. Sąd i komornik oczekują, że najpierw wezwałeś dłużnika pisemnie. Uporządkowana ścieżka nie tylko zwiększa szansę na polubowną zapłatę, ale też wzmacnia Twoją pozycję, gdyby sprawa trafiła dalej.</p>

<h2>Checklista przed startem współpracy</h2>
<p>Przejdź tę listę przed każdym nowym zleceniem. Każdy odhaczony punkt to jeden mniej powód do stresu, gdy zbliża się termin płatności.</p>
<ol>
<li><strong>Zweryfikowałeś klienta</strong> w rejestrach i poszukałeś opinii innych wykonawców.</li>
<li><strong>Ustaliłeś zaliczkę</strong> adekwatną do ryzyka (wyższą przy nowym kliencie).</li>
<li><strong>Spisałeś zakres i harmonogram płatności</strong> w umowie lub potwierdzonym mailu.</li>
<li><strong>Rozbiłeś większy projekt na etapy</strong> z płatnością po każdym kamieniu milowym.</li>
<li><strong>Zapisałeś termin płatności i odsetki</strong> za opóźnienie.</li>
<li><strong>Ustaliłeś, że efekt pracy wydajesz po zapłacie</strong> za dany etap.</li>
</ol>

<h2>Jak SzpontHub pomaga panować nad należnościami</h2>
<p>Zabezpieczenie przed niepłacącym klientem wymaga porządku w fakturach i szybkiego wychwytywania przeterminowanych płatności. W SzpontHub wystawiasz faktury (w integracji z Kugaru) i widzisz je obok swoich przychodów, dzięki czemu od razu zauważasz, która należność nie wpłynęła w terminie. Trzymając zlecenia, faktury i wpłaty w jednym miejscu, wiesz dokładnie, ile pieniędzy czeka na zapłatę i którego klienta trzeba przypomnieć — zanim mały poślizg zamieni się w duży problem.</p>
`,
  faq: [
    {
      q: 'Jak zabezpieczyć się przed niepłacącym klientem?',
      a: 'Najskuteczniej zanim zaczniesz pracę: pobierz zaliczkę 30–50%, rozbij większe projekty na płatności etapowe i podpisz pisemną umowę z terminem płatności. Dzięki temu w najgorszym wypadku tracisz jeden etap, a nie cały projekt.',
    },
    {
      q: 'Ile powinna wynosić zaliczka od klienta?',
      a: 'Standardem jest 30–50% wartości projektu płatne przed rozpoczęciem pracy. Przy nowym kliencie zaliczka jest obowiązkowa i im wyższa, tym lepiej, bo nie znasz jeszcze jego historii płatności. Przy sprawdzonym kliencie możesz ją obniżyć.',
    },
    {
      q: 'Co zrobić, gdy klient nie zapłacił faktury?',
      a: 'Działaj stopniowo: najpierw uprzejme przypomnienie, potem oficjalne pisemne wezwanie do zapłaty z nowym terminem, następnie naliczenie odsetek za opóźnienie, a przy braku reakcji elektroniczne postępowanie upominawcze i windykacja komornicza.',
    },
    {
      q: 'Czy freelancerowi należą się odsetki za opóźnienie w płatności?',
      a: 'Tak. Za opóźnienie w transakcjach handlowych przysługują odsetki ustawowe, do których masz prawo z mocy przepisów. Warto zapisać wysokość odsetek w umowie i wskazać je już w wezwaniu do zapłaty.',
    },
    {
      q: 'Czy warto oddawać pracę przed otrzymaniem zapłaty?',
      a: 'Nie. Efekt pracy — gotowy plik, projekt czy kod — wydawaj dopiero po zapłacie za dany etap. Oddanie całości przed przelewem pozbawia Cię najsilniejszego argumentu negocjacyjnego, jeśli klient zacznie zwlekać.',
    },
    {
      q: 'Jak sprawdzić klienta przed rozpoczęciem współpracy?',
      a: 'Zweryfikuj dane firmy w publicznych rejestrach jak CEIDG i KRS, poszukaj opinii innych wykonawców w sieci i zwróć uwagę na czerwone flagi: pośpiech, opór wobec umowy i zaliczki oraz mgliste ustalenia. Kilka minut sprawdzenia oszczędza późniejszych strat.',
    },
    {
      q: 'Ile kosztuje odzyskanie niezapłaconej faktury?',
      a: 'Poza samą należnością doliczyć trzeba czas na wezwania, opłatę od pozwu w e-sądzie w wysokości 5 procent wartości oraz utracony przychód z pracy odłożonej na rzecz sporu. Przy fakturze na 5000 zł realny koszt sięga blisko tysiąca złotych ponad kwotę długu, dlatego zaliczka i płatności etapowe niemal zawsze wychodzą taniej niż windykacja.',
    },
  ],
};

export default article;
