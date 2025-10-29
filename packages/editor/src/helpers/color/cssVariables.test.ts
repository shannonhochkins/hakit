import { generateColorSwatches } from './index';
import { generateCssVariables } from './generateCssVariables';
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
});
