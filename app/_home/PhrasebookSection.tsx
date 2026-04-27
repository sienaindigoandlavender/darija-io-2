import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import type { DarijaPhrase } from '@/lib/dictionary';

interface Props {
  phrases: DarijaPhrase[];
}

export default async function PhrasebookSection({ phrases }: Props) {
  const t = await getTranslations('home');
  const tPhrase = await getTranslations('phrase');
  const locale = await getLocale();

  if (phrases.length === 0) return null;

  return (
    <section
      className="bg-neutral-50/60 border-t border-neutral-100 px-6 md:px-[8%] lg:px-[12%] py-20 md:py-28"
      aria-labelledby="phrasebook-heading"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-12 md:mb-16">
        <div className="md:col-span-7">
          <p className="text-[#c53a1a] text-[11px] font-medium uppercase tracking-[0.3em] mb-4">
            {t('phrasebookEyebrow')}
          </p>
          <h2
            id="phrasebook-heading"
            className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
          >
            {t('phrasebookTitle')}
          </h2>
        </div>
        <div className="md:col-span-4 md:col-start-9 flex items-end">
          <p className="text-neutral-700 leading-relaxed">{t('phrasebookDesc')}</p>
        </div>
      </div>

      <ul role="list" className="grid md:grid-cols-2 gap-px bg-neutral-200 max-w-5xl">
        {phrases.map(p => {
          const meaning = locale === 'fr' && p.french ? p.french : p.english;
          return (
            <li key={p.id} className="bg-white">
              <Link href={`/phrase/${p.id}`} className="block p-6 md:p-8 hover:bg-neutral-50 transition-colors h-full">
                <p className="font-arabic text-xl md:text-2xl text-[#c53a1a] mb-2 leading-snug">
                  {p.arabic}
                </p>
                <p className="font-display text-lg md:text-xl mb-3 tracking-tight">{p.darija}</p>
                <p className="text-neutral-700 text-base">{meaning}</p>
                {p.literal_translation && (
                  <p className="text-xs italic text-neutral-500 mt-3">
                    {tPhrase('literally')}: {p.literal_translation}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
