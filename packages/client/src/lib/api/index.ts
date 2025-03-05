import { ClientResponse, hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { toast } from 'react-toastify';

const client = hc<ApiRoutes>("/");

export const api = client.api;

// dodgey helper to extract the 200 response out as this is the only response that can be returned
type ExtractSuccessData<T> = T extends ClientResponse<infer Data, 200, "json"> ? Data : never;


export async function callApi<T extends ClientResponse<unknown, number, "json">>(request: Promise<T>): Promise<ExtractSuccessData<T>> {
  try {
    const res = await (request as Promise<Response>);
    if (!res.ok) {
      throw new Error("Server error");
    }
    const data = await res.json();
    if ('error' in data) {
      // Throw an error so that React Query's error handling kicks in.
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
