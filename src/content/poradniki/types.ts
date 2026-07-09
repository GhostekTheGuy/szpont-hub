// Model danych bazy wiedzy /poradniki.
// Każdy artykuł to obiekt TS (frontmatter + treść jako semantyczny HTML) w tym katalogu.
// Treść jest autorska (nasza), dlatego bodyHtml renderujemy przez dangerouslySetInnerHTML.

export type CategorySlug =
  | 'finanse-osobiste'
  | 'freelancer'
  | 'inwestycje'
  | 'produktywnosc';

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Krótki opis kategorii (używany na liście i w metadanych). */
  description: string;
  /** Emoji/ikona tekstowa do karty kategorii. */
  emoji: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Article {
  /** Unikalny slug URL (kebab-case, bez polskich znaków). */
  slug: string;
  /** Tytuł H1 artykułu. */
  title: string;
  /** Opcjonalny override znacznika <title> (domyślnie = title). */
  metaTitle?: string;
  /** Meta description, 150–160 znaków, po polsku. */
  description: string;
  category: CategorySlug;
  tags: string[];
  /** 2–4 zdania streszczenia na górze artykułu (pod GEO — cytowalne przez LLM-y). */
  tldr: string;
  /** 3–6 kluczowych wniosków w punktach (pod GEO). */
  keyTakeaways: string[];
  /** Treść jako semantyczny HTML: <h2>, <h3>, <p>, <ul>, <ol>, <table>, <blockquote>. */
  bodyHtml: string;
  /** 5–7 pytań i odpowiedzi (renderowane jako sekcja + FAQPage JSON-LD). */
  faq: FaqItem[];
  /** Data publikacji w formacie ISO (YYYY-MM-DD). */
  published: string;
  /** Opcjonalna data aktualizacji (YYYY-MM-DD). */
  updated?: string;
  /** Szacowany czas czytania w minutach. */
  readingMinutes: number;
}
