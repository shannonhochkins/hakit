import { describe, it, expect } from 'bun:test';
import { isValidColorValue } from './index';

describe('isValidColorValue', () => {
  const valid = [
    '#fff',
    '#ffff',
    '#ffffff',
    '#ffffffff',
    'rgb(0,0,0)',
    'rgb(255, 128, 64)',
    'rgba(10, 20, 30, 0.5)',
    'rgba(10,20,30,1)',
    'hsl(120, 50%, 50%)',
    'hsla(240, 100%, 50%, 0.75)',
    'linear-gradient(to right, #fff, rgba(0,0,0,0.2))',
    'transparent',
    'color-mix(in srgb, var(--primary) 60%, transparent 40%)',
    'var(--primary)',
  ];

  const invalid = [
    '',
    '   ',
    '#ff', // too short
    '#fffffff', // 7 not valid
    'rgb()',
    'hsl(10,10,10)', // missing % symbols
    'linear-gradient', // no parens
    'var(primary)', // missing --
    'not-a-color',
  ];

  it('accepts valid color values', () => {
    for (const v of valid) {
      expect(isValidColorValue(v)).toBe(true);
    }
  });

  it('rejects invalid color values', () => {
    for (const v of invalid) {
      expect(isValidColorValue(v)).toBe(false);
    }
  });
});
