import type { Article, CategorySlug } from './types';
import { CATEGORIES, CATEGORY_MAP } from './categories';

// Rejestr wszystkich artykułów. Każdy plik domyślnie eksportuje obiekt Article.
import a1 from './poduszka-finansowa-ile-odkladac';
import a2 from './metoda-kopertowa-jak-zaczac';
import a3 from './zasada-50-30-20-budzet';
import a4 from './jak-oszczedzac-pieniadze-sposoby';
import a5 from './budzet-domowy-jak-prowadzic';
import a6 from './jak-kontrolowac-wydatki';
import a7 from './portfel-wielowalutowy-jak-zarzadzac';
import a8 from './jak-oszczedzac-przy-niskich-zarobkach';
import a9 from './fundusz-awaryjny-vs-poduszka';
import a10 from './jak-splacic-dlugi-kula-sniezna';
import a11 from './inflacja-jak-chronic-oszczednosci';
import a12 from './jak-planowac-wydatki-miesieczne';
import a13 from './konto-oszczednosciowe-czy-lokata';
import a14 from './jak-ograniczyc-subskrypcje';
import a15 from './budzetowanie-zerowe';
import a16 from './jak-zaoszczedzic-na-jedzeniu';
import a17 from './wspolny-budzet-w-zwiazku';
import a18 from './jak-uczyc-dzieci-oszczedzania';
import a19 from './finanse-po-utracie-pracy';
import a20 from './jak-obliczyc-wartosc-netto';
import a21 from './comiesieczny-przeglad-finansow';
import a22 from './jak-oszczedzac-na-rachunkach';
import a23 from './cele-finansowe-jak-wyznaczac';
import a24 from './gotowka-czy-karta-kontrola-wydatkow';
import a25 from './jak-zbudowac-nawyk-oszczedzania';
import a26 from './rrso-jak-czytac-koszt-kredytu';
import a27 from './ubezpieczenia-ktore-sa-potrzebne';
import a28 from './zdolnosc-kredytowa-jak-obliczyc';
import a29 from './ulgi-podatkowe-pit-jak-rozliczyc';

import b1 from './jak-liczyc-stawke-godzinowa-freelancer';
import b2 from './jak-wystawic-fakture-freelancer';
import b3 from './sledzenie-czasu-pracy-freelancer';
import b4 from './jak-wycenic-projekt';
import b5 from './faktura-a-rachunek-roznice';
import b6 from './dzialalnosc-nierejestrowana-limit';
import b7 from './ryczalt-czy-podatek-liniowy-freelancer';
import b8 from './jak-rozliczac-zagranicznych-klientow';
import b9 from './zus-dla-freelancera';
import b10 from './jak-zarzadzac-nieregularnym-dochodem';
import b11 from './jak-zabezpieczyc-sie-przed-nieplacacym-klientem';
import b12 from './koszty-uzyskania-przychodu-freelancer';
import b13 from './jak-prowadzic-wiele-zlecen-naraz';
import b14 from './umowa-z-klientem-co-zawiera';
import b15 from './jak-ustalic-warunki-platnosci';
import b16 from './samozatrudnienie-vs-etat-finanse';
import b17 from './jak-legalnie-obnizyc-podatki-freelancer';
import b18 from './faktura-proforma-kiedy-stosowac';
import b19 from './jak-liczyc-rentownosc-zlecenia';
import b20 from './portfolio-freelancera-jak-zbudowac';
import b21 from './jak-podniesc-stawki-klientom';
import b22 from './faktura-walutowa-przeliczanie-kursu';
import b23 from './jak-planowac-podatki-freelancer';
import b24 from './b2b-czy-umowa-zlecenie';
import b25 from './jak-zorganizowac-finanse-freelancera';
import b26 from './vat-dla-freelancera-kiedy-rejestracja';
import b27 from './konto-firmowe-dla-freelancera';

