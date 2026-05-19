/**
 * Enrich the candidate queue with cultural notes + examples via the Anthropic API.
 *
 * Reads data/enrich-queue.json, processes in batches of 20, writes
 * data/enrich-output.json keyed by id. Resume-safe: existing entries are
 * skipped on re-run. Output is for review; do NOT merge into words.json yet.
 *
 * Env: ANTHROPIC_API_KEY
 */
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const MODEL = 'claude-sonnet-4-20250514';
const BATCH_SIZE = 20;
const MAX_TOKENS = 1024;

interface Candidate {
  id: string;
  darija: string;
  arabic: string;
  english: string;
  french: string | null;
  pronunciation: string | null;
  category: string | null;
  part_of_speech: string | null;
  tags: string[];
}

interface Example {
  arabic: string;
  darija: string;
  english: string;
  french: string;
}

type Status = 'ok' | 'skipped_no_cultural_note' | 'error';

interface OutputEntry {
  status: Status;
  cultural_note: string | null;
  examples: Example[];
  error?: string;
}

const root = process.cwd();
const queuePath = path.join(root, 'data/enrich-queue.json');
const outPath = path.join(root, 'data/enrich-output.json');

const queue: Candidate[] = JSON.parse(readFileSync(queuePath, 'utf8'));
const output: Record<string, OutputEntry> = existsSync(outPath)
  ? JSON.parse(readFileSync(outPath, 'utf8'))
  : {};

const todo = queue.filter(c => !(c.id in output));
console.log(
  `queue=${queue.length}  already_done=${queue.length - todo.length}  todo=${todo.length}`,
);

if (todo.length === 0) process.exit(0);

const client = new Anthropic();

function buildPrompt(c: Candidate): string {
  return `You are enriching a Moroccan Darija dictionary entry.

Word:
  Darija (Latin): ${c.darija}
  Arabic: ${c.arabic}
  English: ${c.english}
  French: ${c.french ?? '(none)'}
  Pronunciation: ${c.pronunciation ?? '(none)'}
  Part of speech: ${c.part_of_speech ?? '(unknown)'}
  Category: ${c.category ?? '(unknown)'}

Return ONLY strict JSON, no preamble, no markdown fences, with this schema:
{
  "cultural_note": "string or null",
  "examples": [
    {"arabic": "...", "darija": "...", "english": "...", "french": "..."},
    {"arabic": "...", "darija": "...", "english": "...", "french": "..."}
  ]
}

Rules:
1. cultural_note: 1-2 sentences MAX. Specific to Moroccan usage — when it's used, what register, regional notes if relevant, or one concrete cultural anchor. NO throat-clearing. NO "This word means...". NO platitudes about Moroccan hospitality. If there's nothing genuinely interesting to say, return null.
2. examples: exactly 2 example sentences. Each must include arabic, darija (Latin transliteration matching the style of the headword), english, french. Sentences should be the kind of thing actually said in Marrakech, not textbook constructions. VARY the grammar across the two examples — don't give two declarative present-tense sentences. Mix in questions, imperatives, negation, past tense, etc.

Voice: write like a Marrakech-based editor with 15 years on the ground, not a textbook. Specific over general. One concrete fact beats three generalizations. Never start a cultural_note with "This word..." or "In Morocco...". If the only honest note is "it's just the word for X, no story here," return null.`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1].trim() : trimmed;
  return JSON.parse(body);
}

async function enrichOne(c: Candidate): Promise<OutputEntry> {
  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: buildPrompt(c) }],
    });

    const textBlock = resp.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    if (!textBlock) {
      return { status: 'error', cultural_note: null, examples: [], error: 'no text block' };
    }

    const parsed = extractJson(textBlock.text) as {
      cultural_note: string | null;
      examples: Example[];
    };

    if (!Array.isArray(parsed.examples) || parsed.examples.length < 2) {
      return {
        status: 'error',
        cultural_note: parsed.cultural_note ?? null,
        examples: parsed.examples ?? [],
        error: 'fewer than 2 examples',
      };
    }

    const status: Status = parsed.cultural_note ? 'ok' : 'skipped_no_cultural_note';
    return {
      status,
      cultural_note: parsed.cultural_note,
      examples: parsed.examples.slice(0, 2),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 'error', cultural_note: null, examples: [], error: msg };
  }
}

function flush(): void {
  writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
}

async function run(): Promise<void> {
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(c => enrichOne(c)));
    for (let j = 0; j < batch.length; j++) {
      output[batch[j].id] = results[j];
    }
    flush();
    const counts = { ok: 0, skipped: 0, error: 0 };
    for (const v of Object.values(output)) {
      if (v.status === 'ok') counts.ok++;
      else if (v.status === 'skipped_no_cultural_note') counts.skipped++;
      else counts.error++;
    }
    console.log(
      `batch ${i / BATCH_SIZE + 1}/${Math.ceil(todo.length / BATCH_SIZE)}  ` +
        `processed=${Math.min(i + BATCH_SIZE, todo.length)}/${todo.length}  ` +
        `ok=${counts.ok}  skipped=${counts.skipped}  error=${counts.error}`,
    );
  }

  // Print a 5-word random sample for spot-check
  const okIds = Object.keys(output).filter(k => output[k].status === 'ok');
  const shuffled = [...okIds].sort(() => Math.random() - 0.5).slice(0, 5);
  console.log('\n=== 5-word sample for spot-check ===');
  for (const id of shuffled) {
    const cand = queue.find(c => c.id === id)!;
    const entry = output[id];
    console.log(`\n--- ${id}  ${cand.darija} (${cand.arabic}) — ${cand.english}`);
    console.log(`cultural_note: ${entry.cultural_note}`);
    for (const ex of entry.examples) {
      console.log(`  ex: ${ex.darija} / ${ex.arabic}`);
      console.log(`      en: ${ex.english}`);
      console.log(`      fr: ${ex.french}`);
    }
  }
}

run().catch(err => {
  console.error('fatal:', err);
  flush();
  process.exit(1);
});
