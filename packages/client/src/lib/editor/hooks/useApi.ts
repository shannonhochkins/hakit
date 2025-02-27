import { useEffect, useMemo, useState } from 'react';
import { type PuckPageData, type PageConfiguration, type FullConfiguration } from '@typings/puck';

type EndpointMap = {
  '/api/upload/image': {
    output: {
      message: string;
      filename: string;
    };
    input: FormData;
  };
  '/api/remove/image': {
    output: {
      message: string;
    };
    input: {
      filename: string;
    };
  };
  // updating existing configuration
  '/api/page/configuration/save': {
    output: PageConfiguration | null;
    input: {
      data?: PuckPageData;
      id: string;
    };
  };
  '/api/page/configuration/new': {
    output: {
      id: string;
      data: PageConfiguration;
    };
    input?: undefined;
  };
  '/api/page/configuration/clone': {
    output: {
      id: string;
      data: PageConfiguration;
    };
    input: {
      id: string;
    };
  };

  '/api/page/configurations': {
    output: FullConfiguration;
    input: undefined;
  };
};

const endpointMap: Record<
  keyof EndpointMap,
  {
    type: 'json' | 'text' | 'formData';
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  }
> = {
  '/api/upload/image': {
    method: 'POST',
    type: 'formData',
  },
  '/api/remove/image': {
    method: 'POST',
    type: 'json',
  },
  '/api/page/configuration/save': {
    method: 'POST',
    type: 'json',
  },
  '/api/page/configurations': {
    method: 'GET',
    type: 'json',
  },
  '/api/page/configuration/new': {
    method: 'POST',
    type: 'json',
  },
  '/api/page/configuration/clone': {
    method: 'POST',
    type: 'json',
  },
};

type Response<T extends keyof EndpointMap> =
  | {
      status: 'success';
      response: EndpointMap[T]['output'];
      isLoading: false;
      error: null;
    }
  | {
      status: 'error';
      response: null;
      isLoading: false;
      error: string;
    }
  | {
      status: 'loading';
      response: null;
      isLoading: true;
      error: null;
    };

export async function callApi<T extends keyof EndpointMap>(endpoint: T, data?: EndpointMap[T]['input']): Promise<EndpointMap[T]['output']> {
  const response = await fetch(endpoint, {
    method: endpointMap[endpoint].method,
    headers:
      endpointMap[endpoint].type === 'formData'
        ? {}
        : {
            'Content-Type': endpointMap[endpoint].type === 'json' ? 'application/json' : 'text/plain',
          },
    body:
      endpointMap[endpoint].type === 'formData'
        ? (data as FormData)
        : endpointMap[endpoint].type === 'json'
          ? JSON.stringify(data, null, 2)
          : undefined,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return endpointMap[endpoint].type === 'json' || endpointMap[endpoint].type === 'formData' ? await response.json() : await response.text();
}

const REQUEST_CACHE = new Map<string, string>();
const RESPONSE_CACHE = new Map<string, string>();

export function useApi<T extends keyof EndpointMap>(
  {
    endpoint,
    data,
  }: {
    endpoint: T;
    data?: EndpointMap[T]['input'];
  },
  reTriggerValue?: unknown
): Response<T> {
  const [response, setResponse] = useState<EndpointMap[T]['output'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // because of the nature of how react will re-render dependencies in the effects
    // we need to do our own check here as objects will always trigger a re-render and we just want to check if the values are the same not the reference.
    const hasAlreadyRequested = REQUEST_CACHE.has(endpoint) && REQUEST_CACHE.get(endpoint) === JSON.stringify({ data, reTriggerValue });
    if (hasAlreadyRequested) {
      if (RESPONSE_CACHE.has(endpoint) && !response) {
        setIsLoading(false);
        setResponse(JSON.parse(RESPONSE_CACHE.get(endpoint) as string));
      }
      return;
    } else {
      setResponse(null);
      setIsLoading(true);
      setError(null);
    }
    REQUEST_CACHE.set(endpoint, JSON.stringify({ data, reTriggerValue }));
    callApi(endpoint, data)
      .then(response => {
        RESPONSE_CACHE.set(endpoint, JSON.stringify(response));
        setResponse(response);
      })
      .catch(error => {
        console.error(error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [endpoint, data, reTriggerValue, response]);

  return useMemo(() => {
    if (isLoading) {
      return {
        response: null,
        status: 'loading' as const,
        isLoading: true,
        error: null,
      };
    }
    if (error) {
      return {
        response: null,
        status: 'error' as const,
        isLoading: false,
        error,
      };
    }
    return {
      response: response as EndpointMap[T]['output'],
      status: 'success' as const,
      isLoading: false,
      error: null,
    };
  }, [response, isLoading, error]);
}
