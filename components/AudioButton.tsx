'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  /** MP3/WAV URL. If undefined, the component renders nothing (calm-tech: hide what isn't ready). */
  src?: string;
  /** Aria label fallback (uses translation when omitted). */
  label?: string;
  /** Visual size — small for inline contexts, default for hero. */
  size?: 'sm' | 'md';
}

/**
 * AudioButton — pronunciation playback.
 *
 * Calm-tech principle: don't pre-announce future features.
 * When `src` is missing, this component renders nothing at all
 * (no "audio coming soon" placeholder, no greyed-out button).
 *
 * The data scaffolding (DarijaWord.audio_url, JSON-LD AudioObject)
 * stays in place so flipping audio on later is a one-line change.
 */
export default function AudioButton({ src, label, size = 'md' }: Props) {
  const t = useTranslations('word');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  if (!src) return null;

  const dimensions = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
  const iconSize = size === 'sm' ? 14 : 18;

  const play = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.addEventListener('ended', () => setPlaying(false));
      audioRef.current.addEventListener('pause', () => setPlaying(false));
    }
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
    setPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={play}
      aria-label={label || t('playAudio')}
      title={t('playAudio')}
      className={[
        dimensions,
        'inline-flex items-center justify-center rounded-full border transition-colors',
        'border-neutral-300 text-neutral-700 hover:border-[#c53a1a] hover:text-[#c53a1a] active:scale-95',
        playing ? 'border-[#c53a1a] text-[#c53a1a]' : '',
      ].join(' ')}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}
