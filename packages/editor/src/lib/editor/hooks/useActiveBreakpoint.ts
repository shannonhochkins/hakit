import { useBreakpoint, type BreakPoint } from '@hakit/components';

type BreakPointMap = Record<BreakPoint, boolean>;

function getActiveBreakpoint(breakpoints: BreakPointMap): BreakPoint | undefined {
  for (const key in breakpoints) {
    if (breakpoints[key as BreakPoint]) return key as BreakPoint;
  }
  return undefined;
}

export function useActiveBreakpoint() {
  const breakpoints = useBreakpoint();
  const activeBreakpoint = getActiveBreakpoint(breakpoints) ?? 'xlg';
  // 2. If no active breakpoint is found, we might default to `xlg`:
  return activeBreakpoint ?? 'xlg';
}
