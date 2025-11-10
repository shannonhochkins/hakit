import { expect, describe, test } from 'bun:test';
import {
  buildColorVariableGroups,
  parseColorMix,
  extractCssVarToken,
  extractAlphaPct,
  isGradient,
  isCssVariableValue,
} from './colorFieldHelpers';

describe('colorFieldHelpers', () => {
  test('buildColorVariableGroups includes custom non-theme variable', () => {
    const opts = buildColorVariableGroups({ currentValue: 'var(--clr-nonexistent-x99)' });
    console.log('opts[0]', opts[0]);
    expect(opts[0]).toMatchObject({ label: '--clr-nonexistent-x99', meta: { custom: true }, value: 'var(--clr-nonexistent-x99)' });
  });

  test('buildColorVariableGroups includes custom raw color', () => {
    const opts = buildColorVariableGroups({ currentValue: '#ff0000' });
    expect(opts[0]).toMatchObject({ label: '#ff0000', value: '#ff0000', meta: { custom: true } });
  });

  test('parseColorMix extracts token and alpha', () => {
    const mix = 'color-mix(in srgb, var(--clr-primary-a40) 75%, transparent 25%)';
    const parsed = parseColorMix(mix);
    expect(parsed).toEqual({ token: '--clr-primary-a40', alphaPct: 75 });
  });

  test('extractCssVarToken returns token', () => {
    expect(extractCssVarToken('var(--abc)')).toBe('--abc');
    expect(extractCssVarToken('--abc')).toBeUndefined();
  });

  test('extractAlphaPct handles rgba and hex8 and color-mix', () => {
    expect(extractAlphaPct('rgba(10,20,30,0.42)')).toBe(42);
    expect(extractAlphaPct('#ff000080')).toBe(50);
    expect(extractAlphaPct('color-mix(in srgb, var(--x) 33%, transparent 67%)')).toBe(33);
  });

  test('isGradient detects linear-gradient', () => {
    expect(isGradient('linear-gradient(red, blue)')).toBe(true);
    expect(isGradient('#fff')).toBe(false);
  });

  test('isCssVariableValue detects var() syntax', () => {
    expect(isCssVariableValue('var(--x)')).toBe(true);
    expect(isCssVariableValue('--x')).toBe(false);
  });
});
