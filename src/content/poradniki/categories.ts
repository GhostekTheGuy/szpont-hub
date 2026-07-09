import type { Category, CategorySlug } from './types';

export const CATEGORIES: Category[] = [
  {
    slug: 'finanse-osobiste',
    name: 'Finanse osobiste',
    description:
      'Budżet domowy, oszczędzanie, poduszka finansowa, kontrola wydatków i portfele wielowalutowe.',
    emoji: '💰',
  },
  {
    slug: 'freelancer',
    name: 'Freelancer i B2B',
    description:
      'Rozliczenia freelancera, faktury, stawki godzinowe, śledzenie czasu pracy, podatki i składki.',
    emoji: '🧾',
  },
  {
    slug: 'inwestycje',
    name: 'Inwestycje i aktywa',
    description:
      'Podatek Belki, akcje i krypto, procent składany, dywersyfikacja oraz wartość netto.',
    emoji: '📈',
  },
  {
    slug: 'produktywnosc',
    name: 'Produktywność i nawyki',
    description:
      'Nawyki finansowe, planowanie tygodnia, kalendarz pracy i systemy śledzenia celów.',
    emoji: '🎯',
  },
];

export const CATEGORY_MAP: Record<CategorySlug, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.slug] = c;
    return acc;
  },
  {} as Record<CategorySlug, Category>,
);
