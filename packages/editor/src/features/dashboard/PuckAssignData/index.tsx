import { useEffect, useMemo } from 'react';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { Spinner } from '@components/Loaders/Spinner';
import { useDashboardWithData } from '@hooks/queeries/useDashboardWithData';
import { trimPuckDataToConfig } from '@helpers/editor/pageData/trimPuckDataToConfig';
import { dbValueToPuck } from '../../../helpers/editor/pageData/dbValueToPuck';

interface DashboardProps {
  dashboardPath?: string;
  pagePath?: string;
  children?: React.ReactNode;
}

export function AssignPuckData({ dashboardPath, pagePath, children }: DashboardProps) {
  const dashboardQuery = useDashboardWithData(dashboardPath);
  const dashboard = dashboardQuery.data;
  const matchedPage = useMemo(
    () => (pagePath ? dashboard?.pages.find(page => page.path === pagePath) : dashboard?.pages[0]),
    [dashboard, pagePath]
  );

  // get the path param from /editor:/id with tanstack router
  const userConfig = useGlobalStore(store => store.userConfig);

  useEffect(() => {
    const { setPuckPageData, puckPageData, userConfig, activeBreakpoint } = useGlobalStore.getState();

    if (matchedPage && !puckPageData && userConfig) {
      const updated = trimPuckDataToConfig(matchedPage.data, userConfig);
      if (updated) {
        const puckValue = dbValueToPuck(updated, activeBreakpoint);
        setPuckPageData(puckValue);
      }
    }
  }, [dashboard, matchedPage]);

  if (dashboardQuery.isLoading) {
    return <Spinner absolute text='Loading dashboard data' />;
  }

  if (dashboard && dashboard.pages.length > 0 && matchedPage && userConfig) {
    return <>{children}</>;
  }
  return <Spinner absolute text='Connecting the dots...' />;
}
