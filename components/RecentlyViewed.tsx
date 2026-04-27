'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

/**
 * Recently viewed — calm daily-use surface.
 * Reads localStorage only; renders nothing if empty (no skeleton, no nag).
 * Items are tracked by /word/[id] and /phrase/[id] pages on mount.
 *
 * Storage shape: [{ kind: 'word'|'phrase', id, label, sub, ts }]
 * Cap at 8 items, dedupe by `${kind}:${id}`.
 */
export interface RecentItem {
  kind: 'word' | 'phrase';
  id: string;
  label: string;
  sub: string;
  ts: number;
}

const STORAGE_KEY = 'darija_recent_v1';

export function readRecent(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is RecentItem =>
        i && (i.kind === 'word' || i.kind === 'phrase') && typeof i.id === 'string'
    );
  } catch {
    return [];
  }
}

export function pushRecent(item: Omit<RecentItem, 'ts'>) {
  if (typeof window === 'undefined') return;
  try {
    const list = readRecent();
    const key = `${item.kind}:${item.id}`;
    const filtered = list.filter(i => `${i.kind}:${i.id}` !== key);
    const next = [{ ...item, ts: Date.now() }, ...filtered].slice(0, 8);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

export default function RecentlyViewed() {
  const t = useTranslations('home');
  const [items, setItems] = useState<RecentItem[] | null>(null);

  useEffect(() => {
    setItems(readRecent());
  }, []);

  // Skip the section completely when empty — calm software, no empty states.
  if (!items || items.length === 0) return null;

  return (
    <section
      className="border-t border-neutral-100 px-6 md:px-[8%] lg:px-[12%] py-10 md:py-16"
      aria-labelledby="recent-heading"
    >
      <p
        id="recent-heading"
        className="text-[#c53a1a] text-[11px] font-medium uppercase tracking-[0.3em] mb-6"
      >
        {t('recentlyViewed')}
      </p>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {items.map(item => {
          const href = item.kind === 'word' ? `/word/${item.id}` : `/phrase/${item.id}`;
          return (
            <Link
              key={`${item.kind}:${item.id}`}
              href={href}
              className="group inline-flex items-baseline gap-3 py-2 -my-2 hover:text-[#c53a1a] transition-colors"
            >
              <span className="font-display text-base md:text-lg text-neutral-900 group-hover:text-[#c53a1a] transition-colors">
                {item.label}
              </span>
              <span className="text-sm text-neutral-400 truncate max-w-[40vw] md:max-w-[16rem]">
                {item.sub}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
