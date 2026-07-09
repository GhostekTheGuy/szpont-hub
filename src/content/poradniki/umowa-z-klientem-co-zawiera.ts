import type { Article } from './types';

const article: Article = {
  slug: 'umowa-z-klientem-co-zawiera',
  title: 'Umowa z klientem — co powinna zawierać, żeby chronić freelancera',
  description:
    'Co musi zawierać dobra umowa z klientem: zakres, terminy, płatności, prawa autorskie i klauzule ochronne. Lista elementów i wzór najważniejszych zapisów.',
  category: 'freelancer',
  tags: ['umowa z klientem', 'freelancer', 'prawa autorskie', 'warunki płatności', 'zabezpieczenie'],
  tldr:
    'Dobra umowa z klientem precyzuje zakres prac, terminy, wynagrodzenie i warunki płatności, moment przeniesienia praw autorskich oraz zasady zmian i rozwiązania współpracy. Jej celem nie jest walka w sądzie, lecz jasne ustalenie oczekiwań po obu stronach, zanim zaczną się nieporozumienia. Nawet prosta umowa mailowa z tymi elementami chroni Cię lepiej niż ustne ustalenia.',
  keyTakeaways: [
    'Umowa ma przede wszystkim ustalać oczekiwania — precyzyjny zakres prac ogranicza rozrastanie się projektu.',
    'Zapisz termin i formę płatności, odsetki za zwłokę oraz warunki zaliczki — to Twoja główna ochrona finansowa.',
    'Ureguluj prawa autorskie: kiedy przechodzą na klienta i czy dopiero po pełnej zapłacie.',
    'Dodaj zasady zmian w zakresie, bo to one najczęściej rujnują rentowność zlecenia.',
    'Nawet umowa zawarta mailowo jest wiążąca — brak dokumentu to największe ryzyko, nie jego forma.',
    'Model rozliczenia decyduje o tym, kto ponosi ryzyko przekroczeń: ryczałt obciąża Ciebie, stawka godzinowa klienta.',
    'Przy nowym kliencie standardem jest zaliczka 30 do 50 procent — finansuje start prac i filtruje niepoważnych.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Umowa z klientem kojarzy się z formalnością, którą podpisuje się i chowa do szuflady. W praktyce to najtańsze ubezpieczenie, jakie ma freelancer — dokument, który rozstrzyga spory, zanim zdążą się rozwinąć. W tym poradniku przejdziemy przez wszystkie elementy dobrej umowy: od zakresu prac po klauzule ochronne, z konkretnymi zapisami, które warto mieć.</p>

<h2>Po co freelancerowi umowa</h2>
<p>Najczęstsze nieporozumienia między freelancerem a klientem nie wynikają ze złej woli, lecz z różnych założeń. Ty myślisz, że projekt obejmuje trzy poprawki, klient zakłada nieograniczoną liczbę. Ty liczysz na płatność w 14 dni, klient płaci, kiedy mu wygodnie. Umowa ustawia te oczekiwania na piśmie, zanim staną się źródłem konfliktu.</p>
<p>Drugi powód jest finansowy. Bez umowy trudniej wyegzekwować należność od klienta, który zwleka lub odmawia zapłaty. Z umową masz dowód uzgodnionego zakresu, kwoty i terminu — a to znacząco zmienia Twoją pozycję. O samej egzekucji należności piszemy w poradniku <a href="/poradniki/jak-zabezpieczyc-sie-przed-nieplacacym-klientem">jak zabezpieczyć się przed niepłacącym klientem</a>.</p>
<blockquote>Umowa nie jest po to, żeby iść do sądu. Jest po to, żeby do sądu nie iść — bo wszystko zostało ustalone na piśmie z góry.</blockquote>

<h2>Elementy, które musi zawierać każda umowa</h2>
<p>Niezależnie od branży dobra umowa z klientem powinna precyzować poniższe punkty. Braki w którymkolwiek z nich to typowe miejsca, w których rodzą się spory.</p>
<table>
<thead>
<tr><th>Element</th><th>Co określa</th><th>Ryzyko przy braku</th></tr>
</thead>
<tbody>
<tr><td>Strony umowy</td><td>Kto z kim zawiera umowę, dane do faktury</td><td>Problem z egzekucją należności</td></tr>
<tr><td>Zakres prac</td><td>Co dokładnie dostarczasz i czego to nie obejmuje</td><td>Rozrastanie się projektu bez dodatkowej zapłaty</td></tr>
<tr><td>Terminy</td><td>Kamienie milowe i termin końcowy</td><td>Przeciąganie projektu w nieskończoność</td></tr>
<tr><td>Wynagrodzenie</td><td>Kwota, forma (ryczałt/godziny), waluta</td><td>Spór o wysokość zapłaty</td></tr>
<tr><td>Warunki płatności</td><td>Termin, zaliczka, odsetki za zwłokę</td><td>Opóźnione lub brak płatności</td></tr>
<tr><td>Prawa autorskie</td><td>Kiedy i w jakim zakresie przechodzą na klienta</td><td>Spór o wykorzystanie efektu pracy</td></tr>
<tr><td>Zasady zmian</td><td>Jak rozliczane są dodatkowe prace</td><td>Darmowe poprawki zjadające rentowność</td></tr>
<tr><td>Rozwiązanie umowy</td><td>Kiedy i jak można zakończyć współpracę</td><td>Utknięcie w toksycznym projekcie</td></tr>
</tbody>
</table>

<h2>Zakres prac — najważniejszy zapis</h2>
<p>Precyzyjny zakres to najskuteczniejsza ochrona przed zjawiskiem rozrastania się projektu, gdy do pierwotnego zlecenia dochodzą kolejne prośby, na które nikt nie zaplanował czasu ani budżetu. Zakres opisz dwustronnie: wypisz nie tylko to, co dostarczasz, ale też to, czego umowa nie obejmuje.</p>
<p>Przykład dla projektanta strony: zakres obejmuje projekt pięciu podstron i dwie rundy poprawek. Zakres nie obejmuje pisania tekstów, przygotowania zdjęć ani wdrożenia na serwer. Taki zapis sprawia, że gdy pojawi się prośba o szóstą podstronę, macie jasną podstawę do wyceny dodatkowej pracy — bez niezręcznej dyskusji.</p>

<h3>Zasady zmian i dodatkowych prac</h3>
<p>Zmiany w projekcie są normalne — problemem jest brak zasad ich rozliczania. Dopisz prosty mechanizm: prace wykraczające poza uzgodniony zakres wyceniasz osobno i realizujesz po pisemnej akceptacji. Jedno zdanie w umowie zamienia niezręczną prośbę o dodatkowe pieniądze w standardową procedurę.</p>

<h2>Wynagrodzenie i warunki płatności</h2>
<p>To sekcja, która najbardziej chroni Twoje finanse. Określ nie tylko kwotę, ale też cały mechanizm rozliczenia:</p>
<ul>
<li><strong>Forma wynagrodzenia</strong> — ryczałt za projekt, stawka godzinowa czy płatność za kamienie milowe.</li>
<li><strong>Zaliczka</strong> — przy nowych klientach standardem jest 30–50% z góry. Zaliczka filtruje klientów niepoważnych i finansuje początek prac.</li>
<li><strong>Termin płatności</strong> — konkretna liczba dni od wystawienia faktury, np. 14 dni. Unikaj mglistego po zakończeniu projektu.</li>
<li><strong>Odsetki za zwłokę</strong> — zapis o odsetkach ustawowych za opóźnienie działa dyscyplinująco, nawet jeśli rzadko je egzekwujesz.</li>
<li><strong>Waluta</strong> — przy klientach zagranicznych ustal walutę i to, kto ponosi koszty przewalutowania.</li>
</ul>
<p>Jak dobrać te parametry, opisujemy szczegółowo w poradniku <a href="/poradniki/jak-ustalic-warunki-platnosci">jak ustalić warunki płatności i terminy</a>.</p>

<h2>Prawa autorskie — kiedy przechodzą na klienta</h2>
<p>To punkt, który freelancerzy pomijają najczęściej, a bywa kluczowy. Domyślnie majątkowe prawa autorskie do Twojej pracy pozostają przy Tobie, dopóki umowa nie przeniesie ich na klienta. Warto zapisać dwie rzeczy: jakich pól eksploatacji dotyczy przeniesienie oraz że prawa przechodzą na klienta dopiero po pełnej zapłacie.</p>
<p>Ten drugi zapis to realne zabezpieczenie: jeśli klient nie zapłaci, formalnie nie ma prawa korzystać z efektu Twojej pracy. To silny argument w negocjacjach o zaległą płatność. Pamiętaj, że to materiał informacyjny, a nie porada prawna — przy dużych kontraktach warto skonsultować zapisy z prawnikiem.</p>

<h2>Klauzule ochronne, o których warto pamiętać</h2>
<ol>
<li><strong>Poufność.</strong> Zobowiązanie obu stron do nieujawniania informacji poznanych przy współpracy.</li>
<li><strong>Limit odpowiedzialności.</strong> Ograniczenie Twojej odpowiedzialności finansowej, zwykle do wysokości wynagrodzenia z umowy.</li>
<li><strong>Prawo do referencji.</strong> Zgoda na pokazanie efektu pracy w portfolio — przydatna, gdy budujesz <a href="/poradniki/portfolio-freelancera-jak-zbudowac">portfolio freelancera</a>.</li>
<li><strong>Warunki rozwiązania.</strong> Jak każda ze stron może zakończyć współpracę i co dzieje się z rozliczeniem prac już wykonanych.</li>
</ol>

<h2>Czy umowa musi być podpisana papierowo</h2>
<p>Nie. Umowę zawartą mailowo, w której obie strony potwierdzają zakres, kwotę i termin, także wiąże. Dla większości zleceń freelancerskich wystarczy jasne ustalenie warunków w wiadomości, na którą klient odpowie akceptacją. Największym ryzykiem nie jest brak papierowego podpisu, lecz brak jakiegokolwiek zapisu ustaleń. Ustne umowy są ważne, ale w sporze nie do udowodnienia.</p>

<h2>Formy wynagrodzenia — co wybrać i jak zapisać</h2>
<p>Sposób rozliczenia decyduje o tym, kto ponosi ryzyko przekroczenia zakresu. Poniższe zestawienie pokazuje trzy najczęstsze modele wraz z przykładami kwot, żeby zobaczyć, kiedy który się opłaca.</p>
<table>
<thead>
<tr><th>Model</th><th>Przykład</th><th>Kto ponosi ryzyko przekroczeń</th><th>Kiedy stosować</th></tr>
</thead>
<tbody>
<tr><td>Ryczałt za projekt</td><td>Strona firmowa za 6000 zł</td><td>Freelancer</td><td>Zakres jasny i stabilny</td></tr>
<tr><td>Stawka godzinowa</td><td>120 zł za godzinę, rozliczenie co tydzień</td><td>Klient</td><td>Zakres płynny, dużo zmian</td></tr>
<tr><td>Kamienie milowe</td><td>3 transze po 2000 zł za etapy</td><td>Dzielone</td><td>Długie projekty, budowa zaufania</td></tr>
</tbody>
</table>
<p>Przy ryczałcie to Ty tracisz, gdy praca się rozrośnie, dlatego ryczałt ma sens tylko przy naprawdę precyzyjnym zakresie i twardej zasadzie rozliczania zmian. Przy stawce godzinowej ryzyko przechodzi na klienta, więc częściej domaga się on estymaty i limitu godzin — warto go w umowie podać (na przykład szacunek 40 godzin, powyżej którego informujesz przed kontynuacją). Model kamieni milowych łączy zalety obu: klient płaci za zamknięte etapy, a Ty nie finansujesz całego projektu z własnej kieszeni.</p>

<h2>Przykładowe zapisy do umowy</h2>
<p>Konkretne sformułowania są warte więcej niż opis. Poniżej gotowe zdania, które możesz dostosować do swojej sytuacji. To materiał informacyjny, nie wzór prawny — przy większych kontraktach skonsultuj treść z prawnikiem.</p>
<ul>
<li><strong>Zakres i zmiany:</strong> Wykonawca dostarcza zakres opisany w załączniku. Prace wykraczające poza ten zakres wyceniane są odrębnie i realizowane po pisemnej akceptacji Zamawiającego.</li>
<li><strong>Płatność:</strong> Zamawiający wpłaca zaliczkę 40 procent w ciągu 3 dni od zawarcia umowy, a pozostałą część w terminie 14 dni od wystawienia faktury końcowej.</li>
<li><strong>Odsetki:</strong> W razie opóźnienia w płatności Wykonawcy przysługują odsetki ustawowe za opóźnienie w transakcjach handlowych.</li>
<li><strong>Prawa autorskie:</strong> Majątkowe prawa autorskie przechodzą na Zamawiającego z chwilą zapłaty pełnego wynagrodzenia, na polach eksploatacji wskazanych w umowie.</li>
<li><strong>Rozwiązanie:</strong> Każda ze stron może wypowiedzieć umowę z zachowaniem 14 dni. Prace wykonane do dnia rozwiązania podlegają rozliczeniu proporcjonalnie.</li>
</ul>

<h2>Najczęstsze błędy w umowach freelancerów</h2>
<ol>
<li><strong>Zakres opisany jednostronnie.</strong> Wypisanie tylko tego, co robisz, bez granicy tego, czego nie robisz, zostawia furtkę na darmowe dokładanie pracy.</li>
<li><strong>Termin płatności po zakończeniu projektu.</strong> To sformułowanie bez daty pozwala klientowi zwlekać. Zawsze podawaj konkretną liczbę dni od faktury.</li>
<li><strong>Brak zapisu o przeniesieniu praw po zapłacie.</strong> Oddając prawa z chwilą wykonania, tracisz najsilniejszy argument przy zaległej płatności.</li>
<li><strong>Nieograniczona liczba poprawek.</strong> Bez limitu rund poprawek rentowność zlecenia potrafi spaść do zera przy jednym wymagającym kliencie.</li>
<li><strong>Brak zaliczki przy nowym kliencie.</strong> Pełne finansowanie projektu z własnej kieszeni to ryzyko, którego łatwo uniknąć.</li>
</ol>

<h3>Checklista przed podpisaniem</h3>
<p>Zanim odeślesz akceptację, sprawdź, czy umowa odpowiada na pięć pytań:</p>
<ul>
<li><strong>Co dokładnie dostarczam i czego nie?</strong> Zakres dwustronny, z liczbą rund poprawek.</li>
<li><strong>Do kiedy i w jakich etapach?</strong> Termin końcowy i ewentualne kamienie milowe.</li>
<li><strong>Za ile i kiedy dostanę pieniądze?</strong> Kwota, zaliczka, termin w dniach, odsetki.</li>
<li><strong>Kiedy przechodzą prawa autorskie?</strong> Po pełnej zapłacie, na wskazanych polach.</li>
<li><strong>Jak można zakończyć współpracę?</strong> Warunki wypowiedzenia i rozliczenie prac wykonanych.</li>
</ul>

<h2>Jak SzpontHub pomaga po podpisaniu umowy</h2>
<p>Umowa ustala warunki, a SzpontHub pomaga ich pilnować w praktyce. Ustalony w umowie zakres i budżet godzin możesz kontrolować, śledząc czas pracy nad zleceniem, a terminy płatności i kamienie milowe wpiszesz do kalendarza pracy, żeby nie umknęły. Gdy przychodzi rozliczenie, wystawisz fakturę zgodną z warunkami umowy dzięki integracji z Kugaru, a wpływy przypiszesz do właściwego portfela. Dzięki temu droga od zapisów w umowie do zaksięgowanej płatności jest w jednym miejscu.</p>

<h2>Umowa a rodzaj współpracy: dzieło, zlecenie, B2B</h2>
<p>Nazwa i konstrukcja umowy wpływają na to, za co odpowiadasz i jak wygląda rozliczenie. Trzy najczęstsze formy w pracy freelancera różnią się przede wszystkim tym, czy zobowiązujesz się do konkretnego rezultatu, czy do starannego działania.</p>
<table>
<thead>
<tr><th>Forma</th><th>Do czego się zobowiązujesz</th><th>Typowe zastosowanie</th></tr>
</thead>
<tbody>
<tr><td>Umowa o dzieło</td><td>Do konkretnego, sprawdzalnego rezultatu</td><td>Projekt, tekst, grafika, kod jako zamknięta całość</td></tr>
<tr><td>Umowa zlecenie</td><td>Do starannego wykonywania czynności</td><td>Praca ciągła, konsultacje, obsługa bez jednego efektu</td></tr>
<tr><td>Umowa B2B</td><td>Zależnie od zapisów, firma z firmą</td><td>Stała współpraca, wyższe kwoty, własna działalność</td></tr>
</tbody>
</table>
<p>Rozróżnienie ma znaczenie praktyczne: przy umowie o dzieło klient może odmówić zapłaty, jeśli rezultat ma wady, więc precyzyjny opis dzieła chroni obie strony. Przy zleceniu liczy się rzetelność wykonania, a nie sam efekt. Sama nazwa nie przesądza jednak o charakterze umowy — decyduje jej treść, dlatego zapisy są ważniejsze niż tytuł na górze dokumentu. To materiał informacyjny, nie porada prawna; przy stałej współpracy o dużej wartości warto skonsultować formę z księgowym lub prawnikiem.</p>

<h2>Jak rozmawiać z klientem o umowie</h2>
<p>Wielu freelancerów unika proponowania umowy z obawy, że klient odbierze to jako brak zaufania. W praktyce jest odwrotnie: jasne warunki na piśmie są sygnałem profesjonalizmu, a nie podejrzliwości. Kilka zasad, które ułatwiają tę rozmowę:</p>
<ul>
<li><strong>Przedstaw umowę jako standard.</strong> Zdanie o treści zawsze pracuję na prostej umowie, żeby uniknąć nieporozumień zdejmuje z sytuacji napięcie i ustawia to jako normę, nie wyjątek.</li>
<li><strong>Podkreśl korzyść dla klienta.</strong> Umowa chroni obie strony: klient wie dokładnie, co dostanie i do kiedy. To nie jest zabezpieczenie tylko na Twoją korzyść.</li>
<li><strong>Nie zaczynaj pracy przed ustaleniami.</strong> Rozpoczęcie realizacji przed zaakceptowaniem warunków osłabia Twoją pozycję, gdy pojawi się spór o zakres lub kwotę.</li>
<li><strong>Zachowaj korespondencję.</strong> Nawet jeśli nie podpisujecie osobnego dokumentu, ustalenia mailowe zaakceptowane przez klienta są dowodem — nie kasuj tych wiadomości.</li>
</ul>
<p>Klient, który reaguje niechęcią na samą propozycję prostej umowy, sam w sobie jest sygnałem ostrzegawczym. Poważne firmy traktują pisemne ustalenia jako oczywistość, a nie przeszkodę.</p>

<h2>Podsumowanie</h2>
<p>Dobra umowa z klientem to nie gruby dokument pełen prawniczego języka, lecz jasne ustalenie kilku kluczowych rzeczy: co dostarczasz, do kiedy, za ile, na jakich warunkach płatności i komu przypadają prawa autorskie. Dołóż zasady zmian i podstawowe klauzule ochronne, a ograniczysz większość typowych konfliktów, zanim się pojawią. Nawet prosta umowa mailowa z tymi elementami chroni Cię nieporównanie lepiej niż same ustne ustalenia.</p>
`,
  faq: [
    {
      q: 'Co powinna zawierać umowa z klientem?',
      a: 'Strony umowy, precyzyjny zakres prac, terminy, wysokość i formę wynagrodzenia, warunki płatności z odsetkami za zwłokę, zasady przeniesienia praw autorskich, reguły rozliczania zmian oraz warunki rozwiązania współpracy. Te elementy pokrywają większość typowych sporów.',
    },
    {
      q: 'Czy umowa z klientem musi być podpisana papierowo?',
      a: 'Nie. Umowa zawarta mailowo, w której obie strony potwierdzają zakres, kwotę i termin, jest wiążąca. Dla większości zleceń freelancerskich wystarczy jasne ustalenie warunków w wiadomości zaakceptowanej przez klienta. Ryzykiem jest brak jakiegokolwiek zapisu, nie brak papierowego podpisu.',
    },
    {
      q: 'Kiedy prawa autorskie przechodzą na klienta?',
      a: 'Dopiero wtedy, gdy przenosi je umowa — domyślnie majątkowe prawa autorskie pozostają przy twórcy. Warto zapisać, że przechodzą na klienta po pełnej zapłacie, bo to daje realne zabezpieczenie: bez zapłaty klient formalnie nie może korzystać z efektu pracy.',
    },
    {
      q: 'Jak zabezpieczyć się w umowie przed dodatkowymi darmowymi poprawkami?',
      a: 'Opisz zakres dwustronnie — co dostarczasz i czego umowa nie obejmuje — oraz określ liczbę rund poprawek. Dodaj zapis, że prace poza uzgodnionym zakresem wyceniasz osobno i realizujesz po pisemnej akceptacji. To zamienia niezręczną prośbę o dopłatę w standardową procedurę.',
    },
    {
      q: 'Czy warto brać zaliczkę od klienta?',
      a: 'Tak, zwłaszcza od nowych klientów. Standardem jest 30–50% wartości zlecenia z góry. Zaliczka finansuje początek prac, filtruje klientów niepoważnych i zmniejsza ryzyko, że zostaniesz bez zapłaty po wykonaniu całości projektu.',
    },
    {
      q: 'Czy ustna umowa z klientem jest ważna?',
      a: 'Formalnie tak, ale w razie sporu jest praktycznie nie do udowodnienia. Bez zapisu ustaleń nie masz dowodu na uzgodniony zakres, kwotę i termin. Dlatego nawet krótka umowa mailowa jest nieporównanie bezpieczniejsza niż same ustne ustalenia.',
    },
    {
      q: 'Ryczałt czy stawka godzinowa — co lepsze dla freelancera?',
      a: 'To zależy od tego, jak stabilny jest zakres. Ryczałt daje klientowi pewność kwoty, ale całe ryzyko przekroczenia pracy spada na Ciebie, więc ma sens tylko przy precyzyjnym zakresie i twardej zasadzie rozliczania zmian. Stawka godzinowa przenosi ryzyko na klienta i lepiej pasuje do projektów z płynnym zakresem i licznymi zmianami. Model kamieni milowych łączy zalety obu.',
    },
    {
      q: 'Jak zapisać przeniesienie praw autorskich w umowie?',
      a: 'Najbezpieczniej zapisać, że majątkowe prawa autorskie przechodzą na zamawiającego z chwilą zapłaty pełnego wynagrodzenia, na konkretnie wskazanych polach eksploatacji. Powiązanie przeniesienia z zapłatą daje Ci realne zabezpieczenie, bo przed uregulowaniem faktury klient formalnie nie może korzystać z efektu pracy. To materiał informacyjny, a nie porada prawna — przy dużych kontraktach skonsultuj zapisy z prawnikiem.',
    },
  ],
};

export default article;
