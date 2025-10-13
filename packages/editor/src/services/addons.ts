import { queryOptions } from '@tanstack/react-query';
import { callApi, ToastMessages } from '@services/callApi';
import { Addon, UserAddon, AddonWithLatestVersion, AddonVersion } from '@typings/hono';
import { api } from './client';

// ============================
// ADDON BROWSING
// ============================

export async function getAddons(toastMessage?: ToastMessages): Promise<Addon[]> {
  const response = await callApi(api.addons.addons.$get(), toastMessage);
  return response.addons;
}

export async function getAddon(addonId: string, toastMessage?: ToastMessages): Promise<Addon> {
  const response = await callApi(
    api.addons.addons[':id'].$get({
      param: { id: addonId },
    }),
    toastMessage
  );
  return response.addon;
}

export async function getAddonVersion(addonId: string, version: string, toastMessage?: ToastMessages): Promise<AddonVersion> {
  const response = await callApi(
    api.addons.addons[':id'].versions[':version'].$get({
      param: { id: addonId, version },
    }),
    toastMessage
  );
  return response.version;
}

export async function getAddonVersions(addonId: string, toastMessage?: ToastMessages): Promise<AddonVersion[]> {
  const response = await callApi(
    api.addons.addons[':id'].versions.$get({
      param: { id: addonId },
    }),
    toastMessage
  );
  return response.versions;
}

// ============================
// SEARCH
// ============================

export async function searchAddons(
  query?: string,
  options: { limit?: number; offset?: number; sortBy?: 'popularity' | 'updated' } = {},
  toastMessage?: ToastMessages
): Promise<AddonWithLatestVersion[]> {
  const { limit = 20, offset = 0, sortBy = 'popularity' } = options;

  const response = await callApi(
    api.addons.search.$get({
      query: {
        ...(query && { q: query }),
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy,
      },
    }),
    toastMessage
  );
  return response.addons;
}

// Convenience functions that use the unified search endpoint
export async function searchAddonByComponent(
  component: string,
  options: { limit?: number; offset?: number } = {},
  toastMessage?: ToastMessages
): Promise<AddonWithLatestVersion[]> {
  // Use the unified search with the component name as query
  return searchAddons(component, options, toastMessage);
}

export async function getPopularAddons(limit: number = 10, toastMessage?: ToastMessages): Promise<AddonWithLatestVersion[]> {
  // Use the unified search without query to get popular addons
  return searchAddons(undefined, { limit, sortBy: 'popularity' }, toastMessage);
}

export async function getRecentAddons(limit: number = 10, toastMessage?: ToastMessages): Promise<AddonWithLatestVersion[]> {
  // Use the unified search without query to get recent addons
  return searchAddons(undefined, { limit, sortBy: 'updated' }, toastMessage);
}

// ============================
// USER ADDONS
// ============================

export async function getUserAddons(toastMessage?: ToastMessages): Promise<UserAddon[]> {
  const response = await callApi(api.addons['user-addons'].$get(), toastMessage);
  return response.userAddons;
}

export async function connectAddon(addonId: string, versionId: string, toastMessage?: ToastMessages) {
  const response = await callApi(
    api.addons['user-addons'].$post({
      json: {
        addonId,
        versionId,
      },
    }),
    toastMessage
  );
  return response;
}

export async function updateUserAddonVersion(userAddonId: string, versionId: string, toastMessage?: ToastMessages) {
  return await callApi(
    api.addons['user-addons'][':userAddonId'].$put({
      param: { userAddonId: userAddonId },
      json: { versionId },
    }),
    toastMessage
  );
}

export async function disconnectAddon(userAddonId: string, toastMessage?: ToastMessages): Promise<{ message: string }> {
  return await callApi(
    api.addons['user-addons'][':userAddonId'].$delete({
      param: { userAddonId: userAddonId },
    }),
    toastMessage
  );
}

export async function toggleComponentStatus(
  userAddonId: string,
  componentName: string,
  toastMessage?: ToastMessages
): Promise<{ message: string; component: { name: string; enabled: boolean } }> {
  return await callApi(
    api.addons['user-addons'][':userAddonId'].components[':componentName'].toggle.$put({
      param: { userAddonId: userAddonId, componentName },
    }),
    toastMessage
  );
}

// ============================
// GITHUB ADDON INSTALLATION
// ============================

export async function installAddonFromGithub(
  repositoryUrl: string,
  onProgress?: (data: { message: string; status: 'success' | 'warning' | 'error' }) => void,
  toastMessage?: ToastMessages
): Promise<void> {
  const installFromGithubUrl = api.addons.install['from-github'].$url();
  // For streaming endpoints, we need to use direct fetch as callApi doesn't handle streaming
  const response = await fetch(installFromGithubUrl.pathname, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repositoryUrl,
    }),
  });

  if (!response.ok) {
    const errorMessage = `Failed to install addon: ${response.statusText}`;

    if (toastMessage?.error) {
      // Error toast will be handled by calling component
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error('No response body received');
  }

  await processStreamingResponse(response.body, onProgress);
}

// ============================
// STREAMING HELPERS
// ============================

async function processStreamingResponse(
  stream: ReadableStream<Uint8Array>,
  onProgress?: (data: { message: string; status: 'success' | 'warning' | 'error' }) => void
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6)) as { message: string; status: 'success' | 'warning' | 'error' };
            onProgress?.(data);

            if (data.status === 'error') {
              throw new Error(data.message);
            }
          } catch (parseError) {
            if (parseError instanceof Error && parseError.message !== line.slice(6)) {
              throw parseError;
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================
// QUERY OPTIONS
// ============================

export const addonsQueryOptions = queryOptions({
  queryKey: ['addons'],
  queryFn: () => getAddons(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

export const addonQueryOptions = (addonId: string) =>
  queryOptions({
    queryKey: ['addon', addonId],
    queryFn: () => getAddon(addonId),
    staleTime: 5 * 60 * 1000,
  });

export const addonVersionQueryOptions = (addonId: string, version: string) =>
  queryOptions({
    queryKey: ['addon-version', addonId, version],
    queryFn: () => getAddonVersion(addonId, version),
    staleTime: 5 * 60 * 1000,
  });

export const addonVersionsQueryOptions = (addonId: string) =>
  queryOptions({
    queryKey: ['addon-versions', addonId],
    queryFn: () => getAddonVersions(addonId),
    staleTime: 5 * 60 * 1000,
  });

export const userAddonsQueryOptions = queryOptions({
  queryKey: ['user-addons'],
  queryFn: () => getUserAddons(),
  staleTime: 2 * 60 * 1000, // 2 minutes
});

export const popularAddonsQueryOptions = (limit: number = 10) =>
  queryOptions({
    queryKey: ['popular-addons', limit],
    queryFn: () => getPopularAddons(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

export const recentAddonsQueryOptions = (limit: number = 10) =>
  queryOptions({
    queryKey: ['recent-addons', limit],
    queryFn: () => getRecentAddons(limit),
    staleTime: 5 * 60 * 1000,
  });

export const searchAddonsQueryOptions = (
  query: string,
  options: { limit?: number; offset?: number; sortBy?: 'popularity' | 'updated' } = {}
) =>
  queryOptions({
    queryKey: ['search-addons', query, options],
    queryFn: () => searchAddons(query, options),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });

export const searchAddonsByComponentQueryOptions = (component: string, options: { limit?: number; offset?: number } = {}) =>
  queryOptions({
    queryKey: ['search-addons-by-component', component, options],
    queryFn: () => searchAddonByComponent(component, options),
    enabled: component.length > 0,
    staleTime: 5 * 60 * 1000,
  });
