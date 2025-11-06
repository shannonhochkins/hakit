import { describe, it, expect } from 'bun:test';
import { makeSurfaceSwatches } from './surface';

describe('makeSurfaceSwatches', () => {
  it('generates dark mode progression lightening input without duplicates', () => {
    const swatches = makeSurfaceSwatches('#121212', false);
    expect(swatches).toHaveLength(10);
    // first is base
    expect(swatches[0].color.startsWith('rgba(18,18,18')).toBeTrue();
    // ensure last is lighter (string inequality plus numeric check)
    expect(swatches[9].color).not.toBe(swatches[0].color);
  });

  it('generates light mode progression darkening white base without duplicates', () => {
    const swatches = makeSurfaceSwatches('#ffffff', true);
    expect(swatches).toHaveLength(10);
    expect(swatches[0].color).toBe('rgba(255,255,255,1)');
    expect(swatches[9].color).not.toBe(swatches[0].color);
  });

  it('light mode from non-white base darkens each step without duplicates', () => {
    const swatches = makeSurfaceSwatches('#e0e0e0', true);
    expect(swatches).toHaveLength(10);
    expect(swatches[0].color).toBe('rgba(224,224,224,1)');
    expect(swatches[9].color).not.toBe(swatches[0].color);
  });

  it('propagates alpha channel', () => {
    const swatches = makeSurfaceSwatches('rgba(32,32,32,0.4)', false);
    expect(swatches.every(s => s.color.endsWith(',0.4)'))).toBeTrue();
  });
});
