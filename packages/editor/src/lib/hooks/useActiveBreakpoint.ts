import { useBreakpoint, type BreakPoint } from '@hakit/components';
import { useMemo } from 'react';

type BreakPointMap = Record<BreakPoint, boolean>;

function getActiveBreakpoint(breakpoints: BreakPointMap): BreakPoint | undefined {
  for (const key in breakpoints) {
    if (breakpoints[key as BreakPoint]) return key as BreakPoint;
  }
  return undefined;
}

export function useActiveBreakpoint() {
  const breakpoints = useBreakpoint();
  // 2. If no active breakpoint is found, we might default to `xlg`:
  const activeBreakpoint = useMemo(() => getActiveBreakpoint(breakpoints) ?? 'xlg', [breakpoints]);
  return activeBreakpoint;
}
