import { useEffect, useMemo } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { DynamicConfig } from './DynamicConfig';
import { useThemeStore } from '@hakit/components';
import { breakpointItemToBreakPoints } from '@lib/helpers/breakpoints';
import { DEFAULT_BREAKPOINTS } from '@lib/constants';
import { useIsPageEditMode } from '@lib/hooks/useIsPageEditMode';
import { Spinner } from '@lib/components/Spinner';
import { useDashboardWithData } from '@lib/hooks/queeries/useDashboardWithData';

interface DashboardProps {
  dashboardPath?: string;
  pagePath?: string;
  children?: React.ReactNode;
}

export function PreloadPuck({ dashboardPath, pagePath, children }: DashboardProps) {
  const dashboardQuery = useDashboardWithData(dashboardPath);
  const setDashboard = useGlobalStore(store => store.setDashboard);
  const setBreakpoints = useThemeStore(store => store.setBreakpoints);
  const setBreakPointItems = useGlobalStore(store => store.setBreakPointItems);

  const setPuckPageData = useGlobalStore(state => state.setPuckPageData);
  const setEditorMode = useGlobalStore(state => state.setEditorMode);

  const dashboard = dashboardQuery.data;
  const matchedPage = useMemo(
    () => (pagePath ? dashboard?.pages.find(page => page.path === pagePath) : dashboard?.pages[0]),
    [dashboard, pagePath]
  );
  const isPageEditMode = useIsPageEditMode();

  useEffect(() => {
    setEditorMode(isPageEditMode);
  }, [setEditorMode, isPageEditMode]);

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
    return <Spinner absolute text='Loading dashboard data' />;
  }

  if (dashboard && dashboard.pages.length > 0 && matchedPage) {
    return (
      <>
        <DynamicConfig>{children}</DynamicConfig>
      </>
    );
  }
  // TODO - Maybe the page we're viewing doesn't have page data?
  // redirect to dashboard home or display a message?
  return <Spinner absolute text='No page data found??' />;
}
