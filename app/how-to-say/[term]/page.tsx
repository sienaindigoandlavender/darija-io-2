import { searchWords, searchPhrases } from '@/lib/dictionary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import HowToSayClient from './HowToSayClient';
import {
  getPrioritizedHowToSaySlugs,
  unslugTerm,
} from '@/lib/howToSay';

const SITE_URL = 'https://darija.io';

// ------------------------------------------------------------------
// Curated TERMS — only the highest-volume queries get hand-written copy.
// Everything else falls back to dynamic generation from the word data.
// ------------------------------------------------------------------

interface CuratedTerm {
  query: string;
  title: string;
  description: string;
  category?: { slug: string; name: string };
}

const CURATED: Record<string, CuratedTerm> = {
  'thank-you':         { query: 'thank',     title: 'How to Say Thank You in Moroccan Arabic',     description: 'Shukran, llah ykhllik, barak llahu fik — every way to say thank you in Darija with pronunciation and when to use each one.', category: { slug: 'greetings', name: 'Greetings' } },
  'hello':             { query: 'hello',     title: 'How to Say Hello in Moroccan Arabic',         description: 'Salam, labas, ahlan — greetings in Darija with the full greeting sequence Moroccans actually use.', category: { slug: 'greetings', name: 'Greetings' } },
  'goodbye':           { query: 'goodbye',   title: 'How to Say Goodbye in Moroccan Arabic',       description: 'Bslama, tsbhh 3la khir, llah ymssk bikhir — every way to say goodbye in Darija.', category: { slug: 'greetings', name: 'Greetings' } },
  'how-are-you':       { query: 'how are you', title: 'How to Say How Are You in Moroccan Arabic', description: 'Labas? Kiddayr? — the Darija greeting sequence that you cannot skip.', category: { slug: 'greetings', name: 'Greetings' } },
  'please':            { query: 'please',    title: 'How to Say Please in Moroccan Arabic',        description: '3afak, llah ykhllik, mn fdlk — please in Darija with cultural context.', category: { slug: 'greetings', name: 'Greetings' } },
  'sorry':             { query: 'sorry',     title: 'How to Say Sorry in Moroccan Arabic',         description: 'Smhhliya, 3fu — apologizing in Darija and when each form is appropriate.', category: { slug: 'greetings', name: 'Greetings' } },
  'yes':               { query: 'yes',       title: 'How to Say Yes in Moroccan Arabic',           description: 'Iyyeh, ah, wakha — the many ways to agree in Darija.', category: { slug: 'greetings', name: 'Greetings' } },
  'no':                { query: 'no',        title: 'How to Say No in Moroccan Arabic',            description: 'Lla, lala, ma-bghitsh — saying no in Darija without causing offense.', category: { slug: 'greetings', name: 'Greetings' } },
  'how-much':          { query: 'how much',  title: 'How to Say How Much in Moroccan Arabic',      description: 'Bshhal? Bshhal hada? — the essential souk phrase in Darija with bargaining vocabulary.', category: { slug: 'shopping', name: 'Shopping' } },
  'water':             { query: 'water',     title: 'How to Say Water in Moroccan Arabic',         description: 'L-ma — water in Darija and related drink vocabulary.', category: { slug: 'food', name: 'Food & Drink' } },
  'tea':               { query: 'tea',       title: 'How to Say Tea in Moroccan Arabic',           description: 'Atay — Moroccan mint tea vocabulary in Darija with cultural notes on tea ceremony.', category: { slug: 'food', name: 'Food & Drink' } },
  'coffee':            { query: 'coffee',    title: 'How to Say Coffee in Moroccan Arabic',        description: 'Qhwa, noss noss — coffee vocabulary in Darija and café culture.', category: { slug: 'food', name: 'Food & Drink' } },
  'bread':             { query: 'bread',     title: 'How to Say Bread in Moroccan Arabic',         description: 'L-khubz — bread in Darija. The word you will hear and need most in Morocco.', category: { slug: 'food', name: 'Food & Drink' } },
  'delicious':         { query: 'delicious', title: 'How to Say Delicious in Moroccan Arabic',     description: 'Bnin, ldid, zwin — complimenting food in Darija (the highest form of praise for a host).', category: { slug: 'food', name: 'Food & Drink' } },
  'beautiful':         { query: 'beautiful', title: 'How to Say Beautiful in Moroccan Arabic',     description: 'Zwin, zwina, jmil — beauty words in Darija for people, places, and things.', category: { slug: 'adjectives', name: 'Adjectives' } },
  'love':              { query: 'love',      title: 'How to Say I Love You in Moroccan Arabic',    description: 'Kanbghik, kanhhbbk — love expressions in Darija with cultural weight.', category: { slug: 'family', name: 'Family & People' } },
  'where':             { query: 'where',     title: 'How to Say Where in Moroccan Arabic',         description: 'Fin? Fin kayn...? — asking for directions in Darija.', category: { slug: 'directions', name: 'Directions' } },
  'bathroom':          { query: 'bathroom',  title: 'How to Say Bathroom in Moroccan Arabic',      description: 'Bit l-ma, twalet — asking for the bathroom in Darija.', category: { slug: 'directions', name: 'Directions' } },
  'taxi':              { query: 'taxi',      title: 'How to Say Taxi in Moroccan Arabic',          description: 'Taxi, petit taxi, grand taxi — transport vocabulary in Darija with fare negotiation phrases.', category: { slug: 'transport', name: 'Transport' } },
  'money':             { query: 'money',     title: 'How to Say Money in Moroccan Arabic',         description: 'L-flus, drham, ryal — money vocabulary in Darija and the ryal counting system.', category: { slug: 'money', name: 'Money' } },
  'food':              { query: 'food',      title: 'How to Say Food in Moroccan Arabic',          description: 'L-makla — food vocabulary in Darija covering meals, dishes, and kitchen language.', category: { slug: 'food', name: 'Food & Drink' } },
  'good':              { query: 'good',      title: 'How to Say Good in Moroccan Arabic',          description: 'Mzyan, bikhir, hssen — saying good in Darija for things, situations, and people.', category: { slug: 'adjectives', name: 'Adjectives' } },
  'bad':               { query: 'bad',       title: 'How to Say Bad in Moroccan Arabic',           description: 'Khayb, ma mzyansh — expressing bad in Darija.', category: { slug: 'adjectives', name: 'Adjectives' } },
  'big':               { query: 'big',       title: 'How to Say Big in Moroccan Arabic',           description: 'Kbir, kbira — size adjectives in Darija.', category: { slug: 'adjectives', name: 'Adjectives' } },
  'small':             { query: 'small',     title: 'How to Say Small in Moroccan Arabic',         description: 'Sghir, sghira — size words in Darija.', category: { slug: 'adjectives', name: 'Adjectives' } },
  'hot':               { query: 'hot',       title: 'How to Say Hot in Moroccan Arabic',           description: 'Skhun, hharr — temperature and spice heat in Darija.', category: { slug: 'adjectives', name: 'Adjectives' } },
  'cold':              { query: 'cold',      title: 'How to Say Cold in Moroccan Arabic',          description: 'Bard, barda — cold in Darija for weather, drinks, and temperature.', category: { slug: 'adjectives', name: 'Adjectives' } },
  'i-dont-understand': { query: 'understand', title: "How to Say I Don't Understand in Moroccan Arabic", description: 'Ma fhmtsh — the most useful phrase in Darija for any traveler.', category: { slug: 'greetings', name: 'Greetings' } },
  'i-dont-speak-arabic': { query: 'speak arabic', title: "How to Say I Don't Speak Arabic in Moroccan Arabic", description: "Ma kantkllmsh l-3rbiya — telling people you don't speak Arabic in Darija.", category: { slug: 'greetings', name: 'Greetings' } },
  'my-name-is':        { query: 'name',      title: 'How to Say My Name Is in Moroccan Arabic',    description: 'Smiyti... — introducing yourself in Darija.', category: { slug: 'greetings', name: 'Greetings' } },
  'friend':            { query: 'friend',    title: 'How to Say Friend in Moroccan Arabic',        description: 'Sahbi, shhab, khuya — friendship vocabulary in Darija.', category: { slug: 'family', name: 'Family & People' } },
  'family':            { query: 'family',    title: 'How to Say Family in Moroccan Arabic',        description: 'L-3a2ila, l-walidin — family vocabulary in Darija.', category: { slug: 'family', name: 'Family & People' } },
  'mother':            { query: 'mother',    title: 'How to Say Mother in Moroccan Arabic',        description: 'Lwalida, mama, mmi — mother in Darija with cultural significance.', category: { slug: 'family', name: 'Family & People' } },
  'father':            { query: 'father',    title: 'How to Say Father in Moroccan Arabic',        description: 'Lwalid, baba, bbi — father in Darija.', category: { slug: 'family', name: 'Family & People' } },
  'house':             { query: 'house',     title: 'How to Say House in Moroccan Arabic',         description: 'D-dar — house, home, and dwelling vocabulary in Darija.', category: { slug: 'home', name: 'Home & House' } },
  'market':            { query: 'market',    title: 'How to Say Market in Moroccan Arabic',        description: 'S-suq — the souk and market vocabulary in Darija.', category: { slug: 'shopping', name: 'Shopping' } },
  'expensive':         { query: 'expensive', title: 'How to Say Expensive in Moroccan Arabic',     description: 'Ghali, ghali bzzaf — price vocabulary for bargaining in Darija.', category: { slug: 'shopping', name: 'Shopping' } },
  'cheap':             { query: 'cheap',     title: 'How to Say Cheap in Moroccan Arabic',         description: 'Rkhis — price negotiation words in Darija.', category: { slug: 'shopping', name: 'Shopping' } },
  'doctor':            { query: 'doctor',    title: 'How to Say Doctor in Moroccan Arabic',        description: 'Ttbib — medical vocabulary in Darija for health emergencies.', category: { slug: 'health', name: 'Health' } },
  'help':              { query: 'help',      title: 'How to Say Help in Moroccan Arabic',          description: '3awnni, 3afak 3awnni — asking for help in Darija.', category: { slug: 'emergency', name: 'Emergency' } },
  'eat':               { query: 'eat',       title: 'How to Say Eat in Moroccan Arabic',           description: 'Kla, ka-nakl — eating verbs in Darija with conjugation.', category: { slug: 'verbs', name: 'Verbs' } },
  'drink':             { query: 'drink',     title: 'How to Say Drink in Moroccan Arabic',         description: 'Shrb, ka-nshrb — drinking verbs in Darija.', category: { slug: 'verbs', name: 'Verbs' } },
  'go':                { query: 'go',        title: 'How to Say Go in Moroccan Arabic',            description: 'Msha, ka-nmshi — the verb to go in Darija with full conjugation.', category: { slug: 'verbs', name: 'Verbs' } },
  'come':              { query: 'come',      title: 'How to Say Come in Moroccan Arabic',          description: 'Ja, aji — come and arrive in Darija.', category: { slug: 'verbs', name: 'Verbs' } },
  'want':              { query: 'want',      title: 'How to Say I Want in Moroccan Arabic',        description: 'Bgha, ka-nbghi — wanting and desiring in Darija (also means love).', category: { slug: 'verbs', name: 'Verbs' } },
  'i-like':            { query: 'like',      title: 'How to Say I Like in Moroccan Arabic',        description: 'Ka-y3jbni, ka-nbghi — expressing preference in Darija.', category: { slug: 'verbs', name: 'Verbs' } },
  'god-willing':       { query: 'inshallah', title: 'How to Say God Willing (Inshallah) in Moroccan Arabic', description: 'Inshallah — the most important word in Morocco. Can mean yes, maybe, or never.', category: { slug: 'religion', name: 'Faith & Blessings' } },
  'welcome':           { query: 'welcome',   title: 'How to Say Welcome in Moroccan Arabic',       description: 'Mrhba, mrhba bik — welcoming in Darija and the culture of hospitality.', category: { slug: 'greetings', name: 'Greetings' } },
  'lets-go':           { query: 'yallah',    title: "How to Say Let's Go in Moroccan Arabic",      description: 'Yallah — the universal Darija command to move, start, or hurry.', category: { slug: 'slang', name: 'Street Slang' } },
  'enough':            { query: 'enough',    title: 'How to Say Enough in Moroccan Arabic',        description: 'Safi, baraka — enough and stop in Darija.', category: { slug: 'slang', name: 'Street Slang' } },
};

