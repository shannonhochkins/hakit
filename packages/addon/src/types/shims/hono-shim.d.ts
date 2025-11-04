import { Data } from '@measured/puck';

// src/types/shims/hono-shim.d.ts
export type Dashboard = {
  path: string;
  id: string;
  name: string;
  pages: DashboardPage[];
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  dashboardId: string;
};

export type DashboardPage = {
  id: string;
  name: string;
  thumbnail: string | null;
  updatedAt: string;
  createdAt: string;
  path: string;
  dashboardId: string;
  data: Data;
};

export type DashboardPageWithoutData = Omit<DashboardPage, 'data'>;

// Force this .d.ts to be a module even if only types are present
export {};
