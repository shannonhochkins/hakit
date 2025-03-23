import { dashboardQueryOptions } from '@client/src/lib/api/dashboard';
import { useLocalStorage } from '@editor/hooks/useLocalStorage';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { HassConnect } from '@hakit/core';
import { HassModal } from './HassModal';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';
import { DynamicConfig } from './DynamicConfig';

interface DashboardProps {
  dashboardPath: string;
  children?: React.ReactNode;
}

export function Dashboard({
  dashboardPath,
  children
}: DashboardProps) {
  // get the path param from /editor:/id with tanstack router
  const dashboardQuery = useQuery(dashboardQueryOptions(dashboardPath));
  const setDashboard = useGlobalStore(store => store.setDashboard);
  const [hassUrl] = useLocalStorage<string | null>('hassUrl');
  const [hassToken] = useLocalStorage<string | undefined>('hassToken');
  const [pageId, setPageId] = useLocalStorage<string | undefined>('pageId');
  const setPuckPageData = useGlobalStore(state => state.setPuckPageData);

  const dashboard = dashboardQuery.data;
  const matchedPage = useMemo(() => dashboard?.pages.find(page => page.id === pageId), [dashboard, pageId]);

  useEffect(() => {
    if (dashboard && dashboard.pages.length) {
      setDashboard(dashboard);
      if (!matchedPage) {
        // if the stored ID in local storage doesn't match a page, 
        // set the pageId to the first page in the dashboard
        setPageId(dashboard.pages[0].id);
      } else {
        setPuckPageData(matchedPage?.data);
      }
    }
  }, [pageId, dashboard, matchedPage]);


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
