import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import LocaleSwitcher from './LocaleSwitcher';

/**
 * Persistent top nav. Always solid — no scroll transition,
 * no motion the user didn't initiate.
 * Clarity-first: brand left, nav center, locale right.
 */
export default async function SiteHeader() {
  const tNav = await getTranslations('nav');

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-100">
      <div className="px-6 md:px-[8%] lg:px-[12%] h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-2 group" aria-label="darija.io home">
          <span className="font-arabic text-xl text-[#c53a1a] leading-none group-hover:opacity-80 transition-opacity">دارجة</span>
          <span className="font-display text-base tracking-tight">darija.io</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link href="/" className="text-neutral-700 hover:text-black transition-colors">{tNav('dictionary')}</Link>
          <Link href="/first-day" className="text-neutral-700 hover:text-black transition-colors">{tNav('firstDay')}</Link>
          <Link href="/grammar" className="text-neutral-700 hover:text-black transition-colors">{tNav('grammar')}</Link>
          <Link href="/about" className="text-neutral-700 hover:text-black transition-colors">{tNav('about')}</Link>
        </nav>

        <LocaleSwitcher />
      </div>
    </header>
  );
}
