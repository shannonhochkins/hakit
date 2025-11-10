import { notFound } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { dashboardByPathWithPageDataQueryOptions } from '@services/dashboard';
import { useGlobalStore } from '@hooks/useGlobalStore';

export async function loadDashboardAndPageOrNotFound(args: { queryClient: QueryClient; dashboardPath: string; pagePath: string }) {
  const { queryClient, dashboardPath, pagePath } = args;
  const { setDashboard, setDashboardWithoutData } = useGlobalStore.getState();

  // Force a network fetch to avoid returning stale cached data immediately after a mutation + navigation.
  // ensureQueryData returns current cached value (even if stale) then kicks off a background revalidation.
  // fetchQuery waits for the fresh result, which we need here for correctness.
  const dashboard = await queryClient.fetchQuery(dashboardByPathWithPageDataQueryOptions(dashboardPath));

  if (!dashboard) {
    // Clear the dashboard if no data is returned
    setDashboard(null);
    setDashboardWithoutData(null);
    throw notFound({ data: { reason: 'dashboard-not-found', dashboardPath } });
  }

  if (!dashboard.pages || dashboard.pages.length === 0) {
    setDashboard(null);
    setDashboardWithoutData(null);
    throw notFound({ data: { reason: 'dashboard-has-no-pages', dashboardPath } });
  }

  const matchedPage = dashboard.pages.find(page => page.path === pagePath);
  if (!matchedPage) {
    setDashboard(null);
    setDashboardWithoutData(null);
    throw notFound({ data: { reason: 'page-not-found', dashboardPath, pagePath } });
  }

  // Set the dashboard in global store when data is available
  setDashboard(dashboard);
  // delete the data property from the dashboard, and each page
  const clonedDashboard = structuredClone(dashboard);
  // @ts-expect-error data is not a valid property on DashboardWithPageData
  delete clonedDashboard.data;
  clonedDashboard.pages.forEach(page => {
    // @ts-expect-error data is not a valid property on DashboardWithPageData
    delete page.data;
  });
  setDashboardWithoutData(clonedDashboard);

  // Return minimal info in case a route wants to use it
  return {
    dashboard,
    page: matchedPage,
  };
}
