import { ImageResponse } from 'next/og';
import { getPhraseById } from '@/lib/dictionary';
import { shapeArabicForOg } from '@/lib/arabicShape';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
// Rendered on first request, then cached. Not pre-built.

export const alt = 'Darija phrase card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Per-phrase share card.
 * Same calm Moroccan minimal as word cards, but tuned for longer text:
 *   - Smaller Arabic (phrases are multi-word)
 *   - Transliteration sized down so it fits
 *   - Same eyebrow and wordmark for brand consistency
 */
export default async function Image({ params }: { params: { id: string } }) {
  const phrase = await getPhraseById(params.id);
  const arabicShaped = phrase ? shapeArabicForOg(phrase.arabic) : '';
  const ornamentShaped = shapeArabicForOg('دارجة');

  const arabicFont = await readFile(
    path.join(process.cwd(), 'app/_og-fonts/amiri-regular.woff')
  ).catch(() => null);

  if (!phrase) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fbf7f1',
            color: '#c53a1a',
            fontSize: 48,
          }}
        >
          darija.io
        </div>
      ),
      { ...size }
    );
  }

  // Phrases tend to be longer — scale Arabic + Latin sizes down with length.
  const arabicLen = phrase.arabic.length;
  const arabicSize = arabicLen > 30 ? 80 : arabicLen > 18 ? 110 : 140;
  const darijaLen = phrase.darija.length;
  const darijaSize = darijaLen > 40 ? 36 : darijaLen > 24 ? 46 : 56;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#fbf7f1',
          padding: '72px 80px',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            color: '#c53a1a',
            fontSize: 18,
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          Moroccan Arabic Phrase
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: 'AmiriArabic, serif',
              fontSize: arabicSize,
              color: '#c53a1a',
              lineHeight: 1.2,
              marginBottom: 24,
              display: 'flex',
            }}
          >
            {arabicShaped}
          </div>

          <div
            style={{
              fontSize: darijaSize,
              color: '#1a1a1a',
              lineHeight: 1.1,
              marginBottom: 20,
              display: 'flex',
              letterSpacing: -0.5,
            }}
          >
            {phrase.darija}
          </div>

          <div
            style={{
              fontSize: 32,
              color: '#525252',
              display: 'flex',
            }}
          >
            {phrase.english}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontFamily: 'AmiriArabic, serif',
              fontSize: 28,
              color: '#c53a1a',
              display: 'flex',
            }}
          >
            {ornamentShaped}
          </span>
          <span
            style={{
              fontSize: 22,
              color: '#1a1a1a',
              letterSpacing: -0.5,
              display: 'flex',
            }}
          >
            darija.io
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: arabicFont
        ? [
            {
              name: 'AmiriArabic',
              data: arabicFont,
              style: 'normal',
              weight: 400,
            },
          ]
        : [],
    }
  );
}
