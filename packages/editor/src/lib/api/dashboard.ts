import { queryOptions } from "@tanstack/react-query";
import { Json } from "@kinde-oss/kinde-typescript-sdk";
import { api, callApi } from './';

type CreateDashboardPayload = {
  name: string;
  path: string;
  data: Json;
}
export async function createDashboard({ name, path, data }: CreateDashboardPayload) {
  // Adjust path if you named it differently in your Hono routes
  return await callApi(api.dashboard.$post({ 
    json: {
      name,
      path,
      data,
    },
  }));
}

export async function getDashboardForUser(dashboardPath: string) {
  return await callApi(api.dashboard[":dashboardPath"].$get({
    param: {
      dashboardPath,
    }
  }));
}

export async function getPageConfigurationForUser(dashboardPath: string, pagePath: string) {
  return await callApi(api.dashboard[":dashboardPath"][":pagePath"].$get({
    param: {
      dashboardPath,
      pagePath,
    }
  }));
}

export async function getDashboardsForUser() {
  const req = api.dashboard.$get();
  const res = await callApi(req);
  return res; 
}


export const dashboardQueryOptions = (dashboardPath: string) => queryOptions({
  queryKey: ["get-dashboard-for-user", dashboardPath],
  queryFn: () => getDashboardForUser(dashboardPath),
  staleTime: Infinity,
});

export const pageConfigQueryOptions = (dashboardPath: string, pagePath: string) => queryOptions({
  queryKey: ["get-page-configuration-for-user", dashboardPath, pagePath],
  queryFn: () => getPageConfigurationForUser(dashboardPath, pagePath),
  staleTime: Infinity,
});

export const dashboardsQueryOptions = queryOptions({
  queryKey: ["get-dashboards-for-user"],
  queryFn: getDashboardsForUser,
  staleTime: Infinity,
});