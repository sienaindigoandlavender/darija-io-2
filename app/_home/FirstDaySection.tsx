import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import type { DarijaWord } from '@/lib/dictionary';

interface Props {
  words: DarijaWord[];
}

/**
 * "Your first day" — 8 must-know words, presented as a clean list.
 * Each row is its own dictionary entry. Click → /word/{id}.
 * No accordions, no expand toggles — clarity first.
 */
export default async function FirstDaySection({ words }: Props) {
  const t = await getTranslations('home');
  const locale = await getLocale();

  if (words.length === 0) return null;

  return (
    <section
      className="border-t border-neutral-100 px-6 md:px-[8%] lg:px-[12%] py-20 md:py-28"
      aria-labelledby="first-day-heading"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-12 md:mb-16">
        <div className="md:col-span-7">
          <p className="text-[#c53a1a] text-[11px] font-medium uppercase tracking-[0.3em] mb-4">
            {t('essentials')}
          </p>
          <h2
            id="first-day-heading"
            className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
          >
            {t('essentialsTitle')}
          </h2>
        </div>
        <div className="md:col-span-4 md:col-start-9 flex items-end">
          <p className="text-neutral-700 leading-relaxed">{t('essentialsDesc')}</p>
        </div>
      </div>

      <ul role="list" className="divide-y divide-neutral-100 border-y border-neutral-100">
        {words.map(w => {
          const meaning = locale === 'fr' && w.french ? w.french : w.english;
          return (
            <li key={w.id}>
              <Link
                href={`/word/${w.id}`}
                className="group flex items-baseline justify-between gap-6 py-5 md:py-6 hover:bg-neutral-50/50 -mx-6 md:-mx-8 px-6 md:px-8 transition-colors"
              >
                <span className="flex items-baseline gap-5 min-w-0">
                  <span className="font-arabic text-2xl md:text-3xl text-[#c53a1a] shrink-0 leading-none">
                    {w.arabic}
                  </span>
                  <span className="font-display text-xl md:text-2xl tracking-tight truncate">
                    {w.darija}
                  </span>
                </span>
                <span className="flex items-baseline gap-4 shrink-0">
                  <span className="text-neutral-700 text-base md:text-lg">{meaning}</span>
                  <svg
                    className="w-4 h-4 text-neutral-300 group-hover:text-[#c53a1a] group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-10">
        <Link
          href="/first-day"
          className="text-sm uppercase tracking-[0.2em] text-[#c53a1a] hover:underline underline-offset-4"
        >
          {t('essentials')} →
        </Link>
      </div>
    </section>
  );
}
