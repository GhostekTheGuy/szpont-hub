import type { Article } from './types';

const article: Article = {
  slug: 'jak-ustalic-warunki-platnosci',
  title: 'Jak ustalić warunki płatności i terminy — poradnik freelancera',
  description:
    'Jak ustalać terminy płatności, zaliczki i harmonogram rozliczeń, żeby nie kredytować klientów. Konkretne modele płatności, tabela i gotowe zapisy.',
  category: 'freelancer',
  tags: ['warunki płatności', 'freelancer', 'terminy płatności', 'zaliczka', 'faktury'],
  tldr:
    'Dobre warunki płatności to krótki termin (7–14 dni), zaliczka przy nowych klientach (30–50%) oraz rozliczanie większych projektów w kamieniach milowych, a nie dopiero na końcu. Ustala się je na piśmie przed rozpoczęciem prac i zapisuje w umowie razem z odsetkami za zwłokę. Celem jest nie kredytować klienta własną pracą i mieć płynność finansową mimo nieregularnych wpływów.',
  keyTakeaways: [
    'Ustalaj warunki płatności przed rozpoczęciem prac, nie po — potem jesteś na słabszej pozycji.',
    'Krótki termin płatności (7–14 dni) i data liczona od wystawienia faktury, nie od zakończenia projektu.',
    'Zaliczka 30–50% przy nowych klientach finansuje start prac i filtruje klientów niepoważnych.',
    'Duże projekty rozliczaj w kamieniach milowych, żeby nie kredytować klienta całością pracy.',
    'Zapisz odsetki za zwłokę i procedurę przypomnień — dyscyplinują nawet, gdy rzadko je egzekwujesz.',
    'Na prośbę o dłuższy termin odpowiadaj wymianą — wyższą ceną, większą zaliczką lub częstszym fakturowaniem.',
    'Przy kliencie zagranicznym ustal z góry, kto pokrywa koszty przelewu i po jakim kursie następuje przewalutowanie.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Warunki płatności decydują o tym, czy freelancing daje Ci płynność finansową, czy nieustanne stresy z brakiem gotówki. Zbyt długie terminy i brak zaliczek sprawiają, że w praktyce kredytujesz klientów własną pracą — czekając tygodniami na pieniądze za coś, co już dostarczyłeś. W tym poradniku pokażemy, jak ustalać terminy, zaliczki i harmonogram rozliczeń, żeby pieniądze wpływały przewidywalnie.</p>

<h2>Dlaczego warunki płatności ustala się przed pracą</h2>
<p>Moment negocjacji warunków to jedyny czas, gdy masz realną siłę przetargową. Zanim zaczniesz, klient potrzebuje Twojej pracy, więc jest gotów uzgodnić rozsądne zasady. Po dostarczeniu efektu sytuacja się odwraca — to Ty czekasz na pieniądze i masz mniej dźwigni. Dlatego wszystkie warunki płatności ustalaj i zapisuj, zanim wykonasz pierwszą godzinę pracy.</p>
<blockquote>Zasada: nigdy nie zaczynaj pracy, dopóki termin płatności, zaliczka i forma rozliczenia nie są ustalone na piśmie.</blockquote>
<p>Warunki płatności to naturalna część umowy — więcej o całym dokumencie znajdziesz w poradniku <a href="/poradniki/umowa-z-klientem-co-zawiera">umowa z klientem — co powinna zawierać</a>.</p>

<h2>Termin płatności — im krótszy, tym lepiej dla płynności</h2>
<p>Termin płatności to liczba dni, w których klient musi zapłacić po otrzymaniu faktury. Dla freelancera im krótszy, tym lepiej — każdy dodatkowy dzień to Twój kredyt udzielony klientowi. Rozsądny standard to 7–14 dni. Terminy 30, 45 czy 60 dni, popularne w dużych firmach, oznaczają, że przez półtora miesiąca finansujesz cudzą działalność.</p>
<p>Zwróć uwagę na jeden szczegół: termin liczony od wystawienia faktury, a nie od zakończenia projektu ani od zaakceptowania prac. Mgliste sformułowania w rodzaju płatność po odbiorze pozwalają klientowi przeciągać moment startu odliczania w nieskończoność.</p>

<h2>Zaliczka — Twoje główne zabezpieczenie</h2>
<p>Zaliczka to część wynagrodzenia płacona z góry, przed rozpoczęciem prac. Pełni trzy funkcje naraz: finansuje początek projektu, filtruje klientów niepoważnych (kto nie chce wpłacić zaliczki, często i tak nie zapłaci) oraz zmniejsza Twoje ryzyko, gdybyś na końcu został bez zapłaty za całość.</p>
<table>
<thead>
<tr><th>Sytuacja</th><th>Zalecana zaliczka</th><th>Uzasadnienie</th></tr>
</thead>
<tbody>
<tr><td>Nowy klient, pierwszy projekt</td><td>40–50%</td><td>Brak historii współpracy, najwyższe ryzyko</td></tr>
<tr><td>Stały klient, sprawdzona historia</td><td>0–30%</td><td>Zaufanie i przewidywalne płatności</td></tr>
<tr><td>Duży projekt długoterminowy</td><td>30% plus kamienie milowe</td><td>Rozłożenie ryzyka na etapy</td></tr>
<tr><td>Klient zagraniczny</td><td>30–50%</td><td>Trudniejsza egzekwowalność należności</td></tr>
</tbody>
</table>

<h2>Modele rozliczania większych projektów</h2>
<p>Przy dużych zleceniach płatność dopiero na końcu to poważne ryzyko — jeśli projekt trwa dwa miesiące, przez cały ten czas pracujesz bez wpływów. Lepiej rozbić rozliczenie na etapy. Najczęstsze modele:</p>
<ul>
<li><strong>Kamienie milowe.</strong> Płatność przypisana do konkretnych etapów projektu (np. 30% zaliczki, 40% po akceptacji koncepcji, 30% po oddaniu całości). Klient płaci za zrealizowany fragment, Ty masz regularne wpływy.</li>
<li><strong>Rozliczenie miesięczne.</strong> Przy współpracy ciągłej fakturujesz co miesiąc za wykonane godziny lub ustaloną kwotę. Dobre dla projektów bez wyraźnego końca.</li>
<li><strong>Ryczałt z zaliczką.</strong> Stała kwota za cały projekt, z częścią płatną z góry. Sprawdza się przy dobrze zdefiniowanym zakresie.</li>
</ul>
<p>Model dopasuj do długości i przewidywalności projektu — im dłuższy i mniej pewny, tym ważniejsze rozłożenie płatności na etapy.</p>

<h3>Płatność godzinowa a ryczałt</h3>
<p>Przy rozliczeniu godzinowym ryzyko przekroczenia budżetu ponosi klient, przy ryczałcie — Ty. Ryczałt daje klientowi pewność kosztu, ale wymaga od Ciebie precyzyjnej wyceny i pilnowania czasu, bo każda godzina ponad plan obniża Twoją realną stawkę. Jak to policzyć, opisujemy w poradniku <a href="/poradniki/jak-liczyc-rentownosc-zlecenia">jak liczyć rentowność zlecenia</a>.</p>

<h2>Odsetki za zwłokę i procedura przypomnień</h2>
<p>Zapis o odsetkach ustawowych za opóźnienie w płatności działa dyscyplinująco, nawet jeśli rzadko je naliczasz. Sam fakt, że są w umowie, sygnalizuje, że traktujesz terminy poważnie. Warto też mieć prostą, powtarzalną procedurę przypomnień, żeby nie odkładać niezręcznej rozmowy o zaległej płatności:</p>
<ol>
<li><strong>Dzień 0 (termin płatności).</strong> Uprzejme przypomnienie mailem, że faktura jest wymagalna.</li>
<li><strong>Dzień +3.</strong> Konkretniejsze przypomnienie z numerem faktury i kwotą.</li>
<li><strong>Dzień +7.</strong> Oficjalne wezwanie do zapłaty z informacją o odsetkach.</li>
<li><strong>Dzień +14.</strong> Rozważ dalsze kroki — wezwanie przedsądowe lub windykację.</li>
</ol>
<p>Regularne, spokojne przypomnienia rozwiązują większość opóźnień. Więcej o egzekwowaniu należności znajdziesz w poradniku <a href="/poradniki/jak-zabezpieczyc-sie-przed-nieplacacym-klientem">jak zabezpieczyć się przed niepłacącym klientem</a>.</p>

<h2>Gotowe zapisy do umowy</h2>
<p>Warunki płatności działają tylko wtedy, gdy są jednoznaczne. Poniżej przykładowe sformułowania, które nie zostawiają pola do interpretacji. Traktuj je jako materiał informacyjny i dopasuj do swojej sytuacji:</p>
<ul>
<li><strong>Termin.</strong> Płatność w terminie 14 dni od daty wystawienia faktury, a nie od odbioru prac.</li>
<li><strong>Zaliczka.</strong> Zaliczka w wysokości 40 procent wartości zlecenia płatna przed rozpoczęciem prac; przystąpienie do realizacji następuje po jej zaksięgowaniu.</li>
<li><strong>Kamienie milowe.</strong> Wynagrodzenie płatne etapami: 30 procent zaliczki, 40 procent po akceptacji koncepcji, 30 procent po przekazaniu całości.</li>
<li><strong>Odsetki.</strong> Za opóźnienie naliczane są odsetki ustawowe za każdy dzień zwłoki.</li>
<li><strong>Wstrzymanie prac.</strong> W razie zwłoki przekraczającej 14 dni wykonawca może wstrzymać prace do czasu uregulowania należności.</li>
</ul>
<p>Konkretny zapis o dacie liczonej od wystawienia faktury eliminuje najczęstszą furtkę: mgliste płatne po odbiorze, które pozwala klientowi przeciągać start odliczania.</p>

<h2>Jak reagować na prośbę o dłuższy termin</h2>
<p>Duże firmy często narzucają 30 lub 60 dni jako standard. Nie musisz się zgadzać bez rekompensaty. Możliwe odpowiedzi:</p>
<ol>
<li><strong>Wyższa cena za dłuższy termin.</strong> Jeśli klient chce 30 dni, doliczasz narzut za kredytowanie, na przykład kilka procent wartości.</li>
<li><strong>Większa zaliczka.</strong> Zgoda na dłuższy termin końcowy w zamian za wyższą płatność z góry.</li>
<li><strong>Częstsze fakturowanie.</strong> Zamiast jednej faktury na 60 dni wystawiasz kilka mniejszych z krótszymi terminami.</li>
<li><strong>Twarda granica.</strong> Przy nowym, niesprawdzonym kliencie masz prawo nie schodzić poniżej bezpiecznego progu.</li>
</ol>
<p>Kluczowe jest, żeby dłuższy termin był świadomą wymianą, a nie ustępstwem z rozpędu. Każdy dodatkowy tydzień oczekiwania ma swoją cenę, którą warto wliczyć w wycenę.</p>

<h2>Metody płatności i ich wpływ na wpływy</h2>
<p>Nie tylko termin decyduje o tym, kiedy zobaczysz pieniądze. Wybór metody płatności też ma znaczenie, zwłaszcza przy klientach zagranicznych:</p>
<table>
<thead>
<tr><th>Metoda</th><th>Kiedy pieniądze docierają</th><th>Na co uważać</th></tr>
</thead>
<tbody>
<tr><td>Przelew krajowy</td><td>Zwykle następny dzień roboczy</td><td>Podaj poprawny numer konta na fakturze</td></tr>
<tr><td>Przelew zagraniczny</td><td>Od jednego do kilku dni</td><td>Koszty i przewalutowanie po obu stronach</td></tr>
<tr><td>Bramka lub karta</td><td>Niemal natychmiast</td><td>Prowizja operatora obniża kwotę netto</td></tr>
</tbody>
</table>
<p>Przy kliencie zagranicznym ustal z góry, kto pokrywa koszty przelewu i po jakim kursie następuje przewalutowanie, bo inaczej realna kwota potrafi być niższa od faktury.</p>

<h2>Jak SzpontHub pomaga panować nad płatnościami</h2>
<p>Nieregularne wpływy to codzienność freelancera, a warunki płatności są tylko połową sprawy — drugą jest pilnowanie, czy pieniądze faktycznie wpływają na czas. W SzpontHub wystawisz fakturę z ustalonym terminem dzięki integracji z Kugaru, a wpłaty przypiszesz do portfela, żeby na bieżąco widzieć, które faktury są już opłacone, a które czekają. Terminy płatności i daty przypomnień wpiszesz do kalendarza, dzięki czemu procedura monitów staje się rutyną, a nie czymś, co odkładasz. Portfele wielowalutowe pomagają, gdy rozliczasz się z klientami zagranicznymi w USD lub EUR.</p>

<h2>Najczęstsze błędy przy ustalaniu warunków płatności</h2>
<ul>
<li><strong>Rozpoczynanie pracy bez ustalonych warunków.</strong> Tracisz siłę przetargową, gdy efekt jest już dostarczony.</li>
<li><strong>Zbyt długie terminy.</strong> 30–60 dni to kredytowanie klienta kosztem własnej płynności.</li>
<li><strong>Brak zaliczki u nowych klientów.</strong> Największe ryzyko finansowe całej współpracy.</li>
<li><strong>Płatność dopiero na końcu dużego projektu.</strong> Miesiące pracy bez wpływów przy pełnym ryzyku braku zapłaty.</li>
<li><strong>Odkładanie przypomnień o zaległej płatności.</strong> Im dłużej zwlekasz, tym trudniej odzyskać pieniądze.</li>
</ul>

<h2>Podsumowanie</h2>
<p>Dobre warunki płatności sprowadzają się do kilku decyzji: krótki termin liczony od wystawienia faktury, zaliczka przy nowych klientach, rozliczanie dużych projektów w kamieniach milowych oraz zapis o odsetkach i prosta procedura przypomnień. Ustalone przed rozpoczęciem prac i zapisane w umowie, chronią Twoją płynność i sprawiają, że przestajesz kredytować klientów własną pracą.</p>
`,
  faq: [
    {
      q: 'Jaki termin płatności ustalać jako freelancer?',
      a: 'Rozsądny standard to 7–14 dni liczonych od wystawienia faktury, a nie od zakończenia projektu czy odbioru prac. Każdy dodatkowy dzień terminu to kredyt, którego udzielasz klientowi kosztem własnej płynności, dlatego popularne terminy 30–60 dni są dla freelancera niekorzystne.',
    },
    {
      q: 'Ile powinna wynosić zaliczka od klienta?',
      a: 'Przy nowym kliencie 40–50% wartości zlecenia, przy stałym i sprawdzonym 0–30%. Zaliczka finansuje początek prac, filtruje klientów niepoważnych i zmniejsza ryzyko, że zostaniesz bez zapłaty za całość. Przy dużych projektach łącz zaliczkę z rozliczeniem w kamieniach milowych.',
    },
    {
      q: 'Jak rozliczać duży, długoterminowy projekt?',
      a: 'Rozbij płatność na kamienie milowe przypisane do etapów projektu, na przykład zaliczka, płatność po akceptacji koncepcji i płatność po oddaniu całości. Dzięki temu masz regularne wpływy, a nie miesiące pracy bez pieniędzy, i nie kredytujesz klienta całością zlecenia.',
    },
    {
      q: 'Kiedy ustalać warunki płatności z klientem?',
      a: 'Zawsze przed rozpoczęciem prac. To jedyny moment, gdy masz realną siłę przetargową, bo klient potrzebuje Twojej pracy. Po dostarczeniu efektu pozycja się odwraca i trudniej negocjować korzystne terminy czy zaliczkę.',
    },
    {
      q: 'Czy warto wpisywać odsetki za zwłokę do umowy?',
      a: 'Tak. Zapis o odsetkach ustawowych za opóźnienie działa dyscyplinująco, nawet jeśli rzadko je naliczasz. Sam fakt, że są w umowie, sygnalizuje klientowi, że traktujesz terminy płatności poważnie, i daje podstawę do egzekwowania należności.',
    },
    {
      q: 'Co zrobić, gdy klient nie płaci w terminie?',
      a: 'Uruchom prostą, powtarzalną procedurę przypomnień: uprzejme przypomnienie w dniu terminu, konkretniejsze po kilku dniach, a po tygodniu oficjalne wezwanie do zapłaty z informacją o odsetkach. Spokojne, regularne monity rozwiązują większość opóźnień bez eskalacji.',
    },
    {
      q: 'Jak odpowiedzieć na prośbę klienta o dłuższy termin płatności?',
      a: 'Potraktuj to jak wymianę, a nie ustępstwo. Możesz doliczyć narzut za kredytowanie, poprosić o większą zaliczkę, fakturować częściej mniejszymi kwotami z krótszymi terminami albo przy nowym kliencie nie schodzić poniżej bezpiecznego progu. Każdy dodatkowy tydzień oczekiwania ma cenę, którą warto wliczyć w wycenę.',
    },
    {
      q: 'Na co uważać przy płatnościach od klienta zagranicznego?',
      a: 'Ustal z góry, kto pokrywa koszty przelewu i po jakim kursie następuje przewalutowanie, bo inaczej realna kwota bywa niższa od faktury. Warto też przyjąć wyższą zaliczkę, zwykle 30-50 procent, ze względu na trudniejszą egzekwowalność należności za granicą.',
    },
  ],
};

export default article;
