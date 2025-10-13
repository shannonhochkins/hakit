import { type BreakPoint } from '@hakit/components';
import { isValidElement, type ReactElement } from 'react';

// Helper type to check if an object has breakpoint keys
type HasBreakpointKeys<T> =
  T extends Record<string, unknown>
    ? keyof T extends never
      ? false
      : keyof T extends `$${BreakPoint}` | `$${string}`
        ? true
        : string extends keyof T
          ? false
          : keyof T extends `$${string}`
            ? true
            : false
    : false;

/**
 * Type transformation that removes a specific breakpoint key from all breakpoint objects
 */
export type RemoveBreakpointData<T, BP extends BreakPoint> =
  // If T is null or undefined, return as-is
  T extends null | undefined
    ? T
    : // If T is a React element, return as-is
      T extends ReactElement
      ? T
      : // If T is an array, transform each element
        T extends readonly (infer U)[]
        ? RemoveBreakpointData<U, BP>[]
        : // If T is a breakpoint object, remove the specified key
          HasBreakpointKeys<T> extends true
          ? Omit<{ [K in keyof T]: RemoveBreakpointData<T[K], BP> }, `$${BP}`>
          : // If T is a regular object, recursively transform each property
            T extends object
            ? { [K in keyof T]: RemoveBreakpointData<T[K], BP> }
            : // If T is a primitive, return as-is
              T;

/**
 * Recursively removes a specific breakpoint key from all breakpoint objects in the data structure.
 *
 * This function traverses the entire object/array tree and removes the specified breakpoint key
 * (e.g., '$xlg', '$md') from any breakpoint objects it encounters. The original object is never
 * mutated - a completely new object structure is created.
 *
 * @template T - The type of the input data
 * @template BP - The breakpoint to remove
 * @param data - The data structure to process (can be any object, array, or primitive)
 * @param breakpointToRemove - The breakpoint key to remove (e.g., 'xlg', 'md', 'sm')
 * @returns A new object with the specified breakpoint key removed from all breakpoint objects
 *
 * @example
 * ```typescript
 * const data = {
 *   title: { $xlg: 'Desktop', $md: 'Tablet', $sm: 'Mobile' },
 *   nested: {
 *     value: { $xlg: 100, $md: 75 }
 *   }
 * };
 *
 * const result = removeBreakpointData(data, 'md');
 * // Result (typed correctly with $md removed):
 * // {
 * //   title: { $xlg: 'Desktop', $sm: 'Mobile' },  // $md removed
 * //   nested: {
 * //     value: { $xlg: 100 }  // $md removed
 * //   }
 * // }
 * ```
 */
export function removeBreakpointData<T, BP extends BreakPoint>(data: T, breakpointToRemove: BP): RemoveBreakpointData<T, BP> {
  // Handle null/undefined
  if (data == null) {
    return data as RemoveBreakpointData<T, BP>;
  }

  // Handle React elements - return as-is
  if (isValidElement(data)) {
    return data as RemoveBreakpointData<T, BP>;
  }

  // Handle arrays - recursively process each item
  if (Array.isArray(data)) {
    return data.map(item => removeBreakpointData(item, breakpointToRemove)) as RemoveBreakpointData<T, BP>;
  }

  // Handle objects
  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    const breakpointKey = `$${breakpointToRemove}`;

    for (const key of Object.keys(data)) {
      // Skip the breakpoint key we want to remove
      if (key === breakpointKey) {
        continue;
      }

      const value = (data as Record<string, unknown>)[key];

      // Recursively process the value
      if (value !== null && typeof value === 'object') {
        if (isValidElement(value)) {
          result[key] = value;
        } else {
          result[key] = removeBreakpointData(value, breakpointToRemove);
        }
      } else {
        result[key] = value;
      }
    }

    return result as RemoveBreakpointData<T, BP>;
  }

  // For primitives, return as-is
  return data as RemoveBreakpointData<T, BP>;
}
