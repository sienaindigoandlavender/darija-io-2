import { MetadataRoute } from 'next';
import words from '@/data/words.json';
import phrases from '@/data/phrases.json';
import { getPrioritizedHowToSaySlugs } from '@/lib/howToSay';

const SITE_URL = 'https://darija.io';
const today = new Date().toISOString().split('T')[0];

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: today, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/grammar`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/first-day`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/practice`, lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/how-to-say`, lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
  ];

  // How-to-say pages — every English headword in the dictionary becomes a
  // "How to say X" page. Sitemap includes the prioritized 2000 most important
  // ones; the rest are still reachable but not surfaced to crawlers en masse.
  const howToSayTerms = getPrioritizedHowToSaySlugs(2000);

  const howToSayPages: MetadataRoute.Sitemap = howToSayTerms.map(term => ({
    url: `${SITE_URL}/how-to-say/${term}`,
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Category pages
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
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Word pages — all 10,000 words
  const wordPages: MetadataRoute.Sitemap = (words as Array<{ id: string }>).map(word => ({
    url: `${SITE_URL}/word/${word.id}`,
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Phrase pages — all 1,500 phrases
  const phrasePages: MetadataRoute.Sitemap = (phrases as Array<{ id: string }>).map(phrase => ({
    url: `${SITE_URL}/phrase/${phrase.id}`,
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...howToSayPages, ...categoryPages, ...wordPages, ...phrasePages];
}
