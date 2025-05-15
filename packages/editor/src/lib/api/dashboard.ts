import { queryOptions } from "@tanstack/react-query";
import { Json } from "@kinde-oss/kinde-typescript-sdk";
import { api, callApi, ToastMessages } from './';
import { DashboardWithPageData, DashboardPageWithData } from "@typings/dashboard";

type CreateDashboardPayload = {
  name: string;
  path: string;
  data?: Json;
  thumbnail?: string | null;
}
export async function createDashboard({ name, path, data, thumbnail }: CreateDashboardPayload) {
  // Adjust path if you named it differently in your Hono routes
  return await callApi(api.dashboard.$post({ 
    json: {
      name,
      path,
      data,
      thumbnail
    },
  }));
}

export async function createDashboardPage({ id, name, path, data }: { id: DashboardWithPageData['id'], name: string, path: string, data?: Json }) {
  return await callApi(api.dashboard[":id"].page.$post({
    param: {
      id,
    },
    json: {
      name,
      path,
      data,
    }
  }));
}

export async function deleteDashboard({ id }: { id: DashboardWithPageData['id'] }, toastMessage?: ToastMessages) {
  return await callApi(api.dashboard[":id"].$delete({
    param: {
      id,
    },
  }), toastMessage);
}

export async function deleteDashboardPage({ id, pageId }: { id: DashboardWithPageData['id'], pageId: DashboardPageWithData['id'] }, toastMessage?: ToastMessages) {
  return await callApi(api.dashboard[":id"].page[':pageId'].$delete({
    param: {
      id,
      pageId,
    },
  }), toastMessage);
}

export async function getDashboardByPath(dashboardPath: DashboardWithPageData['path']) {
  return await callApi(api.dashboard[":dashboardPath"].$get({
    param: {
      dashboardPath,
    }
  }));
}

export async function getDashboardByPathWithData(dashboardPath: DashboardWithPageData['path']) {
  return await callApi(api.dashboard[":dashboardPath"].data.$get({
    param: {
      dashboardPath,
    }
  }));
}

export async function getDashboardPageForUser(id: DashboardWithPageData['id'], pageId: DashboardPageWithData['id']) {
  return await callApi(api.dashboard[":id"].page[":pageId"].$get({
    param: {
      id,
      pageId,
    }
  }));
}
export async function updateDashboardPageForUser(id: DashboardWithPageData['id'], page: Partial<DashboardPageWithData> & {
  id: DashboardPageWithData['id'];
}) {
  const req = api.dashboard[":id"].page[":pageId"].$put({
    json: {
      path: page.path,
      name: page.name,
      data: page.data,
      thumbnail: page.thumbnail,
    },
    param: {
      id,
      pageId: page.id,
    }
  });
  const res = await callApi(req);
  return res;
}

type DashboardUpdateInput = { id: DashboardWithPageData['id'] } & Partial<Omit<DashboardWithPageData, 'pages' | 'id'>>;

export async function updateDashboardForUser(dashboard: DashboardUpdateInput) {
  const req = api.dashboard[":id"].$put({
    param: {
      id: dashboard.id,
    },
    json: {
      name: dashboard.name,
      path: dashboard.path,
      data: dashboard.data,
      themeId: dashboard.themeId,
      breakpoints: dashboard.breakpoints,
      thumbnail: dashboard.thumbnail,
    }
  });
  const res = await callApi(req);
  return res; 
}

export async function getDashboardsForUser() {
  const req = api.dashboard.$get();
  const res = await callApi(req);
  return res; 
}

// get a dashboard by path with pages, pages don't have data
export const dashboardByPathQueryOptions = (dashboardPath: DashboardWithPageData['path']) => queryOptions({
  queryKey: ["get-dashboard-by-path-for-user", dashboardPath],
  queryFn: () => getDashboardByPath(dashboardPath),
  staleTime: Infinity,
});
export const dashboardByPathWithPageDataQueryOptions = (dashboardPath: DashboardWithPageData['path']) => queryOptions({
  queryKey: ["get-dashboard-by-path-with-page-for-user", dashboardPath],
  queryFn: () => getDashboardByPathWithData(dashboardPath),
  staleTime: Infinity,
});
// get a dashboard page with data
export const dashboardPageQueryOptions = (dashboardId: DashboardWithPageData['id'], pageId: DashboardPageWithData['id']) => queryOptions({
  queryKey: ["get-dashboard-page-for-user", dashboardId, pageId],
  queryFn: () => getDashboardPageForUser(dashboardId, pageId),
  staleTime: Infinity,
});
// get all dashboards including pages, pages don't have data
export const dashboardsQueryOptions = queryOptions({
  queryKey: ["get-dashboards-for-user"],
  queryFn: getDashboardsForUser,
  staleTime: Infinity,
});