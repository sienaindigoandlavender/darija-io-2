import { getTranslations } from 'next-intl/server';
import SearchBox from '@/components/SearchBox';

/**
 * Hero — clarity-first.
 * Single job: get the user to search.
 *
 * Layout:
 *   - Eyebrow ("Moroccan Arabic")
 *   - Single big H1 (no competing decoration)
 *   - One-line tagline
 *   - Search box (the point of the page)
 */
export default async function HomeHero() {
  const t = await getTranslations();

  return (
    <section
      className="relative px-6 md:px-[8%] lg:px-[12%] pt-24 md:pt-40 pb-12 md:pb-28 overflow-hidden"
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
        <p className="text-[#c53a1a] text-[11px] md:text-xs font-medium uppercase tracking-[0.3em] mb-4 md:mb-6">
          {t('site.name')}
        </p>

        <h1
          id="home-h1"
          className="font-display text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] md:leading-[0.9] tracking-tight mb-4 md:mb-6"
        >
          {t('site.tagline')}
        </h1>

        <p className="text-neutral-600 text-base md:text-xl max-w-2xl mb-8 md:mb-16 leading-relaxed">
          {t('site.description')}
        </p>

        <div className="max-w-3xl">
          <SearchBox size="hero" />
        </div>
      </div>
    </section>
  );
}
