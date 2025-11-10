import { InferResponseType } from 'hono/client';
import { api } from '../client';

type ApiType = typeof api;

export type Addon = InferResponseType<ApiType['addons']['addons'][':id']['$get'], 200>['addon'];
export type AddonVersion = InferResponseType<ApiType['addons']['addons'][':id']['versions']['$get'], 200>['versions'][number];
export type AddonWithLatestVersion = InferResponseType<ApiType['addons']['search']['$get'], 200>['addons'][number];
export type UserAddon = InferResponseType<ApiType['addons']['user-addons']['$get'], 200>['userAddons'][number];
export type DashboardPage = InferResponseType<ApiType['dashboard'][':id']['page'][':pageId']['$get'], 200>['page'];
export type DashboardPageWithoutData = Omit<DashboardPage, 'data'>;
export type Dashboard = InferResponseType<ApiType['dashboard'][':dashboardPath']['$get'], 200>['dashboard'];
export type DashboardWithPageData = Omit<Dashboard, 'pages'> & {
  pages: DashboardPage[];
};

export type NotFoundTypes = 'dashboard-not-found' | 'dashboard-has-no-pages' | 'page-not-found' | 'not-found' | 'issue-not-found';
