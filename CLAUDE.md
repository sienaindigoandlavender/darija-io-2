# CLAUDE.md — darija.io context for future sessions

This file is read by Claude Code on startup. It exists so the next session doesn't have to re-derive strategy and decisions from the codebase. Sister file lives at `tamazight-dictionary/CLAUDE.md`; the two should be kept in sync where they overlap.

## Quick context

- **What**: darija.io — the most comprehensive Moroccan Arabic (Darija) dictionary online. ~10,000 words, ~1,500 phrases, with Arabic script, Latin transliteration (Arabizi), EN/FR glosses, IPA, and cultural notes from 11 years of field research in Morocco.
- **Sister site**: tamazight.io. Same publisher (Dancing with Lions), reciprocal cross-links in footers, `llms.txt`, and contextual in-content (e.g. /grammar negation section). Visual identity intentionally sibling-but-distinct: darija's favicon is three descending horizontal bars, tamazight's is the yaz (three vertical bars).
- **Stage**: live on `darija.io`. Some recent commits to `main` follow a tamazight-aligned chrome refresh (footer cross-promo, all-caps top nav, AI policy hardening, README, this file).

## Read first

1. Strategic positioning — read **before** suggesting features.
2. Calm-OS principles — anti-patterns to avoid.
3. Explicit non-goals — what NOT to build.
4. Architectural conventions — where things go.
5. Recent commit history.
6. Next moves.

## 1. Strategic positioning

**The bet:** be the place where someone — journalist on deadline, researcher, heritage learner, curious dinner-table guest — gets a definitive Darija answer in under 5 seconds with cultural context. **Reference, not course.** GoDarija and Morolingo own "app/course" forever; we own "web reference forever." Don't try to out-feature the course apps.

**Moat:** corpus depth (10k+ vs competitors' 2-3k) + cultural-note depth + FAQ-structured how-to-say SEO + modern web feel.

**Two-product portfolio.** darija.io and tamazight.io are siblings. Cross-promo wired (footer, llms.txt, in-content links from /grammar and /about that point to tamazight.io for the Amazigh substrate). Future siblings could include other languages.

## 2. Calm-OS principles

Same philosophy as tamazight. See that CLAUDE.md for the full statement. Highlights:

- No streaks, no points, no celebration UI. Practice mode shows level chips, not point counters.
- No empty-state nags. RecentlyViewed renders nothing when empty.
- No accounts. localStorage only.
- Silence is a feature.
- Continuous polish > new surfaces.

## 3. Explicit non-goals

- ❌ Audio recordings (out of scope — `AudioButton` exists but coverage is partial; don't expand).
- ❌ Newsletter funnel pipeline (next-week item; `/api/subscribe` is a logging stub).
- ❌ Paywall.
- ❌ Accounts / sign-in.
- ❌ AI tutor / chatbot.
- ❌ Course-platform features (lesson plans, structured curricula, B1/B2 levels). That's GoDarija's lane.
- ❌ Native apps before mid-2026.

## 4. Architectural conventions

**i18n** with next-intl. `NEXT_LOCALE` cookie + `Accept-Language` fallback. Messages in `messages/{en,fr}.json`. Both locales fully translated for chrome — long-form content (grammar, legal, about) is also bilingual via the same namespaces.

**Daily rotation** uses `app/_home/util.ts`'s `dayIndex()` and `pickByDay()`. Same content for everyone for 24h, fresh tomorrow, SSR-stable.

**OG card generation** at `app/word/[id]/opengraph-image.tsx` and `app/phrase/[id]/opengraph-image.tsx`. Bundles Amiri (Naskh-style Arabic, open-source) in `app/_og-fonts/` because Satori can't load system fonts. **Arabic shaping is required** — `lib/arabicShape.ts` provides `shapeArabicForOg()` because @vercel/og's Satori doesn't run OpenType shaping in this version. (Tamazight doesn't need this — Tifinagh is LTR with no contextual joining.)

**Nexus CMS** (Supabase) drives `/legal/[slug]` content. Pages without DB seeds 404. The Nexus client is in `lib/nexus.ts`.

**AI policy** — same three-layer setup as tamazight:
1. `public/robots.txt` — explicit allow/disallow per user-agent. Retrieval bots welcome, training bots disallowed.
2. `middleware.ts` — `Link: <license>; rel="license"` and `X-Robots-Tag: noai, noimageai` on every response. Also handles www → non-www redirect.
3. JSON-LD WebSite schema — `license`, `copyrightYear`, `copyrightHolder`, `creditText`, `usageInfo`.

**Content license: CC BY-NC-ND 4.0. Code license: MIT.** Don't conflate.

## 5. Top nav structure

5 items: Dictionary · First Day · Practice · Grammar · Phrases. About moved to footer + a quieter trailing tier on mobile. Locale switcher (EN · FR) on the right. Aligned with tamazight's nav structure.

## 6. Recent commit history (high-level)

1. **Chrome alignment** — uppercase top nav, EN/FR locale switcher styling.
2. **Footer cross-promo** to tamazight.io.
3. **Favicon redesign** — three descending horizontal bars in brand red. Pairs with tamazight's vertical yaz.
4. **Top nav restructure** — Dictionary / First Day / Practice / Grammar / Phrases (added `practice` and `phrases` to the nav and translation files; About moved to footer).
5. **Newsletter banner** at the bottom of home, with EN/FR translations.
6. **AI training opt-out** — `public/robots.txt` rewritten with explicit retrieval-vs-training split, `middleware.ts` extended with license + `X-Robots-Tag` headers, JSON-LD gains license fields, `llms.txt` opens with attribution-required block.
7. **Contextual in-content cross-references** — `/grammar` negation section links "Amazigh substrate influence" → tamazight.io/grammar#negation, `/about` "What is Darija" links "Amazigh grammar" → tamazight.io.
8. **Documentation** — README rewrite (replaced create-next-app boilerplate), this file.

## 7. Next moves

### Operational
- Already deployed on `darija.io`. Maintain GSC + Bing Webmaster verification.
- After tamazight.io launches, watch for AI citations referencing both sites (the cross-references are designed to compound).

### Code work that's actually useful next
- **Newsletter funnel** when ready (next-week task per user). Current `/api/subscribe` route validates and logs the email; swap to Resend/Buttondown call.
- **Long-form content remaining English-only** (any pages that haven't been translated yet) — translator pass.
- **Native app preparation** — same React Native + Expo + NativeWind path as tamazight when web demand is validated.

### Things explicitly waiting on user signal
- Stripe payment link for `/support`-type tier (none currently — darija doesn't have a /support page; that's tamazight-only for now).
- Newsletter ESP credentials.
- Nexus DB seeds for `/legal/*` pages (or add hardcoded fallback like tamazight has).

---

*If you're reading this in a future session: trust the calm-OS principles, don't drift into course-platform territory, and resist feature drift. Reference forever.*
