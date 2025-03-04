import { hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { queryOptions } from "@tanstack/react-query";
import { Json } from "@kinde-oss/kinde-typescript-sdk";

const client = hc<ApiRoutes>("/");

export const api = client.api;

type CreateDashboardPayload = {
  name: string;
  path: string;
  data: Json;
}
export async function createDashboard({ name, path, data }: CreateDashboardPayload) {
  // Adjust path if you named it differently in your Hono routes
  const res = await api.dashboard.$post({ 
    json: {
      name,
      path,
      data,
    },
  });
  if (!res.ok) {
    throw new Error("server error");
  }
  return await res.json();
}

export async function getDashboardForUser(dashboardPath: string) {
  const res = await api.dashboard[":dashboardPath"].$get({
    param: {
      dashboardPath,
    }
  });
  const data = await res.json();
  if ('error' in data) {
    // Throw an error so that React Query's error handling kicks in.
    throw new Error(data.error);
  }
  return data;
}

export async function getPageConfigurationForUser(dashboardPath: string, pagePath: string) {
  const res = await api.dashboard[":dashboardPath"][":pagePath"].$get({
    param: {
      dashboardPath,
      pagePath,
    }
  });
  const data = await res.json();
  if ('error' in data) {
    // Throw an error so that React Query's error handling kicks in.
    throw new Error(data.error);
  }
  return data;
}

export async function getDashboardsForUser() {
  const res = await api.dashboard.$get();
  const data = await res.json();
  if ('error' in data) {
    // Throw an error so that React Query's error handling kicks in.
    throw new Error(data.error);
  }
  return data;
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