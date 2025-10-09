import { useEffect } from 'react';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useThemeStore } from '@hakit/components';
import { breakpointItemToBreakPoints } from '@helpers/editor/breakpoints';
import { DEFAULT_BREAKPOINTS } from '@constants';
import { Spinner } from '@components/Loaders/Spinner';
import { useDashboardWithData } from '@hooks/queeries/useDashboardWithData';
import { useStore } from '@hakit/core';
import { getServices as _getServices } from 'home-assistant-js-websocket';
import { getPuckConfiguration } from '../PuckDynamicConfiguration';
import { generateComponentBreakpointMap } from '@helpers/editor/pageData/generateComponentBreakpointMap';
import { sanitizePuckData } from '@helpers/editor/pageData/sanitizePuckData';

interface DashboardProps {
  dashboardPath?: string;
  pagePath?: string;
  children?: React.ReactNode;
}

export function PuckPreload({ dashboardPath, pagePath, children }: DashboardProps) {
  const dashboardQuery = useDashboardWithData(dashboardPath);
  const dashboard = dashboardQuery.data;
  const userConfig = useGlobalStore(store => store.userConfig);

  useEffect(() => {
    const { connection, entities } = useStore.getState();
    const {
      setUserConfig,
      setBreakPointItems,
      activeBreakpoint,
      userConfig,
      setActiveBreakpoint,
      setPuckPageData,
      setComponentBreakpointMap,
    } = useGlobalStore.getState();
    // get the path param from /editor:/id with tanstack router
    const matchedPage = pagePath ? dashboard?.pages.find(page => page.path === pagePath) : dashboard?.pages[0];

    if (connection && dashboard && dashboard.pages.length && !userConfig && matchedPage) {
      // if there's breakpoints set, use them, else use the default breakpoints
      const breakpoints =
        dashboard.breakpoints && Array.isArray(dashboard.breakpoints) && dashboard.breakpoints.length > 0
          ? dashboard.breakpoints
          : DEFAULT_BREAKPOINTS;

      // if the current active breakpoint doesn't exist on the breakpoint items as an enabled item
      // set to the next highest enabled breakpoint
      // this is to avoid local storage values going out of sync with the data
      if (activeBreakpoint && !breakpoints.find(bp => bp.id === activeBreakpoint && !bp.disabled)) {
        const currentBreakpoint = breakpoints.find(bp => bp.id === activeBreakpoint);
        const nextHighestBreakpoint = currentBreakpoint
          ? breakpoints.find(bp => !bp.disabled && bp.width > currentBreakpoint?.width)
          : undefined;

        const fallbackBreakpoint = nextHighestBreakpoint?.id ?? 'xlg';
        // Use store method which will sync to localStorage
        setActiveBreakpoint(fallbackBreakpoint);
      }

      const getAllEntities = () => entities;
      const getServices = () => _getServices(connection);

      getPuckConfiguration({
        getAllEntities,
        getAllServices: getServices,
      }).then(config => {
        console.log('test] config', config);
        setUserConfig(config);
        setBreakPointItems(breakpoints);
        useThemeStore.getState().setBreakpoints(breakpointItemToBreakPoints(breakpoints));
        const sanitizedData = sanitizePuckData({
          data: matchedPage.data,
          userConfig: config,
        });
        if (sanitizedData) {
          setPuckPageData(sanitizedData);
          // Initialize the componentBreakpointMap from the database data
          const breakpointMap = generateComponentBreakpointMap(matchedPage.data);
          setComponentBreakpointMap(breakpointMap);
        }
      });
    }
  }, [dashboard, pagePath]);

  useEffect(() => {
    console.log('[test] userConfig', typeof userConfig);
  }, [userConfig]);

  useEffect(() => {
    console.log('[test] dashboard', typeof dashboard);
  }, [dashboard]);

  useEffect(() => {
    console.log('[test] dashboardPath', typeof dashboardPath);
  }, [dashboardPath]);

  useEffect(() => {
    console.log('[test] pagePath', typeof pagePath);
  }, [pagePath]);

  useEffect(() => {
    console.log('[test] children', typeof children);
  }, [children]);

  if (dashboardQuery.isLoading) {
    return <Spinner absolute text='Loading dashboard data' />;
  }
  if (!userConfig) {
    return <Spinner absolute text='Connecting the dots...' />;
  }
  console.log('[test] rendering children', typeof children);

  return children;
}
