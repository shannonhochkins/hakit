import { dashboardByPathWithPageDataQueryOptions } from '@client/src/lib/api/dashboard';
import { useLocalStorage } from '@lib/hooks/useLocalStorage';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { HassConnect } from '@hakit/core';
import { HassModal } from './HassModal';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { DynamicConfig } from './DynamicConfig';
import { useThemeStore } from '@hakit/components';
import { breakpointItemToBreakPoints } from '@lib/helpers/breakpoints';
import { DEFAULT_BREAKPOINTS } from '@lib/constants';

interface DashboardProps {
  dashboardPath: string;
  pagePath?: string;
  children?: React.ReactNode;
}

export function Dashboard({
  dashboardPath,
  pagePath,
  children
}: DashboardProps) {
  // get the path param from /editor:/id with tanstack router
  const dashboardQuery = useQuery(dashboardByPathWithPageDataQueryOptions(dashboardPath));
  const setDashboard = useGlobalStore(store => store.setDashboard);
  const setBreakpoints = useThemeStore(store => store.setBreakpoints);
  const setBreakPointItems = useGlobalStore(store => store.setBreakPointItems);
  const [hassUrl] = useLocalStorage<string | null>('hassUrl');
  const [hassToken] = useLocalStorage<string | undefined>('hassToken');
  const setPuckPageData = useGlobalStore(state => state.setPuckPageData);

  const dashboard = dashboardQuery.data;
  const matchedPage = useMemo(() => pagePath ?dashboard?.pages.find(page => page.path === pagePath): dashboard?.pages[0], [dashboard, pagePath]);

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
  }, [dashboard, matchedPage]);


  if (dashboardQuery.isLoading || !dashboard) {
    return <div>Loading dashboard data...</div>
  }
  if (dashboardQuery.isError) {
    return <div>Error: {dashboardQuery.error.message}</div>
  }
  if (!dashboard.pages.length) {
    return <div>No pages found</div>
  }
  if (!matchedPage) {
    return <div>No page found</div>
  }
  if (!hassUrl) {
    // ask the user for their Home Assistant URL
    return <HassModal />
  }

  return <HassConnect hassUrl={hassUrl} hassToken={hassToken}>
    <DynamicConfig>
      {children}
    </DynamicConfig>
  </HassConnect>;
}
