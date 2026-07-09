import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  articles,
  getArticleBySlug,
  getAllSlugs,
  getRelatedArticles,
  CATEGORY_MAP,
} from '@/content/poradniki';
import { SITE_URL, SITE_NAME, SITE_OG_IMAGE } from '@/lib/site';

interface Props {
  // Next 16: params jest asynchroniczne i musi być awaitowane.
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  const url = `${SITE_URL}/poradniki/${article.slug}`;
  return {
    title: article.metaTitle ?? article.title,
    description: article.description,
    alternates: { canonical: `/poradniki/${article.slug}` },
    openGraph: {
      type: 'article',
      url,
      title: `${article.title} | ${SITE_NAME}`,
      description: article.description,
      publishedTime: article.published,
      modifiedTime: article.updated ?? article.published,
      authors: [SITE_NAME],
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

/** Owija tabele w kontener z poziomym przewijaniem (dla wąskich ekranów). */
function withResponsiveTables(html: string): string {
  return html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = CATEGORY_MAP[article.category];
  const related = getRelatedArticles(article, 3);
  const url = `${SITE_URL}/poradniki/${article.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: article.title,
        description: article.description,
        inLanguage: 'pl-PL',
        datePublished: article.published,
        dateModified: article.updated ?? article.published,
        author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: { '@id': `${SITE_URL}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: `${SITE_URL}${SITE_OG_IMAGE}`,
        articleSection: category?.name,
        keywords: article.tags.join(', '),
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: article.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Strona główna', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Poradniki', item: `${SITE_URL}/poradniki` },
          { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
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
        <div className="mx-auto flex h-14 max-w-3xl items-center px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground hover:text-violet-400 transition-colors"
          >
            $zpont Hub
          </Link>
          <span className="mx-3 text-border/60">/</span>
          <Link
            href="/poradniki"
            className="text-sm text-muted-foreground hover:text-violet-400 transition-colors"
          >
            Poradniki
          </Link>
          <Link
            href="/poradniki"
            className="ml-auto text-xs text-muted-foreground hover:text-violet-400 transition-colors"
          >
            &larr; Wszystkie
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <article>
          {/* Nagłówek */}
          <div className="mb-8">
            <Link
              href={`/poradniki#${category?.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4 hover:text-violet-300 transition-colors"
            >
              <span aria-hidden="true">{category?.emoji}</span>
              {category?.name}
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4 text-balance leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <time dateTime={article.published}>{formatDate(article.published)}</time>
              <span aria-hidden="true">·</span>
              <span>{article.readingMinutes} min czytania</span>
            </div>
          </div>

          {/* TL;DR — pod GEO */}
          <div className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-5 mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
              W skrócie
            </p>
            <p className="text-sm text-foreground leading-relaxed">{article.tldr}</p>
          </div>

          {/* Kluczowe wnioski */}
          {article.keyTakeaways.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card/40 p-5 mb-10">
              <p className="text-sm font-bold text-foreground mb-3">Najważniejsze wnioski</p>
              <ul className="flex flex-col gap-2">
                {article.keyTakeaways.map((t, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-1 text-violet-400 shrink-0" aria-hidden="true">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treść */}
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: withResponsiveTables(article.bodyHtml) }}
          />

          {/* FAQ */}
          {article.faq.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-6">
                Najczęściej zadawane pytania
              </h2>
              <div className="flex flex-col gap-3">
                {article.faq.map((f, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border border-border/50 bg-card/40 p-5"
                  >
                    <summary className="cursor-pointer list-none font-semibold text-foreground flex items-center justify-between gap-3">
                      {f.q}
                      <span className="text-muted-foreground group-open:rotate-45 transition-transform shrink-0" aria-hidden="true">+</span>
                    </summary>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-14 rounded-3xl border border-violet-500/30 bg-violet-500/5 p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Ogarnij finanse w jednym miejscu
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
              Portfele wielowalutowe, transakcje, faktury, nawyki i kalendarz pracy — z
              szyfrowaniem i raportami AI. SzpontHub jest darmowy na start.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              Załóż darmowe konto
            </Link>
          </div>
        </article>

        {/* Powiązane */}
        {related.length > 0 && (
          <aside className="mt-16 border-t border-border/40 pt-10">
            <h2 className="text-lg font-bold text-foreground mb-5">Zobacz również</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/poradniki/${r.slug}`}
                  className="group rounded-2xl border border-border/50 bg-card/40 p-4 hover:border-violet-500/50 transition-colors"
                >
                  <div className="text-xs text-violet-400 mb-1.5">
                    {CATEGORY_MAP[r.category]?.name}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-violet-300 transition-colors">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
