import { dashboardByPathQueryOptions } from '@services/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

export function useDashboard(dashboardPath?: string) {
  // Define the query options separately to avoid spreading type conflicts
  const queryOptions = useMemo(() => {
    if (!dashboardPath) {
      // Return a dummy query when no path is provided
      return {
        queryKey: ['dashboard-placeholder'],
        enabled: false,
      };
    }

    return dashboardByPathQueryOptions(dashboardPath);
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
