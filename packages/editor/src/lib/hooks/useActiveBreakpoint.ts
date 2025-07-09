import { useBreakpoint, type BreakPoint } from '@hakit/components';
import { useEffect, useMemo } from 'react';
import { useGlobalStore } from './useGlobalStore';
import { useLocalStorage } from './useLocalStorage';

type BreakPointMap = Record<BreakPoint, boolean>;

function getActiveBreakpoint(breakpoints: BreakPointMap): BreakPoint | undefined {
  for (const key in breakpoints) {
    if (breakpoints[key as BreakPoint]) return key as BreakPoint;
  }
  return undefined;
}

export function useActiveBreakpoint() {
  const breakpoints = useBreakpoint();
  const [selectedBreakpointId] = useLocalStorage<BreakPoint>('selectedBreakpoint');
  // 2. If no active breakpoint is found, we might default to `xlg`:
  const activeBreakpoint = useMemo(
    () => getActiveBreakpoint(breakpoints) ?? selectedBreakpointId ?? 'xlg',
    [breakpoints, selectedBreakpointId]
  );
  // sync the new value with the global store
  useEffect(() => {
    const store = useGlobalStore.getState();
    // Only update if the active breakpoint has actually changed
    if (store.activeBreakpoint !== activeBreakpoint) {
      store.setActiveBreakpoint(activeBreakpoint);
    }
  }, [activeBreakpoint]);

  return activeBreakpoint;
}
