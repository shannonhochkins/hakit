import { useEffect, useMemo } from 'react';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useThemeStore } from '@hakit/components';
import { breakpointItemToBreakPoints } from '@helpers/editor/breakpoints';
import { DEFAULT_BREAKPOINTS } from '@constants';
import { useIsPageEditMode } from '@hooks/useIsPageEditMode';
import { Spinner } from '@components/Spinner';
import { useDashboardWithData } from '@hooks/queeries/useDashboardWithData';
import { useStore } from '@hakit/core';
import { getServices as _getServices } from 'home-assistant-js-websocket';
import { getPuckConfiguration } from '../PuckDynamicConfiguration';

interface DashboardProps {
  dashboardPath?: string;
  pagePath?: string;
  children?: React.ReactNode;
}

export function PuckPreload({ dashboardPath, pagePath, children }: DashboardProps) {
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
    const { setUserConfig, setBreakPointItems, userConfig } = useGlobalStore.getState();

    if (connection && dashboard && dashboard.pages.length && !userConfig) {
      // if there's breakpoints set, use them, else use the default breakpoints
      const breakpoints =
        dashboard.breakpoints && Array.isArray(dashboard.breakpoints) && dashboard.breakpoints.length > 0
          ? dashboard.breakpoints
          : DEFAULT_BREAKPOINTS;
      useThemeStore.getState().setBreakpoints(breakpointItemToBreakPoints(breakpoints));
      setBreakPointItems(breakpoints);
      const getAllEntities = () => entities;
      const getServices = () => _getServices(connection);
      getPuckConfiguration({
        getAllEntities,
        getAllServices: getServices,
      }).then(config => {
        setUserConfig(config);
      });
    }
  }, [dashboard, matchedPage]);

  if (dashboardQuery.isLoading) {
    return <Spinner absolute text='Loading dashboard data' />;
  }

  if (userConfig) {
    return children;
  }
  // TODO - Maybe the page we're viewing doesn't have page data?
  // redirect to dashboard home or display a message?
  return <Spinner absolute text='Connecting the dots...' />;
}
