// @ts-expect-error — package has no types
import { ArabicShaper } from 'arabic-persian-reshaper';

/**
 * Pre-shape Arabic text for use in @vercel/og (Satori) image generation.
 *
 * Why: the version of Satori bundled with Next 14.2 does not run the
 * OpenType Arabic shaping engine. Without pre-shaping, letters render
 * in their isolated (disconnected) forms.
 *
 * What this does:
 *   1. `convertArabic` maps each Unicode Arabic code point to its
 *      correct presentation-form glyph (initial / medial / final /
 *      isolated) based on neighbouring letters.
 *   2. The shaped string then needs to be reversed because Satori
 *      lays out characters left-to-right; reversing makes the visual
 *      reading order right-to-left.
 *
 * Use only for OG image generation. Live HTML pages use the browser's
 * native shaping engine and must NOT receive pre-shaped/reversed text.
 */
export function shapeArabicForOg(text: string): string {
  const shaped = ArabicShaper.convertArabic(text);
  // Reverse codepoints (handles surrogate pairs correctly with Array.from)
  return Array.from(shaped as string).reverse().join('');
}
