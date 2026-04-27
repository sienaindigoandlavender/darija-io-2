'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';
import { useEffect, useState } from 'react';

/**
 * Persistent top nav. Translucent on top, solid on scroll.
 * Clarity-first: brand left, nav center, locale right.
 */
export default function SiteHeader() {
  const tNav = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur border-b border-neutral-100' : 'bg-transparent'
      }`}
    >
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
