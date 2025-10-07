import { InferResponseType } from 'hono/client';
import { api } from '../client';

type ApiType = typeof api;

export type Repository = InferResponseType<ApiType['repositories']['repositories'][':id']['$get'], 200>['repository'];
export type RepositoryVersion = InferResponseType<
  ApiType['repositories']['repositories'][':id']['versions']['$get'],
  200
>['versions'][number];
export type RepositoryWithLatestVersion = InferResponseType<ApiType['repositories']['search']['$get'], 200>['repositories'][number];
export type UserRepository = InferResponseType<ApiType['repositories']['user-repositories']['$get'], 200>['userRepositories'][number];
export type DashboardPage = InferResponseType<ApiType['dashboard'][':id']['page'][':pageId']['$get'], 200>['page'];
export type DashboardPageWithoutData = Omit<DashboardPage, 'data'>;
export type Dashboard = InferResponseType<ApiType['dashboard'][':dashboardPath']['$get'], 200>['dashboard'];
export type DashboardWithPageData = Omit<Dashboard, 'pages'> & {
  pages: DashboardPage[];
};
