import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import {
  getAllWords,
  getWordsByTag,
  getProverbs,
  getWordCategories,
  getPhraseCategories,
  getPhrasesByCategory,
  isWordWorthy,
  isPhraseWorthy,
} from '@/lib/dictionary';
import canonicalOverrides from '@/data/canonical-overrides.json';

const HOME_CANONICAL_OVERRIDES = canonicalOverrides as Record<string, string>;
import HomeHero from './_home/HomeHero';
import WordOfTheDay from './_home/WordOfTheDay';
import CategoryGrid from './_home/CategoryGrid';
import FirstDaySection from './_home/FirstDaySection';
import PhrasebookSection from './_home/PhrasebookSection';
import WisdomSection from './_home/WisdomSection';
import RecentlyViewed from '@/components/RecentlyViewed';
import NewsletterSignup from '@/components/NewsletterSignup';
import { dayIndex, pickByDay } from './_home/util';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations('site');
  return {
    title: `${t('name')} — ${t('tagline')}`,
    description: t('description'),
    alternates: {
      canonical: 'https://darija.io',
      languages: {
        en: 'https://darija.io',
        fr: 'https://darija.io',
        'x-default': 'https://darija.io',
      },
    },
    openGraph: {
      title: t('name'),
      description: t('description'),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
  };
}

export default async function HomePage() {
  // All data fetched server-side — no client API calls on first paint
  const [allWords, essentials, proverbs, wordCategories, phraseCategories, survivalPhrases] =
    await Promise.all([
      getAllWords(),
      getWordsByTag('essential'),
      getProverbs(),
      getWordCategories(),
      getPhraseCategories(),
      getPhrasesByCategory('survival'),
    ]);

  // Only ever surface — and link to — words/phrases that are prerendered
  // and aren't canonicalized away. Otherwise the homepage renders inbound
  // links to 404 / duplicate URLs that drag indexing health down.
  const linkable = (w: { id: string }) =>
    !HOME_CANONICAL_OVERRIDES[w.id];

  // Word of the day — deterministic per day, only words with cultural notes
  // (and worthy + non-duplicate, since this links into /word/[id]).
  const withNotes = allWords.filter(
    w => w.cultural_note && isWordWorthy(w) && linkable(w)
  );
  const wotd = withNotes.length > 0 ? withNotes[dayIndex() % withNotes.length] : null;

  // First-day picks: 8 essentials, rotated daily for freshness
  const firstDayPicks = pickByDay(
    essentials.filter(w => isWordWorthy(w) && linkable(w)),
    8
  );

  // Featured phrases: 4 survival phrases, rotated daily
  const featuredPhrases = pickByDay(survivalPhrases.filter(isPhraseWorthy), 4);

  const worthyProverbs = proverbs.filter(isPhraseWorthy);

  return (
    <>
      <HomeHero />
      <RecentlyViewed />
      {wotd && <WordOfTheDay word={wotd} />}
      <CategoryGrid wordCategories={wordCategories} phraseCategories={phraseCategories} />
      <FirstDaySection words={firstDayPicks} />
      <PhrasebookSection phrases={featuredPhrases} />
      {worthyProverbs.length > 0 && <WisdomSection proverbs={worthyProverbs.slice(0, 6)} />}
      <NewsletterSignup />
    </>
  );
}
