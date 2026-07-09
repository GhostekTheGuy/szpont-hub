import type { Article } from './types';

const article: Article = {
  slug: 'jak-liczyc-rentownosc-zlecenia',
  title: 'Jak liczyć rentowność zlecenia — wzór i realna stawka za godzinę',
  description:
    'Jak sprawdzić, czy zlecenie się opłaca: wzór na rentowność, realna stawka godzinowa, koszty ukryte i czas niefakturowany. Przykładowe wyliczenia i tabela.',
  category: 'freelancer',
  tags: ['rentowność zlecenia', 'freelancer', 'stawka godzinowa', 'wycena', 'śledzenie czasu pracy'],
  tldr:
    'Rentowność zlecenia liczysz jako przychód minus wszystkie koszty (w tym Twój czas wyceniony realną stawką) podzielony przez faktyczną liczbę godzin pracy. Kluczowe jest liczenie całego czasu — także rozmów, poprawek i administracji — bo to on decyduje, czy dobra na papierze faktura daje realny zarobek. Zlecenie jest rentowne, gdy realna stawka za godzinę przekracza Twój próg opłacalności.',
  keyTakeaways: [
    'Rentowność to przychód minus koszty podzielony przez faktyczną liczbę przepracowanych godzin.',
    'Licz cały czas: rozmowy, wyceny, poprawki i administrację, nie tylko samą pracę fakturowaną.',
    'Realna stawka za godzinę to najważniejsza miara — porównuj ją ze swoim progiem opłacalności.',
    'Zlecenie ryczałtowe traci rentowność, gdy zajmuje więcej godzin, niż założono przy wycenie.',
    'Śledzenie czasu przy każdym zleceniu zamienia ocenę opłacalności z domysłu w dane.',
    'Ustal próg opłacalności z kosztów stałych, oczekiwanego dochodu i narzutu na czas niefakturowany.',
    'Zlecenie na styku progu przyjmuj tylko wtedy, gdy buduje relację lub referencję.',
  ],
  published: '2026-07-09',
  readingMinutes: 12,
  bodyHtml: `
<p>Zlecenie może wyglądać na opłacalne — faktura opiewa na przyzwoitą kwotę, klient miły, temat ciekawy. A jednak po jego zakończeniu na koncie zostaje mniej, niż się spodziewałeś. Powód niemal zawsze jest ten sam: czas, którego nikt nie policzył. W tym poradniku pokażemy, jak liczyć rentowność zlecenia uczciwie, uwzględniając cały czas i wszystkie koszty, oraz jak czytać kluczową miarę — realną stawkę za godzinę.</p>

<h2>Czym jest rentowność zlecenia</h2>
<p>Rentowność zlecenia to odpowiedź na pytanie, ile realnie zarabiasz na danym projekcie po odjęciu wszystkiego, co Cię kosztował — łącznie z Twoim czasem. Nie chodzi o samą kwotę faktury, lecz o to, co z niej zostaje w przeliczeniu na godzinę pracy. Dwa zlecenia na 5000 zł mogą mieć zupełnie różną rentowność: jedno zajmie 20 godzin, drugie 60.</p>
<blockquote>Wzór: rentowność = (przychód − koszty bezpośrednie) ÷ faktyczna liczba przepracowanych godzin. Wynik to Twoja realna stawka za godzinę.</blockquote>
<p>Realna stawka za godzinę to najważniejsza miara, bo pozwala porównywać zlecenia między sobą i z Twoim progiem opłacalności. Jak wyznaczyć ten próg, opisujemy w poradniku <a href="/poradniki/jak-liczyc-stawke-godzinowa-freelancer">jak policzyć stawkę godzinową freelancera</a>.</p>

<h2>Policz cały czas, nie tylko pracę fakturowaną</h2>
<p>Największy błąd przy ocenie rentowności to liczenie wyłącznie czasu bezpośredniej pracy nad projektem. Tymczasem zlecenie pochłania znacznie więcej godzin, które łatwo pominąć:</p>
<ul>
<li><strong>Rozmowy i ustalenia.</strong> Maile, telefony, spotkania na starcie i w trakcie.</li>
<li><strong>Wycena i oferta.</strong> Czas na przygotowanie propozycji, także gdy klient jeszcze nie potwierdził.</li>
<li><strong>Poprawki i rundy feedbacku.</strong> Często niedoszacowane, a potrafią podwoić czas projektu.</li>
<li><strong>Administracja.</strong> Faktury, umowa, korespondencja rozliczeniowa.</li>
<li><strong>Przełączanie kontekstu.</strong> Wejście z powrotem w temat po przerwie.</li>
</ul>
<p>Suma tych godzin bywa większa niż sama praca merytoryczna. Zlecenie, które fakturowo wygląda na 30 godzin, realnie może zająć 45 — a to zmienia stawkę za godzinę o jedną trzecią.</p>

<h2>Uwzględnij koszty bezpośrednie</h2>
<p>Poza czasem zlecenie może generować koszty, które trzeba odjąć od przychodu, zanim policzysz rentowność:</p>
<ul>
<li><strong>Podwykonawcy.</strong> Jeśli część pracy zlecasz dalej, to koszt bezpośredni projektu.</li>
<li><strong>Narzędzia i licencje.</strong> Zakupione specjalnie pod dane zlecenie.</li>
<li><strong>Materiały i usługi zewnętrzne.</strong> Wszystko, co kupujesz na potrzeby projektu.</li>
<li><strong>Prowizje i koszty przewalutowania.</strong> Zwłaszcza przy klientach zagranicznych.</li>
</ul>
<p>Dopiero przychód pomniejszony o te koszty, podzielony przez pełny czas, daje uczciwą rentowność.</p>

<h2>Próg opłacalności — od jakiej stawki zlecenie ma sens</h2>
<p>Realna stawka za godzinę mówi coś dopiero wtedy, gdy masz ją z czym porównać. Tym punktem odniesienia jest próg opłacalności: minimalna stawka, poniżej której zlecenie realnie Cię zubaża. Próg wyznaczasz z trzech składników.</p>
<ol>
<li><strong>Koszty stałe działalności</strong> podzielone przez liczbę godzin fakturowalnych w miesiącu — księgowość, ZUS, oprogramowanie, sprzęt, lokal.</li>
<li><strong>Oczekiwany dochód netto</strong> na godzinę, czyli to, co ma Ci zostać w kieszeni.</li>
<li><strong>Narzut na czas niefakturowany</strong> — sprzedaż, administracja, przerwy — który w praktyce pochłania 30-40 procent tygodnia.</li>
</ol>
<p>Przykład: koszty stałe 4000 zł miesięcznie przy 100 godzinach fakturowalnych to 40 zł/h. Do tego oczekiwany dochód 80 zł/h. Suma 120 zł/h to Twój próg. Każde zlecenie, którego realna stawka spada poniżej tej kwoty, dokłada się do kosztów zamiast je pokrywać.</p>
<table>
<thead>
<tr><th>Realna stawka</th><th>Relacja do progu (120 zł/h)</th><th>Wniosek</th></tr>
</thead>
<tbody>
<tr><td>200 zł/h</td><td>+67 procent</td><td>Bardzo rentowne, szukaj podobnych</td></tr>
<tr><td>150 zł/h</td><td>+25 procent</td><td>Zdrowy zapas, przyjmuj</td></tr>
<tr><td>120 zł/h</td><td>na styk</td><td>Zero zysku, tylko jeśli buduje relację</td></tr>
<tr><td>90 zł/h</td><td>−25 procent</td><td>Dopłacasz do zlecenia, renegocjuj lub odrzuć</td></tr>
</tbody>
</table>
<p>Zauważ, że zlecenie na styku progu nie jest bezwartościowe — może otwierać drogę do stałej współpracy albo referencji. Kluczowe jest, żebyś podejmował taką decyzję świadomie, znając liczbę, a nie dlatego, że faktura wyglądała okazale.</p>

<h2>Przykładowe wyliczenie</h2>
<p>Porównajmy dwa zlecenia, oba na 6000 zł przychodu, żeby zobaczyć, jak czas i koszty zmieniają obraz.</p>
<table>
<thead>
<tr><th>Pozycja</th><th>Zlecenie A</th><th>Zlecenie B</th></tr>
</thead>
<tbody>
<tr><td>Przychód</td><td>6000 zł</td><td>6000 zł</td></tr>
<tr><td>Koszty bezpośrednie</td><td>500 zł</td><td>0 zł</td></tr>
<tr><td>Czas pracy merytorycznej</td><td>25 h</td><td>40 h</td></tr>
<tr><td>Czas dodatkowy (rozmowy, poprawki, administracja)</td><td>8 h</td><td>20 h</td></tr>
<tr><td>Czas łączny</td><td>33 h</td><td>60 h</td></tr>
<tr><td><strong>Realna stawka za godzinę</strong></td><td><strong>≈ 167 zł/h</strong></td><td><strong>≈ 100 zł/h</strong></td></tr>
</tbody>
</table>
<p>Ta sama kwota faktury, a rentowność różni się o dwie trzecie. Gdybyś patrzył tylko na przychód, oba zlecenia wyglądałyby identycznie. Dopiero pełny czas pokazuje, że zlecenie B jest znacznie mniej opłacalne — i przy podobnych propozycjach warto raczej szukać kolejnych zleceń typu A.</p>

<h3>Rentowność zlecenia ryczałtowego</h3>
<p>Przy wycenie ryczałtowej to Ty ponosisz ryzyko przekroczenia czasu. Wyceniasz projekt na 5000 zł, zakładając 30 godzin, co daje 167 zł/h. Jeśli projekt zajmie 50 godzin, realna stawka spada do 100 zł/h — mimo że faktura się nie zmieniła. Dlatego przy ryczałcie tak ważne jest pilnowanie budżetu godzin. Jak dobierać warunki, opisujemy w poradniku <a href="/poradniki/jak-ustalic-warunki-platnosci">jak ustalić warunki płatności</a>.</p>

<h2>Rentowność zakładana a realna</h2>
<p>Rentowność liczy się na dwóch etapach. Przed przyjęciem zlecenia szacujesz rentowność zakładaną, żeby zdecydować, czy i za ile je przyjąć. Po zakończeniu liczysz rentowność realną, opartą na faktycznym czasie i kosztach. Różnica między nimi to najcenniejsza informacja, jaką możesz zebrać jako freelancer: pokazuje, gdzie systematycznie nie doszacowujesz czasu i które typy zleceń wyglądają lepiej na papierze, niż są w rzeczywistości.</p>
<p>Zbieranie tych danych z wielu projektów pozwala z czasem wyceniać trafniej i świadomie odrzucać zlecenia, które statystycznie okazują się nierentowne. To także podstawa decyzji, czy w ogóle warto prowadzić kilka podobnych projektów naraz — o czym piszemy w poradniku <a href="/poradniki/jak-prowadzic-wiele-zlecen-naraz">jak prowadzić wiele zleceń naraz</a>.</p>

<h2>Częste błędy przy liczeniu rentowności</h2>
<p>Nawet freelancerzy, którzy mierzą czas, popełniają powtarzalne pomyłki zawyżające rentowność na papierze:</p>
<ul>
<li><strong>Pomijanie czasu sprzedaży.</strong> Godziny na ofertę, negocjacje i rozmowy wstępne należą do zlecenia, nawet jeśli klient jeszcze nie podpisał.</li>
<li><strong>Zaokrąglanie czasu w dół.</strong> Trzy kwadranse pracy zapisane jako pół godziny w skali miesiąca gubią kilkanaście godzin.</li>
<li><strong>Traktowanie przychodu brutto jak zysku.</strong> Przed podziałem przez godziny odejmij podatek, składki i koszty przewalutowania.</li>
<li><strong>Ignorowanie kosztu przełączania.</strong> Skakanie między trzema zleceniami dziennie dokłada minuty rozbiegu, które sumują się w godziny.</li>
<li><strong>Liczenie tylko udanych projektów.</strong> Zlecenia, które utknęły lub zostały porzucone przez klienta, też zjadły Twój czas — ujmij je w bilansie.</li>
</ul>

<h2>Checklista przed przyjęciem zlecenia</h2>
<p>Zanim odpiszesz „biorę”, przejdź przez pięć pytań. Zajmuje to pięć minut, a chroni przed miesiącami pracy poniżej progu opłacalności.</p>
<ol>
<li>Ile godzin realnie zajmie projekt razem z rozmowami, poprawkami i administracją?</li>
<li>Jakie koszty bezpośrednie poniosę i ile z przychodu naprawdę zostanie?</li>
<li>Jaka wychodzi zakładana stawka za godzinę i jak wypada wobec mojego progu?</li>
<li>Ile rund poprawek zakłada umowa i co dzieje się, gdy klient przekroczy limit?</li>
<li>Czy nawet przy pesymistycznym scenariuszu czasowym stawka trzyma się powyżej progu?</li>
</ol>
<p>Jeśli odpowiedź na ostatnie pytanie brzmi „nie”, masz dwie drogi: podnieść cenę albo zawęzić zakres. Przyjęcie zlecenia mimo czerwonej odpowiedzi to świadomy koszt, który powinien mieć uzasadnienie inne niż optymizm.</p>

<h2>Jak SzpontHub pomaga liczyć rentowność</h2>
<p>Rentowność stoi i upada na jednej rzeczy: znajomości faktycznego czasu pracy. W SzpontHub uruchomisz licznik czasu (timer) dla konkretnego zlecenia i przypiszesz mu stawkę godzinową, dzięki czemu po zakończeniu pracy zobaczysz realny zarobek za godzinę — z uwzględnieniem całego zmierzonego czasu, nie tylko szacunku z pamięci. Przychody i koszty projektu prowadzisz w portfelach z kategoriami, a funkcja rozliczania tygodni i zleceń podsumowuje, ile faktycznie zostało po odjęciu kosztów. To zamienia ocenę opłacalności z domysłu w liczbę, którą możesz porównać między zleceniami.</p>

<h2>Podsumowanie</h2>
<p>Rentowność zlecenia to nie kwota na fakturze, lecz to, co z niej zostaje po odjęciu kosztów i podzieleniu przez cały faktyczny czas pracy — łącznie z rozmowami, poprawkami i administracją. Kluczową miarą jest realna stawka za godzinę, którą porównujesz ze swoim progiem opłacalności. Licz ją przed przyjęciem zlecenia i po jego zakończeniu, a różnica nauczy Cię wyceniać trafniej i odrzucać projekty, które tylko udają opłacalne. Bez śledzenia czasu ta ocena pozostaje zgadywaniem.</p>
`,
  faq: [
    {
      q: 'Jak policzyć rentowność zlecenia?',
      a: 'Od przychodu odejmij koszty bezpośrednie (podwykonawcy, narzędzia, prowizje), a wynik podziel przez faktyczną liczbę przepracowanych godzin — łącznie z rozmowami, poprawkami i administracją. Otrzymasz realną stawkę za godzinę, którą porównujesz ze swoim progiem opłacalności.',
    },
    {
      q: 'Dlaczego zlecenie z dobrą fakturą może być nieopłacalne?',
      a: 'Bo kwota faktury nie uwzględnia czasu. Zlecenie na 6000 zł zajmujące 60 godzin daje 100 zł za godzinę, a to samo w 33 godziny — 167 zł. Ukryty czas rozmów, poprawek i administracji potrafi obniżyć realną stawkę o jedną trzecią lub więcej.',
    },
    {
      q: 'Jaki czas liczyć przy rentowności zlecenia?',
      a: 'Cały czas związany z projektem: pracę merytoryczną, rozmowy i ustalenia, przygotowanie wyceny, rundy poprawek, administrację oraz czas na ponowne wejście w temat po przerwach. Liczenie tylko pracy fakturowanej zawyża rentowność i prowadzi do zaniżania wycen.',
    },
    {
      q: 'Jak liczyć rentowność zlecenia ryczałtowego?',
      a: 'Podziel ustaloną kwotę ryczałtu przez faktyczną liczbę godzin, jakie projekt zajął. Przy ryczałcie to Ty ponosisz ryzyko przekroczenia czasu — jeśli projekt zajmie więcej godzin, niż zakładałeś przy wycenie, realna stawka spada mimo niezmienionej faktury. Dlatego pilnuj budżetu godzin.',
    },
    {
      q: 'Czym różni się rentowność zakładana od realnej?',
      a: 'Zakładaną szacujesz przed przyjęciem zlecenia, żeby zdecydować o wycenie, a realną liczysz po zakończeniu na podstawie faktycznego czasu i kosztów. Różnica między nimi pokazuje, gdzie systematycznie nie doszacowujesz czasu, i pomaga wyceniać trafniej kolejne projekty.',
    },
    {
      q: 'Jak zmierzyć faktyczny czas pracy nad zleceniem?',
      a: 'Najprościej licznikiem czasu uruchamianym przy każdej sesji pracy nad danym projektem, z przypisaną stawką godzinową. Dzięki temu opierasz rentowność na zmierzonych danych, a nie na szacunku z pamięci, który niemal zawsze zaniża realny czas poświęcony na zlecenie.',
    },
    {
      q: 'Jak wyznaczyć próg opłacalności zlecenia?',
      a: 'Zsumuj trzy składniki: koszty stałe działalności podzielone przez liczbę godzin fakturowalnych w miesiącu, oczekiwany dochód netto na godzinę oraz narzut na czas niefakturowany. Przykładowo koszty 4000 zł przy 100 godzinach to 40 zł/h, plus 80 zł/h dochodu daje próg 120 zł/h. Poniżej tej stawki zlecenie dokłada się do kosztów.',
    },
    {
      q: 'Czy warto przyjąć zlecenie na styku progu opłacalności?',
      a: 'Tylko wtedy, gdy daje coś poza samą stawką: otwiera stałą współpracę, buduje portfolio albo przynosi wartościową referencję. Jeśli takiego dodatkowego zysku nie ma, zlecenie na zero jest stratą czasu, który mógłbyś przeznaczyć na projekt powyżej progu.',
    },
  ],
};

export default article;
