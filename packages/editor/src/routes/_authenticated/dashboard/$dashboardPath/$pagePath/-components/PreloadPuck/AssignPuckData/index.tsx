import { useEffect, useMemo } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Spinner } from '@lib/components/Spinner';
import { useDashboardWithData } from '@lib/hooks/queeries/useDashboardWithData';
import { trimPuckDataToConfig } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/pageData/trimPuckDataToConfig';
import { dbValueToPuck } from '../helpers/pageData/dbValueToPuck';

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
  // TODO - Maybe the page we're viewing doesn't have page data?
  // redirect to dashboard home or display a message?
  return <Spinner absolute text='Whoops, something weird has happened!' />;
}
