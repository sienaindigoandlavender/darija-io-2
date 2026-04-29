import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import LocaleSwitcher from './LocaleSwitcher';
import MobileMenu from './MobileMenu';

/**
 * Persistent top nav. Always solid — no scroll transition,
 * no motion the user didn't initiate.
 * Clarity-first: brand left, desktop nav center, locale + mobile trigger right.
 */
export default async function SiteHeader() {
  const tNav = await getTranslations('nav');

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-100">
      <div className="px-6 md:px-[8%] lg:px-[12%] h-14 flex items-center justify-between gap-4 md:gap-6">
        <Link href="/" className="flex items-baseline gap-2 group" aria-label="darija.io home">
          <span className="font-arabic text-xl text-[#c53a1a] leading-none group-hover:opacity-80 transition-opacity">دارجة</span>
          <span className="font-display text-base tracking-tight">darija.io</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest">
          <Link href="/" className="text-neutral-700 hover:text-black transition-colors">{tNav('dictionary')}</Link>
          <Link href="/first-day" className="text-neutral-700 hover:text-black transition-colors">{tNav('firstDay')}</Link>
          <Link href="/practice" className="text-neutral-700 hover:text-black transition-colors">{tNav('practice')}</Link>
          <Link href="/grammar" className="text-neutral-700 hover:text-black transition-colors">{tNav('grammar')}</Link>
          <Link href="/how-to-say" className="text-neutral-700 hover:text-black transition-colors">{tNav('phrases')}</Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <LocaleSwitcher />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
