import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface Cat {
  id: string;
  name: string;
  count: number;
}

interface Props {
  wordCategories: Cat[];
  phraseCategories: Cat[];
}

/**
 * Browse by category.
 * Replaces the old type-cloud (visually exciting but hard to scan)
 * with a clean, scannable, server-rendered grid.
 *
 * Each tile is one category. Sort by count, biggest first.
 */
export default async function CategoryGrid({ wordCategories }: Props) {
  const t = await getTranslations('home');
  const tCat = await getTranslations('category');

  return (
    <section
      className="bg-neutral-50/60 border-t border-neutral-100 px-6 md:px-[8%] lg:px-[12%] py-14 md:py-28"
      aria-labelledby="categories-heading"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-12 md:mb-16">
        <div className="md:col-span-7">
          <p className="text-[#c53a1a] text-[11px] font-medium uppercase tracking-[0.3em] mb-4">
            {t('browseByCategory')}
          </p>
          <h2
            id="categories-heading"
            className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
          >
            {t('browseByCategory')}
          </h2>
        </div>
        <div className="md:col-span-4 md:col-start-9 flex items-end">
          <p className="text-neutral-700 leading-relaxed">
            {t('browseByCategoryDesc')}
          </p>
        </div>
      </div>

      <ul
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-neutral-200"
        role="list"
      >
        {wordCategories.map(c => (
          <li key={c.id} className="bg-white">
            <Link
              href={`/category/${c.id}`}
              className="group flex flex-col justify-between h-full p-5 md:p-6 transition-colors hover:bg-neutral-50"
            >
              <span className="font-display text-lg md:text-xl tracking-tight group-hover:text-[#c53a1a] transition-colors">
                {c.name}
              </span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mt-6">
                {tCat('wordsCount', { count: c.count })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
