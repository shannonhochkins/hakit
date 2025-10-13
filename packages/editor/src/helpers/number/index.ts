import { removeWhitespace } from '@helpers/string';

// Format numbers in a compact, human-readable format
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

export function toNumber(v: unknown): number | unknown {
  // if it's already a number, return it
  if (typeof v === 'number') return v;

  const s = removeWhitespace(String(v));
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : v;
}
