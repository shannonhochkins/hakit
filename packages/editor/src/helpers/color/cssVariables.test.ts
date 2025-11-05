import { generateColorSwatches } from './index';
import { generateCssVariables, generateCssVariablesData, type CssVariablePairData } from './generateCssVariables';
import { describe, it, expect } from 'bun:test';
import { SEMANTIC_DEFAULTS } from './semantic';

describe('generateCssVariables', () => {
  it('produces default variable names with on-* text colors', () => {
    const scales = generateColorSwatches({ primary: '#3366ff', surface: '#121212', tonalityMix: 0.25, ...SEMANTIC_DEFAULTS });
    const css = generateCssVariables(scales);
    // basic expectations
    expect(css).toContain('--clr-primary-a0:');
    expect(css).toContain('--clr-on-primary-a0:');
    expect(css).toContain('--clr-surface-a0:');
    expect(css).toContain('--clr-on-surface-a0:');
    // ensure a later label present
    expect(css).toContain('--clr-primary-a90:');
  });

  it('allows custom prefix and scale names and excludes text when requested', () => {
    const scales = generateColorSwatches({ primary: '#ff6600', surface: '#ffffff', lightMode: true, ...SEMANTIC_DEFAULTS });
    const css = generateCssVariables(scales, { prefix: 'theme', primaryName: 'brand', surfaceName: 'bg', includeText: false });
    expect(css).toContain('--theme-brand-a0:');
    expect(css).toContain('--theme-bg-a0:');
    expect(css).not.toContain('--theme-on-brand-a0:');
    expect(css).not.toContain('--theme-on-bg-a0:');
  });

  it('supports custom formatter override', () => {
    const scales = generateColorSwatches({ primary: '#00aa88', surface: '#222222', ...SEMANTIC_DEFAULTS });
    const css = generateCssVariables(scales, {
      formatter: ({ scale, label, isText }) => `--x-${scale}-${label}${isText ? '-text' : ''}`,
      prefix: null,
    });
    expect(css).toContain('--x-primary-a0:');
    expect(css).toContain('--x-primary-a0-text:');
  });

  it('produces semantic css variables', () => {
    const scales = generateColorSwatches({ primary: '#00aa88', surface: '#222222', ...SEMANTIC_DEFAULTS });
    const css = generateCssVariables(scales);
    expect(css).toContain('--clr-success-a0');
    expect(css).toContain('--clr-on-success-a0');
    expect(css).toContain('--clr-warning-a0');
    expect(css).toContain('--clr-on-warning-a0');
    expect(css).toContain('--clr-danger-a0');
    expect(css).toContain('--clr-on-danger-a0');
    expect(css).toContain('--clr-info-a0');
    expect(css).toContain('--clr-on-info-a0');
  });

  describe('generateCssVariablesData', () => {
    it('returns structured data for primary scale', () => {
      const scales = generateColorSwatches({ primary: '#3366ff', tonalityMix: 0.3, ...SEMANTIC_DEFAULTS });
      const data = generateCssVariablesData({ primary: scales.primary });
      expect(data.primary).toBeDefined();
      expect(Array.isArray(data.primary)).toBe(true);
      // first swatch (a0) structure
      const first = data.primary![0];
      expect(first.background).toMatch(/^clr-primary-a0$/);
      expect(first.backgroundValue).toMatch(/rgba\(/);
      expect(first.text).toMatch(/^clr-on-primary-a0$/);
      expect(first.textValue).toMatch(/rgba\(/);
      expect(first.scale).toBe('primary');
      expect(first.label).toBe('a0');
    });

    it('supports custom names and omits text when includeText=false', () => {
      const scales = generateColorSwatches({ primary: '#ff6600', surface: '#ffffff', lightMode: true, ...SEMANTIC_DEFAULTS });
      const data = generateCssVariablesData(
        { primary: scales.primary, surface: scales.surface },
        { prefix: 'theme', primaryName: 'brand', surfaceName: 'bg', includeText: false }
      );
      // keys reflect custom names
      expect(data.brand).toBeDefined();
      expect(data.bg).toBeDefined();
      const sw = data.brand![0];
      expect(sw.background).toBe('theme-brand-a0');
      expect(sw.text).toBeUndefined();
      expect(sw.textValue).toBeUndefined();
    });

    it('includes semantics with strict keys', () => {
      const scales = generateColorSwatches({ primary: '#00aa88', surface: '#222222', ...SEMANTIC_DEFAULTS });
      const data = generateCssVariablesData({ primary: scales.primary, surface: scales.surface, semantics: scales.semantics });
      // semantic keys
      const semanticKeys = ['success', 'warning', 'danger', 'info'] as const;
      for (const key of semanticKeys) {
        const arr = (data as Record<string, CssVariablePairData[] | undefined>)[key];
        expect(arr).toBeDefined();
        const item = arr![0];
        expect(item.scale).toBe(key);
        expect(item.background).toMatch(new RegExp(`^clr-${key}-a0$`));
        expect(item.text).toMatch(new RegExp(`^clr-on-${key}-a0$`));
      }
    });

    it('applies formatter consistently to data output', () => {
      const scales = generateColorSwatches({ primary: '#3366ff', surface: '#121212', ...SEMANTIC_DEFAULTS });
      const data = generateCssVariablesData(
        { primary: scales.primary },
        {
          formatter: ({ scale, label, isText }) => `--x-${scale}-${label}${isText ? '-t' : ''}`,
          prefix: null,
        }
      );
      const first = data.primary![0];
      expect(first.background).toBe('x-primary-a0'); // leading -- stripped
      expect(first.text).toBe('x-primary-a0-t');
    });

    it('returns only provided scales (no surface key if absent)', () => {
      const scales = generateColorSwatches({ primary: '#123456', ...SEMANTIC_DEFAULTS });
      const data = generateCssVariablesData({ primary: scales.primary });
      expect(data.primary).toBeDefined();
  expect(Object.prototype.hasOwnProperty.call(data, 'surface')).toBe(false);
    });
  });
});
