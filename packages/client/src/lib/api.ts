import { hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { queryOptions } from "@tanstack/react-query";
import type { CreateConfiguration, CreateUser } from "@typings/server";

const client = hc<ApiRoutes>("/");

export const api = client.api;

export async function getCurrentUser(id: string, email: string) {
  const res = await api.user.$get({
    query: { id, email }
  });
  if (!res.ok) {
    throw new Error("server error");
  }
  const data = await res.json();
  return data;
}

// export const userQueryOptions = queryOptions({
//   queryKey: ["get-current-user"],
//   queryFn: getCurrentUser,
//   staleTime: Infinity,
// });


export async function createUser({ value }: { value: CreateUser }) {
  const res = await api.user.$post({ json: value });
  if (!res.ok) {
    throw new Error("server error");
  }

  const newExpense = await res.json();
  return newExpense;
}


/**
 * CREATE a configuration
 * Sends POST /api/config with the JSON body { userId, userEmail, config: {...} }
 */
export async function createConfiguration({ value }: { value: CreateConfiguration }) {
  // Adjust path if you named it differently in your Hono routes
  const res = await api.config.$post({ json: value });
  if (!res.ok) {
    throw new Error("server error");
  }
  return await res.json();
}

export async function getConfigurationByUser({
  userId,
  userEmail
}: {
  userId: number;
  userEmail: string;
}) {
  // If your route is: GET /api/config/user/:id/email/:email
  // the hc client usage might look like:
  const res = await api.config.$get({
    query: { userId, userEmail }
  });
  if (!res.ok) {
    throw new Error("server error");
  }
  return await res.json();
}