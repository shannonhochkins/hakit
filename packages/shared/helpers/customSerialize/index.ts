import { PuckPageData } from '../../typings/puck';
import { puckDataZodSchema } from '../../../server/db/schema/schemas';

/**
 * Helper functions for JSON serialization that preserves undefined values
 * using JSON.stringify/parse replacer/reviver functions.
 */

// Special marker string to represent undefined values in JSON
export const UNDEFINED_MARKER = '__HAKIT_UNDEFINED__';

/**
 * JSON.stringify replacer function that converts undefined values to a special marker
 */
function undefinedReplacer(_key: string, value: unknown): unknown {
  return value === undefined ? UNDEFINED_MARKER : value;
}

/**
 * Serialize data to JSON string while preserving undefined values
 */
export function serializeWithUndefined<T>(data: T): string {
  return JSON.stringify(data, undefinedReplacer);
}

export function parseWithUndefined<T>(jsonString: string): T {
  // First parse normally to get the object
  const parsed = JSON.parse(jsonString);

  // Then recursively replace markers with undefined
  function replaceMarkers(obj: unknown): unknown {
    if (obj === UNDEFINED_MARKER) {
      return undefined;
    }

    if (Array.isArray(obj)) {
      return obj.map(replaceMarkers);
    }

    if (obj && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = replaceMarkers(value);
      }
      return result;
    }

    return obj;
  }

  return replaceMarkers(parsed) as T;
}

/** Essentially JSON.parse but with typescript validation and zod parsing */
export function deserializePageData(jsonString: string, revive = false): PuckPageData {
  return puckDataZodSchema.parse(revive ? parseWithUndefined(jsonString) : JSON.parse(jsonString));
}
