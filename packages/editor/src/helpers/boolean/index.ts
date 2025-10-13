import { removeWhitespace } from '@helpers/string';

export function toBoolean(v: unknown): boolean | unknown {
  if (typeof v === 'boolean') return v;
  const s = removeWhitespace(String(v)).toLowerCase();
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === '1') return true;
  if (s === '0') return false;
  return v;
}
