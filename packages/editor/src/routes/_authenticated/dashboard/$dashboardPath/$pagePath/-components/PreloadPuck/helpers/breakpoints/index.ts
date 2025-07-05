import { type BreakPoints } from '@hakit/components';
import { BreakpointItem } from '@typings/breakpoints';

export function breakpointItemToBreakPoints(breakpoints: BreakpointItem[]): BreakPoints {
  return breakpoints
    .filter(breakpoint => !breakpoint.disabled)
    .reduce(
      (acc, breakpoint) => ({
        ...acc,
        [breakpoint.id]: breakpoint.width,
      }),
      {} as BreakPoints
    );
}
