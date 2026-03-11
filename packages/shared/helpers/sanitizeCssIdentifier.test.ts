import { describe, expect, test } from 'bun:test';
import { sanitizeCssIdentifier } from './sanitizeCssIdentifier';

describe('sanitizeCssIdentifier', () => {
  test('example 1: keeps ~~ and replaces invalid chars', () => {
    const input = 'Navigation~~@hakit/navigation-c0af';
    const result = sanitizeCssIdentifier(input);
    expect(result).toBe('Navigation~~_hakit_navigation-c0af');
  });

  test('example 2: digits at start are allowed and invalid chars become _', () => {
    const input = '123abc!#@';
    const result = sanitizeCssIdentifier(input);
    expect(result).toBe('123abc___');
  });

  test('already safe identifier remains unchanged', () => {
    const input = 'MyComponent__part--modifier~~123';
    const result = sanitizeCssIdentifier(input);
    expect(result).toBe('MyComponent__part--modifier~~123');
  });

  test('spaces and punctuation are replaced with underscores', () => {
    const input = 'hello world! nice-day?';
    const result = sanitizeCssIdentifier(input);
    expect(result).toBe('hello_world__nice-day_');
  });

  test('unicode / emoji get replaced', () => {
    const input = 'box-📦-ready';
    const result = sanitizeCssIdentifier(input);
    // Even though visually "📦" looks like one character, JavaScript stores it internally as two 16-bit values.
    expect(result).toBe('box-__-ready');
  });

  test('multiple invalid characters in a row become multiple underscores', () => {
    const input = 'a!!!b@@@c///d';
    const result = sanitizeCssIdentifier(input);
    expect(result).toBe('a___b___c___d');
  });

  test('tilde is preserved as a delimiter', () => {
    const input = 'part1~~part2~~part3';
    const result = sanitizeCssIdentifier(input);
    expect(result).toBe('part1~~part2~~part3');
  });
});
