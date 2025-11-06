import { useEffect, useRef } from 'react';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useThemeStore } from '@hakit/components';
import { breakpointItemToBreakPoints } from '@helpers/editor/breakpoints';
import { DEFAULT_BREAKPOINTS } from '@constants';
import { Spinner } from '@components/Loaders/Spinner';
import { useStore } from '@hakit/core';
import { getServices as _getServices } from 'home-assistant-js-websocket';
import { getPuckConfiguration } from '../PuckDynamicConfiguration';
import { generateComponentBreakpointMap } from '@helpers/editor/pageData/generateComponentBreakpointMap';
import { sanitizePuckData } from '@helpers/editor/pageData/sanitizePuckData';
import { dashboardsQueryOptions } from '@services/dashboard';
import { useQuery } from '@tanstack/react-query';
import { DashboardWithPageData } from '@typings/hono';
import { usePopupStore } from '@hooks/usePopupStore';

interface DashboardProps {
  dashboard: DashboardWithPageData;
  page: DashboardWithPageData['pages'][number];
  children?: React.ReactNode;
}

const DEBUG_MODE = false;

function debug(message: string) {
  if (DEBUG_MODE) {
    console.debug('[PUCK_PRELOAD]', message);
  }
}

export function PuckPreload({ dashboard, page, children }: DashboardProps) {
  const userConfig = useGlobalStore(store => store.userConfig);
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const editingDashboardPage = useGlobalStore(store => store.editingDashboardPage);
  const requestingExtraInformation = useRef(false);

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
    // wait for a connection to home assistant
    if (!connection) {
      debug('no connection, waiting for connection to home assistant');
      return;
    }
    if (requestingExtraInformation.current) {
      debug('already requesting extra information, waiting for it to complete');
      return;
    }
    // if there's already a user config, return early
    if (userConfig) {
      debug('user config already set, waiting for user config to load');
      return;
    }

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
    requestingExtraInformation.current = true;
    const getAllEntities = () => entities;
    const getServices = async () => {
      const services = await _getServices(connection);
      useGlobalStore.getState().setServices(services);
      return services;
    };
    debug('getting puck configuration');

    getPuckConfiguration({
      getAllEntities,
      getAllServices: getServices,
    }).then(config => {
      setUserConfig(config);
      setBreakPointItems(breakpoints);
      useThemeStore.getState().setBreakpoints(breakpointItemToBreakPoints(breakpoints));
      const sanitizedData = sanitizePuckData({
        data: page.data,
        userConfig: config,
      });
      if (sanitizedData) {
        usePopupStore.getState().initializePopups(sanitizedData);
        setPuckPageData(sanitizedData);
        // Initialize the componentBreakpointMap from the database data
        const breakpointMap = generateComponentBreakpointMap(page.data);
        setComponentBreakpointMap(breakpointMap);
        debug('set puckPageData and componentBreakpointMap');
      }
      requestingExtraInformation.current = false;
    });
  }, [dashboard, page, editingDashboardPage]);

  useEffect(() => {
    if (dashboardsQuery.data) useGlobalStore.getState().setDashboards(dashboardsQuery.data);
  }, [dashboardsQuery.data]);

  // check, if the current editing dashboard/page are different
  useEffect(() => {
    const { editingDashboardPage, userConfig } = useGlobalStore.getState();
    if (editingDashboardPage && (editingDashboardPage.dashboardId !== dashboard.id || editingDashboardPage.pageId !== page.id)) {
      // if the current dashboard has NOT changed, but the page has changed, we need to reset the puckInformation
      if (userConfig && dashboard.id === editingDashboardPage?.dashboardId && page.id !== editingDashboardPage?.pageId) {
        debug('page changed, resetting puckInformation');
        useGlobalStore.getState().resetPuckInformation();
      }
      const dashboardChanged = dashboard.id !== editingDashboardPage?.dashboardId;
      // if the dashbord changed, we need reset the puckInformation, and refetch the dashboard
      if (dashboardChanged) {
        debug('dashboard changed, resetting puckInformation and refetching dashboard');
        useGlobalStore.getState().resetPuckInformation(true);
      }
      // dashboard or page has changed
      debug(`dashboardChanged: ${dashboardChanged}, setting editing dashboard page`);
      useGlobalStore.getState().setEditingDashboardPage(dashboard.id, page.id);
    } else if (!editingDashboardPage) {
      debug('no editing dashboard page, setting editing dashboard page');
      useGlobalStore.getState().setEditingDashboardPage(dashboard.id, page.id);
    }
  }, [dashboard, page]);

  useEffect(() => {
    return () => {
      // without resetting the cache, we'll be holding onto the incorrect document head
      // So we reset whenever the component unmounts
      useGlobalStore.getState().setEmotionCache(null);
    };
  }, []);

  if (!userConfig) {
    return <Spinner absolute text='Loading dashboard data' />;
  }

  return children;
}
