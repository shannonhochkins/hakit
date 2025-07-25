import { isBreakpointObject } from './isBreakpointObject';

/**
 * Determines if a value has multiple breakpoint configurations enabled.
 *
 * This function checks if a value is a breakpoint object (contains $ prefixed breakpoint keys)
 * and has more than one property, indicating that multiple breakpoint values are configured.
 * This is useful for determining whether breakpoint-specific logic should be applied or if
 * a value should be treated as a simple, non-responsive value.
 *
 * @param value - The value to check for multiple breakpoint configurations
 * @returns True if the value is a breakpoint object with multiple properties, false otherwise
 *
 * @example
 * ```typescript
 * // Returns true - has multiple breakpoint keys
 * multipleBreakpointsEnabled({ $lg: 'large', $sm: 'small', width: 100 })
 *
 * // Returns false - only one breakpoint key
 * multipleBreakpointsEnabled({ $lg: 'large' })
 *
 * // Returns false - not a breakpoint object
 * multipleBreakpointsEnabled({ width: 100, height: 200 })
 *
 * // Returns false - not a breakpoint object
 * multipleBreakpointsEnabled(42)
 *
 * // Returns false - empty object
 * multipleBreakpointsEnabled({})
 * ```
 */
export function multipleBreakpointsEnabled(value: unknown): boolean {
  if (!isBreakpointObject(value)) return false;
  return Object.keys(value).length > 1;
}
