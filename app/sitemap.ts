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
const today = new Date().toISOString().split('T')[0];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: today, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/grammar`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/first-day`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/practice`, lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/how-to-say`, lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
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
      lastModified: today,
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
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  const wordCategories = [
    'greetings', 'food', 'shopping', 'transport', 'home', 'emotions', 'time',
    'numbers', 'family', 'city', 'money', 'health', 'religion', 'slang', 'verbs',
    'directions', 'crafts', 'animals', 'nature', 'clothing', 'music',
    'technology', 'education', 'work', 'pronouns', 'culture', 'architecture',
    'blessings', 'compliments', 'emergency', 'adjectives', 'sports', 'survival',
  ];

  const categoryPages: MetadataRoute.Sitemap = wordCategories.map(cat => ({
    url: `${SITE_URL}/category/${cat}`,
    lastModified: today,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const wordsArr = words as DarijaWord[];
  const wordPages: MetadataRoute.Sitemap = wordsArr
    .filter(isWordWorthy)
    .slice(0, 2000)
    .map(word => ({
      url: `${SITE_URL}/word/${word.id}`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  const phrasesArr = phrases as DarijaPhrase[];
  const phrasePages: MetadataRoute.Sitemap = phrasesArr
    .filter(isPhraseWorthy)
    .slice(0, 500)
    .map(phrase => ({
      url: `${SITE_URL}/phrase/${phrase.id}`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  return [...staticPages, ...howToSayPages, ...categoryPages, ...wordPages, ...phrasePages];
}
