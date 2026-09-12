import type { Article } from './types';

const article: Article = {
  slug: 'jak-rozliczyc-pit-roczny',
  title: 'Jak rozliczyć PIT roczny — przewodnik krok po kroku',
  metaTitle: 'Jak rozliczyć PIT roczny — poradnik krok po kroku',
  description:
    'Jak rozliczyć roczny PIT bez błędów: który formularz wybrać, jakie ulgi odliczyć, do kiedy złożyć zeznanie i jak działa usługa Twój e-PIT. Praktyczny przewodnik.',
  category: 'finanse-osobiste',
  tags: ['PIT', 'rozliczenie roczne', 'zeznanie podatkowe', 'ulgi podatkowe', 'Twój e-PIT'],
  tldr:
    'Roczne zeznanie PIT składa się do 30 kwietnia za rok poprzedni. Większość osób na etacie rozlicza PIT-37, a przedsiębiorcy PIT-36 lub PIT-36L. Usługa Twój e-PIT przygotowuje zeznanie automatycznie, ale warto je sprawdzić i uzupełnić o ulgi, których urząd nie zna — na dzieci, internet, darowizny czy termomodernizację. Niezłożenie zeznania w terminie grozi konsekwencjami, a nadpłatę podatku urząd zwraca zwykle w ciągu kilku tygodni.',
  keyTakeaways: [
    'Termin złożenia rocznego PIT to 30 kwietnia za rok poprzedni — dotyczy też korekt składanych na czas.',
    'Formularz zależy od źródła dochodu: PIT-37 dla etatu i zleceń, PIT-36 dla działalności na zasadach ogólnych, PIT-28 dla ryczałtu.',
    'Twój e-PIT przygotowuje zeznanie automatycznie, ale nie zna wszystkich ulg — te trzeba dodać samodzielnie.',
    'Ulgi realnie obniżają podatek: na dzieci, rehabilitacyjna, termomodernizacyjna, darowizny, IKZE.',
    'Nadpłatę urząd zwraca zwykle w kilka tygodni, a przy e-zeznaniu szybciej niż przy papierowym.',
    'Brak zeznania w terminie grozi odpowiedzialnością — jeśli nie zdążysz, warto złożyć czynny żal.',
  ],
  published: '2026-07-22',
  readingMinutes: 9,
  bodyHtml: `
<p>Roczne rozliczenie PIT wywołuje więcej stresu, niż powinno. W większości przypadków jest to procedura, którą da się przejść w kilkanaście minut — pod warunkiem, że wiesz, który formularz Cię dotyczy, jakie ulgi możesz odliczyć i czego nie zrobi za Ciebie automat. Ten przewodnik prowadzi przez cały proces krok po kroku.</p>

<p><em>Uwaga: przepisy podatkowe bywają zmieniane co roku. Poniżej opisujemy ogólne zasady i mechanizmy — konkretne stawki, limity ulg i formularze zweryfikuj w aktualnych przepisach albo u księgowego przed złożeniem zeznania.</em></p>

<h2>Krok 1: Ustal, który formularz Cię dotyczy</h2>
<p>Wybór formularza zależy od tego, skąd pochodzą Twoje dochody. To najczęstsze źródło pomyłek, więc zacznij właśnie tutaj.</p>
<table>
<thead>
<tr><th>Formularz</th><th>Dla kogo</th></tr>
</thead>
<tbody>
<tr><td>PIT-37</td><td>Etat, umowy zlecenie i o dzieło, emerytury — dochody rozliczane przez płatnika</td></tr>
<tr><td>PIT-36</td><td>Działalność gospodarcza na zasadach ogólnych, dochody zagraniczne, najem rozliczany skalą</td></tr>
<tr><td>PIT-36L</td><td>Działalność opodatkowana podatkiem liniowym</td></tr>
<tr><td>PIT-28</td><td>Ryczałt od przychodów ewidencjonowanych, w tym najem prywatny</td></tr>
<tr><td>PIT-38</td><td>Dochody kapitałowe: akcje, kryptowaluty, sprzedaż papierów wartościowych</td></tr>
</tbody>
</table>
<p>Jeśli masz kilka źródeł — na przykład etat i działalność — możesz składać więcej niż jeden formularz. Osoby inwestujące na giełdzie czy w krypto rozliczają zyski osobno na PIT-38; jak to policzyć, opisujemy w poradnikach o <a href="/poradniki/podatek-belki-jak-obliczyc">podatku Belki</a> oraz o <a href="/poradniki/jak-rozliczyc-podatek-od-krypto">rozliczaniu podatku od krypto</a>.</p>

<h2>Krok 2: Zbierz dokumenty</h2>
<p>Zanim usiądziesz do zeznania, przygotuj podstawę. Bez kompletu danych łatwo o pominięcie dochodu lub ulgi.</p>
<ul>
<li><strong>PIT-11</strong> — od każdego pracodawcy i zleceniodawcy; podsumowuje przychody i pobrane zaliczki.</li>
<li><strong>PIT-11A / PIT-40A</strong> — od ZUS, jeśli pobierasz emeryturę lub rentę.</li>
<li><strong>Dane o dochodach z działalności</strong> — z księgi przychodów i rozchodów lub ewidencji ryczałtu.</li>
<li><strong>Dokumenty do ulg</strong> — faktury, potwierdzenia darowizn, dane dzieci, dowody wpłat na IKZE.</li>
</ul>

<h2>Krok 3: Sprawdź, czy skorzystasz z Twój e-PIT</h2>
<p>Usługa Twój e-PIT udostępniana w serwisie e-Urzędu Skarbowego automatycznie przygotowuje zeznanie na podstawie danych, które urząd już posiada. To ogromne ułatwienie, ale ma jedną istotną granicę: <strong>urząd zna tylko to, co zostało do niego zgłoszone</strong>.</p>
<p>Automat uwzględni przychody z PIT-11 i część standardowych ulg, ale nie doda odliczeń, o których nie wie — darowizn przekazanych prywatnie, wydatków na termomodernizację czy części ulg, które musisz wykazać samodzielnie. Dlatego przygotowanego zeznania nigdy nie akceptuj w ciemno.</p>

<blockquote>Twój e-PIT to dobry punkt startowy, a nie gotowa odpowiedź. Automat zna Twoje przychody, ale nie zna Twoich ulg — te dopiszesz tylko Ty.</blockquote>

<h2>Krok 4: Odlicz ulgi, które Ci przysługują</h2>
<p>Ulgi to miejsce, w którym rozliczenie realnie wpływa na Twój portfel. Najczęściej pomijane, bo wymagają samodzielnego działania.</p>
<ul>
<li><strong>Ulga na dzieci</strong> — kwota zależna od liczby dzieci, jedna z najczęściej stosowanych.</li>
<li><strong>Ulga rehabilitacyjna</strong> — wydatki związane z niepełnosprawnością własną lub bliskiej osoby.</li>
<li><strong>Ulga termomodernizacyjna</strong> — wydatki na docieplenie i modernizację domu jednorodzinnego.</li>
<li><strong>Darowizny</strong> — na organizacje pożytku publicznego, cele kultu, krwiodawstwo, w ustawowych limitach.</li>
<li><strong>Wpłaty na IKZE</strong> — obniżają podstawę opodatkowania; łączą oszczędzanie na emeryturę z korzyścią podatkową.</li>
</ul>
<p>Wpłata na IKZE to jedno z niewielu odliczeń, które jednocześnie buduje Twój kapitał — jak działa to konto, porównujemy w poradniku <a href="/poradniki/ike-czy-ikze">IKE czy IKZE</a>.</p>

<h2>Krok 5: Zdecyduj o sposobie rozliczenia</h2>
<p>Przed złożeniem sprawdź, czy nie opłaca Ci się rozliczenie wspólne z małżonkiem. Gdy dochody obojga znacząco się różnią, wspólne zeznanie potrafi obniżyć łączny podatek, bo uśrednia podstawę. Samotni rodzice mają z kolei własny, preferencyjny sposób rozliczenia.</p>

<h2>Krok 6: Przekaż 1,5% podatku</h2>
<p>Niezależnie od tego, ile podatku płacisz, możesz wskazać organizację pożytku publicznego, która otrzyma 1,5% Twojego podatku. To nie kosztuje Cię nic — te pieniądze i tak trafiają do budżetu, a wskazanie kieruje je do wybranej organizacji zamiast rozpłynąć się w ogólnej puli.</p>

<h2>Krok 7: Złóż zeznanie w terminie</h2>
<p>Roczny PIT składa się <strong>do 30 kwietnia</strong> za rok poprzedni. Najprościej i najszybciej zrobić to elektronicznie — przez e-Urząd Skarbowy lub inny system e-Deklaracji. Zeznania elektroniczne są też szybciej przetwarzane, co przyspiesza zwrot nadpłaty.</p>
<p>Jeśli z zeznania wynika nadpłata, urząd zwraca ją zwykle w ciągu kilku tygodni od złożenia — przy e-zeznaniu krócej niż przy papierowym. Jeśli wynika dopłata, ureguluj ją w terminie, by uniknąć odsetek.</p>

<h2>Co zrobić, gdy nie zdążysz</h2>
<p>Przekroczenie terminu nie jest końcem świata, ale wymaga reakcji. Najlepszym rozwiązaniem jest jak najszybsze złożenie zeznania wraz z tak zwanym czynnym żalem — pismem, w którym informujesz urząd o spóźnieniu, zanim sam je wykryje. Złożony w porę czynny żal zwykle pozwala uniknąć kary. Kluczowe jest, by nie odkładać sprawy w nieskończoność.</p>

<h2>Najczęstsze błędy</h2>
<ol>
<li><strong>Akceptacja Twój e-PIT bez sprawdzenia.</strong> Automat pomija ulgi, o których urząd nie wie — tracisz realne pieniądze.</li>
<li><strong>Pominięcie dodatkowego źródła dochodu.</strong> Drugi PIT-11, dochód z najmu czy z giełdy trzeba wykazać, nawet jeśli był niewielki.</li>
<li><strong>Zły formularz.</strong> Rozliczenie działalności na PIT-37 zamiast PIT-36 to typowa pomyłka przy łączeniu etatu z firmą.</li>
<li><strong>Brak dokumentów do ulg.</strong> Ulgę trzeba umieć udokumentować — faktury i potwierdzenia przechowuj przez okres przedawnienia zobowiązania.</li>
</ol>

<h2>Jak SzpontHub pomaga przygotować się do PIT</h2>
<p>Największym utrudnieniem przy rocznym rozliczeniu jest odtworzenie tego, co działo się przez cały rok. W SzpontHub masz przychody i wydatki zebrane w jednym miejscu, z podziałem na kategorie, więc przygotowanie danych do zeznania — zwłaszcza przy działalności czy najmie — sprowadza się do przejrzenia gotowych podsumowań zamiast przeszukiwania wyciągów. Osobne portfele pozwalają oddzielić przychody firmowe od prywatnych i wyliczyć realny dochód. Jeśli inwestujesz, historia transakcji ułatwia policzenie zysków do PIT-38. A wydatki, które kwalifikują się do ulg — darowizny czy koszty termomodernizacji — możesz oznaczyć własną kategorią, by w kwietniu mieć je od razu pod ręką.</p>
`,
  faq: [
    {
      q: 'Do kiedy trzeba złożyć roczny PIT?',
      a: 'Roczne zeznanie składa się do 30 kwietnia za rok poprzedni. Najszybciej zrobić to elektronicznie przez e-Urząd Skarbowy — takie zeznania są też szybciej przetwarzane, co przyspiesza ewentualny zwrot nadpłaty.',
    },
    {
      q: 'Czy Twój e-PIT rozlicza wszystko automatycznie?',
      a: 'Nie w pełni. Usługa przygotowuje zeznanie na podstawie danych, które urząd już posiada, ale nie zna ulg wymagających samodzielnego zgłoszenia — darowizn, termomodernizacji czy części odliczeń. Przygotowane zeznanie zawsze warto sprawdzić i uzupełnić.',
    },
    {
      q: 'Który formularz PIT wybrać?',
      a: 'Zależy od źródła dochodu: PIT-37 dla etatu i umów rozliczanych przez płatnika, PIT-36 dla działalności na zasadach ogólnych, PIT-36L dla podatku liniowego, PIT-28 dla ryczałtu, PIT-38 dla dochodów kapitałowych. Przy kilku źródłach można składać więcej niż jeden formularz.',
    },
    {
      q: 'Jakie ulgi najczęściej się pomija?',
      a: 'Najczęściej pomijane są ulgi wymagające samodzielnego wykazania: termomodernizacyjna, darowizny przekazane prywatnie, rehabilitacyjna oraz odliczenie wpłat na IKZE. Automat ich nie doda, bo urząd o nich nie wie.',
    },
    {
      q: 'Co zrobić, gdy nie zdążę złożyć PIT w terminie?',
      a: 'Złóż zeznanie jak najszybciej wraz z czynnym żalem — pismem informującym urząd o spóźnieniu, zanim sam je wykryje. Złożony w porę zwykle pozwala uniknąć kary. Najważniejsze to nie odkładać sprawy.',
    },
    {
      q: 'Ile czeka się na zwrot nadpłaty podatku?',
      a: 'Zwykle kilka tygodni od złożenia zeznania, przy czym zeznania elektroniczne są rozliczane szybciej niż papierowe. Warto sprawdzić aktualne terminy ustawowe, bo bywają zmieniane.',
    },
    {
      q: 'Czy wspólne rozliczenie z małżonkiem się opłaca?',
      a: 'Często tak, zwłaszcza gdy dochody małżonków znacząco się różnią — wspólne zeznanie uśrednia podstawę i może obniżyć łączny podatek. Warto porównać wynik rozliczenia wspólnego i osobnego przed wyborem.',
    },
  ],
};

export default article;
