import { useEffect, useMemo } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { useThemeStore } from '@hakit/components';
import { breakpointItemToBreakPoints } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/breakpoints';
import { DEFAULT_BREAKPOINTS } from '@lib/constants';
import { useIsPageEditMode } from '@lib/hooks/useIsPageEditMode';
import { Spinner } from '@lib/components/Spinner';
import { useDashboardWithData } from '@lib/hooks/queeries/useDashboardWithData';
import { getPuckConfiguration } from './dynamic-puck-configuration';
import { useStore } from '@hakit/core';
import { getServices as _getServices } from 'home-assistant-js-websocket';
import { trimPuckDataToConfig } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/pageData/trimPuckDataToConfig';

interface DashboardProps {
  dashboardPath?: string;
  pagePath?: string;
  children?: React.ReactNode;
}

export function PreloadPuck({ dashboardPath, pagePath, children }: DashboardProps) {
  const dashboardQuery = useDashboardWithData(dashboardPath);
  const dashboard = dashboardQuery.data;
  const matchedPage = useMemo(
    () => (pagePath ? dashboard?.pages.find(page => page.path === pagePath) : dashboard?.pages[0]),
    [dashboard, pagePath]
  );
  const isPageEditMode = useIsPageEditMode();

  // get the path param from /editor:/id with tanstack router
  const userConfig = useGlobalStore(store => store.userConfig);

  useEffect(() => {
    useGlobalStore.getState().setEditorMode(isPageEditMode);
  }, [isPageEditMode]);

  useEffect(() => {
    const { connection, entities } = useStore.getState();
    const { setUserConfig, setBreakPointItems, setPuckPageData, puckPageData, userConfig } = useGlobalStore.getState();

    if (connection && dashboard && dashboard.pages.length && !userConfig) {
      // if there's breakpoints set, use them, else use the default breakpoints
      const breakpoints = dashboard.breakpoints && Array.isArray(dashboard.breakpoints) ? dashboard.breakpoints : DEFAULT_BREAKPOINTS;
      useThemeStore.getState().setBreakpoints(breakpointItemToBreakPoints(breakpoints));
      setBreakPointItems(breakpoints);
      const getAllEntities = () => entities;
      const getServices = () => _getServices(connection);
      getPuckConfiguration({
        getAllEntities,
        getAllServices: getServices,
      }).then(config => {
        setUserConfig(config);
        if (matchedPage && !puckPageData) {
          const updated = trimPuckDataToConfig(matchedPage.data, config);
          if (updated) {
            console.log('config', { updated, config });
            setPuckPageData(updated);
          }
          // puckPageData may have already been set by the RecoveryPrompt component
          // setPuckPageData(matchedPage.data);
        }
      });
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
  return <Spinner absolute text='No page data found??' />;
}
