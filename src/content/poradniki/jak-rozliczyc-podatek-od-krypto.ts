import type { Article } from './types';

const article: Article = {
  slug: 'jak-rozliczyc-podatek-od-krypto',
  title: 'Jak rozliczyć podatek od kryptowalut — PIT-38 krok po kroku',
  description:
    'Jak rozliczyć podatek od kryptowalut w Polsce: stawka 19%, moment powstania obowiązku, koszty, PIT-38 i rozliczanie strat. Przykład wyliczenia i tabela terminów.',
  category: 'inwestycje',
  tags: ['podatek od krypto', 'kryptowaluty', 'PIT-38', 'podatek Belki', 'rozliczenie podatkowe'],
  tldr:
    'W Polsce zysk z kryptowalut opodatkowany jest stawką 19% jako przychód z kapitałów pieniężnych. Podatek płacisz dopiero przy zamianie krypto na walutę tradycyjną (PLN, USD, EUR) lub zapłacie za towar czy usługę — wymiana krypto na krypto jest neutralna podatkowo. Rozliczasz się rocznie na formularzu PIT-38, wykazując przychody i koszty nabycia; nadwyżkę kosztów nad przychodem przenosisz na kolejne lata. To materiał informacyjny, a nie porada podatkowa.',
  keyTakeaways: [
    'Stawka podatku od zysku z krypto wynosi 19% (kapitały pieniężne).',
    'Obowiązek podatkowy powstaje przy zamianie krypto na walutę fiat lub zapłacie za towar/usługę.',
    'Zamiana krypto na krypto jest neutralna podatkowo — nie rozliczasz jej.',
    'Kosztem są wydatki na nabycie krypto; nadwyżkę kosztów przenosisz na kolejne lata.',
    'Rozliczenie składasz na PIT-38 do 30 kwietnia za rok poprzedni.',
  ],
  published: '2026-07-09',
  readingMinutes: 10,
  bodyHtml: `
<p>Rozliczenie podatku od kryptowalut budzi więcej pytań niż niemal każdy inny temat inwestycyjny, głównie dlatego, że zasady różnią się od tych dla akcji. W tym poradniku przejdziemy krok po kroku przez to, kiedy powstaje obowiązek podatkowy, co jest kosztem, jak policzyć kwotę podatku, jak wypełnić PIT-38 i jak rozliczyć straty z lat ubiegłych. Znajdziesz tu konkretne wyliczenia w złotych, wzór i checklistę przed złożeniem zeznania.</p>
<p><strong>Uwaga:</strong> to materiał informacyjny, a nie doradztwo podatkowe. Przepisy i interpretacje bywają indywidualne oraz zmieniają się w czasie, dlatego przed złożeniem zeznania potwierdź szczegóły z księgowym lub doradcą podatkowym i sprawdź aktualne brzmienie ustawy o PIT.</p>

<h2>Jaka stawka i jaki tytuł opodatkowania</h2>
<p>Dochód z odpłatnego zbycia walut wirtualnych opodatkowany jest w Polsce jednolitą stawką 19%. Klasyfikuje się go jako przychód z kapitałów pieniężnych i rozlicza odrębnie od innych dochodów — nie łączysz go z pensją ani z dochodem z działalności. Co istotne, dochodu z krypto nie łączysz też z zyskami z akcji czy ETF-ów; to osobna pula w zeznaniu, wykazywana w odrębnej części PIT-38.</p>
<p>Sama stawka jest taka sama jak przy klasycznym <a href="/poradniki/podatek-belki-jak-obliczyc">podatku Belki</a> od zysków kapitałowych, ale zasady ustalania momentu i sposobu rozliczenia są inne, o czym poniżej. Przy krypto nie ma kwoty wolnej dedykowanej temu dochodowi — podatek liczysz od pierwszej złotówki dochodu, czyli od nadwyżki przychodu nad kosztami nabycia.</p>

<h2>Kiedy powstaje obowiązek podatkowy</h2>
<p>To najważniejszy i najczęściej mylony punkt. Podatek naliczasz nie wtedy, gdy Twoje krypto zyskuje na wartości, lecz w konkretnym momencie zdarzenia:</p>
<ul>
<li><strong>Zamiana krypto na walutę tradycyjną</strong> (PLN, USD, EUR) — moment powstania przychodu.</li>
<li><strong>Zapłata krypto za towar lub usługę</strong> — traktowana jak zbycie po wartości rynkowej.</li>
<li><strong>Zamiana krypto na inne krypto</strong> — neutralna podatkowo, nie generuje przychodu.</li>
</ul>
<p>Ta trzecia zasada jest kluczowa. Jeśli wymieniasz jedną kryptowalutę na inną, nawet z ogromnym zyskiem, nie rozliczasz tego. Podatek pojawia się dopiero, gdy wychodzisz do waluty tradycyjnej. Dzięki temu nie musisz śledzić każdej z setek transakcji krypto-krypto na potrzeby podatku — liczy się to, ile fiat wpłaciłeś i ile wypłaciłeś.</p>
<p>Przykład: kupujesz bitcoina za 20 000 zł, wymieniasz go na ethereum, które rośnie do równowartości 35 000 zł, a potem zamieniasz na solanę. Dopóki nie wypłacisz środków do PLN, USD ani EUR i nie zapłacisz nimi za towar, nie masz przychodu do wykazania — mimo że na papierze zarobiłeś 15 000 zł. Przychód pojawi się dopiero przy wyjściu do fiat.</p>

<blockquote>Przychód powstaje przy wyjściu z krypto do waluty fiat lub przy zapłacie krypto za towar/usługę. Wymiana krypto na krypto jest podatkowo obojętna.</blockquote>

<h2>Co jest kosztem uzyskania przychodu</h2>
<p>Kosztem są udokumentowane wydatki poniesione na nabycie walut wirtualnych oraz koszty związane z ich zbyciem, na przykład prowizje giełdy. Zaliczasz tu kwoty, za które kupiłeś krypto za walutę tradycyjną, w tym opłaty transakcyjne.</p>
<p>Ważna cecha: koszty rozliczasz w roku ich poniesienia, niezależnie od tego, czy w tym samym roku sprzedałeś krypto. Jeśli w danym roku kupiłeś krypto za 40 000 zł, a nic nie sprzedałeś, wykazujesz koszt 40 000 zł, który obniży przychód z lat kolejnych. Nadwyżka kosztów nad przychodami przechodzi na następny rok bez limitu czasowego.</p>
<p>Kosztem nie są natomiast wydatki pośrednie, takie jak sprzęt do kopania rozliczany na zasadach ogólnych działalności czy koszty finansowania zakupu. Zasady dotyczą kosztów bezpośrednio związanych z nabyciem waluty wirtualnej.</p>
<p>Co dokładnie zaliczysz, a czego nie, dobrze pokazuje zestawienie:</p>
<table>
<thead>
<tr><th>Zaliczasz do kosztów</th><th>Nie zaliczasz</th></tr>
</thead>
<tbody>
<tr><td>Cena zakupu krypto za PLN, USD, EUR</td><td>Wartość krypto otrzymanego w drodze wymiany krypto-krypto</td></tr>
<tr><td>Prowizje giełdy i opłaty transakcyjne przy zakupie</td><td>Odsetki od pożyczki na zakup krypto</td></tr>
<tr><td>Prowizje związane ze zbyciem (wypłatą do fiat)</td><td>Sprzęt i prąd do kopania rozliczane w działalności</td></tr>
</tbody>
</table>

<h2>Krok po kroku: jak policzyć podatek od krypto</h2>
<p>Wyliczenie sprowadza się do prostego wzoru: <strong>podatek = (przychód − koszty nabycia) × 19%</strong>, gdzie przychód to suma wyjść do fiat w danym roku, a koszty to suma udokumentowanych wydatków na nabycie. Praktyczny porządek działań wygląda tak:</p>
<ol>
<li>Zsumuj wszystkie wyjścia z krypto do waluty tradycyjnej w roku podatkowym — to Twój <strong>przychód</strong>.</li>
<li>Zsumuj udokumentowane wydatki na nabycie krypto poniesione w tym roku oraz nierozliczoną nadwyżkę kosztów z lat poprzednich — to Twoje <strong>koszty</strong>.</li>
<li>Odejmij koszty od przychodu. Wynik dodatni to <strong>dochód</strong> do opodatkowania; wynik ujemny to nadwyżka kosztów, którą przeniesiesz na kolejny rok.</li>
<li>Pomnóż dochód przez 19% — to należny podatek.</li>
<li>Sprawdź, czy Twój łączny dochód roczny nie zbliża się do progu daniny solidarnościowej (o tym niżej).</li>
</ol>
<p>Przeliczenia walutowe: przychody i koszty w walutach obcych przelicza się na złote według średniego kursu NBP z ostatniego dnia roboczego poprzedzającego dzień uzyskania przychodu lub poniesienia kosztu. Dlatego warto zapisywać nie tylko kwoty, ale i daty transakcji.</p>

<h2>Przykład wyliczenia dla jednego roku</h2>
<p>Prześledźmy prosty przypadek dla jednego roku podatkowego.</p>
<table>
<thead>
<tr><th>Pozycja</th><th>Kwota</th></tr>
</thead>
<tbody>
<tr><td>Wpłaty fiat na zakup krypto (koszt)</td><td>30 000 zł</td></tr>
<tr><td>Wypłaty z krypto do PLN (przychód)</td><td>50 000 zł</td></tr>
<tr><td>Dochód do opodatkowania</td><td>20 000 zł</td></tr>
<tr><td>Podatek 19%</td><td>3 800 zł</td></tr>
<tr><td><strong>Do wypłaty po podatku</strong></td><td><strong>46 200 zł</strong></td></tr>
</tbody>
</table>
<p>Zwróć uwagę, że wewnętrzne wymiany między kryptowalutami w ciągu roku nie mają tu żadnego znaczenia — liczy się tylko fiat na wejściu i wyjściu. Wartość krypto, którego nie sprzedałeś, nie jest opodatkowana, choćby mocno urosła.</p>
<p>Rozważmy wariant, w którym w tym samym roku część kosztów pochodzi z wcześniejszych zakupów. Załóżmy, że oprócz wpłat 30 000 zł masz jeszcze 8 000 zł nierozliczonej nadwyżki kosztów z poprzedniego roku. Wtedy łączne koszty wynoszą 38 000 zł, dochód spada do 12 000 zł, a podatek do 2 280 zł zamiast 3 800 zł. Widać, jak istotne jest wykazywanie kosztów nawet w latach bez sprzedaży.</p>

<h2>Straty i przenoszenie kosztów przez kilka lat</h2>
<p>Krypto ma nietypową mechanikę: jeśli w danym roku koszty nabycia przewyższają przychód, nadwyżka nie przepada, lecz automatycznie powiększa koszty roku kolejnego. Nie jest to klasyczna strata odliczana do 50% rocznie jak przy akcjach — tu cała nadwyżka kosztów przechodzi dalej, bez limitu procentowego i bez ograniczenia liczby lat. Prześledźmy trzy lata inwestora, który najpierw dużo kupował, a dopiero potem sprzedawał.</p>
<table>
<thead>
<tr><th>Rok</th><th>Koszty nabycia w roku</th><th>Przychód (wyjścia do fiat)</th><th>Nadwyżka kosztów z lat poprzednich</th><th>Dochód / podatek 19%</th></tr>
</thead>
<tbody>
<tr><td>2024</td><td>60 000 zł</td><td>0 zł</td><td>0 zł</td><td>strata; przenosisz 60 000 zł</td></tr>
<tr><td>2025</td><td>20 000 zł</td><td>30 000 zł</td><td>60 000 zł</td><td>koszty 80 000 zł &gt; przychód; przenosisz 50 000 zł</td></tr>
<tr><td>2026</td><td>0 zł</td><td>90 000 zł</td><td>50 000 zł</td><td>dochód 40 000 zł; podatek 7 600 zł</td></tr>
</tbody>
</table>
<p>W 2024 roku inwestor tylko kupował, więc wykazuje 60 000 zł kosztów i zero przychodu — całość przechodzi na później. W 2025 sprzedał krypto za 30 000 zł, ale łączne koszty (20 000 zł z roku plus 60 000 zł z przeszłości) i tak przewyższają przychód, więc na kolejny rok przenosi 50 000 zł. Dopiero w 2026, przy przychodzie 90 000 zł i skumulowanych kosztach 50 000 zł, powstaje dochód 40 000 zł i realny podatek 7 600 zł. Gdyby inwestor nie wykazywał kosztów w latach bez sprzedaży, zapłaciłby podatek od pełnych 90 000 zł, czyli 17 100 zł — o 9 500 zł więcej.</p>

<h2>Jak i kiedy złożyć PIT-38</h2>
<p>Dochód z kryptowalut wykazujesz na formularzu PIT-38, w części przeznaczonej na waluty wirtualne. Podajesz łączny przychód (wyjścia do fiat) oraz łączne koszty nabycia. Zeznanie składasz raz w roku.</p>

<table>
<thead>
<tr><th>Element</th><th>Szczegół</th></tr>
</thead>
<tbody>
<tr><td>Formularz</td><td>PIT-38</td></tr>
<tr><td>Stawka</td><td>19%</td></tr>
<tr><td>Termin złożenia</td><td>do 30 kwietnia za rok poprzedni</td></tr>
<tr><td>Zaliczki w trakcie roku</td><td>brak — podatek płatny raz, przy rozliczeniu rocznym</td></tr>
<tr><td>Rozliczenie straty (nadwyżki kosztów)</td><td>przeniesienie na kolejne lata</td></tr>
<tr><td>Przeliczanie walut obcych</td><td>średni kurs NBP z dnia poprzedzającego zdarzenie</td></tr>
</tbody>
</table>

<p>W przeciwieństwie do niektórych innych dochodów, przy krypto nie płacisz zaliczek w trakcie roku — rozliczasz się jednorazowo w zeznaniu rocznym. Masz też obowiązek wykazać transakcje nawet wtedy, gdy wyszedłeś na zero lub na minus, bo to pozwala rozliczyć koszty w przyszłości. Podatek wynikający z PIT-38 wpłacasz na swój mikrorachunek podatkowy również w terminie do 30 kwietnia.</p>

<h2>Danina solidarnościowa przy dużych zyskach</h2>
<p>Jeśli w danym roku Twój łączny dochód podlegający daninie przekroczy 1 000 000 zł, od nadwyżki ponad ten próg może dojść dodatkowe 4% tzw. daniny solidarnościowej. Do podstawy daniny wlicza się m.in. dochody z kapitałów pieniężnych, a więc potencjalnie także dochód z krypto. Dla zdecydowanej większości inwestorów próg jest nieosiągalny, ale przy naprawdę dużych realizacjach zysku warto go mieć na uwadze.</p>
<p>Przykładowo, gdyby dochód z krypto w połączeniu z innymi dochodami wyniósł 1 300 000 zł, danina objęłaby nadwyżkę 300 000 zł, co daje dodatkowe 12 000 zł ponad podatek 19%. To sytuacja, w której konsultacja z doradcą podatkowym jest szczególnie wskazana, bo zasady liczenia podstawy daniny są bardziej złożone niż sam PIT-38.</p>

<h2>Najczęstsze błędy przy rozliczaniu krypto</h2>
<ul>
<li><strong>Rozliczanie wymian krypto-krypto</strong> — te są neutralne, nie wykazujesz ich jako przychodu.</li>
<li><strong>Pominięcie kosztów z lat, w których nic nie sprzedano</strong> — koszty warto wykazywać, by obniżyły przyszły podatek.</li>
<li><strong>Brak dokumentacji</strong> — bez historii transakcji z giełd trudno udowodnić koszty nabycia.</li>
<li><strong>Mylenie krypto z akcjami</strong> — to osobna pula, nie łączysz jej z dochodem z papierów wartościowych.</li>
<li><strong>Ignorowanie zapłaty krypto za towar</strong> — taka transakcja też jest zbyciem i generuje przychód.</li>
<li><strong>Zły kurs przeliczenia</strong> — kwoty w USD czy EUR trzeba przeliczyć po właściwym kursie NBP, a nie po kursie z giełdy.</li>
</ul>

<h2>Checklista przed złożeniem PIT-38</h2>
<p>Zanim wyślesz zeznanie, przejdź przez te punkty — pozwolą uniknąć zaniżenia lub zawyżenia podatku:</p>
<ol>
<li>Pobrałeś pełną historię transakcji ze wszystkich giełd i portfeli, z których korzystałeś.</li>
<li>Zsumowałeś wyłącznie wyjścia do fiat jako przychód, pomijając wymiany krypto-krypto.</li>
<li>Zsumowałeś udokumentowane koszty nabycia z roku i doliczyłeś nadwyżkę kosztów z lat poprzednich.</li>
<li>Kwoty w walutach obcych przeliczyłeś po średnim kursie NBP z dnia poprzedzającego zdarzenie.</li>
<li>Sprawdziłeś, czy nie realizowałeś zapłat krypto za towary lub usługi, które też są przychodem.</li>
<li>Ustaliłeś, czy powstał dochód (podatek 19%), czy nadwyżka kosztów do przeniesienia na kolejny rok.</li>
<li>Zapisałeś dokumentację na wypadek ewentualnej kontroli — obowiązek jej przechowywania trwa latami.</li>
</ol>

<h2>Jak SzpontHub pomaga w rozliczeniu krypto</h2>
<p>Największym wyzwaniem przy podatku od krypto jest dokumentacja: musisz wiedzieć, ile realnie wpłaciłeś w fiat i ile wypłaciłeś. W SzpontHub prowadzisz aktywa i inwestycje, w tym krypto, wraz z transakcjami i portfelami wielowalutowymi (PLN, USD, EUR), więc masz w jednym miejscu historię wpłat i wypłat potrzebną do wyliczenia przychodu i kosztów. Aplikacja uwzględnia też podatek Belki przy zyskach kapitałowych, co ułatwia oszacowanie zobowiązania. Jak liczyć koszt nabycia przy wielu zakupach, rozwijamy w tekście o tym, <a href="/poradniki/jak-obliczyc-cost-basis">jak obliczyć cost basis</a>.</p>
`,
  faq: [
    {
      q: 'Jaki podatek płaci się od kryptowalut w Polsce?',
      a: 'Zysk z kryptowalut opodatkowany jest stawką 19% jako przychód z kapitałów pieniężnych. Rozlicza się go odrębnie od dochodu z pracy i od zysków z akcji, na formularzu PIT-38 w rozliczeniu rocznym.',
    },
    {
      q: 'Kiedy powstaje obowiązek podatkowy od krypto?',
      a: 'W momencie zamiany kryptowaluty na walutę tradycyjną (PLN, USD, EUR) albo zapłaty krypto za towar lub usługę. Sam wzrost wartości trzymanego krypto nie jest opodatkowany, dopóki go nie sprzedasz do waluty fiat.',
    },
    {
      q: 'Czy zamiana jednej kryptowaluty na inną jest opodatkowana?',
      a: 'Nie. Wymiana krypto na krypto jest w Polsce neutralna podatkowo, nawet jeśli następuje z zyskiem. Podatek pojawia się dopiero, gdy wychodzisz z krypto do waluty tradycyjnej lub płacisz krypto za towar czy usługę.',
    },
    {
      q: 'Co jest kosztem przy rozliczaniu kryptowalut?',
      a: 'Udokumentowane wydatki na nabycie walut wirtualnych, w tym kwoty zapłacone za zakup i prowizje giełdy. Koszty rozliczasz w roku poniesienia, a jeśli przewyższają przychód, nadwyżkę przenosisz na kolejne lata podatkowe.',
    },
    {
      q: 'Na jakim formularzu rozlicza się krypto i do kiedy?',
      a: 'Na formularzu PIT-38, w części dotyczącej walut wirtualnych. Zeznanie składasz do 30 kwietnia za rok poprzedni. Przy krypto nie płaci się zaliczek w trakcie roku — podatek regulujesz jednorazowo przy rozliczeniu rocznym.',
    },
    {
      q: 'Czy trzeba rozliczać krypto, jeśli wyszedłem na stracie?',
      a: 'Tak, warto wykazać transakcje nawet przy stracie. Nadwyżka kosztów nabycia nad przychodami przenosi się na kolejne lata i obniża przyszły podatek. Bez wykazania tych kosztów tracisz możliwość ich rozliczenia w przyszłości.',
    },
  ],
};

export default article;
