import Link from 'next/link';
import type { Metadata } from 'next';
import { articles, CATEGORIES, getArticlesByCategory } from '@/content/poradniki';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const TITLE = 'Poradniki — finanse, freelancing, inwestycje i produktywność';
const DESCRIPTION =
  'Baza wiedzy SzpontHub: praktyczne poradniki o finansach osobistych, rozliczeniach freelancera, inwestycjach i produktywności. Konkretne wzory, przykłady i checklisty.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/poradniki' },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/poradniki`,
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

export default function PoradnikiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/poradniki#page`,
        url: `${SITE_URL}/poradniki`,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: 'pl-PL',
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Strona główna', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Poradniki', item: `${SITE_URL}/poradniki` },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: articles.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/poradniki/${a.slug}`,
          name: a.title,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground hover:text-violet-400 transition-colors"
          >
            $zpont Hub
          </Link>
          <span className="mx-3 text-border/60">/</span>
          <span className="text-sm text-muted-foreground">Poradniki</span>
          <Link
            href="/"
            className="ml-auto text-xs text-muted-foreground hover:text-violet-400 transition-colors"
          >
            &larr; Powrót
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-14">
        {/* Hero */}
        <header className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-400 mb-3">
            Baza wiedzy
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4 text-balance">
            Poradniki o finansach, freelancingu i produktywności
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Praktyczne przewodniki oparte na konkretach — wzory, przykładowe wyliczenia i
            checklisty, które od razu zastosujesz w budżecie, rozliczeniach i planowaniu.
          </p>
        </header>

        {/* Kategorie */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
          {CATEGORIES.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="rounded-2xl border border-border/50 bg-card/50 p-4 hover:border-violet-500/50 transition-colors"
            >
              <div className="text-2xl mb-2" aria-hidden="true">{c.emoji}</div>
              <div className="font-semibold text-foreground text-sm">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {getArticlesByCategory(c.slug).length} poradników
              </div>
            </a>
          ))}
        </div>

        {/* Sekcje wg kategorii */}
        <div className="flex flex-col gap-14">
          {CATEGORIES.map((c) => {
            const list = getArticlesByCategory(c.slug);
            if (list.length === 0) return null;
            return (
              <section key={c.slug} id={c.slug} className="scroll-mt-20">
                <div className="flex items-baseline gap-3 mb-5">
                  <h2 className="text-xl font-bold text-foreground">
                    <span className="mr-2" aria-hidden="true">{c.emoji}</span>
                    {c.name}
                  </h2>
                  <span className="text-sm text-muted-foreground">{list.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/poradniki/${a.slug}`}
                      className="group rounded-2xl border border-border/50 bg-card/40 p-5 hover:border-violet-500/50 hover:bg-card/70 transition-colors"
                    >
                      <h3 className="font-semibold text-foreground leading-snug group-hover:text-violet-300 transition-colors text-balance">
                        {a.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                        {a.description}
                      </p>
                      <div className="text-xs text-muted-foreground/70 mt-3">
                        {a.readingMinutes} min czytania
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-3xl border border-violet-500/30 bg-violet-500/5 p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Zastosuj wiedzę w praktyce
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
            SzpontHub łączy portfele, transakcje, faktury, nawyki i kalendarz pracy w jednym
            miejscu — z szyfrowaniem i raportami. Zacznij za darmo.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
          >
            Załóż darmowe konto
          </Link>
        </div>
      </main>
    </div>
  );
}
