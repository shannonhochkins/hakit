import { hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { queryOptions } from "@tanstack/react-query";

const client = hc<ApiRoutes>("/");

export const api = client.api;

/**
 * CREATE a configuration
 * Sends POST /api/config with the JSON body { userId, userEmail, config: {...} }
 */
export async function createConfiguration() {
  // Adjust path if you named it differently in your Hono routes
  const res = await api.config.$post({ 
    json: {
      name: "New Dashboard",
    },
  });
  if (!res.ok) {
    throw new Error("server error");
  }
  return await res.json();
}

export async function getConfigurationForUser(configId: string) {
  const res = await api.config[":configId"].$get({
    param: {
      configId: configId,
    }
  });
  const data = await res.json();
  if ('error' in data) {
    // Throw an error so that React Query's error handling kicks in.
    throw new Error(data.error);
  }
  return data;
}

export async function getPageConfigurationForUser(configId: string, pageId: string) {
  const res = await api.config[":configId"][":pageId"].$get({
    param: {
      configId: configId,
      pageId: pageId,
    }
  });
  const data = await res.json();
  if ('error' in data) {
    // Throw an error so that React Query's error handling kicks in.
    throw new Error(data.error);
  }
  return data;
}

export async function getConfigurationsForUser() {
  const res = await api.config.$get();
  const data = await res.json();
  if ('error' in data) {
    // Throw an error so that React Query's error handling kicks in.
    throw new Error(data.error);
  }
  return data;
}

export const configQueryOptions = (configId: string) => queryOptions({
  queryKey: ["get-configuration-for-user"],
  queryFn: () => getConfigurationForUser(configId),
  staleTime: Infinity,
});

export const pageConfigQueryOptions = (configId: string, pageId: string) => queryOptions({
  queryKey: ["get-page-configuration-for-user"],
  queryFn: () => getPageConfigurationForUser(configId, pageId),
  staleTime: Infinity,
});

export const configsQueryOptions = queryOptions({
  queryKey: ["get-configurations-for-user"],
  queryFn: getConfigurationsForUser,
  staleTime: Infinity,
});