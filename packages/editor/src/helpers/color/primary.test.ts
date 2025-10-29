import { describe, it, expect } from 'bun:test';
import { makePrimarySwatches } from './primary';

describe('makePrimarySwatches', () => {
  it('generates expected red primary scale for #ed0707', () => {
    const swatches = makePrimarySwatches('#ed0707');
    expect(swatches).toHaveLength(10);
    expect(swatches.map(s => s.color)).toEqual([
      'rgba(237,7,7,1)',
      'rgba(243,64,39,1)',
      'rgba(250,94,64,1)',
      'rgba(253,118,89,1)',
      'rgba(253,142,115,1)',
      'rgba(253,164,140,1)',
      'rgba(252,186,166,1)',
      'rgba(251,207,193,1)',
      'rgba(250,227,220,1)',
      'rgba(255,255,255,1)',
    ]);
  });

  it('generates expected blue primary scale for #0482DE', () => {
    const swatches = makePrimarySwatches('#0482DE');
    expect(swatches).toHaveLength(10);
    expect(swatches.map(s => s.color)).toEqual([
      'rgba(4,130,222,1)',
      'rgba(69,141,228,1)',
      'rgba(99,153,232,1)',
      'rgba(124,166,236,1)',
      'rgba(147,179,239,1)',
      'rgba(168,192,241,1)',
      'rgba(188,206,243,1)',
      'rgba(209,220,245,1)',
      'rgba(229,234,247,1)',
      'rgba(255,255,255,1)',
    ]);
  });

  it('generates expected green primary scale for #3BAB31', () => {
    const swatches = makePrimarySwatches('#3BAB31');
    expect(swatches).toHaveLength(10);
    expect(swatches.map(s => s.color)).toEqual([
      'rgba(59,171,49,1)',
      'rgba(86,180,74,1)',
      'rgba(109,189,96,1)',
      'rgba(130,198,118,1)',
      'rgba(151,207,139,1)',
      'rgba(170,216,161,1)',
      'rgba(190,224,182,1)',
      'rgba(209,232,204,1)',
      'rgba(229,240,226,1)',
      'rgba(255,255,255,1)',
    ]);
  });

  it('generates expected yellow primary scale for #edbb07', () => {
    const swatches = makePrimarySwatches('#edbb07');
    expect(swatches).toHaveLength(10);
    expect(swatches.map(s => s.color)).toEqual([
      'rgba(237,187,7,1)',
      'rgba(240,194,58,1)',
      'rgba(243,201,87,1)',
      'rgba(245,207,112,1)',
      'rgba(247,214,136,1)',
      'rgba(248,221,159,1)',
      'rgba(249,228,181,1)',
      'rgba(249,234,203,1)',
      'rgba(248,241,226,1)',
      'rgba(255,255,255,1)',
    ]);
  });

  it('generates expected deep purple primary scale for #5407ed', () => {
    const swatches = makePrimarySwatches('#5407ed');
    expect(swatches).toHaveLength(10);
    expect(swatches.map(s => s.color)).toEqual([
      'rgba(84,7,237,1)',
      'rgba(107,56,239,1)',
      'rgba(127,84,241,1)',
      'rgba(146,109,243,1)',
      'rgba(164,132,245,1)',
      'rgba(181,155,246,1)',
      'rgba(199,178,247,1)',
      'rgba(215,202,248,1)',
      'rgba(232,225,248,1)',
      'rgba(255,255,255,1)',
    ]);
  });

  it('generates expected cyan primary scale for #07edcb', () => {
    const swatches = makePrimarySwatches('#07edcb');
    expect(swatches).toHaveLength(10);
    expect(swatches.map(s => s.color)).toEqual([
      'rgba(7,237,203,1)',
      'rgba(78,239,208,1)',
      'rgba(110,241,212,1)',
      'rgba(136,242,217,1)',
      'rgba(157,244,223,1)',
      'rgba(177,245,228,1)',
      'rgba(197,246,232,1)',
      'rgba(214,247,238,1)',
      'rgba(231,248,243,1)',
      'rgba(255,255,255,1)',
    ]);
  });

  it('generates expected purple primary scale for #db07ed', () => {
    const swatches = makePrimarySwatches('#db07ed');
    expect(swatches).toHaveLength(10);
    expect(swatches.map(s => s.color)).toEqual([
      'rgba(219,7,237,1)',
      'rgba(229,63,236,1)',
      'rgba(236,93,235,1)',
      'rgba(241,118,236,1)',
      'rgba(245,142,238,1)',
      'rgba(248,164,240,1)',
      'rgba(250,185,242,1)',
      'rgba(251,207,243,1)',
      'rgba(250,227,246,1)',
      'rgba(255,255,255,1)',
    ]);
  });

  it('propagates alpha channel across palette', () => {
    // #ed0707 with 80% alpha -> rgba(237,7,7,0.8)
    const swatches = makePrimarySwatches('rgba(237,7,7,0.8)');
    expect(swatches).toHaveLength(10);
    // All entries should end with ,0.8)
    for (const s of swatches) {
      expect(s.color.endsWith(',0.8)')).toBeTrue();
    }
    expect(swatches[0].color).toBe('rgba(237,7,7,0.8)');
    expect(swatches[swatches.length - 1].color).toBe('rgba(255,255,255,0.8)');
  });

  it('supports light mode darkening toward black', () => {
    const swatches = makePrimarySwatches('#ff0000', true);
    expect(swatches).toHaveLength(10);
    expect(swatches[0].color.startsWith('rgba(255,0,0')).toBeTrue();
    expect(swatches[9].color).toBe('rgba(0,0,0,1)');
  });

  it('light mode preserves alpha channel', () => {
    const swatches = makePrimarySwatches('rgba(255,0,0,0.5)', true);
    expect(swatches.every(s => s.color.endsWith(',0.5)'))).toBeTrue();
    expect(swatches[9].color).toBe('rgba(0,0,0,0.5)');
  });

  // Tonality mix tests moved to integration (generateColorSwatches) but keep a placeholder
});
