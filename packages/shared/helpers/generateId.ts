// uuid.ts

function prefixValue(id: string, prefix?: string, delimeter = '-'): string {
  if (prefix) {
    return `${prefix}${delimeter}${id}`;
  }
  return id;
}

export function generateId(prefix?: string, delimeter = '-'): string {
  const g = globalThis as typeof globalThis & {
    crypto?: Crypto & {
      randomUUID?: () => string;
    };
  };

  // 1. Prefer native randomUUID if available
  if (g.crypto?.randomUUID) {
    return prefixValue(g.crypto.randomUUID(), prefix, delimeter);
  }

  // 2. Otherwise, use crypto.getRandomValues if available
  if (g.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    g.crypto.getRandomValues(bytes);
    return prefixValue(bytesToUuidV4(bytes), prefix, delimeter);
  }

  // 3. Final fallback: Math.random-based UUID v4 (not crypto-strong, but format-correct)
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return prefixValue(bytesToUuidV4(bytes), prefix, delimeter);
}

function bytesToUuidV4(bytes: Uint8Array): string {
  // Set version (4) and variant (10xx)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0'));

  return (
    hex.slice(0, 4).join('') +
    '-' +
    hex.slice(4, 6).join('') +
    '-' +
    hex.slice(6, 8).join('') +
    '-' +
    hex.slice(8, 10).join('') +
    '-' +
    hex.slice(10, 16).join('')
  );
}
