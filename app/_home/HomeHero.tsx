import { getTranslations } from 'next-intl/server';
import SearchBox from '@/components/SearchBox';

interface Props {
  stats: { totalWords: number; totalPhrases: number };
}

/**
 * Hero — clarity-first.
 * Single job: get the user to search.
 *
 * Layout:
 *   - Eyebrow ("Moroccan Arabic")
 *   - Single big H1 (no competing decoration)
 *   - One-line tagline
 *   - Search box (the point of the page)
 *   - Tiny stat strip
 */
export default async function HomeHero({ stats }: Props) {
  const t = await getTranslations();

  return (
    <section
      className="relative px-6 md:px-[8%] lg:px-[12%] pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden"
      aria-labelledby="home-h1"
    >
      {/* One subtle Arabic ornament — bottom-right, far from search box */}
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-16 md:-right-32 pointer-events-none select-none"
      >
        <span className="font-arabic text-[28vw] md:text-[20vw] leading-none text-[#c53a1a]/[0.04]">
          دارجة
        </span>
      </div>

      <div className="relative z-10 max-w-5xl">
        <p className="text-[#c53a1a] text-[11px] md:text-xs font-medium uppercase tracking-[0.3em] mb-6">
          {t('site.name')}
        </p>

        <h1
          id="home-h1"
          className="font-display text-[clamp(2.75rem,8vw,7rem)] leading-[0.9] tracking-tight mb-6"
        >
          {t('site.tagline')}
        </h1>

        <p className="text-neutral-600 text-lg md:text-xl max-w-2xl mb-12 md:mb-16 leading-relaxed">
          {t('site.description')}
        </p>

        <div className="max-w-3xl">
          <SearchBox size="hero" />
        </div>

        <div className="flex flex-wrap items-baseline gap-x-12 gap-y-4 mt-16 md:mt-20">
          <Stat value={stats.totalWords} label={t('home.stats.words')} />
          <Stat value={stats.totalPhrases} label={t('home.stats.phrases')} />
          <Stat value={33} label={t('home.stats.categories')} />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <span
        className="font-display text-3xl md:text-4xl block leading-none"
        style={{ letterSpacing: '0.02em' }}
      >
        {value.toLocaleString()}
      </span>
      <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mt-2 block">
        {label}
      </span>
    </div>
  );
}
