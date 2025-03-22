import { ClientResponse, hc } from "hono/client";
import { type ApiRoutes } from "@server/app";
import { toast } from 'react-toastify';

const client = hc<ApiRoutes>("/");

export const api = client.api;

// dodgey helper to extract the 200 response out as this is the only response that can be returned
type ExtractSuccessData<T> = T extends ClientResponse<infer Data, 200, "json"> ? Data : never;

type ToastMessages = {
  pending?: string;
  success?: string;
}

export async function callApi<T extends ClientResponse<unknown, number, "json">>(request: Promise<T>, toastMessages?: ToastMessages): Promise<ExtractSuccessData<T>> {
  const promise = new Promise<ExtractSuccessData<T>>(async (resolve, reject) => {
    try {
      const res = await (request as Promise<Response>);
      if (!res.ok) {
        try {
          const response = await res.json();
          if (response.error && response.message) {
            return reject(`${response.error}: ${response.message}`);
          }
          return reject('Invalid error structure');
        } catch (e) {
          // generic error
          return reject("Server error");
        }
      }
      const data = await res.json();
      if ('error' in data) {
        // Throw an error so that React Query's error handling kicks in.
        return reject(data.error);
      }
      return resolve(data);
    } catch (error) {
      reject(error);
    }
  });
  toast.promise(promise, {
    pending: toastMessages?.pending ? {
      render() {
        return toastMessages.pending
      } 
    } : undefined,
    success: toastMessages?.success ? {
      autoClose: 2000,
      render() {
        return toastMessages.success
      } 
    } : undefined,
    error: {
      render(props){
        const data = props.data;
        return typeof data === 'string' ? data : data instanceof Error ? data.message : 'Unknown error';
      }
    }
  }, {
    theme: 'dark',
    draggable: true,
  });
  return await promise;
}
