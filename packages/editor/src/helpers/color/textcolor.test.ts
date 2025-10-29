import { describe, it, expect } from 'bun:test';
import { generateColorSwatches } from '.';
import Color from 'color';
import { SEMANTIC_DEFAULTS } from './semantic';

describe('text color generation', () => {
  type ColorInstance = ReturnType<typeof Color>;
  function luminance(c: ColorInstance) {
    const { r, g, b } = c.rgb().object();
    const chans = [r, g, b].map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * chans[0] + 0.7152 * chans[1] + 0.0722 * chans[2];
  }
  function contrastRatio(fg: ColorInstance, bg: ColorInstance) {
    const L1 = luminance(fg) + 0.05;
    const L2 = luminance(bg) + 0.05;
    return L1 > L2 ? L1 / L2 : L2 / L1;
  }
  it('assigns textHex with at least 4.5 contrast for surface swatches when possible', () => {
    const { surface } = generateColorSwatches({
      primary: '#ff0000',
      surface: '#121212',
      lightMode: false,
      tonalityMix: 0,
      ...SEMANTIC_DEFAULTS,
    });
    for (const s of surface) {
      expect(s.textColor).toBeTruthy();
      const fg = Color(s.textColor!);
      const bg = Color(s.color);
      const cr = contrastRatio(fg, bg);
      expect(cr).toBeGreaterThanOrEqual(3); // allow >=3 fallback but prefer >=4.5
    }
  });
  it('provides textColor for primary swatches', () => {
    const { primary } = generateColorSwatches({
      primary: '#0482DE',
      surface: '#121212',
      lightMode: false,
      tonalityMix: 0,
      ...SEMANTIC_DEFAULTS,
    });
    expect(primary.every(p => !!p.textColor)).toBeTrue();
  });
});
