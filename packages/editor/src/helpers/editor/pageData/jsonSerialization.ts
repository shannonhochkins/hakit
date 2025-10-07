/**
 * Helper functions for JSON serialization that preserves undefined values
 * by converting them to a special string marker (which JSON supports) and back again.
 */

// Special marker string to represent undefined values in JSON
const UNDEFINED_MARKER = '__HAKIT_UNDEFINED__';

/**
 * Recursively converts undefined values to a special marker string for JSON serialization
 */
export function undefinedToMarker<T>(obj: T): T {
  if (obj === undefined) {
    return UNDEFINED_MARKER as T;
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(undefinedToMarker) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof key === 'string') {
      result[key] = undefinedToMarker(value);
    }
  }

  return result as T;
}

/**
 * Recursively converts special marker strings back to undefined after JSON deserialization
 */
export function markerToUndefined<T>(obj: T): T {
  if (obj === UNDEFINED_MARKER) {
    return undefined as T;
  }

  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(markerToUndefined) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof key === 'string') {
      result[key] = markerToUndefined(value);
    }
  }

  return result as T;
}
