import { useGlobalStore } from './useGlobalStore';
import { useMemo } from 'react';
import { type AvailableQueries, type BreakPoints } from '@hakit/components';
import { ViewportItem, defaultViewports } from '../components/Root/viewports';

export function toBreakpoints(viewports: ViewportItem[]): BreakPoints {
  return viewports.reduce(
    (acc, viewport) => ({
      ...acc,
      [viewport.label as keyof AvailableQueries]: viewport.width,
    }),
    {} as BreakPoints
  );
}

export function useViewports() {
  const data = useGlobalStore(store => store.puckPageData);
  const merged = useMemo(() => {
    const defaultBreakpoints = defaultViewports;
    const breakpoints = data.root.props?.viewports ?? null;
    return breakpoints ? breakpoints : defaultBreakpoints;
  }, [data.root.props?.viewports]);
  return useMemo(() => merged, [merged]);
}
