// tests/uuid.test.ts
import { describe, it, expect } from 'bun:test';
import { generateId } from './generateId';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generateId - crypto.randomUUID path', () => {
  it('uses crypto.randomUUID when available', () => {
    const originalCrypto = globalThis.crypto;

    // Mock crypto.randomUUID to prove it's used
    const calls: string[] = [];
    globalThis.crypto = {
      ...originalCrypto,
      randomUUID: () => {
        const value = '550e8400-e29b-41d4-a716-446655440000';
        calls.push(value);
        return value;
      },
    } as Crypto;

    const id = generateId();

    // Restore
    globalThis.crypto = originalCrypto;

    expect(calls.length).toBe(1);
    expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });
});

describe('generateId - crypto.getRandomValues path', () => {
  it('falls back to getRandomValues when randomUUID is not available', () => {
    const originalCrypto = globalThis.crypto;

    let getRandomValuesCalled = false;

    // Mock crypto with only getRandomValues
    globalThis.crypto = {
      getRandomValues<T extends ArrayBufferView | null>(array: T): T {
        getRandomValuesCalled = true;
        if (!array) return array;
        const bytes = array as unknown as Uint8Array;
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = i; // deterministic but fine for test
        }
        return array;
      },
    } as unknown as Crypto;

    const id = generateId();

    // Restore
    globalThis.crypto = originalCrypto;

    expect(getRandomValuesCalled).toBe(true);
    expect(UUID_V4_REGEX.test(id)).toBe(true);
  });
});

describe('generateId - Math.random fallback path', () => {
  it('works when crypto is completely unavailable', () => {
    const originalCrypto = globalThis.crypto;

    // Remove crypto entirely
    // @ts-expect-error - we are intentionally messing with the global
    delete globalThis.crypto;

    const id = generateId();

    // Restore
    globalThis.crypto = originalCrypto;
    expect(UUID_V4_REGEX.test(id)).toBe(true);
  });
});

describe('generateId - uniqueness check', () => {
  it('generates mostly unique values across many calls', () => {
    const COUNT = 10_000;
    const seen = new Set<string>();

    for (let i = 0; i < COUNT; i++) {
      const id = generateId();
      expect(UUID_V4_REGEX.test(id)).toBe(true);
      seen.add(id);
    }

    // We expect no collisions in 10k if implementation is sane
    expect(seen.size).toBe(COUNT);
  });
});

describe('generateId - prefix and delimeter behaviour', () => {
  it('returns a bare UUID v4 when no prefix is provided', () => {
    const id = generateId();
    expect(UUID_V4_REGEX.test(id)).toBe(true);
  });

  it("adds the default '-' delimeter when prefix is provided", () => {
    const prefix = 'user';
    const id = generateId(prefix); // default delimeter '-'

    // Format: prefix-uuid
    const rest = id.slice((prefix + '-').length);
    expect(id.startsWith(`${prefix}-`)).toBe(true);
    expect(UUID_V4_REGEX.test(rest)).toBe(true);
  });

  it('uses a custom delimeter when provided', () => {
    const prefix = 'order';
    const delimeter = '::';
    const id = generateId(prefix, delimeter);

    // Should start with "order::"
    expect(id.startsWith(`${prefix}${delimeter}`)).toBe(true);

    const rest = id.slice((prefix + delimeter).length);
    expect(UUID_V4_REGEX.test(rest)).toBe(true);
  });

  it('works with a single-character custom delimeter', () => {
    const prefix = 'meta';
    const delimeter = '_';
    const id = generateId(prefix, delimeter);

    expect(id.startsWith(`${prefix}${delimeter}`)).toBe(true);

    const rest = id.slice((prefix + delimeter).length);
    expect(UUID_V4_REGEX.test(rest)).toBe(true);
  });

  it('handles prefixes that themselves contain the UUID delimeter character', () => {
    const prefix = 'user-type-A'; // contains '-'
    const id = generateId(prefix); // default delimeter '-'

    // We only care that it starts with the prefix + '-' and has a valid UUID after that
    const expectedStart = `${prefix}-`;
    expect(id.startsWith(expectedStart)).toBe(true);

    const rest = id.slice(expectedStart.length);
    expect(UUID_V4_REGEX.test(rest)).toBe(true);
  });
});

//
// PREFIX + DELIMETER with each path forced
//
describe('generateId - prefix/delimeter on randomUUID path', () => {
  it('respects prefix/delimeter when using crypto.randomUUID', () => {
    const originalCrypto = globalThis.crypto;

    globalThis.crypto = {
      ...originalCrypto,
      randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
    } as Crypto;

    const id = generateId('abc', '_');

    globalThis.crypto = originalCrypto;

    expect(id).toBe('abc_550e8400-e29b-41d4-a716-446655440000');
  });
});

describe('generateId - prefix/delimeter on getRandomValues path', () => {
  it('respects prefix/delimeter when using crypto.getRandomValues', () => {
    const originalCrypto = globalThis.crypto;

    globalThis.crypto = {
      getRandomValues<T extends ArrayBufferView | null>(array: T): T {
        if (!array) return array;
        const bytes = array as unknown as Uint8Array;
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = i;
        }
        return array;
      },
    } as unknown as Crypto;

    const prefix = 'xyz';
    const delimeter = '::';
    const id = generateId(prefix, delimeter);

    globalThis.crypto = originalCrypto;

    expect(id.startsWith(`${prefix}${delimeter}`)).toBe(true);

    const rest = id.slice((prefix + delimeter).length);
    expect(UUID_V4_REGEX.test(rest)).toBe(true);
  });
});

describe('generateId - prefix/delimeter on Math.random fallback path', () => {
  it('respects prefix/delimeter when crypto is unavailable', () => {
    const originalCrypto = globalThis.crypto;

    // @ts-expect-error intentional for test
    delete globalThis.crypto;

    const prefix = 'fallback';
    const delimeter = '#';
    const id = generateId(prefix, delimeter);

    globalThis.crypto = originalCrypto;

    expect(id.startsWith(`${prefix}${delimeter}`)).toBe(true);

    const rest = id.slice((prefix + delimeter).length);
    expect(UUID_V4_REGEX.test(rest)).toBe(true);
  });
});
