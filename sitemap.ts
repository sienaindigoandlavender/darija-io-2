import { MetadataRoute } from 'next';
import words from '@/data/words.json';
import phrases from '@/data/phrases.json';
import canonicalOverrides from '@/data/canonical-overrides.json';
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

  // Duplicate words 301-redirect to their canonical sibling — never list
  // them in the sitemap (a sitemap must only contain final, 200 URLs).
  const duplicateIds = new Set(Object.keys(canonicalOverrides));

  const wordsArr = words as DarijaWord[];
  const wordPages: MetadataRoute.Sitemap = wordsArr
    .filter(isWordWorthy)
    .filter(word => !duplicateIds.has(word.id))
    // No arbitrary cap: every worthy, non-duplicate word page is prerendered
    // and indexable, so all belong in the sitemap (well under the 50k limit).
    .map(word => ({
      url: `${SITE_URL}/word/${word.id}`,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  const phrasesArr = phrases as DarijaPhrase[];
  const phrasePages: MetadataRoute.Sitemap = phrasesArr
    .filter(isPhraseWorthy)
    // Previously capped at 500, which suppressed ~980 worthy phrase pages
    // from the sitemap and left them in "Crawled - currently not indexed".
    .map(phrase => ({
      url: `${SITE_URL}/phrase/${phrase.id}`,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  return [...staticPages, ...howToSayPages, ...categoryPages, ...wordPages, ...phrasePages];
}
