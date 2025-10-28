import { describe, it, expect } from 'bun:test';
import { generateColorSwatches } from '.';

describe('tonality mix', () => {
  it('mix=0 returns original primary first swatch', () => {
    const { primary } = generateColorSwatches({ primary: '#ff0000', surface: '#121212', lightMode: false, tonalityMix: 0 });
    expect(primary[0].color.startsWith('rgba(255,0,0')).toBeTrue();
  });
  it('mix=1 blends up to the max cap (surface closer to primary but not identical)', () => {
    const { primary, surface } = generateColorSwatches({ primary: '#ff0000', surface: '#121212', lightMode: false, tonalityMix: 1 });
    const { surface: originalSurface } = generateColorSwatches({
      primary: '#ff0000',
      surface: '#121212',
      lightMode: false,
      tonalityMix: 0,
    });
    for (let i = 0; i < surface.length; i++) {
      expect(surface[i].color).not.toBe(primary[i].color); // capped at 50% blend
      expect(surface[i].color).not.toBe(originalSurface[i].color); // still changed vs original
    }
  });
  it('mix=0.5 blends at half of cap (distinct from primary & original)', () => {
    const { primary, surface } = generateColorSwatches({ primary: '#ff0000', surface: '#121212', lightMode: false, tonalityMix: 0.5 });
    const { surface: originalSurface } = generateColorSwatches({
      primary: '#ff0000',
      surface: '#121212',
      lightMode: false,
      tonalityMix: 0,
    });
    for (let i = 0; i < surface.length; i++) {
      expect(surface[i].color).not.toBe(primary[i].color);
      expect(surface[i].color).not.toBe(originalSurface[i].color);
    }
  });
});
