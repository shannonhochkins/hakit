import { ClientResponse } from 'hono/client';
import { Id, toast, ToastOptions } from 'react-toastify';
import { formatErrorResponse } from '@server/helpers/formatErrorResponse';

// dodgey helper to extract the 200 response out as this is the only response that can be returned
type ExtractSuccessData<T> = T extends ClientResponse<infer Data, 200, 'json'> ? Data : never;

export type ToastMessages = {
  pending?: string;
  success?: string;
  error?: string | ((err: string) => string);
};

export async function callApi<T extends ClientResponse<unknown, number, 'json'>>(
  request: Promise<T>,
  toastMessages?: ToastMessages | false
): Promise<ExtractSuccessData<T>> {
  // if the promise executor throws an error, it will be lost if not caught properly
  // ensure all logic is caught in the promise executor if we're going to disable this rule
  // eslint-disable-next-line no-async-promise-executor
  const promise = new Promise<ExtractSuccessData<T>>(async (resolve, reject) => {
    try {
      const res = await request;
      if (!res.ok) {
        try {
          const response = (await res.json()) as {
            error?: string | { name: string; [key: string]: unknown };
            message?: string;
          };
          if (response.error && response.message) {
            return reject(`${response.error}: ${response.message}`);
          }
          if (response.error && typeof response.error === 'object' && response.error.name === 'ZodError') {
            const error = formatErrorResponse('Invalid input', response.error);
            return reject(`${error.error}: ${error.message}`);
          }
          return reject('Invalid error structure');
        } catch (e) {
          const { error, message } = formatErrorResponse('Server error', e);
          // generic error
          return reject(`${error}: ${message}`);
        }
      }
      const data = (await res.json()) as ExtractSuccessData<T> & { error?: string };
      if ('error' in data && data.error) {
        // Throw an error so that React Query's error handling kicks in.
        return reject(data.error);
      }
      return resolve(data as ExtractSuccessData<T>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      reject(errorMessage);
    }
  });
  if (toastMessages === false) {
    return await promise;
  }

  safeToastPromise(promise, {
    pending: toastMessages?.pending,
    success: toastMessages?.success,
    error: err => {
      if (typeof toastMessages?.error === 'function') {
        return toastMessages.error(err);
      }
      return toastMessages?.error || err || 'Something went wrong';
    },
  });
  return await promise;
}

function safeToastPromise<T>(promise: Promise<T>, messages: ToastMessages, opts?: ToastOptions): Promise<T> {
  // Only create an ID if we'll use a pending toast
  const id: Id | undefined = messages.pending ? `safe-toast-${Math.random().toString(36).slice(2)}` : undefined;

  // Show pending toast if requested
  if (messages.pending && id) {
    toast(messages.pending, {
      type: 'info',
      isLoading: true,
      toastId: id,
      theme: 'dark',
      ...opts,
    });
  }

  // Handle resolution
  promise
    .then(() => {
      if (messages.success) {
        if (id) {
          toast.update(id, {
            render: messages.success,
            type: 'success',
            isLoading: false,
            theme: 'dark',
            autoClose: 2000,
            ...opts,
          });
        } else {
          toast(messages.success, {
            type: 'success',
            autoClose: 2000,
            theme: 'dark',
            ...opts,
          });
        }
      }
    })
    .catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const message = typeof messages.error === 'function' ? messages.error(errorMessage) : messages.error || 'Something went wrong';

      if (id) {
        toast.update(id, {
          render: message,
          type: 'error',
          theme: 'dark',
          isLoading: false,
          autoClose: 4000,
          ...opts,
        });
      } else {
        toast(message, {
          type: 'error',
          theme: 'dark',
          autoClose: 4000,
          ...opts,
        });
      }
    });

  return promise;
}
