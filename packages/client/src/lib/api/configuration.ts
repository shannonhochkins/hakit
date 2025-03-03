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
      name: "New Configuration",
    },
  });
  if (!res.ok) {
    throw new Error("server error");
  }
  return await res.json();
}

export async function getConfigurationForUser(id: number) {
  const res = await api.config[":id"].$get({
    param: {
      id: String(id),
    }
  });
  const data = await res.json();
  return data;
}

export async function getConfigurationsForUser() {
  const res = await api.config.$get();
  const data = await res.json();
  return data;
}

export const configQueryOptions = queryOptions({
  queryKey: ["get-configurations-for-user"],
  queryFn: getConfigurationsForUser,
  staleTime: Infinity,
});