'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  return (
    <footer className="mt-20">
      {/* Level 1 — Navigation */}
      <div style={{ backgroundColor: '#1f1f1f' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link href="/" className="block mb-3">
                <span className="uppercase tracking-widest text-sm text-white/90">darija.io</span>
              </Link>
              <p className="text-xs text-white/70 leading-relaxed max-w-xs">
                {t('tagline')}
              </p>
              <div className="mt-5">
                <LocaleSwitcher subtle />
              </div>
            </div>

            {/* Explore */}
            <div>
              <h3 className="uppercase tracking-widest text-[10px] text-white/80 mb-3">{t('explore')}</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-xs text-white/90 hover:text-white transition-colors">{tNav('dictionary')}</Link></li>
                <li><Link href="/category/greetings" className="text-xs text-white/90 hover:text-white transition-colors">{tNav('phrases')}</Link></li>
                <li><Link href="/grammar" className="text-xs text-white/90 hover:text-white transition-colors">{tNav('grammar')}</Link></li>
                <li><Link href="/practice" className="text-xs text-white/90 hover:text-white transition-colors">Practice</Link></li>
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h3 className="uppercase tracking-widest text-[10px] text-white/80 mb-3">{t('learn')}</h3>
              <ul className="space-y-2">
                <li><Link href="/first-day" className="text-xs text-white/90 hover:text-white transition-colors">{tNav('firstDay')}</Link></li>
                <li><Link href="/about" className="text-xs text-white/90 hover:text-white transition-colors">{tNav('about')}</Link></li>
              </ul>
            </div>

            {/* Network */}
            <div>
              <h3 className="uppercase tracking-widest text-[10px] text-white/80 mb-3">{t('network')}</h3>
              <ul className="space-y-2">
                <li><a href="https://www.slowmorocco.com" target="_blank" rel="noopener noreferrer" className="text-xs text-white/90 hover:text-white transition-colors">Slow Morocco</a></li>
                <li><a href="https://architectureofmorocco.com" target="_blank" rel="noopener noreferrer" className="text-xs text-white/90 hover:text-white transition-colors">Architecture of Morocco</a></li>
                <li><a href="https://cuisinesofmorocco.com" target="_blank" rel="noopener noreferrer" className="text-xs text-white/90 hover:text-white transition-colors">Cuisines of Morocco</a></li>
                <li><a href="https://derb.so" target="_blank" rel="noopener noreferrer" className="text-xs text-white/90 hover:text-white transition-colors">derb</a></li>
                <li><a href="https://www.riaddisiena.com" target="_blank" rel="noopener noreferrer" className="text-xs text-white/90 hover:text-white transition-colors">Riad di Siena</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Level 2 — Legal */}
      <div style={{ backgroundColor: '#161616' }}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/legal/privacy" className="text-white/85 hover:text-white transition-colors">{t('privacy')}</Link>
            <Link href="/legal/terms" className="text-white/85 hover:text-white transition-colors">{t('terms')}</Link>
            <Link href="/legal/disclaimer" className="text-white/85 hover:text-white transition-colors">{t('disclaimer')}</Link>
          </div>
        </div>
      </div>

      {/* Level 3 — Powered by */}
      <div style={{ backgroundColor: '#0e0e0e' }}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <p className="text-[9px] tracking-[0.15em] uppercase text-white/70 text-center">
            A <a href="https://www.slowmorocco.com" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white transition-colors">Slow Morocco</a> project / Powered by <a href="https://www.dancingwiththelions.com" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white transition-colors">Dancing with Lions</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
