/**
 * Unsafely deep clones an object.
 * This is used when we know the object is safe to clone and we want to avoid the performance overhead of the safe deep clone.
 * This will drop any non primitive values like functions, symbols, etc.
 * @param v - The object to clone
 * @returns The cloned object
 */
export function unsafelyDeepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