import c1 from './podatek-belki-jak-obliczyc';
import c2 from './procent-skladany-jak-dziala';
import c3 from './jak-zaczac-inwestowac-male-kwoty';
import c4 from './dywersyfikacja-portfela-inwestycyjnego';
import c5 from './etf-dla-poczatkujacych';
import c6 from './akcje-czy-obligacje';
import c7 from './jak-inwestowac-w-krypto-bezpiecznie';
import c8 from './ike-czy-ikze';
import c9 from './jak-obliczyc-zysk-z-inwestycji';
import c10 from './usrednianie-ceny-dca';
import c11 from './jak-rozliczyc-podatek-od-krypto';
import c12 from './ryzyko-inwestycyjne-jak-oceniac';
import c13 from './lokata-vs-inwestycja';
import c14 from './jak-sledzic-portfel-inwestycyjny';
import c15 from './obligacje-skarbowe-antyinflacyjne';
import c16 from './jak-nie-panikowac-przy-spadkach';
import c17 from './wartosc-pieniadza-w-czasie';
import c18 from './jak-inwestowac-dlugoterminowo';
import c19 from './bledy-poznawcze-inwestora';
import c20 from './jak-obliczyc-cost-basis';
import c21 from './reinwestowanie-dywidend';
import c22 from './ile-inwestowac-miesiecznie';
import c23 from './zloto-jako-inwestycja';
import c24 from './jak-zbudowac-pierwszy-portfel';
import c25 from './fire-wczesna-wolnosc-finansowa';
import c26 from './nieruchomosci-na-wynajem-jako-inwestycja';
import c27 from './obligacje-korporacyjne-ryzyko';

import d1 from './nawyki-finansowe-jak-budowac';
import d2 from './planowanie-tygodnia-pracy';
import d3 from './jak-sledzic-nawyki';
import d4 from './time-blocking-blokowanie-czasu';
import d5 from './cele-metoda-smart';
import d6 from './regula-dwoch-minut';
import d7 from './kalendarz-pracy-jak-organizowac';
import d8 from './jak-utrzymac-serie-streak';
import d9 from './gleboka-praca-deep-work';
import d10 from './jak-planowac-dzien';
import d11 from './przeglad-tygodnia-weekly-review';
import d12 from './jak-walczyc-z-prokrastynacja';
import d13 from './system-gtd-wprowadzenie';
import d14 from './jak-mierzyc-produktywnosc';
import d15 from './rutyna-poranna-produktywnosc';
import d16 from './habit-stacking-laczenie-nawykow';
import d17 from './technika-pomodoro';
import d18 from './jak-planowac-cele-roczne';
import d19 from './ile-trwa-zbudowanie-nawyku';
import d20 from './minimalizm-cyfrowy-produktywnosc';
import d21 from './jak-nie-tracic-czasu-audyt-dnia';
import d22 from './jak-laczyc-prace-z-finansami';
import d23 from './zarzadzanie-energia-nie-czasem';
import d24 from './jak-utrzymac-motywacje';
import d25 from './rytm-tygodniowy-freelancera';
import d26 from './wypalenie-zawodowe-jak-zapobiegac';
import d27 from './metoda-eisenhowera-priorytety';

const rawArticles: Article[] = [
  a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25, a26, a27, a28, a29,
  b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27,
  c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19, c20, c21, c22, c23, c24, c25, c26, c27,
  d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27,
];

/** Wszystkie artykuły, posortowane od najnowszych, a przy równej dacie — alfabetycznie. */
export const articles: Article[] = [...rawArticles].sort(
  (a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title),
);

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}

export function getArticlesByCategory(category: CategorySlug): Article[] {
  return articles.filter((a) => a.category === category);
}

/** Artykuły powiązane: najpierw z tej samej kategorii, potem uzupełnione pozostałymi. */
export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const sameCategory = articles.filter(
    (a) => a.slug !== article.slug && a.category === article.category,
  );
  const others = articles.filter(
    (a) => a.slug !== article.slug && a.category !== article.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export { CATEGORIES, CATEGORY_MAP };
export type { Article, CategorySlug };
