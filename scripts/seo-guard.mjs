/**
 * SEO guard — run before every deploy:  node scripts/seo-guard.mjs
 *
 * Fails (exit 1) if the number of indexable pages drops below known-good
 * floors. This exists because a one-line change to generateStaticParams,
 * a worthiness filter, or the sitemap can silently remove thousands of
 * already-indexed pages — which happened in May 2026 and was caught only
 * by comparing the code against Search Console data.
 *
 * If you INTENTIONALLY reduce page counts (e.g. merging duplicates),
 * lower the floors here in the same commit, with a comment saying why.
 * That forces the decision to be explicit and reviewable.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const read = (p) => JSON.parse(readFileSync(path.join(root, '..', p), 'utf8'));

const words = read('data/words.json');
const phrases = read('data/phrases.json');
const overrides = read('data/canonical-overrides.json');

// ---- Replicate the predicates used by the live pages/sitemap ----

const isPhraseWorthy = (p) => {
  if (!p.english || p.english.length < 2) return false;
  const pri = (p.tags || []).some((t) =>
    ['essential', 'first-day', 'common', 'survival'].includes(t)
  );
  const hasResponse = !!(p.response && p.response.darija && p.response.darija.length >= 3);
  return !!p.cultural_note || hasResponse || !!p.audio_url || pri;
};

const wordPages = words.filter((w) => !overrides[w.id]).length;
const phrasePages = phrases.filter(isPhraseWorthy).length;
const categories = new Set(words.map((w) => w.category)).size;
const brokenWords = words.filter(
  (w) => !w.darija || !w.arabic || !w.english || !w.pronunciation
).length;

// ---- Known-good floors (as of June 2026: 9,990 / 1,479 / 32) ----
const FLOORS = {
  wordPages: 9500,
  phrasePages: 1300,
  categories: 30,
};

const checks = [
  [`word pages (${wordPages})`, wordPages >= FLOORS.wordPages, `must be >= ${FLOORS.wordPages}`],
  [`phrase pages (${phrasePages})`, phrasePages >= FLOORS.phrasePages, `must be >= ${FLOORS.phrasePages}`],
  [`categories (${categories})`, categories >= FLOORS.categories, `must be >= ${FLOORS.categories}`],
  [`words missing core fields (${brokenWords})`, brokenWords === 0, 'must be 0 — these render broken pages'],
];

let failed = false;
for (const [label, ok, rule] of checks) {
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}  ${ok ? '' : '— ' + rule}`);
  if (!ok) failed = true;
}

if (failed) {
  console.error(
    '\nSEO guard failed. A change is about to remove indexable pages.' +
      '\nIf this is intentional, update the floors in scripts/seo-guard.mjs' +
      '\nin the same commit and explain why in a comment.'
  );
  process.exit(1);
}
console.log('\nSEO guard passed.');
