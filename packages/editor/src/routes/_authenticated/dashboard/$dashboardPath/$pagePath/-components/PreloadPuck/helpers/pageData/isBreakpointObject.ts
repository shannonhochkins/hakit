import { BreakPoint } from '@hakit/components';
import { BREAKPOINT_ORDER } from './constants';

/**
 * Type guard that determines if a value is a breakpoint object.
 *
 * A breakpoint object is defined as an object that contains at least one key
 * that matches a valid breakpoint identifier prefixed with '$' from the BREAKPOINT_ORDER array.
 * Valid breakpoint keys are: '$xxs', '$xs', '$sm', '$md', '$lg', '$xlg'.
 *
 * @param value - The value to check
 * @returns True if the value is an object with at least one valid prefixed breakpoint key, false otherwise
 *
 * @example
 * ```typescript
 * // Returns true - contains valid breakpoint key '$lg'
 * isBreakpointObject({ $lg: 'large', someOtherKey: 'value' })
 *
 * // Returns false - no valid breakpoint keys (missing $ prefix)
 * isBreakpointObject({ lg: 'large', xs: 'small' })
 *
 * // Returns false - no valid breakpoint keys
 * isBreakpointObject({ width: 100, height: 200 })
 *
 * // Returns false - not an object
 * isBreakpointObject('string')
 * isBreakpointObject(null)
 * ```
 */
export function isBreakpointObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value == null) return false;

  // Check if it has at least one known breakpoint key that starts with $ and matches a valid breakpoint:
  const keys = Object.keys(value);
  return keys.some(k => k.startsWith('$') && BREAKPOINT_ORDER.includes(k.slice(1) as BreakPoint));
}
