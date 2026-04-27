import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import type { DarijaWord } from '@/lib/dictionary';

interface Props {
  word: DarijaWord;
}

/**
 * Word of the day — quiet ritual section.
 * One word. One translation. One cultural note.
 * Fresh every day, deterministic per day (SSR-safe).
 */
export default async function WordOfTheDay({ word }: Props) {
  const t = await getTranslations('home');
  const locale = await getLocale();
  const meaning = locale === 'fr' && word.french ? word.french : word.english;
  const secondary = locale === 'fr' ? word.english : word.french;

  return (
    <section
      className="border-t border-neutral-100 px-6 md:px-[8%] lg:px-[12%] py-20 md:py-28"
      aria-labelledby="wotd-heading"
    >
      <div className="grid md:grid-cols-12 gap-10 md:gap-16">
        <div className="md:col-span-6">
          <p
            id="wotd-heading"
            className="text-[#d4931a] text-[11px] font-medium uppercase tracking-[0.3em] mb-6"
          >
            {t('wordOfTheDay')}
          </p>

          <Link href={`/word/${word.id}`} className="group inline-block">
            <span className="font-arabic text-5xl md:text-7xl text-[#c53a1a] block leading-none mb-4 group-hover:opacity-80 transition-opacity">
              {word.arabic}
            </span>
            <span className="font-display text-3xl md:text-5xl block tracking-tight group-hover:underline decoration-1 underline-offset-8">
              {word.darija}
            </span>
          </Link>

          <p className="font-mono text-neutral-500 text-sm mt-3 tracking-wide">
            /{word.pronunciation}/
          </p>

          <p className="text-black text-xl md:text-2xl mt-6">{meaning}</p>
          {secondary && <p className="text-neutral-500 text-base mt-1">{secondary}</p>}
        </div>

        {word.cultural_note && (
          <div className="md:col-span-5 md:col-start-8 flex items-start md:items-center">
            <div className="border-l-2 border-[#d4931a] pl-6 md:pl-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#d4931a] mb-3">
                {/* "Cultural note" reused from word.* namespace */}
              </p>
              <p className="text-neutral-900 leading-relaxed text-base md:text-lg">
                {word.cultural_note}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
