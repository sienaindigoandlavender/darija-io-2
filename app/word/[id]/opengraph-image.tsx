import { ImageResponse } from 'next/og';
import { getWordById } from '@/lib/dictionary';
import { shapeArabicForOg } from '@/lib/arabicShape';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
// Default behaviour: rendered on first request, then cached.
// We do NOT statically pre-render 10k+ OG images at build time.

// OG image metadata
export const alt = 'Darija word card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Per-word share card.
 *
 * Calm Moroccan minimal:
 *   - Cream background (#fbf7f1)
 *   - Terracotta brand color for Arabic (#c53a1a)
 *   - Large Arabic word centred
 *   - Small Latin transliteration + English meaning
 *   - Tiny darija.io wordmark bottom-left
 *   - One subtle ornament (faded دارجة) bottom-right
 *
 * Renders at 1200×630 (universal OG / Twitter / Pinterest acceptable).
 */
export default async function Image({ params }: { params: { id: string } }) {
  const word = await getWordById(params.id);

  // Pre-shape Arabic for Satori (which doesn't run OpenType shaping in this version)
  const arabicShaped = word ? shapeArabicForOg(word.arabic) : '';
  const ornamentShaped = shapeArabicForOg('دارجة');

  // Amiri — classical Naskh-style Arabic font, open source. Bundled
  // because (a) ImageResponse can't use system fonts, (b) Amiri's
  // ligature tables are compatible with @vercel/og (Noto Naskh isn't).
  const arabicFont = await readFile(
    path.join(process.cwd(), 'app/_og-fonts/amiri-regular.woff')
  ).catch(() => null);

  if (!word) {
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
        {/* Eyebrow */}
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
          Moroccan Arabic
        </div>

        {/* Main content — vertically centred */}
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
          {/* Arabic — the visual hero */}
          <div
            style={{
              fontFamily: 'AmiriArabic, serif',
              fontSize: 168,
              color: '#c53a1a',
              lineHeight: 1.1,
              marginBottom: 20,
              display: 'flex',
            }}
          >
            {arabicShaped}
          </div>

          {/* Transliteration */}
          <div
            style={{
              fontSize: 64,
              color: '#1a1a1a',
              lineHeight: 1,
              marginBottom: 20,
              display: 'flex',
              letterSpacing: -1,
            }}
          >
            {word.darija}
          </div>

          {/* English meaning */}
          <div
            style={{
              fontSize: 36,
              color: '#525252',
              display: 'flex',
            }}
          >
            {word.english}
          </div>
        </div>

        {/* Footer wordmark */}
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
