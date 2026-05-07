import { NextRequest, NextResponse } from 'next/server';
import { searchWords, searchPhrases, isWordWorthy, isPhraseWorthy } from '@/lib/dictionary';
import canonicalOverrides from '@/data/canonical-overrides.json';

const OVERRIDES = canonicalOverrides as Record<string, string>;

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') || '';
  const [allWords, allPhrases] = await Promise.all([searchWords(q), searchPhrases(q)]);
  // Hide pages that 404 (unworthy) or canonicalize away. Search results
  // become inbound internal links that Googlebot follows; we want every one
  // of those to land on a real, indexed URL.
  const words = allWords.filter(w => isWordWorthy(w) && !OVERRIDES[w.id]);
  const phrases = allPhrases.filter(isPhraseWorthy);
  return NextResponse.json({ words, phrases });
}
