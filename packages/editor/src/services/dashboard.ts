import { queryOptions } from '@tanstack/react-query';
import { Json } from '@kinde-oss/kinde-typescript-sdk';
import { callApi, ToastMessages } from './callApi';
import { Dashboard, DashboardPage, DashboardWithPageData } from '@typings/hono';
import { api } from './client';

type CreateDashboardPayload = {
  name: string;
  path: string;
  data?: Json;
  thumbnail?: string | null;
};
export async function createDashboard(
  { name, path, data, thumbnail }: CreateDashboardPayload,
  toastMessage?: ToastMessages
): Promise<DashboardWithPageData> {
  // Adjust path if you named it differently in your Hono routes
  return await callApi(
    api.dashboard.$post({
      json: {
        name,
        path,
        data,
        thumbnail,
      },
    }),
    toastMessage
  );
}

export async function createDashboardPage(
  { id, name, path, data, thumbnail }: { id: DashboardWithPageData['id']; name: string; path: string; data?: Json; thumbnail?: string },
  toastMessage?: ToastMessages
) {
  return await callApi(
    api.dashboard[':id'].page.$post({
      param: {
        id,
      },
      json: {
        name,
        path,
        data,
        thumbnail,
      },
    }),
    toastMessage
  );
}

export async function duplicateDashboard(
  { id, name, path, thumbnail }: { id: DashboardWithPageData['id']; name: string; path: string; thumbnail?: string | null },
  toastMessage?: ToastMessages
): Promise<DashboardWithPageData> {
  return await callApi(
    api.dashboard[':id'].duplicate.$post({
      param: {
        id,
      },
      json: {
        name,
        path,
        thumbnail,
      },
    }),
    toastMessage
  );
}

export async function duplicateDashboardPage(
  {
    id,
    pageId,
    name,
    path,
    thumbnail,
  }: { id: DashboardWithPageData['id']; pageId: DashboardPage['id']; name: string; path: string; thumbnail?: string | null },
  toastMessage?: ToastMessages
) {
  return await callApi(
    api.dashboard[':id'].page[':pageId'].duplicate.$post({
      param: {
        id,
        pageId,
      },
      json: {
        name,
        path,
        thumbnail,
      },
    }),
    toastMessage
  );
}

export async function deleteDashboard({ id }: { id: DashboardWithPageData['id'] }, toastMessage?: ToastMessages) {
  const response = await callApi(
    api.dashboard[':id'].$delete({
      param: {
        id,
      },
    }),
    toastMessage
  );
  return response.message;
}

export async function deleteDashboardPage(
  { id, pageId }: { id: DashboardWithPageData['id']; pageId: DashboardPage['id'] },
  toastMessage?: ToastMessages
) {
  const response = await callApi(
    api.dashboard[':id'].page[':pageId'].$delete({
      param: {
        id,
        pageId,
      },
    }),
    toastMessage
  );
  return response.message;
}
// dashboard paths are unique between dashboards, so this is a safe request
export async function getDashboardByPath(dashboardPath: DashboardWithPageData['path'], toastMessage?: ToastMessages) {
  const response = await callApi(
    api.dashboard[':dashboardPath'].$get({
      param: {
        dashboardPath,
      },
    }),
    toastMessage
  );
  return response.dashboard;
}
// dashboard paths are unique between dashboards, so this is a safe request
export async function getDashboardByPathWithData(
  dashboardPath: DashboardWithPageData['path'],
  toastMessage?: ToastMessages
): Promise<DashboardWithPageData> {
  const response = await callApi(
    api.dashboard[':dashboardPath'].data.$get({
      param: {
        dashboardPath,
      },
    }),
    toastMessage
  );
  return response.dashboard;
}

export async function getDashboardPageForUser(id: DashboardWithPageData['id'], pageId: DashboardPage['id'], toastMessage?: ToastMessages) {
  const response = await callApi(
    api.dashboard[':id'].page[':pageId'].$get({
      param: {
        id,
        pageId,
      },
    }),
    toastMessage
  );
  return response.page;
}
export async function updateDashboardPageForUser(
  id: DashboardWithPageData['id'],
  page: Partial<DashboardPage> & {
    id: DashboardPage['id'];
  },
  toastMessage?: ToastMessages
) {
  const req = api.dashboard[':id'].page[':pageId'].$put({
    json: {
      path: page.path,
      name: page.name,
      data: page.data,
      thumbnail: page.thumbnail,
    },
    param: {
      id,
      pageId: page.id,
    },
  });
  const res = await callApi(req, toastMessage);
  return res.page;
}

type DashboardUpdateInput = { id: DashboardWithPageData['id'] } & Partial<Omit<DashboardWithPageData, 'pages' | 'id'>>;

export async function updateDashboardForUser(dashboard: DashboardUpdateInput, toastMessage?: ToastMessages) {
  const req = api.dashboard[':id'].$put({
    param: {
      id: dashboard.id,
    },
    json: {
      name: dashboard.name,
      path: dashboard.path,
      data: dashboard.data,
      breakpoints: dashboard.breakpoints,
      thumbnail: dashboard.thumbnail,
    },
  });
  const res = await callApi(req, toastMessage);
  return res.dashboard;
}

export async function getDashboardsForUser(): Promise<Dashboard[]> {
  const req = api.dashboard.$get();
  const res = await callApi(req);
  return res.dashboards;
}

// get a dashboard by path with pages, pages don't have data
export const dashboardByPathQueryOptions = (dashboardPath: DashboardWithPageData['path']) =>
  queryOptions({
    queryKey: ['get-dashboard-by-path-for-user', dashboardPath],
    queryFn: () => getDashboardByPath(dashboardPath),
    retry: false,
    staleTime: Infinity,
    experimental_prefetchInRender: true,
  });
export const dashboardByPathWithPageDataQueryOptions = (dashboardPath?: DashboardWithPageData['path']) =>
  queryOptions({
    queryKey: ['get-dashboard-by-path-with-page-for-user', dashboardPath],
    queryFn: () => getDashboardByPathWithData(dashboardPath!),
    retry: false,
    staleTime: Infinity,
    experimental_prefetchInRender: true,
  });
// get a dashboard page with data
export const dashboardPageQueryOptions = (dashboardId: DashboardWithPageData['id'], pageId: DashboardPage['id']) =>
  queryOptions({
    queryKey: ['get-dashboard-page-for-user', dashboardId, pageId],
    queryFn: () => getDashboardPageForUser(dashboardId, pageId),
    retry: false,
    staleTime: Infinity,
    experimental_prefetchInRender: true,
  });
// get all dashboards including pages, pages don't have data
export const dashboardsQueryOptions = queryOptions({
  queryKey: ['get-dashboards-for-user'],
  queryFn: getDashboardsForUser,
  retry: false,
  staleTime: Infinity,
  experimental_prefetchInRender: true,
});
