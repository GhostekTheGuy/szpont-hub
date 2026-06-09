/**
 * Centralna konfiguracja SEO / brandingu serwisu.
 * Wszystkie metadane, sitemap, robots i dane strukturalne korzystają z tych wartości,
 * dzięki czemu w Google konsekwentnie prezentuje się domena szponthub.pl.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://szponthub.pl'
).replace(/\/$/, '');

export const SITE_NAME = '$zpont Hub';
export const SITE_NAME_PLAIN = 'SzpontHub';

export const SITE_TITLE_DEFAULT =
  '$zpont Hub — finanse, nawyki i kalendarz pracy w jednym miejscu';

export const SITE_DESCRIPTION =
  'SzpontHub ($zpont Hub) to aplikacja do zarządzania finansami osobistymi: portfele w wielu walutach, aktywa, nawyki finansowe oraz kalendarz pracy ze śledzeniem czasu — wszystko zsynchronizowane, zaszyfrowane i gotowe do analizy.';

export const SITE_KEYWORDS = [
  'SzpontHub',
  'Szpont Hub',
  'szponthub',
  'szponthub.pl',
  '$zpont Hub',
  'zarządzanie finansami',
  'finanse osobiste',
  'aplikacja do finansów',
  'budżet domowy',
  'portfel wielowalutowy',
  'nawyki finansowe',
  'kalendarz pracy',
  'śledzenie czasu pracy',
  'aplikacja dla freelancera',
  'kontrola wydatków',
];

/** Główny obraz Open Graph / Twitter (1200×630 zalecane). */
export const SITE_OG_IMAGE = '/hero-dashboard.png';
