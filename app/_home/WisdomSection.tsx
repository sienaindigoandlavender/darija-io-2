import { getTranslations, getLocale } from 'next-intl/server';
import type { DarijaPhrase } from '@/lib/dictionary';

interface Props {
  proverbs: DarijaPhrase[];
}

/**
 * Closing section. Dark, contemplative — anchors the brand
 * (engagement through atmosphere, not noise).
 */
export default async function WisdomSection({ proverbs }: Props) {
  const t = await getTranslations('home');
  const locale = await getLocale();

  return (
    <section
      className="relative px-6 md:px-[8%] lg:px-[12%] py-16 md:py-32 bg-neutral-900 text-white overflow-hidden"
      aria-labelledby="wisdom-heading"
    >
      <div
        aria-hidden="true"
        className="absolute -top-10 right-0 translate-x-[15%] pointer-events-none select-none"
      >
        <span className="font-arabic text-[28vw] md:text-[22vw] leading-none text-white/[0.025]">
          حكمة
        </span>
      </div>

      <div className="relative z-10 max-w-6xl">
        <p className="text-[#d4931a] text-[11px] font-medium uppercase tracking-[0.3em] mb-4">
          {t('wisdomEyebrow')}
        </p>
        <h2
          id="wisdom-heading"
          className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.95] mb-16 md:mb-20 tracking-tight"
        >
          {t('wisdomTitle')}
        </h2>

        <ul role="list" className="grid md:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-14">
          {proverbs.map(p => {
            const meaning = locale === 'fr' && p.french ? p.french : p.english;
            return (
              <li key={p.id}>
                <p className="font-arabic text-xl md:text-2xl text-[#d4931a] mb-3 leading-snug">
                  {p.arabic}
                </p>
                <p className="font-display text-lg md:text-xl italic text-white/85 mb-4 tracking-tight">
                  {p.darija}
                </p>
                <p className="text-white/60 text-sm md:text-base leading-relaxed">{meaning}</p>
                {p.literal_translation && (
                  <p className="text-white/40 text-xs italic mt-3">
                    Literally: {p.literal_translation}
                  </p>
                )}
                {p.cultural_note && (
                  <p className="text-white/50 text-xs md:text-sm mt-4 border-l border-[#d4931a]/30 pl-4 leading-relaxed">
                    {p.cultural_note}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
