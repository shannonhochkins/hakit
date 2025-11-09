import type { FieldOption } from '@shared/typings/fields';

// Theme variable groups and steps
const GROUPS: { key: string; label: string; prefix: string }[] = [
  { key: 'primary', label: 'Primary', prefix: '--clr-primary-a' },
  { key: 'surface', label: 'Surface', prefix: '--clr-surface-a' },
  { key: 'info', label: 'Info', prefix: '--clr-info-a' },
  { key: 'success', label: 'Success', prefix: '--clr-success-a' },
  { key: 'warning', label: 'Warning', prefix: '--clr-warning-a' },
  { key: 'error', label: 'Error', prefix: '--clr-error-a' },
];
const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

export function buildColorVariableGroups(currentValue?: string): FieldOption[] {
  const out: FieldOption[] = [];
  const canonicalVars: string[] = [];
  GROUPS.forEach(g => {
    STEPS.forEach(step => {
      const cssVar = `${g.prefix}${step}`;
      canonicalVars.push(cssVar);
      out.push({
        label: `${g.label} ${step}`,
        value: `var(${cssVar})`,
        meta: { cssVar, group: g.label, step },
      });
    });
  });
  if (currentValue) {
    if (isCssVariableValue(currentValue)) {
      const token = extractCssVarToken(currentValue);
      if (token && !canonicalVars.includes(token)) {
        out.unshift({ label: token, value: currentValue, meta: { cssVar: token, custom: true, group: 'Custom' } });
      }
    } else {
      out.unshift({ label: currentValue, value: currentValue, meta: { custom: true, group: 'Custom' } });
    }
  }
  return out;
}

// ---------- Parsing helpers ----------

// color-mix(in srgb, var(--token) A%, transparent B%)
const COLOR_MIX_REGEX = /^color-mix\(in\s+srgb,\s*var\((--[^)]+)\)\s+(\d{1,3})%,\s*transparent\s+(\d{1,3})%\)$/;

export function parseColorMix(val: string): { token: string; alphaPct: number } | undefined {
  const m = val.match(COLOR_MIX_REGEX);
  if (!m) return undefined;
  const token = m[1];
  const pct = parseInt(m[2], 10);
  if (isNaN(pct)) return undefined;
  return { token, alphaPct: pct };
}

export function extractCssVarToken(val: string): string | undefined {
  const m = val.match(/^var\((--[^)]+)\)$/);
  return m?.[1];
}

export function isCssVariableValue(val: string): boolean {
  return /^var\((--[a-zA-Z0-9-_]+)\)$/.test(val.trim());
}

export function isGradient(val: string): boolean {
  return /^(linear-gradient|radial-gradient)\(/.test(val.trim());
}

// Extract alpha percentage from rgba(), #rrggbbaa, or color-mix var form
export function extractAlphaPct(val: string): number | undefined {
  const mix = parseColorMix(val);
  if (mix) return mix.alphaPct;
  const rgba = val.match(/rgba?\(([^)]*)\)/);
  if (rgba) {
    const parts = rgba[1].split(/\s*,\s*/);
    if (parts.length >= 4) {
      const a = parseFloat(parts[3]);
      if (!isNaN(a)) return Math.round(a * 100);
    }
  }
  const hex8 = val.match(/^#([0-9a-fA-F]{8})$/);
  if (hex8) {
    const aHex = hex8[1].substring(6, 8);
    const a = parseInt(aHex, 16) / 255;
    return Math.round(a * 100);
  }
  return undefined;
}

export function isColorMix(val: string): boolean {
  return COLOR_MIX_REGEX.test(val);
}
