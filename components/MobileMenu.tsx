'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * Mobile-only menu trigger + overlay sheet.
 * Calm pattern: full-screen panel, no gestures to learn,
 * tap-targets ≥44px, closes on link tap or backdrop tap.
 */
export default function MobileMenu() {
  const tNav = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-neutral-700 hover:text-black transition-colors"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-x-0 z-30 bg-white overflow-y-auto"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: '#ffffff', top: '56px', height: 'calc(100vh - 56px)' }}
        >
          <nav className="px-6 pt-4 pb-10 flex flex-col">
            <Link
              href="/"
              className="py-4 text-2xl font-display tracking-tight text-neutral-900 border-b border-neutral-100"
            >
              {tNav('dictionary')}
            </Link>
            <Link
              href="/first-day"
              className="py-4 text-2xl font-display tracking-tight text-neutral-900 border-b border-neutral-100"
            >
              {tNav('firstDay')}
            </Link>
            <Link
              href="/grammar"
              className="py-4 text-2xl font-display tracking-tight text-neutral-900 border-b border-neutral-100"
            >
              {tNav('grammar')}
            </Link>
            <Link
              href="/about"
              className="py-4 text-2xl font-display tracking-tight text-neutral-900 border-b border-neutral-100"
            >
              {tNav('about')}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
