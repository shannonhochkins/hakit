import { dashboardByPathWithPageDataQueryOptions } from '@lib/api/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useGlobalStore } from '../useGlobalStore';
import { deepCopy } from 'deep-copy-ts';

export function useDashboardWithData(dashboardPath?: string) {
  // Define the query options separately to avoid spreading type conflicts
  const queryOptions = useMemo(() => {
    if (!dashboardPath) {
      // Return a dummy query when no path is provided
      return {
        queryKey: ['dashboard-placeholder'],
        enabled: false,
      };
    }

    return dashboardByPathWithPageDataQueryOptions(dashboardPath);
  }, [dashboardPath]);

  const query = useQuery({
    ...queryOptions,
    enabled: !!dashboardPath, // Only run query when dashboardPath is provided
  });

  // Handle errors with toast notifications
  useEffect(() => {
    if (query.isError && query.error) {
      console.error('Dashboard query error:', query.error);

      // Extract error message
      const errorMessage = query.error instanceof Error ? query.error.message : 'Failed to load dashboard data';

      toast.error(`Dashboard Error: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [query.isError, query.error]);

  useEffect(() => {
    const { setDashboard, setDashboardWithoutData } = useGlobalStore.getState();

    // Set the dashboard in global store when data is available
    if (query.data) {
      setDashboard(query.data);
      // delete the data property from the dashboard, and each page
      const clonedDashboard = deepCopy(query.data);
      // @ts-expect-error data is not a valid property on DashboardWithPageData
      delete clonedDashboard.data;
      clonedDashboard.pages.forEach(page => {
        // @ts-expect-error data is not a valid property on DashboardWithPageData
        delete page.data;
      });
      setDashboardWithoutData(clonedDashboard);
    } else {
      // Clear the dashboard if no data is returned
      setDashboard(null);
      setDashboardWithoutData(null);
    }
  }, [query.data]);

  return useMemo(
    () => ({
      data: dashboardPath ? query.data : null, // Return null when no path
      isLoading: dashboardPath ? query.isLoading : false,
      isError: dashboardPath ? query.isError : false,
      error: dashboardPath ? query.error : null,
      refetch: query.refetch,
      isRefetching: dashboardPath ? query.isRefetching : false,
    }),
    [query, dashboardPath]
  );
}
