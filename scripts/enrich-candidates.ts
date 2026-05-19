/**
 * Build the enrichment candidate queue.
 *
 * Reads data/words.json and emits data/enrich-queue.json — every priority-tagged
 * word that currently has zero "depth" (no cultural_note, <2 examples, no audio)
 * and is not a known duplicate. These are the words Step 3's worthiness tighten
 * would otherwise drop from the sitemap.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PRIORITY_TAGS = ['essential', 'first-day', 'common', 'basic', 'survival'];

interface Example {
  arabic?: string;
  darija?: string;
  english?: string;
  french?: string;
}

interface Word {
  id: string;
  darija?: string;
  arabic?: string;
  english?: string;
  french?: string;
  pronunciation?: string;
  category?: string;
  part_of_speech?: string;
  tags?: string[];
  cultural_note?: string;
  examples?: Example[];
  audio_url?: string;
}

const root = process.cwd();
const words: Word[] = JSON.parse(readFileSync(path.join(root, 'data/words.json'), 'utf8'));
const overrides: Record<string, string> = JSON.parse(
  readFileSync(path.join(root, 'data/canonical-overrides.json'), 'utf8'),
);

const nonEmpty = (s: unknown): s is string => typeof s === 'string' && s.length > 0;

const candidates = words
  .filter(w => Array.isArray(w.tags) && w.tags!.some(t => PRIORITY_TAGS.includes(t)))
  .filter(w => nonEmpty(w.english) && nonEmpty(w.darija) && nonEmpty(w.arabic))
  .filter(w => !nonEmpty(w.cultural_note))
  .filter(w => !Array.isArray(w.examples) || w.examples.length < 2)
  .filter(w => !nonEmpty(w.audio_url))
  .filter(w => !(w.id in overrides))
  .map(w => ({
    id: w.id,
    darija: w.darija,
    arabic: w.arabic,
    english: w.english,
    french: w.french ?? null,
    pronunciation: w.pronunciation ?? null,
    category: w.category ?? null,
    part_of_speech: w.part_of_speech ?? null,
    tags: w.tags ?? [],
  }))
  .sort((a, b) => {
    const c = (a.category ?? '').localeCompare(b.category ?? '');
    return c !== 0 ? c : a.id.localeCompare(b.id);
  });

const outPath = path.join(root, 'data/enrich-queue.json');
writeFileSync(outPath, JSON.stringify(candidates, null, 2) + '\n');
console.log(`wrote ${candidates.length} candidates to ${path.relative(root, outPath)}`);
