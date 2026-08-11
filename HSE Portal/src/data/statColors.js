// Central semantic color map for StatCard / accent usage across all pages.
// Use the `variant` name instead of hardcoding hex values in JSX.
export const STAT_VARIANTS = {
  blue: { color: 'var(--info-600)', bg: 'var(--info-50)' },
  teal: { color: 'var(--teal-600)', bg: 'var(--teal-50)' },
  green: { color: 'var(--green-600)', bg: 'var(--green-100)' },
  amber: { color: 'var(--amber-600)', bg: 'var(--amber-100)' },
  red: { color: 'var(--red-600)', bg: 'var(--red-100)' },
  violet: { color: 'var(--violet-600)', bg: 'var(--violet-100)' },
  pink: { color: 'var(--pink-600)', bg: 'var(--pink-100)' },
  orange: { color: 'var(--orange-600)', bg: 'var(--orange-100)' },
  cyan: { color: 'var(--cyan-600)', bg: 'var(--cyan-100)' },
  slate: { color: 'var(--slate-500)', bg: 'var(--slate-100)' },
};

export const STAT_VARIANT_NAMES = Object.keys(STAT_VARIANTS);
