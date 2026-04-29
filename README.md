# Everyday Darija — darija.io

<div align="center">
  <h2>دارجة</h2>
  <p><em>The most comprehensive Moroccan Arabic (Darija) dictionary online</em></p>
  <p><a href="https://darija.io">darija.io</a></p>
</div>

A Dancing with Lions publication. Sister site: [tamazight.io](https://tamazight.io) — the Berber substrate language that shapes Darija.

---

## What this is

A free, structured reference for spoken Moroccan Arabic — **10,000+ words** and **1,500+ phrases** with Arabic script, Latin transliteration (Arabizi), English and French glosses, IPA pronunciation, and cultural notes drawn from 11 years of field research living in Morocco.

Built to be the place a journalist on deadline, a researcher, a heritage learner, or a curious person at a dinner table can get a definitive answer in under five seconds — with cultural context. Different DNA from a course platform; this is a reference.

## Surfaces

### Reference

| Route | Purpose |
|-------|---------|
| `/` | Search-first home with daily rituals (recently viewed, word of the day, category grid, first-day section, phrasebook, wisdom, newsletter) |
| `/word/[id]` | Per-word page with pronunciation, examples, conjugation, same-root words, FAQ schema, OG share card |
| `/phrase/[id]` | Per-phrase detail page with response patterns, OG card |
| `/category/[slug]` | Browse by category (food, greetings, shopping, etc.) |
| `/grammar` | Sound system, pronouns, verb tenses, negation, questions, adjective agreement |

### Learning loops

| Route | What it does |
|-------|---|
| `/first-day` | 80+ essential survival words for travellers |
| `/practice` | Spaced-repetition flashcards across 16 category/tag decks. localStorage progress, no accounts. |
| `/how-to-say`, `/how-to-say/[term]` | SEO surface — 50+ curated "How to say X in Darija" terms with FAQ JSON-LD |

### Project

| Route | What it does |
|-------|---|
| `/about` | Project mission, language background, methodology, citation, team |
| `/legal/[slug]` | Privacy, terms, disclaimer (content from Nexus shared CMS) |

## Tech

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl (`en`, `fr`); cookie-driven with `Accept-Language` fallback
- **OG cards**: Next.js `ImageResponse` with bundled Amiri (Arabic) font + custom Arabic shaping helper (Satori doesn't run OpenType shaping in this version)
- **Data**: bundled JSON in `/data` (~10k words + 1.5k phrases)
- **Deployment**: Vercel
- **Shared CMS**: Nexus (Supabase) for legal pages and content-network metadata

## Project structure

```
darija-io-2/
├── app/
│   ├── _home/              # Home-page sections (HomeHero, WordOfTheDay,
│   │                        # CategoryGrid, FirstDaySection, PhrasebookSection,
│   │                        # WisdomSection, util.ts)
│   ├── api/                # words, phrases, search, word-of-the-day,
│   │                        # categories, knowledge/darija, subscribe, contact
│   ├── word/[id]/          # Word detail + opengraph-image
│   ├── phrase/[id]/        # Phrase detail + opengraph-image
│   ├── category/[slug]/    # Category browse
│   ├── first-day/          # Survival kit
│   ├── practice/           # Flashcard surface
│   ├── how-to-say/         # SEO surface index + [term] detail
│   ├── grammar/            # Long-form grammar reference
│   ├── about/              # Project page
│   ├── legal/[slug]/       # Privacy / terms / disclaimer (Nexus-driven)
│   ├── layout.tsx          # NextIntl provider, JSON-LD with license
│   └── sitemap.ts
├── components/             # SiteHeader, Footer, MobileMenu, SearchBox,
│                            # AudioButton, LocaleSwitcher, RecentlyViewed,
│                            # RecentTracker, NewsletterSignup
├── data/                   # words.json, phrases.json, proverbs.json, etc.
├── i18n/request.ts         # Locale detection
├── messages/               # en.json, fr.json
├── lib/                    # dictionary, nexus, arabicShape, etc.
├── public/
│   ├── icon.svg            # Three descending bars in brand red
│   ├── llms.txt            # AI-GEO manifest
│   ├── llms-full.txt       # Deep AI knowledge file
│   └── robots.txt          # AI-policy-aware
├── middleware.ts           # www → non-www redirect + license Link header
└── next.config.mjs         # Wrapped with createNextIntlPlugin
```

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
```

### Environment variables

| Variable | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (default `https://darija.io`) | No |
| `NEXUS_SUPABASE_URL` | Nexus CMS for legal pages | No (page returns 404 without seeded content) |
| `NEXUS_SUPABASE_ANON_KEY` | Nexus auth | No |
| `SITE_ID` | Nexus brand identifier (default `darija-for-dummies`) | No |

## Data model

A word entry (full schema visible in `app/api/knowledge/darija/route.ts`):

```ts
{
  id: 'salam',
  darija: 'salam',
  arabic: 'سلام',
  english: 'peace, hello',
  french: 'paix, bonjour',
  pronunciation: 'sa-LAAM',
  category: 'greetings',
  part_of_speech: 'noun',
  register: 'standard',
  tags: ['essential', 'first-day', 'greetings'],
  examples: [{ darija: '...', arabic: '...', english: '...', french: '...' }],
  cultural_note: 'A versatile word that doubles as hello and peace...',
  arabizi_variants: ['salaam', 'slm'],
  root: 's-l-m',
  audio_url: '/audio/salam.mp3',
}
```

## AI policy & licensing

Content licensed **[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)**. The codebase itself is MIT.

The site distinguishes two classes of AI crawler:

- **Allowed** (visit on demand, return citation URL): Googlebot, Bingbot, ChatGPT-User, OAI-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Applebot.
- **Disallowed** (silent ingestion into model weights): GPTBot, Google-Extended, ClaudeBot, anthropic-ai, Claude-Web, CCBot, Bytespider, Meta-ExternalAgent, Diffbot, Amazonbot, Applebot-Extended, AI2Bot, cohere-ai, and others. See [`public/robots.txt`](public/robots.txt) for the full list.

Three machine-readable signals enforce the policy on every response:
1. `robots.txt` — explicit per-user-agent allow/disallow
2. Edge middleware — `Link: <license>; rel="license"` and `X-Robots-Tag: noai, noimageai`
3. JSON-LD WebSite schema — `license`, `copyrightHolder`, `creditText`, `usageInfo`

Training use of the corpus requires written permission from Dancing with Lions (`contact@dancingwiththelions.com`).

## Citation

```
Dancing with Lions. (2026). Everyday Darija Dictionary [Dataset].
https://darija.io
```

## Contributing

Bug reports and corrections welcome — use the [contact form](https://darija.io/about) on the live site or open an issue here.

---

<div align="center">
  <p>الدارجة</p>
  <p><em>A Dancing with Lions publication · Marrakech, Morocco</em></p>
</div>
