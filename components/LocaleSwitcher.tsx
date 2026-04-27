'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function LocaleSwitcher({ subtle = false }: { subtle?: boolean }) {
  const locale = useLocale();
  const t = useTranslations('language');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (next: 'en' | 'fr') => {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    startTransition(() => {
      // Soft refresh — re-runs server components for the new locale,
      // no navigation event, scroll position preserved.
      router.refresh();
    });
  };

  const baseClass = subtle
    ? 'text-[10px] uppercase tracking-[0.25em] transition-colors'
    : 'text-xs uppercase tracking-[0.2em] transition-colors';
  const activeClass = 'text-[#c53a1a]';
  const inactiveClass = subtle ? 'text-neutral-400 hover:text-neutral-700' : 'text-neutral-500 hover:text-black';

  return (
    <div className={`inline-flex items-center gap-3 ${isPending ? 'opacity-60' : ''}`} aria-label={t('switch')}>
      <button
        onClick={() => setLocale('en')}
        className={`${baseClass} ${locale === 'en' ? activeClass : inactiveClass}`}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <span className={`${baseClass} ${inactiveClass}`} aria-hidden="true">·</span>
      <button
        onClick={() => setLocale('fr')}
        className={`${baseClass} ${locale === 'fr' ? activeClass : inactiveClass}`}
        aria-pressed={locale === 'fr'}
      >
        FR
      </button>
    </div>
  );
}
