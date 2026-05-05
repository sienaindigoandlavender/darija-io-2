import { getWordById, getAllWords, getWordsByRoot } from '@/lib/dictionary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import AudioButton from '@/components/AudioButton';
import RecentTracker from '@/components/RecentTracker';

const SITE_URL = 'https://darija.io';

// Per-id title overrides (uses absolute title to bypass the global template).
const WORD_TITLE_OVERRIDES: Record<string, string> = {
  'verbs-00900': 'T3awn — "To Help" in Moroccan Darija | darija.io',
};

export async function generateStaticParams() {
  const words = await getAllWords();
  return words.map(w => ({ id: w.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const word = await getWordById(params.id);
  if (!word) return { title: 'Word Not Found' };

  const isThin =
    !word.cultural_note &&
    (!word.examples || word.examples.length === 0) &&
    !word.audio_url &&
    !(word.tags || []).some((t: string) =>
      ['essential', 'first-day', 'common', 'basic', 'survival'].includes(t)
    );

  const locale = await getLocale();
  const meaning = locale === 'fr' && word.french ? word.french : word.english;

  const overrideTitle = WORD_TITLE_OVERRIDES[params.id];
  const title = `${word.darija} (${word.arabic}) — ${meaning} in Darija`;
  const description = `How to say "${word.english}" in Moroccan Arabic: ${word.darija} (${word.arabic}). Pronounced /${word.pronunciation}/. ${word.french ? `French: ${word.french}.` : ''} ${word.cultural_note ? word.cultural_note.slice(0, 120) : ''}`;
  const url = `${SITE_URL}/word/${word.id}`;

  return {
    title: overrideTitle ? { absolute: overrideTitle } : title,
    description,
    robots: isThin ? { index: false, follow: true } : undefined,
    openGraph: {
      title: overrideTitle || title,
      description,
      url,
      // images intentionally omitted — Next auto-uses opengraph-image.tsx
      // in this segment, which generates a per-word card.
    },
    alternates: {
      canonical: url,
      languages: { en: url, fr: url, 'x-default': url },
    },
  };
}

export default async function WordPage({ params }: { params: { id: string } }) {
  const word = await getWordById(params.id);
  if (!word) notFound();

  const t = await getTranslations('word');
  const locale = await getLocale();
  const meaning = locale === 'fr' && word.french ? word.french : word.english;
  const secondary = locale === 'fr' ? word.english : word.french;

  // Same-root words (only fetched if word.root is set)
  const sameRoot = word.root ? await getWordsByRoot(word.root, word.id) : [];

  const url = `${SITE_URL}/word/${word.id}`;

  // JSON-LD: DefinedTerm, with optional AudioObject when audio_url is present
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: word.darija,
    alternateName: [word.arabic, ...(word.arabizi_variants ?? [])],
    description: word.english,
    inLanguage: 'ar',
    url,
    dateModified: new Date().toISOString().split('T')[0],
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Everyday Darija Dictionary',
      url: SITE_URL,
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'pronunciation', value: word.pronunciation },
      { '@type': 'PropertyValue', name: 'french', value: word.french },
      { '@type': 'PropertyValue', name: 'category', value: word.category },
      { '@type': 'PropertyValue', name: 'part_of_speech', value: word.part_of_speech },
      ...(word.gender ? [{ '@type': 'PropertyValue', name: 'gender', value: word.gender }] : []),
      ...(word.root ? [{ '@type': 'PropertyValue', name: 'root', value: word.root }] : []),
      ...(word.cultural_note ? [{ '@type': 'PropertyValue', name: 'cultural_note', value: word.cultural_note }] : []),
    ],
  };

  if (word.audio_url) {
    jsonLd.audio = {
      '@type': 'AudioObject',
      contentUrl: word.audio_url,
      encodingFormat: 'audio/mpeg',
      inLanguage: 'ar-MA',
      name: `${word.darija} pronunciation`,
    };
  }

  // FAQ schema for "how do you say X in Darija" — only emitted when we
  // have real Q&A content (gate prevents empty FAQPage from reaching GSC).
  const faqQuestions = word.english
    ? [{
        '@type': 'Question' as const,
        name: `How do you say "${word.english}" in Moroccan Arabic (Darija)?`,
        acceptedAnswer: {
          '@type': 'Answer' as const,
          text: `In Darija (Moroccan Arabic), "${word.english}" is "${word.darija}" (${word.arabic}), pronounced /${word.pronunciation}/.${word.french ? ` In French: ${word.french}.` : ''}${word.cultural_note ? ` ${word.cultural_note}` : ''}`,
        },
      }]
    : [];

  const faqLd = faqQuestions.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqQuestions,
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}
      <RecentTracker kind="word" id={word.id} label={word.darija} sub={meaning} />

      <div className="min-h-screen">
        <section className="px-6 md:px-[8%] lg:px-[12%] pt-20 pb-4 md:pb-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-2 -my-2">
              &larr; {t('back')}
            </Link>
            {word.category && (
              <Link
                href={`/category/${word.category}`}
                className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-2 -my-2"
              >
                {word.category}
              </Link>
            )}
          </div>
        </section>

        <section className="px-6 md:px-[8%] lg:px-[12%] pb-16 md:pb-20">
          <div className="grid md:grid-cols-12 gap-12 md:gap-16">
            {/* Left: The word */}
            <div className="md:col-span-6">
              <span className="font-arabic text-6xl md:text-7xl lg:text-8xl text-[#c53a1a] block leading-tight mb-4" dir="rtl" lang="ar">
                {word.arabic}
              </span>

              <div className="flex items-center gap-4 mb-6">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl">{word.darija}</h1>
                <AudioButton src={word.audio_url} />
              </div>

              <p className="text-neutral-500 text-lg mb-2 font-mono">/{word.pronunciation}/</p>

              {word.arabizi_variants && word.arabizi_variants.length > 0 && (
                <p className="text-sm text-neutral-400 mt-1">
                  <span className="uppercase tracking-wider text-xs mr-2">{t('alsoWritten')}</span>
                  {word.arabizi_variants.join(' · ')}
                </p>
              )}

              <div className="flex items-baseline gap-3 mt-6">
                <p className="text-neutral-900 text-2xl">{meaning}</p>
              </div>
              {secondary && <p className="text-neutral-500 mt-2">{secondary}</p>}

              <div className="flex flex-wrap gap-3 mt-8">
                {word.part_of_speech && (
                  <span className="text-xs uppercase tracking-wider text-neutral-500 border border-neutral-200 px-3 py-1">
                    {word.part_of_speech}
                  </span>
                )}
                {word.gender && (
                  <span className="text-xs uppercase tracking-wider text-neutral-500 border border-neutral-200 px-3 py-1">
                    {word.gender}
                  </span>
                )}
                {word.register !== 'universal' && word.register && (
                  <span className="text-xs uppercase tracking-wider text-neutral-500 border border-neutral-200 px-3 py-1">
                    {word.register}
                  </span>
                )}
                {word.root && (
                  <span className="text-xs uppercase tracking-wider text-neutral-500 border border-neutral-200 px-3 py-1 font-mono">
                    √ {word.root}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Context */}
            <div className="md:col-span-5 md:col-start-8 flex flex-col gap-10">
              {word.cultural_note && (
                <div className="border-l-2 border-[#d4931a] pl-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d4931a] mb-3">{t('culturalNote')}</p>
                  <p className="text-neutral-900 leading-relaxed text-lg">{word.cultural_note}</p>
                </div>
              )}

              {word.examples?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">{t('examples')}</p>
                  {word.examples.map((ex, i) => (
                    <div key={i} className="space-y-1 mb-5">
                      <p className="font-arabic text-xl text-black" dir="rtl" lang="ar">{ex.arabic}</p>
                      <p className="text-neutral-900">{ex.darija}</p>
                      <p className="text-sm text-neutral-500">
                        {locale === 'fr' && ex.french ? ex.french : ex.english}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {word.conjugation?.past && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">{t('conjugation')}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {Object.entries(word.conjugation.past).map(([k, v]) => (
                      <div key={k} className="flex gap-3">
                        <span className="text-neutral-500 w-12">{k}</span>
                        <span className="text-neutral-900">{v as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sameRoot.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                    {t('sameRoot')} <span className="font-mono">√ {word.root}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sameRoot.map(rw => (
                      <Link
                        key={rw.id}
                        href={`/word/${rw.id}`}
                        className="text-sm border border-neutral-200 px-3 py-2.5 hover:border-[#c53a1a] hover:text-[#c53a1a] transition-colors"
                      >
                        {rw.darija}
                        <span className="text-neutral-400 ml-2">{locale === 'fr' && rw.french ? rw.french : rw.english}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SEO text block — visible to crawlers and helpful to readers */}
        <section className="px-6 md:px-[8%] lg:px-[12%] py-12 md:py-16 border-t border-neutral-100">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl mb-4">
              {t('howToSayTitle', { english: word.english })}
            </h2>
            <p className="text-neutral-900 leading-relaxed">
              {t.rich('howToSayBody', {
                english: word.english,
                darija: word.darija,
                arabic: word.arabic,
                pronunciation: word.pronunciation,
              })}
              {word.french && locale !== 'fr' ? ` The French equivalent is "${word.french}." ` : ''}
              {word.cultural_note ? ` ${word.cultural_note}` : ''}
            </p>

            {/* Ecosystem link */}
            <div className="mt-12 pt-6 border-t border-neutral-200">
              <p className="text-xs text-neutral-400">
                Travelling to Morocco?{' '}
                <a
                  href="https://www.slowmorocco.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-neutral-600 transition-colors"
                >
                  Slow Morocco
                </a>{' '}and{' '}
                <a
                  href="https://derb.so"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-neutral-600 transition-colors"
                >
                  Derb
                </a>{' '}explain the context behind the words.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
