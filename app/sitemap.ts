import { MetadataRoute } from 'next';
import words from '@/data/words.json';
import phrases from '@/data/phrases.json';
import { getPrioritizedHowToSaySlugs, slugifyTerm } from '@/lib/howToSay';
import {
  isWordWorthy,
  isPhraseWorthy,
  type DarijaWord,
  type DarijaPhrase,
} from '@/lib/dictionary';

const SITE_URL = 'https://darija.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/grammar`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/first-day`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/practice`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/how-to-say`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const howToSayTerms = getPrioritizedHowToSaySlugs(500);
  const seenSlugs = new Set<string>();
  const howToSayPages: MetadataRoute.Sitemap = [];
  for (const term of howToSayTerms) {
    const slug = slugifyTerm(term);
    if (!slug || seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    howToSayPages.push({
      url: `${SITE_URL}/how-to-say/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }
  // Manually-added Darija-form slugs that wouldn't be produced by slugifying the
  // English headword (e.g. "bara" instead of "outside-away").
  for (const slug of ['bara', 'wahed-nhar']) {
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    howToSayPages.push({
      url: `${SITE_URL}/how-to-say/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // Derived from the word data itself so the sitemap can never list a
  // category page that has no words (the old hardcoded list included
  // 'blessings', a phrase-only category that rendered an empty page).
  const wordCategories = Array.from(
    new Set((words as DarijaWord[]).map(w => w.category))
  );

  const categoryPages: MetadataRoute.Sitemap = wordCategories.map(cat => ({
    url: `${SITE_URL}/category/${cat}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const wordsArr = words as DarijaWord[];
  const wordPages: MetadataRoute.Sitemap = wordsArr
    .filter(isWordWorthy)
    .slice(0, 2000)
    .map(word => ({
      url: `${SITE_URL}/word/${word.id}`,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  const phrasesArr = phrases as DarijaPhrase[];
  const phrasePages: MetadataRoute.Sitemap = phrasesArr
    .filter(isPhraseWorthy)
    .slice(0, 500)
    .map(phrase => ({
      url: `${SITE_URL}/phrase/${phrase.id}`,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  return [...staticPages, ...howToSayPages, ...categoryPages, ...wordPages, ...phrasePages];
}
