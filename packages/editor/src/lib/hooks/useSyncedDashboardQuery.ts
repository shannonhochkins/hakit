import { dashboardByPathWithPageDataQueryOptions } from "@lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "./useGlobalStore";
import { useEffect } from "react";


export function useSyncedDashboardQuery(dashboardPath: string) {
  const setDashboard = useGlobalStore(state => state.setDashboard)
  // get the path param from /editor:/id with tanstack router
  const dashboardQuery = useQuery(dashboardByPathWithPageDataQueryOptions(dashboardPath));

  useEffect(() => { 
    if (dashboardQuery.data) {
      setDashboard(dashboardQuery.data);
    }
  }, [setDashboard, dashboardQuery.data]);

  return dashboardQuery;
}