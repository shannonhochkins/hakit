import { BreakPoint } from '@hakit/components';
import { BREAKPOINT_ORDER } from './constants';
import { isBreakpointObject } from './isBreakpointObject';

/**
 * Resolves a breakpoint value by finding the most appropriate value for the given active breakpoint.
 *
 * This function implements a cascading breakpoint resolution strategy where it looks for values
 * starting from the active breakpoint and falls back to larger breakpoints if no value is found.
 * If the input is not a breakpoint object (doesn't contain $ prefixed breakpoint keys), it returns
 * the value as-is.
 *
 * @template T - The expected return type of the resolved value
 * @param value - The value to resolve. Can be a breakpoint object with $ prefixed keys or any other value
 * @param active - The currently active breakpoint to resolve for
 * @returns The resolved value for the active breakpoint, or the original value if not a breakpoint object
 *
 * @example
 * ```typescript
 * // Returns 'large' because $lg is available for the active 'lg' breakpoint
 * getResolvedBreakpointValue({ $lg: 'large', $sm: 'small' }, 'lg')
 *
 * // Returns 'large' because $lg is the closest available breakpoint for 'md' (cascades up)
 * getResolvedBreakpointValue({ $lg: 'large', $sm: 'small' }, 'md')
 *
 * // Returns 42 as-is because it's not a breakpoint object
 * getResolvedBreakpointValue(42, 'lg')
 *
 * // Returns 'fallback' from $xlg as the ultimate fallback
 * getResolvedBreakpointValue({ $xlg: 'fallback' }, 'xs')
 * ```
 */
export function getResolvedBreakpointValue(value: unknown, active: BreakPoint): unknown {
  if (!isBreakpointObject(value)) return value;

  const startIndex = BREAKPOINT_ORDER.indexOf(active);

  // From the active breakpoint onward...
  for (let i = startIndex; i < BREAKPOINT_ORDER.length; i++) {
    const bp = BREAKPOINT_ORDER[i];
    const key: `$${BreakPoint}` = `$${bp}`;
    if (key in value && value[key] !== undefined) {
      // Found a defined value (null is valid, only undefined causes fallback)
      return value[key];
    }
  }
  // If we somehow get here (no valid value found), return undefined
  return undefined;
}
