'use client';

import { useEffect } from 'react';
import { pushRecent } from './RecentlyViewed';

/**
 * Fire-and-forget client component.
 * Mounts on word/phrase pages and records the visit in localStorage.
 * Renders nothing.
 */
interface Props {
  kind: 'word' | 'phrase';
  id: string;
  label: string;
  sub: string;
}

export default function RecentTracker({ kind, id, label, sub }: Props) {
  useEffect(() => {
    pushRecent({ kind, id, label, sub });
  }, [kind, id, label, sub]);

  return null;
}
