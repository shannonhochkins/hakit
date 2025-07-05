import { useBreakpoint, type BreakPoint } from '@hakit/components';
import { useEffect, useMemo } from 'react';
import { useGlobalStore } from './useGlobalStore';

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
  // sync the new value with the global store
  useEffect(() => {
    const store = useGlobalStore.getState();
    // 3. If the active breakpoint in the store is different from the one we computed, update it:
    if (store.activeBreakpoint !== activeBreakpoint) {
      store.setActiveBreakpoint(activeBreakpoint);
    }
  }, [activeBreakpoint]);

  return activeBreakpoint;
}
