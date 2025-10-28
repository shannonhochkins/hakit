import { makeSurfaceSwatches } from './surface';
import { describe, it, expect } from 'bun:test';
import Color from 'color';

describe('makeSurfaceSwatches - light mode white base', () => {
  it('produces descending progression from white toward neutral target', () => {
    const swatches = makeSurfaceSwatches('#ffffff', true);
    expect(swatches.length).toBe(10);
    // Ensure first is pure white
    expect(swatches[0].color).toContain('255,255,255');
    // Later entries should not all be identical; check that at least one differs
    const unique = new Set(swatches.map(s => s.color));
    expect(unique.size).toBeGreaterThan(3);
    // Confirm monotonic darkening roughly via luminance decrease
    const lum = (rgba: string) => {
      // Normalize any decimal channel components by rounding before Color parse.
      const rounded = rgba.replace(/rgba\(([^)]+)\)/, (_m, inner) => {
        const parts = inner.split(',').map((p: string) => p.trim());
        // last part is alpha
        if (parts.length === 4) {
          const [r, g, b, a] = parts;
          const rr = Math.round(parseFloat(r));
          const gg = Math.round(parseFloat(g));
          const bb = Math.round(parseFloat(b));
          const aa = parseFloat(a); // keep alpha
          return `rgba(${rr},${gg},${bb},${aa})`;
        }
        return `rgba(${inner})`;
      });
      const c = Color(rounded);
      const { r, g, b } = c.rgb().object();
      const channels = [r, g, b].map(v => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const lums = swatches.map(s => lum(s.color));
    // Each subsequent luminance should be <= previous (allow tiny floating increases within epsilon)
    for (let i = 1; i < lums.length; i++) {
      expect(lums[i]).toBeLessThanOrEqual(lums[i - 1] + 0.0001);
    }
    // Final should be noticeably darker than first
    expect(lums[lums.length - 1]).toBeLessThan(lums[0] - 0.15);
  });
});
