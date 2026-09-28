/**
 * Deterministic tonal gradients used as artwork placeholders.
 *
 * Remote artwork can fail (offline, expired CDN link). Rather than showing a
 * broken image, `<Artwork>` falls back to a gradient derived from the item's
 * id, so the same album always gets the same colours. Palette values are the
 * Sonic Curator tokens from `.stitch/DESIGN.md` — no off-system colours.
 */

const PAIRS: readonly [string, string][] = [
  ['#3d5afe', '#1c2971'],
  ['#007f32', '#00531e'],
  ['#37438b', '#131314'],
  ['#bbc3ff', '#344088'],
  ['#3ce36a', '#003912'],
  ['#2848ee', '#000f5d'],
  ['#69ff87', '#007f32'],
  ['#dee0ff', '#37438b'],
];

function hash(seed: string): number {
  let value = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    value = ((value << 5) + value + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(value);
}

/** A CSS `linear-gradient` string, stable for a given seed. */
export function gradientFor(seed: string): string {
  const h = hash(seed);
  const [from, to] = PAIRS[h % PAIRS.length];
  const angle = 120 + (h % 5) * 20;
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

/** First letters of the first two words, e.g. "Neon Pulse" -> "NP". */
export function initialsFor(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}
