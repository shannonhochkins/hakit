import { useMemo } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { useActiveBreakpoint } from '@lib/hooks/useActiveBreakpoint';
import { transformProps } from '../helpers/breakpoints';
import { PuckPageData } from '@typings/puck';

export function useTransformedPuckData() {
  const data = useGlobalStore(store => store.puckPageData);
  const activeBreakpoint = useActiveBreakpoint();
  return useMemo(() => transformProps((data ?? {
    content: [],
    root: {},
    zones: {},
  }) satisfies PuckPageData, activeBreakpoint), [activeBreakpoint, data]);
}

export function useTransformedUnsavedPuckData() {
  const data = useGlobalStore(store => store.unsavedPuckPageData);
  const activeBreakpoint = useActiveBreakpoint();
  return useMemo(() => transformProps((data ?? {
    content: [],
    root: {},
    zones: {},
  }) satisfies PuckPageData, activeBreakpoint), [activeBreakpoint, data]);
}
