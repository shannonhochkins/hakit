import { queryOptions } from '@tanstack/react-query';
import { callApi } from './callApi';
import { api } from './client';

export async function getCurrentUser() {
  return await callApi(api.me.$get(), false);
}

export const userQueryOptions = queryOptions({
  queryKey: ['get-current-user'],
  queryFn: getCurrentUser,
  retry: false,
  staleTime: Infinity,
  experimental_prefetchInRender: true,
});
