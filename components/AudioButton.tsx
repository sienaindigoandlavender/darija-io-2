'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  /** MP3/WAV URL. If undefined, the button is shown disabled with "audio coming soon" tooltip. */
  src?: string;
  /** Aria label fallback (uses translation when omitted). */
  label?: string;
  /** Visual size — small for inline contexts, default for hero. */
  size?: 'sm' | 'md';
}

/**
 * AudioButton — Phase 1 scaffolding for ElevenLabs pronunciation playback.
 *
 * Silent until `src` is populated on a word/phrase. When src is missing the
 * button is disabled but visible — gives the UI a clear "audio coming" affordance
 * without breaking the layout once we backfill audio later.
 */
export default function AudioButton({ src, label, size = 'md' }: Props) {
  const t = useTranslations('word');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const dimensions = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
  const iconSize = size === 'sm' ? 14 : 18;

  const play = () => {
    if (!src) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.addEventListener('ended', () => setPlaying(false));
      audioRef.current.addEventListener('pause', () => setPlaying(false));
    }
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
    setPlaying(true);
  };

  const disabled = !src;

  return (
    <button
      type="button"
      onClick={play}
      disabled={disabled}
      aria-label={label || (disabled ? t('audioComing') : t('playAudio'))}
      title={disabled ? t('audioComing') : t('playAudio')}
      className={[
        dimensions,
        'inline-flex items-center justify-center rounded-full border transition-colors',
        disabled
          ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
          : 'border-neutral-300 text-neutral-700 hover:border-[#c53a1a] hover:text-[#c53a1a] active:scale-95',
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
