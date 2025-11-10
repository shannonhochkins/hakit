import { ClientResponse } from 'hono/client';
import { Id, toast, ToastOptions } from 'react-toastify';
import { formatErrorResponse } from '@server/helpers/formatErrorResponse';
import { isNotFound, notFound } from '@tanstack/react-router';

// dodgey helper to extract the 200 response out as this is the only response that can be returned
type ExtractSuccessData<T> = T extends ClientResponse<infer Data, 200 | 201 | 204 | 202, 'json'> ? Data : never;

export type ToastMessages = {
  pending?: string;
  success?: string;
  error?: string | ((err: string) => string);
};

interface ZodErrorLike {
  name: string;
}

export async function callApi<T extends ClientResponse<unknown, number, 'json'>>(
  request: Promise<T>,
  toastMessages?: ToastMessages | false
): Promise<ExtractSuccessData<T>> {
  const corePromise = (async () => {
    const res = await request;
    if (!res.ok) {
      let body = {} as {
        error?: string | { name: string; [key: string]: unknown };
        message?: string;
      };
      try {
        body = (await res.json()) as {
          error?: string | { name: string; [key: string]: unknown };
          message?: string;
        };
      } catch {
        // ignore JSON parse errors, treat as empty
      }
      if (res.status === 404) {
        // Pass through any structured data so NotFound component can read reason, etc.
        throw notFound({ data: body });
      }
      // Handle validation errors
      if (typeof body === 'object' && body !== null) {
        const maybeErr = body;
        if (maybeErr.error && maybeErr.message && typeof maybeErr.error === 'string') {
          throw new Error(`${maybeErr.error}: ${maybeErr.message}`);
        }

        if (maybeErr.error && typeof maybeErr.error === 'object' && maybeErr.error !== null && maybeErr.error.name === 'ZodError') {
          const zodErr = formatErrorResponse('Invalid input', maybeErr.error as ZodErrorLike);
          throw new Error(`${zodErr.error}: ${zodErr.message}`);
        }
      }
      throw new Error(`Request failed (${res.status})`);
    }
    const data = (await res.json()) as ExtractSuccessData<T> & { error?: string };
    if (data && 'error' in data && data.error) {
      throw new Error(data.error);
    }
    return data as ExtractSuccessData<T>;
  })();

  if (toastMessages === false) {
    return corePromise;
  }

  safeToastPromise(corePromise, {
    pending: toastMessages?.pending,
    success: toastMessages?.success,
    error: err => {
      if (typeof toastMessages?.error === 'function') {
        return toastMessages.error(err);
      }
      return toastMessages?.error || err || 'Something went wrong';
    },
  });
  return corePromise;
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
      // Don't toast or swallow notFound errors – let router handle them.
      if (isNotFound(err)) {
        return; // early exit to allow router to handle 404 visuals
      }
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
