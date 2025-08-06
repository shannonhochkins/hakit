import { queryOptions } from '@tanstack/react-query';
import { callApi, ToastMessages } from '@services/callApi';
import { Repository, UserRepository, RepositoryWithLatestVersion, RepositoryVersion } from '@typings/hono';
// import { RepositoryAPI, RepositoryVersionAPI, UserRepositoryAPI, RepositoryWithLatestVersionAPI } from '@typings/db';
import { api } from './client';
// export interface UserRepositoryWithDetails {
//   id: string;
//   userId: string;
//   connectedAt: string;
//   repositoryId: string;
//   versionId: string;
//   lastUsedAt: string | null;
//   repository: RepositoryAPI;
//   version: Omit<RepositoryVersionAPI, 'components'> & {
//     components: Array<{
//       name: string;
//       enabled: boolean;
//     }>;
//   };
// }

// ============================
// REPOSITORY BROWSING
// ============================

export async function getRepositories(toastMessage?: ToastMessages): Promise<Repository[]> {
  const response = await callApi(api.repositories.repositories.$get(), toastMessage);
  return response.repositories;
}

export async function getRepository(repositoryId: string, toastMessage?: ToastMessages): Promise<Repository> {
  const response = await callApi(
    api.repositories.repositories[':id'].$get({
      param: { id: repositoryId },
    }),
    toastMessage
  );
  return response.repository;
}

export async function getRepositoryVersion(
  repositoryId: string,
  version: string,
  toastMessage?: ToastMessages
): Promise<RepositoryVersion> {
  const response = await callApi(
    api.repositories.repositories[':id'].versions[':version'].$get({
      param: { id: repositoryId, version },
    }),
    toastMessage
  );
  return response.version;
}

export async function getRepositoryVersions(repositoryId: string, toastMessage?: ToastMessages): Promise<RepositoryVersion[]> {
  const response = await callApi(
    api.repositories.repositories[':id'].versions.$get({
      param: { id: repositoryId },
    }),
    toastMessage
  );
  return response.versions;
}

// ============================
// SEARCH
// ============================

export async function searchRepositories(
  query?: string,
  options: { limit?: number; offset?: number; sortBy?: 'popularity' | 'updated' } = {},
  toastMessage?: ToastMessages
): Promise<RepositoryWithLatestVersion[]> {
  const { limit = 20, offset = 0, sortBy = 'popularity' } = options;

  const response = await callApi(
    api.repositories.search.$get({
      query: {
        ...(query && { q: query }),
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy,
      },
    }),
    toastMessage
  );
  return response.repositories;
}

// Convenience functions that use the unified search endpoint
export async function searchRepositoriesByComponent(
  component: string,
  options: { limit?: number; offset?: number } = {},
  toastMessage?: ToastMessages
): Promise<RepositoryWithLatestVersion[]> {
  // Use the unified search with the component name as query
  return searchRepositories(component, options, toastMessage);
}

export async function getPopularRepositories(limit: number = 10, toastMessage?: ToastMessages): Promise<RepositoryWithLatestVersion[]> {
  // Use the unified search without query to get popular repositories
  return searchRepositories(undefined, { limit, sortBy: 'popularity' }, toastMessage);
}

export async function getRecentRepositories(limit: number = 10, toastMessage?: ToastMessages): Promise<RepositoryWithLatestVersion[]> {
  // Use the unified search without query to get recent repositories
  return searchRepositories(undefined, { limit, sortBy: 'updated' }, toastMessage);
}

// ============================
// USER REPOSITORIES
// ============================

export async function getUserRepositories(toastMessage?: ToastMessages): Promise<UserRepository[]> {
  const response = await callApi(api.repositories['user-repositories'].$get(), toastMessage);
  return response.userRepositories;
}

export async function connectRepository(repositoryId: string, versionId: string, toastMessage?: ToastMessages): Promise<UserRepository> {
  const response = await callApi(
    api.repositories['user-repositories'].$post({
      json: {
        repositoryId,
        versionId,
      },
    }),
    toastMessage
  );
  return response;
}

