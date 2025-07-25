import { BreakPoint } from '@hakit/components';
import { BREAKPOINT_TRANSFORM_EXCLUDE } from './constants';
import { getResolvedBreakpointValue } from './getResolvedBreakpointValue';

type ExcludedKeys = (typeof BREAKPOINT_TRANSFORM_EXCLUDE)[number];

// Helper type to check if an object is a breakpoint object
type IsBreakpointObject<T> =
  T extends Record<string, unknown>
    ? keyof T extends never
      ? false // Empty objects are not breakpoint objects
      : keyof T extends `$${BreakPoint}` | `$${string}`
        ? true
        : string extends keyof T
          ? false
          : keyof T extends `$${string}`
            ? true
            : false
    : false;

// Helper type to extract the value type from a breakpoint object
// This will return a union of all possible values from all breakpoint keys
type ExtractBreakpointValue<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: T[K];
      }[keyof T]
    : never;

// Advanced type transformation that properly handles breakpoint resolution
type DbValueToPuck<T> =
  // If T is null or undefined, return as-is
  T extends null | undefined
    ? T
    : // If T is an array, transform each element
      T extends readonly (infer U)[]
      ? DbValueToPuck<U>[]
      : // If T is a breakpoint object, extract and transform the value type
        IsBreakpointObject<T> extends true
        ? DbValueToPuck<ExtractBreakpointValue<T>>
        : // If T is an object (but not a breakpoint object), transform each property
          T extends object
          ? {
              [K in keyof T]: K extends ExcludedKeys
                ? T[K] // Excluded keys are kept as-is
                : DbValueToPuck<T[K]>; // Other keys are transformed
            }
          : // If T is a primitive, return as-is
            T;

/**
 * Transforms dashboard page data from the database format to the format expected by Puck editor.
 *
 * This function takes deeply nested objects that contain breakpoint-specific values (prefixed with $)
 * and flattens them based on the current active breakpoint. It implements a cascading fallback
 * system where if a value doesn't exist for the current breakpoint, it falls back to larger
 * breakpoints until it finds a value (with $xlg as the ultimate fallback).
 *
 * The transformation process:
 * 1. Recursively traverses the entire object/array structure
 * 2. For each property, checks if it's a breakpoint object (contains $ prefixed keys)
 * 3. If it is, resolves the appropriate value for the current breakpoint
 * 4. Excludes certain keys (like 'id', 'puck', etc.) from transformation
 * 5. Continues recursively on the resolved values
 *
 * @template P - The type of the input props object
 * @param props - The database props object containing breakpoint-specific values
 * @param currentBreakpoint - The currently active breakpoint to resolve values for
 * @returns The transformed props object with breakpoint values flattened for the current breakpoint
 *
 * @example
 * ```typescript
 * // Input from database
 * const databaseData = {
 *   title: { $xlg: "Desktop Title", $md: "Tablet Title" },
 *   subtitle: { $xlg: "Desktop Subtitle" },
 *   id: "component-123", // excluded from transformation
 *   nested: {
 *     content: { $xlg: "Desktop Content", $sm: "Mobile Content" }
 *   }
 * };
 *
 * // Transform for 'md' breakpoint
 * const result = dbValueToPuck(databaseData, 'md');
 * // Result:
 * // {
 * //   title: "Tablet Title",      // Uses $md value
 * //   subtitle: "Desktop Subtitle", // Falls back to $xlg
 * //   id: "component-123",         // Excluded, kept as-is
 * //   nested: {
 * //     content: "Desktop Content"  // Falls back to $xlg (no $md available)
 * //   }
 * // }
 *
 * // Transform for 'sm' breakpoint
 * const smallResult = dbValueToPuck(databaseData, 'sm');
 * // Result:
 * // {
 * //   title: "Desktop Title",      // Falls back to $xlg (no $sm available)
 * //   subtitle: "Desktop Subtitle", // Falls back to $xlg
 * //   id: "component-123",         // Excluded, kept as-is
 * //   nested: {
 * //     content: "Mobile Content"   // Uses $sm value
 * //   }
 * // }
 * ```
 */
export function dbValueToPuck<P extends object>(props: P, currentBreakpoint: BreakPoint): DbValueToPuck<P> {
  // Handle null/undefined cases
  if (props == null) {
    return props as DbValueToPuck<P>;
  }

  // Handle arrays - transform each item recursively
  if (Array.isArray(props)) {
    return props.map(item =>
      typeof item === 'object' && item !== null ? dbValueToPuck(item, currentBreakpoint) : item
    ) as DbValueToPuck<P>;
  }

  // Handle objects
  if (typeof props === 'object') {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(props)) {
      const typedKey = key as keyof P;

      // If key is excluded from transformation, copy as-is
      if (BREAKPOINT_TRANSFORM_EXCLUDE.includes(key as ExcludedKeys)) {
        result[key] = props[typedKey];
        continue;
      }

      // Get the value and resolve breakpoint if applicable
      const value = props[typedKey];
      const resolved = getResolvedBreakpointValue(value, currentBreakpoint);

      // Recursively transform the resolved value
      if (resolved !== null && typeof resolved === 'object') {
        result[key] = dbValueToPuck(resolved, currentBreakpoint);
      } else {
        result[key] = resolved;
      }
    }

    return result as DbValueToPuck<P>;
  }

  // For primitives, return as-is
  return props as DbValueToPuck<P>;
}
