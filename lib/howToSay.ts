/**
 * /how-to-say programmatic SEO helpers.
 *
 * Strategy: every English headword in our dictionary becomes a "How to say X
 * in Moroccan Arabic" page automatically. The curated TERMS map provides
 * higher-quality copy for the most-searched queries; everything else is
 * generated from the word's own data.
 *
 * URL slugs are kebab-case (lowercase, hyphen-separated). We strip diacritics
 * and apostrophes so URLs stay clean.
 */

import wordsData from '@/data/words.json';
import type { DarijaWord } from './dictionary';

const allWords = wordsData as DarijaWord[];

/**
 * Convert a word/phrase term to a URL slug.
 * "I don't understand" -> "i-dont-understand"
 * "How much"           -> "how-much"
 */
export function slugifyTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip accents
    .replace(/['\u2019]/g, '')          // strip apostrophes (don't -> dont)
    .replace(/[^a-z0-9\s-]/g, ' ')      // anything else -> space
    .trim()
    .replace(/\s+/g, '-')               // spaces -> hyphens
    .replace(/-+/g, '-')                // collapse multiple hyphens
    .replace(/^-|-$/g, '');             // trim leading/trailing
}

/**
 * Reverse of slugify, for display + as a search query.
 * "i-dont-understand" -> "i dont understand"
 */
export function unslugTerm(slug: string): string {
  return slug.replace(/-/g, ' ');
}

/**
 * All how-to-say slugs we should statically generate.
 *
 * We dedupe English headwords and skip:
 *   - very long terms (likely sentences)
 *   - empty or single-character terms
 *   - terms that don't survive slugification
 *
 * Returns slugs only. The page handler resolves slug -> word(s) at request time.
 */
export function getAllHowToSaySlugs(): string[] {
  const seen = new Set<string>();
  for (const w of allWords) {
    if (!w.english || w.english.length < 2 || w.english.length > 60) continue;
    // Skip parentheticals and multi-meaning headwords ("to give (something)")
    const clean = w.english.replace(/\([^)]*\)/g, '').trim();
    const slug = slugifyTerm(clean);
    if (slug && slug.length >= 2 && slug.length <= 80) seen.add(slug);
  }
  return Array.from(seen);
}

/**
 * Top N slugs by likely search interest.
 * We use English headwords from words tagged "essential" or "first-day" first,
 * then fill with the rest by word.order.
 *
 * Used to prioritize SSG (static generation) — the rest fall back to ISR/dynamic
 * if traffic warrants it.
 */
export function getPrioritizedHowToSaySlugs(limit = 2000): string[] {
  const tagPriority = (w: DarijaWord) => {
    const tags = w.tags || [];
    if (tags.includes('essential')) return 0;
    if (tags.includes('first-day')) return 1;
    if (tags.includes('common')) return 2;
    if (tags.includes('basic')) return 3;
    return 4;
  };
  const sorted = [...allWords].sort((a, b) => {
    const tp = tagPriority(a) - tagPriority(b);
    if (tp !== 0) return tp;
    return (a.order || 0) - (b.order || 0);
  });
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of sorted) {
    if (out.length >= limit) break;
    if (!w.english || w.english.length < 2 || w.english.length > 60) continue;
    const clean = w.english.replace(/\([^)]*\)/g, '').trim();
    const slug = slugifyTerm(clean);
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      out.push(slug);
    }
  }
  return out;
}
