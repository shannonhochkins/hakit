import { queryOptions } from "@tanstack/react-query";
import { api, callApi } from './';

export async function getCurrentUser() {
  return await callApi(api.me.$get());
}

export const userQueryOptions = queryOptions({
  queryKey: ["get-current-user"],
  queryFn: getCurrentUser,
  retry: false,
  staleTime: Infinity,
});

