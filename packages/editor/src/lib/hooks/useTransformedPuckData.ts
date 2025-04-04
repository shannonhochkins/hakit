import { useMemo } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { useActiveBreakpoint } from '@lib/hooks/useActiveBreakpoint';
import { transformProps } from '../helpers/breakpoints';

export function useTransformedPuckData() {
  const data = useGlobalStore(store => store.puckPageData);
  const activeBreakpoint = useActiveBreakpoint();
  const transformedData = useMemo(() => transformProps(data ?? {}, activeBreakpoint), [activeBreakpoint, data]);
  return transformedData;
}