export async function updateUserRepositoryVersion(userRepositoryId: string, versionId: string, toastMessage?: ToastMessages) {
  return await callApi(
    api.repositories['user-repositories'][':userRepoId'].$put({
      param: { userRepoId: userRepositoryId },
      json: { versionId },
    }),
    toastMessage
  );
}

export async function disconnectRepository(userRepositoryId: string, toastMessage?: ToastMessages): Promise<{ message: string }> {
  return await callApi(
    api.repositories['user-repositories'][':userRepoId'].$delete({
      param: { userRepoId: userRepositoryId },
    }),
    toastMessage
  );
}

export async function toggleComponentStatus(
  userRepositoryId: string,
  componentName: string,
  toastMessage?: ToastMessages
): Promise<{ message: string; component: { name: string; enabled: boolean } }> {
  return await callApi(
    api.repositories['user-repositories'][':userRepoId'].components[':componentName'].toggle.$put({
      param: { userRepoId: userRepositoryId, componentName },
    }),
    toastMessage
  );
}

// ============================
// GITHUB REPOSITORY INSTALLATION
// ============================

export async function installRepositoryFromGithub(
  repositoryUrl: string,
  onProgress?: (data: { message: string; status: 'success' | 'warning' | 'error' }) => void,
  toastMessage?: ToastMessages
): Promise<void> {
  const basePath = window.location.origin;
  const installFromGithubUrl = api.repositories.install['from-github'].$url();
  const url = `${basePath}${installFromGithubUrl}`;
  // For streaming endpoints, we need to use direct fetch as callApi doesn't handle streaming
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repositoryUrl,
    }),
  });

  if (!response.ok) {
    const errorMessage = `Failed to install repository: ${response.statusText}`;

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

export const repositoriesQueryOptions = queryOptions({
  queryKey: ['repositories'],
  queryFn: () => getRepositories(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

export const repositoryQueryOptions = (repositoryId: string) =>
  queryOptions({
    queryKey: ['repository', repositoryId],
    queryFn: () => getRepository(repositoryId),
    staleTime: 5 * 60 * 1000,
  });

export const repositoryVersionQueryOptions = (repositoryId: string, version: string) =>
  queryOptions({
    queryKey: ['repository-version', repositoryId, version],
    queryFn: () => getRepositoryVersion(repositoryId, version),
    staleTime: 5 * 60 * 1000,
  });

export const repositoryVersionsQueryOptions = (repositoryId: string) =>
  queryOptions({
    queryKey: ['repository-versions', repositoryId],
    queryFn: () => getRepositoryVersions(repositoryId),
    staleTime: 5 * 60 * 1000,
  });

export const userRepositoriesQueryOptions = queryOptions({
  queryKey: ['user-repositories'],
  queryFn: () => getUserRepositories(),
  staleTime: 2 * 60 * 1000, // 2 minutes
});

export const popularRepositoriesQueryOptions = (limit: number = 10) =>
  queryOptions({
    queryKey: ['popular-repositories', limit],
    queryFn: () => getPopularRepositories(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

export const recentRepositoriesQueryOptions = (limit: number = 10) =>
  queryOptions({
    queryKey: ['recent-repositories', limit],
    queryFn: () => getRecentRepositories(limit),
    staleTime: 5 * 60 * 1000,
  });

export const searchRepositoriesQueryOptions = (
  query: string,
  options: { limit?: number; offset?: number; sortBy?: 'popularity' | 'updated' } = {}
) =>
  queryOptions({
    queryKey: ['search-repositories', query, options],
    queryFn: () => searchRepositories(query, options),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });

export const searchRepositoriesByComponentQueryOptions = (component: string, options: { limit?: number; offset?: number } = {}) =>
  queryOptions({
    queryKey: ['search-repositories-by-component', component, options],
    queryFn: () => searchRepositoriesByComponent(component, options),
    enabled: component.length > 0,
    staleTime: 5 * 60 * 1000,
  });
