import { dashboardByPathWithPageDataQueryOptions } from '@client/src/lib/api/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { DynamicConfig } from './DynamicConfig';
import { useThemeStore } from '@hakit/components';
import { breakpointItemToBreakPoints } from '@lib/helpers/breakpoints';
import { DEFAULT_BREAKPOINTS } from '@lib/constants';
import { Spinner } from '../Spinner';
import { useIsPageEditMode } from '@lib/hooks/useIsPageEditMode';

interface DashboardProps {
  dashboardPath?: string;
  pagePath?: string;
  children?: React.ReactNode;
}

export function Dashboard({
  dashboardPath,
  pagePath,
  children,
}: DashboardProps) {
  // get the path param from /editor:/id with tanstack router
  const dashboardQuery = useQuery({
  // spread everything your helper already returns
  ...dashboardByPathWithPageDataQueryOptions(dashboardPath),
  // turn it off unless we have a path
  enabled: !!dashboardPath,
});
  const setDashboard = useGlobalStore(store => store.setDashboard);
  const setBreakpoints = useThemeStore(store => store.setBreakpoints);
  const setBreakPointItems = useGlobalStore(store => store.setBreakPointItems);
  
  const setPuckPageData = useGlobalStore(state => state.setPuckPageData);
  const setEditorMode = useGlobalStore(state => state.setEditorMode);

  const dashboard = dashboardQuery.data;
  const matchedPage = useMemo(() => pagePath ? dashboard?.pages.find(page => page.path === pagePath) : dashboard?.pages[0], [dashboard, pagePath]);
  const isPageEditMode = useIsPageEditMode();

  useEffect(() => {
    setEditorMode(true);
  }, [setEditorMode]);

  useEffect(() => {
    if (dashboard && dashboard.pages.length) {
      setDashboard(dashboard);
      // if there's breakpoints set, use them, else use the default breakpoints
      const breakpoints = dashboard.breakpoints && Array.isArray(dashboard.breakpoints) ? dashboard.breakpoints : DEFAULT_BREAKPOINTS;
      setBreakpoints(breakpointItemToBreakPoints(breakpoints));
      setBreakPointItems(breakpoints);
      if (matchedPage) {
        setPuckPageData(matchedPage.data);
      }
    }
  }, [dashboard, matchedPage, setBreakPointItems, setBreakpoints, setDashboard, setPuckPageData]);

  if (dashboardQuery.isLoading) {
    return <Spinner absolute text="Loading dashboard data" />
  }

  if (isPageEditMode && dashboard && dashboard.pages.length > 0 && matchedPage) {
    return <>
      <DynamicConfig>
        {children}
      </DynamicConfig>
    </>;
  }
  return <Spinner absolute text="Loading dashboard data" />
}
