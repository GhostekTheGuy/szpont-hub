import type { Article } from './types';

const article: Article = {
  slug: 'jak-wystawic-fakture-freelancer',
  title: 'Jak wystawić fakturę jako freelancer — kompletny poradnik',
  description:
    'Jak wystawić fakturę jako freelancer: obowiązkowe elementy, terminy, faktura z VAT i bez, numeracja i błędy do uniknięcia. Konkretna lista i przykłady.',
  category: 'freelancer',
  tags: ['faktura', 'freelancer', 'faktura VAT', 'rozliczenia', 'działalność'],
  tldr:
    'Fakturę jako freelancer wystawiasz, gdy prowadzisz działalność gospodarczą lub gdy klient (firma) jej wymaga. Musi zawierać m.in. datę wystawienia, kolejny numer, dane obu stron z NIP, nazwę usługi, ilość, cenę jednostkową, kwotę netto, stawkę i kwotę VAT oraz kwotę do zapłaty. Fakturę wystawiasz najpóźniej do 15. dnia miesiąca po wykonaniu usługi, a termin płatności ustalasz z klientem. Ten materiał ma charakter informacyjny, nie jest poradą podatkową.',
  keyTakeaways: [
    'Fakturę wystawia głównie przedsiębiorca; przy współpracy z firmą to zwykle standard rozliczenia.',
    'Faktura ma obowiązkowe elementy — brak choćby NIP czy numeru czyni ją wadliwą.',
    'Termin: fakturę wystaw najpóźniej do 15. dnia miesiąca po wykonaniu usługi.',
    'Numeracja musi być ciągła i unikalna, np. 1/2026, 2/2026, bez luk i powtórzeń.',
    'Zwolniony z VAT wystawia fakturę bez kwoty VAT, z adnotacją o podstawie zwolnienia.',
    'Fakturę koryguje się fakturą korygującą, nie przez usunięcie lub ręczną poprawkę.',
    'Wartość brutto liczysz jako netto powiększone o VAT: 5000 zł netto przy 23% to 6150 zł do zapłaty.',
    'Fakturę wystawisz raz i wykorzystasz szablon — najwięcej czasu zajmuje pierwsza, kolejne to minuty.',
  ],
  published: '2026-07-09',
  readingMinutes: 13,
  bodyHtml: `
<p>Wystawienie pierwszej faktury bywa dla freelancera stresujące — pojawia się obawa, że pominięcie jakiegoś pola albo błąd w numeracji ściągnie problem. W rzeczywistości faktura to prosty dokument o ściśle określonej zawartości. Gdy raz zrozumiesz, co musi się na niej znaleźć i kiedy ją wystawić, cała procedura staje się rutyną. W tym poradniku przechodzimy przez to krok po kroku. Materiał ma charakter informacyjny i nie zastępuje porady księgowej.</p>

<h2>Kiedy freelancer musi wystawić fakturę</h2>
<p>Obowiązek wystawienia faktury dotyczy przede wszystkim przedsiębiorców, czyli osób prowadzących zarejestrowaną działalność gospodarczą. Jeśli działasz na działalności, faktura jest podstawowym dokumentem rozliczenia z klientem biznesowym. Przy współpracy z firmą klient prawie zawsze oczekuje faktury, bo potrzebuje jej do zaksięgowania kosztu.</p>
<p>Sytuacja wygląda inaczej, gdy korzystasz z działalności nierejestrowanej — wtedy zamiast faktury zwykle wystawiasz rachunek, choć na żądanie nabywcy również możesz wystawić uproszczoną fakturę. Jeśli zastanawiasz się, czy w Twojej sytuacji właściwy jest jeden czy drugi dokument, zajrzyj do poradnika <a href="/poradniki/faktura-a-rachunek-roznice">faktura a rachunek — różnice i kiedy co stosować</a>.</p>

<h2>Obowiązkowe elementy faktury</h2>
<p>Faktura to nie dowolny dokument — przepisy określają, co musi zawierać. Pominięcie któregoś z elementów sprawia, że faktura jest wadliwa i klient może odmówić jej przyjęcia. Oto pełna lista pól, które muszą się znaleźć na standardowej fakturze.</p>

<table>
<thead>
<tr><th>Element</th><th>Co wpisujesz</th></tr>
</thead>
<tbody>
<tr><td>Data wystawienia</td><td>Dzień sporządzenia faktury</td></tr>
<tr><td>Numer faktury</td><td>Kolejny, unikalny numer w ramach serii</td></tr>
<tr><td>Dane sprzedawcy</td><td>Nazwa, adres i NIP Twojej firmy</td></tr>
<tr><td>Dane nabywcy</td><td>Nazwa, adres i NIP klienta</td></tr>
<tr><td>Data wykonania usługi</td><td>Dzień lub okres realizacji, jeśli inny niż data wystawienia</td></tr>
<tr><td>Nazwa usługi lub towaru</td><td>Opis tego, za co wystawiasz fakturę</td></tr>
<tr><td>Ilość i jednostka</td><td>Np. liczba godzin, sztuk lub jedna usługa</td></tr>
<tr><td>Cena jednostkowa netto</td><td>Cena bez podatku za jednostkę</td></tr>
<tr><td>Wartość netto</td><td>Ilość pomnożona przez cenę jednostkową</td></tr>
<tr><td>Stawka i kwota VAT</td><td>Np. 23%, lub adnotacja o zwolnieniu</td></tr>
<tr><td>Kwota do zapłaty (brutto)</td><td>Wartość netto powiększona o VAT</td></tr>
</tbody>
</table>

<p>Do tego dochodzą elementy praktyczne, których nie wymaga wprost przepis, ale bez których klient nie zapłaci: numer rachunku bankowego, termin płatności i forma płatności. Warto je zawsze dodawać, bo przyspieszają rozliczenie.</p>

<h2>Faktura krok po kroku na konkretnym przykładzie</h2>
<p>Teoria brzmi abstrakcyjnie, dlatego prześledźmy realną fakturę. Załóżmy, że jesteś grafikiem, wykonałeś projekt identyfikacji wizualnej za 5000 zł netto dla firmy klienta, jesteś czynnym podatnikiem VAT (stawka 23%), a usługę zakończyłeś 20 marca 2026. Oto jak wypełniasz kolejne pola.</p>
<ol>
<li><strong>Numer i data.</strong> Numer 7/2026 (siódma faktura w roku), data wystawienia 3 kwietnia 2026, data wykonania usługi 20 marca 2026.</li>
<li><strong>Strony.</strong> Twoja nazwa, adres i NIP jako sprzedawca; nazwa, adres i NIP klienta jako nabywca.</li>
<li><strong>Pozycja.</strong> Nazwa: „Projekt identyfikacji wizualnej”, ilość 1 usługa, cena jednostkowa netto 5000 zł.</li>
<li><strong>Podatek.</strong> Stawka 23%, kwota VAT 1150 zł.</li>
<li><strong>Podsumowanie.</strong> Wartość netto 5000 zł, VAT 1150 zł, kwota do zapłaty 6150 zł.</li>
<li><strong>Płatność.</strong> Numer rachunku, termin 14 dni (do 17 kwietnia 2026), forma: przelew.</li>
</ol>
<p>Tak wygląda rozbicie kwot na tej fakturze:</p>
<table>
<thead>
<tr><th>Pozycja</th><th>Netto</th><th>VAT 23%</th><th>Brutto</th></tr>
</thead>
<tbody>
<tr><td>Projekt identyfikacji wizualnej</td><td>5000,00 zł</td><td>1150,00 zł</td><td>6150,00 zł</td></tr>
<tr><td>Razem do zapłaty</td><td>5000,00 zł</td><td>1150,00 zł</td><td>6150,00 zł</td></tr>
</tbody>
</table>
<p>Wzór jest zawsze ten sam: <strong>brutto = netto + (netto × stawka VAT)</strong>. Przy 23% mnożysz netto przez 1,23. Gdybyś rozliczał tę samą usługę jako zwolniony z VAT, w tabeli nie byłoby kolumny podatku, a kwota do zapłaty wynosiłaby 5000 zł — dokładnie tyle co netto.</p>

<h2>Faktura z VAT i bez VAT</h2>
<p>Kluczowa różnica na fakturze zależy od tego, czy jesteś czynnym podatnikiem VAT, czy korzystasz ze zwolnienia. Wielu freelancerów na początku działalności jest zwolnionych z VAT — najczęściej ze względu na limit obrotu (zwolnienie podmiotowe) lub rodzaj wykonywanych usług.</p>
<ul>
<li><strong>Czynny podatnik VAT</strong> — na fakturze wykazujesz stawkę VAT (najczęściej 23%) i kwotę podatku, a kwota do zapłaty to netto plus VAT. Podatek odprowadzasz do urzędu.</li>
<li><strong>Zwolniony z VAT</strong> — wystawiasz fakturę bez kwoty VAT, z adnotacją wskazującą podstawę zwolnienia. Kwota do zapłaty równa się wtedy kwocie netto.</li>
</ul>
<p>Wybór statusu VAT ma konsekwencje wykraczające poza samą fakturę — wpływa na ceny, rozliczenia i możliwość odliczania podatku od zakupów. Decyzję warto skonsultować z księgową, bo zależy od skali i charakteru Twojej działalności.</p>
<p>Żeby zobaczyć różnicę na liczbach, weźmy tę samą usługę wycenioną na 4000 zł netto. Poniżej porównanie, jak wygląda faktura i kwota, którą realnie widzisz na koncie, w obu wariantach.</p>
<table>
<thead>
<tr><th>Element</th><th>Czynny podatnik VAT</th><th>Zwolniony z VAT</th></tr>
</thead>
<tbody>
<tr><td>Wartość netto</td><td>4000,00 zł</td><td>4000,00 zł</td></tr>
<tr><td>VAT 23%</td><td>920,00 zł</td><td>brak (adnotacja o zwolnieniu)</td></tr>
<tr><td>Kwota do zapłaty przez klienta</td><td>4920,00 zł</td><td>4000,00 zł</td></tr>
<tr><td>Co robisz z VAT</td><td>Odprowadzasz 920 zł do urzędu</td><td>Nie dotyczy</td></tr>
<tr><td>Odliczenie VAT od zakupów</td><td>Tak</td><td>Nie</td></tr>
</tbody>
</table>
<p>Ważne: dla klienta będącego firmą kwota VAT zwykle nie jest kosztem, bo on ją sobie odlicza. Dla klienta prywatnego (osoby fizycznej) różnica 920 zł to realnie wyższa cena — dlatego status VAT wpływa na to, dla kogo Twoja oferta jest atrakcyjniejsza.</p>

<h2>Terminy — kiedy wystawić fakturę</h2>
<p>Freelancerzy często mylą się w terminach, zakładając, że fakturę trzeba wystawić natychmiast po wykonaniu usługi. Zasada jest inna i daje trochę oddechu.</p>
<blockquote>Fakturę wystawiasz najpóźniej do 15. dnia miesiąca następującego po miesiącu, w którym wykonałeś usługę.</blockquote>
<p>Oznacza to, że za usługę wykonaną w marcu masz czas na wystawienie faktury do 15 kwietnia. Nie możesz jej też wystawić dowolnie wcześnie — co do zasady nie wcześniej niż 60 dni przed wykonaniem usługi lub otrzymaniem zapłaty. Osobną kwestią jest termin płatności, czyli data, do której klient ma uregulować należność — ten ustalasz w umowie i wpisujesz na fakturze (typowo 7, 14 lub 30 dni).</p>

<h3>Numeracja faktur</h3>
<p>Numery faktur muszą tworzyć ciąg — kolejny, unikalny i bez luk. Możesz przyjąć dowolny czytelny schemat, byle był konsekwentny przez cały rok. Popularne formaty to 1/2026, 2/2026 lub FV/01/2026. Najważniejsze zasady:</p>
<ol>
<li><strong>Ciągłość</strong> — numery idą po kolei, bez przeskoków i dziur w numeracji.</li>
<li><strong>Unikalność</strong> — żaden numer nie powtarza się w obrębie serii.</li>
<li><strong>Konsekwencja</strong> — trzymasz się jednego formatu przez cały okres rozliczeniowy.</li>
</ol>

<h2>Najczęstsze błędy przy wystawianiu faktur</h2>
<ul>
<li><strong>Brak NIP nabywcy.</strong> Przy sprzedaży dla firmy NIP kupującego jest niezbędny, by mogła zaksięgować koszt.</li>
<li><strong>Luki w numeracji.</strong> Przeskoki w numerach faktur to jedna z rzeczy, które od razu rzucają się w oczy przy kontroli.</li>
<li><strong>Poprawianie wystawionej faktury ręcznie.</strong> Wystawionej faktury nie usuwa się ani nie nadpisuje — błąd koryguje się fakturą korygującą.</li>
<li><strong>Zapominanie o dacie wykonania usługi.</strong> Gdy różni się od daty wystawienia, musi być podana osobno.</li>
<li><strong>Brak terminu i numeru rachunku.</strong> Formalnie faktura bywa ważna, ale w praktyce klient nie wie, kiedy i gdzie zapłacić.</li>
</ul>

<h2>Jak korygować błędną fakturę</h2>
<p>Jeśli po wystawieniu faktury zauważysz błąd — złą kwotę, pomyłkę w danych, niewłaściwą stawkę — nie usuwasz dokumentu i nie wystawiasz go od nowa z tym samym numerem. Do poprawy służy faktura korygująca, która odwołuje się do pierwotnej faktury i pokazuje, co i jak się zmienia. Dzięki temu w dokumentacji zostaje ślad zarówno oryginału, jak i korekty, co jest zgodne z zasadą ciągłości. Drobne omyłki formalne, jak literówka w nazwie, nabywca może z kolei poprawić notą korygującą.</p>

<h2>Warianty rozliczenia: godziny, projekt, abonament</h2>
<p>Sposób, w jaki opiszesz pozycję na fakturze, zależy od modelu rozliczenia. Trzy najczęstsze warianty u freelancerów wyglądają na fakturze różnie, mimo że kwota końcowa może być taka sama.</p>
<ul>
<li><strong>Stawka godzinowa.</strong> Ilość to liczba godzin, cena jednostkowa to stawka. Przy 40 godzinach po 120 zł netto wartość netto wynosi 4800 zł. Warto dołączyć rozpiskę godzin jako załącznik, żeby klient wiedział, za co płaci.</li>
<li><strong>Cena za projekt (ryczałt).</strong> Ilość to 1 usługa, cena jednostkowa równa się całości, np. 5000 zł netto. Prosto i przejrzyście, ale każdą zmianę zakresu trzeba rozliczyć osobną pozycją lub fakturą.</li>
<li><strong>Abonament miesięczny (retainer).</strong> Powtarzalna faktura na stałą kwotę, np. 2500 zł netto miesięcznie za opiekę nad stroną. Numeracja idzie dalej normalnie, a opis warto uzupełnić o miesiąc, którego dotyczy usługa.</li>
</ul>
<p>Przy rozliczeniu godzinowym łatwo o pomyłkę w liczbie godzin, dlatego dobrze mieć jedno wiarygodne źródło czasu pracy zamiast liczyć z pamięci. Jeśli pracujesz na godziny, przyda się też poradnik <a href="/poradniki/jak-liczyc-stawke-godzinowa-freelancer">jak wyliczyć stawkę godzinową freelancera</a>, żeby cena jednostkowa na fakturze faktycznie pokrywała Twoje koszty.</p>

<h2>Mini-case: pierwsza faktura krok po kroku</h2>
<p>Marta zaczyna jako copywriterka na działalności, zwolniona z VAT. Pierwsze zlecenie to seria tekstów na bloga za 1800 zł, usługę kończy 28 marca. Popełnia typowy błąd początkującego: wystawia fakturę 28 marca z numerem 1/2026, ale zapomina numeru rachunku i terminu płatności. Klient odpisuje „na jakie konto?” i płatność opóźnia się o tydzień. Poprawnie zrobiona faktura powinna zawierać: numer 1/2026, datę wystawienia, datę wykonania 28 marca, pozycję „Redakcja i copywriting — 6 artykułów”, kwotę 1800 zł, adnotację o zwolnieniu z VAT, numer rachunku i termin 14 dni. Wniosek: formalnie brakujące pola płatnicze nie unieważniają faktury, ale w praktyce to one decydują, czy pieniądze wpłyną na czas.</p>

<h2>Checklista przed wysłaniem faktury</h2>
<p>Zanim klikniesz „wyślij”, przejdź przez tę listę. Zajmuje minutę, a eliminuje 90% powodów, dla których faktura wraca do poprawki.</p>
<ol>
<li>Numer jest kolejny i nie powtarza żadnego z wcześniejszych.</li>
<li>NIP nabywcy się zgadza (sprawdź cyfry, literówka w NIP to najczęstsza przyczyna odrzucenia).</li>
<li>Data wykonania usługi jest podana, jeśli różni się od daty wystawienia.</li>
<li>Kwoty się liczą: wartość netto = ilość × cena, brutto = netto + VAT.</li>
<li>Jest numer rachunku, termin płatności i forma płatności.</li>
<li>Przy zwolnieniu z VAT widnieje adnotacja o podstawie zwolnienia.</li>
</ol>

<h2>Jak SzpontHub pomaga wystawiać faktury</h2>
<p>SzpontHub ma wbudowany moduł faktur z integracją Kugaru, dzięki czemu wystawisz fakturę bez ręcznego pilnowania każdego obowiązkowego pola i bez osobnego programu księgowego. Aplikacja dba o ciągłą numerację i przechowuje historię wystawionych dokumentów w jednym miejscu, obok Twoich portfeli i rozliczeń zleceń. Ponieważ faktury łączą się z resztą Twoich finansów, od razu widzisz, które są opłacone, a które czekają na płatność — bez przeklejania danych między arkuszami.</p>
`,
  faq: [
    {
      q: 'Jak wystawić fakturę jako freelancer krok po kroku?',
      a: 'Wpisz datę wystawienia i kolejny numer, dane obu stron z NIP, nazwę usługi, ilość i cenę jednostkową netto, wartość netto, stawkę i kwotę VAT lub adnotację o zwolnieniu oraz kwotę do zapłaty. Dodaj numer rachunku i termin płatności. Fakturę wystaw najpóźniej do 15. dnia miesiąca po wykonaniu usługi.',
    },
    {
      q: 'Co musi zawierać faktura freelancera?',
      a: 'Datę wystawienia, kolejny numer, dane sprzedawcy i nabywcy z NIP, datę wykonania usługi, nazwę usługi, ilość, cenę jednostkową netto, wartość netto, stawkę i kwotę VAT oraz kwotę brutto do zapłaty. W praktyce dodaje się też numer rachunku i termin płatności, bez których klient nie wie, kiedy i gdzie zapłacić.',
    },
    {
      q: 'Do kiedy trzeba wystawić fakturę?',
      a: 'Najpóźniej do 15. dnia miesiąca następującego po miesiącu, w którym wykonałeś usługę. Za usługę z marca masz więc czas do 15 kwietnia. Osobną sprawą jest termin płatności, czyli data uregulowania należności przez klienta, który ustalasz w umowie i wpisujesz na fakturze.',
    },
    {
      q: 'Czy freelancer zwolniony z VAT wystawia fakturę?',
      a: 'Tak, ale wystawia fakturę bez kwoty VAT, z adnotacją wskazującą podstawę zwolnienia. Kwota do zapłaty równa się wtedy kwocie netto. Zwolnienie wynika najczęściej z limitu obrotu lub rodzaju usług, a jego wybór warto skonsultować z księgową.',
    },
    {
      q: 'Jak poprawić błąd na wystawionej fakturze?',
      a: 'Nie usuwasz faktury ani jej nie nadpisujesz. Błąd w kwocie, stawce lub danych poprawiasz fakturą korygującą, która odwołuje się do pierwotnego dokumentu i pokazuje zmianę. Drobne omyłki formalne, jak literówka w nazwie, nabywca może poprawić notą korygującą.',
    },
    {
      q: 'Jak numerować faktury?',
      a: 'Numery muszą być kolejne, unikalne i bez luk, na przykład 1/2026, 2/2026 lub FV/01/2026. Trzymaj się jednego formatu przez cały okres rozliczeniowy. Przeskoki i dziury w numeracji od razu rzucają się w oczy przy kontroli, dlatego ciągłość jest tu kluczowa.',
    },
  ],
};

export default article;
