import { dashboardByPathQueryOptions } from "@lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useDashboard(dashboardPath?: string) {
  // Define the query options separately to avoid spreading type conflicts
  const queryOptions = useMemo(() => {
    if (!dashboardPath) {
      // Return a dummy query when no path is provided
      return {
        queryKey: ["dashboard-placeholder"],
        enabled: false,
      };
    }
    
    return dashboardByPathQueryOptions(dashboardPath);
  }, [dashboardPath]);

  const query = useQuery({
    ...queryOptions,
    enabled: !!dashboardPath, // Only run query when dashboardPath is provided
  });
  
  return useMemo(() => ({
    data: dashboardPath ? query.data : null, // Return null when no path
    isLoading: dashboardPath ? query.isLoading : false,
    isError: dashboardPath ? query.isError : false,
    error: dashboardPath ? query.error : null,
    refetch: query.refetch,
    isRefetching: dashboardPath ? query.isRefetching : false,
  }), [query, dashboardPath]);
}