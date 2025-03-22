import { queryOptions } from "@tanstack/react-query";
import { api, callApi } from './';

export async function getAssetForUser(objectKey: string) {
  return await callApi(api.asset[":objectKey{.*}"].$get({
    param: {
      objectKey,
    }
  }));
}

export const assetQueryOptions = queryOptions({
  queryKey: ["get-asset-for-user"],
  queryFn: getAssetForUser,
  staleTime: Infinity,
});