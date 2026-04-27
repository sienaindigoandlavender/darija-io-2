'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface DarijaWord {
  id: string;
  darija: string;
  arabic: string;
  english: string;
  french: string;
  pronunciation: string;
  category: string;
}
interface DarijaPhrase {
  id: string;
  darija: string;
  arabic: string;
  english: string;
  french: string;
  category: string;
}

interface Props {
  size?: 'hero' | 'compact';
  autoFocus?: boolean;
  examples?: string[];
}

export default function SearchBox({ size = 'hero', autoFocus = false, examples }: Props) {
  const t = useTranslations('search');
  const [query, setQuery] = useState('');
  const [words, setWords] = useState<DarijaWord[]>([]);
  const [phrases, setPhrases] = useState<DarijaPhrase[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tryExamples = examples ?? (t.raw('examples') as string[]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!query.trim()) {
      setWords([]);
      setPhrases([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then(r => r.json())
        .then(d => {
          setWords((d.words || []).slice(0, 8));
          setPhrases((d.phrases || []).slice(0, 4));
        })
        .catch(() => {});
    }, 150);
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const allResults = [
    ...words.map(w => ({ kind: 'word' as const, item: w })),
    ...phrases.map(p => ({ kind: 'phrase' as const, item: p })),
  ];

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      const r = allResults[activeIdx];
      if (r) {
        const href = r.kind === 'word' ? `/word/${r.item.id}` : `/phrase/${r.item.id}`;
        window.location.href = href;
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const inputBase = 'w-full bg-transparent outline-none transition-colors placeholder:font-display';
  const inputSize = size === 'hero'
    ? 'pb-4 text-xl md:text-2xl border-b-2 border-neutral-200 focus:border-[#c53a1a] font-display placeholder:text-neutral-400'
    : 'py-3 px-4 text-base border border-neutral-200 rounded-lg focus:border-[#c53a1a] font-display placeholder:text-neutral-400';

  const showDropdown = isOpen && query.trim().length > 0;
  const noResults = showDropdown && allResults.length === 0 && query.trim().length > 1;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={size === 'hero' ? t('placeholder') : t('shortPlaceholder')}
          className={`${inputBase} ${inputSize}`}
          aria-label={t('label')}
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear"
            className="absolute right-0 bottom-4 text-neutral-400 hover:text-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {!query && size === 'hero' && tryExamples.length > 0 && (
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 mt-4">
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">{t('tryLabel')}</span>
          {tryExamples.map(w => (
            <button
              key={w}
              type="button"
              onClick={() => {
                setQuery(w);
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="text-sm text-neutral-500 hover:text-[#c53a1a] transition-colors font-display italic"
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 max-h-[70vh] overflow-y-auto">
          {noResults ? (
            <div className="px-5 py-8 text-center">
              <span className="font-arabic text-4xl text-neutral-200 block mb-2">؟</span>
              <p className="font-display text-lg text-black">{t('noResults', { query })}</p>
              <p className="text-sm text-neutral-500 mt-1">{t('noResultsHint')}</p>
            </div>
          ) : (
            <ul role="listbox" className="py-2">
              {words.length > 0 && (
                <li className="px-5 pt-2 pb-1 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                  {t('resultsWords', { count: words.length })}
                </li>
              )}
              {words.map((w, i) => (
                <li key={w.id} role="option" aria-selected={activeIdx === i}>
                  <Link
                    href={`/word/${w.id}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`flex items-baseline justify-between gap-4 px-5 py-3 transition-colors ${
                      activeIdx === i ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <span className="flex items-baseline gap-3 min-w-0">
                      <span className="font-arabic text-lg text-[#c53a1a] shrink-0">{w.arabic}</span>
                      <span className="font-display text-base truncate">{w.darija}</span>
                    </span>
                    <span className="text-sm text-neutral-500 truncate">{w.english}</span>
                  </Link>
                </li>
              ))}
              {phrases.length > 0 && (
                <li className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-[0.25em] text-neutral-400 border-t border-neutral-100 mt-1">
                  {t('resultsPhrases', { count: phrases.length })}
                </li>
              )}
              {phrases.map((p, i) => {
                const idx = words.length + i;
                return (
                  <li key={p.id} role="option" aria-selected={activeIdx === idx}>
                    <Link
                      href={`/phrase/${p.id}`}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`flex flex-col gap-0.5 px-5 py-3 transition-colors ${
                        activeIdx === idx ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="font-arabic text-base text-[#c53a1a] shrink-0">{p.arabic}</span>
                        <span className="font-display text-sm">{p.darija}</span>
                      </span>
                      <span className="text-xs text-neutral-500">{p.english}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