// ------------------------------------------------------------------
// Static params — we statically generate every English headword
// (capped to a reasonable build-time limit). Anything outside the
// list still works dynamically via Next.js's dynamic params.
// ------------------------------------------------------------------

// Allow on-demand SSG for any English headword that isn't in the prerendered set.
// Pages are cached forever once generated (ISR with no revalidation needed,
// since dictionary data is shipped with the build).
export const dynamicParams = true;

export async function generateStaticParams() {
  // Prerender curated + a small set of high-priority slugs at build time.
  // The rest (thousands of long-tail headwords) are generated on first request
  // and cached automatically — keeps `next build` time reasonable.
  const slugs = new Set<string>(Object.keys(CURATED));
  for (const slug of getPrioritizedHowToSaySlugs(200)) slugs.add(slug);
  return Array.from(slugs).map(term => ({ term }));
}

// ------------------------------------------------------------------
// Metadata
// ------------------------------------------------------------------

export async function generateMetadata({ params }: { params: { term: string } }): Promise<Metadata> {
  const url = `${SITE_URL}/how-to-say/${params.term}`;
  const curated = CURATED[params.term];
  if (curated) {
    return {
      title: curated.title,
      description: curated.description,
      openGraph: { title: curated.title, description: curated.description, url },
      alternates: {
        canonical: url,
        languages: { en: url, fr: url, 'x-default': url },
      },
    };
  }

  // Auto-generate from search results
  const term = unslugTerm(params.term);
  const words = await searchWords(term);
  const top = words[0];
  const isEmpty = words.length === 0;
  const title = top
    ? `How to Say "${capitalize(term)}" in Moroccan Arabic — ${top.darija}`
    : `How to Say "${capitalize(term)}" in Moroccan Arabic`;
  const description = top
    ? `"${capitalize(term)}" in Darija (Moroccan Arabic) is "${top.darija}" (${top.arabic}), pronounced /${top.pronunciation}/. ${top.cultural_note ? top.cultural_note.slice(0, 100) : ''}`.trim()
    : `Learn how to say "${term}" in Darija — Moroccan Arabic translations, pronunciation, and cultural context.`;

  return {
    title,
    description,
    robots: isEmpty ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url },
    alternates: {
      canonical: url,
      languages: { en: url, fr: url, 'x-default': url },
    },
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------

export default async function HowToSayPage({ params }: { params: { term: string } }) {
  const locale = await getLocale();
  const t = await getTranslations('word');

  const curated = CURATED[params.term];
  const queryString = curated?.query ?? unslugTerm(params.term);
  const termLabel = unslugTerm(params.term);

  const [words, phrases] = await Promise.all([
    searchWords(queryString),
    searchPhrases(queryString),
  ]);

  const title = curated?.title ?? `How to say "${capitalize(termLabel)}" in Moroccan Arabic`;
  const description = curated?.description ??
    (words[0]
      ? `In Darija, "${termLabel}" is ${words[0].darija} (${words[0].arabic}), pronounced /${words[0].pronunciation}/.`
      : '');

  const faqQuestions = words.slice(0, 5).map(w => ({
    '@type': 'Question' as const,
    name: `How do you say "${w.english}" in Moroccan Arabic?`,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: `In Darija (Moroccan Arabic), "${w.english}" is "${w.darija}" (${w.arabic}), pronounced /${w.pronunciation}/.${w.cultural_note ? ' ' + w.cultural_note : ''}`,
    },
  }));

  const jsonLd = faqQuestions.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqQuestions,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <HowToSayClient
        term={termLabel}
        words={words}
        phrases={phrases}
        title={title}
        description={description}
        locale={locale}
      />

      {/* Server-rendered context section for SEO */}
      <section className="px-8 md:px-[8%] lg:px-[12%] py-16 border-t border-neutral-100">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl mb-6">About this word in Darija</h2>
          {description && <p className="text-neutral-900 leading-relaxed mb-4">{description}</p>}
          <p className="text-neutral-900 leading-relaxed mb-4">
            Darija (الدارجة) is Moroccan Arabic — the everyday spoken language of 40 million Moroccans.
            Unlike Modern Standard Arabic, it&apos;s rarely written down and draws heavily on French, Spanish,
            and Amazigh vocabulary. Learning how to say &ldquo;{termLabel}&rdquo; the way Moroccans actually
            say it — with the right pronunciation, register, and cultural context — is the difference
            between sounding like a textbook and sounding like you belong.
          </p>
          <p className="text-neutral-900 leading-relaxed mb-8">
            Every entry on Everyday Darija includes Arabic script, romanized pronunciation, English and
            French translations, and cultural notes where they matter. Use the search above to explore
            related terms, or browse by category below.
          </p>
          <div className="flex flex-wrap gap-4">
            {curated?.category && (
              <Link
                href={`/category/${curated.category.slug}`}
                className="border border-neutral-300 px-6 py-3 text-sm uppercase tracking-wider hover:border-[#c53a1a] hover:text-[#c53a1a] transition-colors"
              >
                Browse {curated.category.name} &rarr;
              </Link>
            )}
            {!curated?.category && words[0]?.category && (
              <Link
                href={`/category/${words[0].category}`}
                className="border border-neutral-300 px-6 py-3 text-sm uppercase tracking-wider hover:border-[#c53a1a] hover:text-[#c53a1a] transition-colors"
              >
                Browse {words[0].category} &rarr;
              </Link>
            )}
            <Link
              href="/"
              className="border border-neutral-300 px-6 py-3 text-sm uppercase tracking-wider hover:border-[#c53a1a] hover:text-[#c53a1a] transition-colors"
            >
              {t('back')} &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
