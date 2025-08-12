// In-memory cache with TTL
export type CacheEntry<T> = { value: T; expiresAt: number };
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const listKeys: string[] = [];
export function getListCacheKey(q?: string, state?: string, labels?: string, page?: number, per_page?: number) {
  return JSON.stringify({ q: q || '', state: state || 'open', labels: labels || '', page: page || 1, per_page: per_page || 20 });
}
export function getCached<T>(map: Map<string, CacheEntry<T>>, key: string): T | null;
export function getCached<T>(map: Map<number, CacheEntry<T>>, key: number): T | null;
export function getCached<T>(map: Map<string | number, CacheEntry<T>>, key: string | number): T | null {
  const entry = map.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    map.delete(key);
    return null;
  }
  return entry.value;
}
export function setCached<T>(map: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number = ONE_DAY_MS) {
  map.set(key, { value, expiresAt: Date.now() + ttlMs });
  if (!listKeys.includes(key)) listKeys.unshift(key);
  if (listKeys.length > 50) listKeys.pop();
}
export function setCachedNumberKey<T>(map: Map<number, CacheEntry<T>>, key: number, value: T, ttlMs: number = ONE_DAY_MS) {
  map.set(key, { value, expiresAt: Date.now() + ttlMs });
}
export function getListKeys() {
  return listKeys;
}
