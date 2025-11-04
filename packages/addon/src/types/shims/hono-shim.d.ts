import { Data } from '@measured/puck';

// Fallback local declaration; real type should merge from @typings/breakpoints when available.
export interface BreakpointItem {
  id: string;
  title: string;
  width: number;
  disabled: boolean;
  editable: boolean;
  icon?: string;
}

// src/types/shims/hono-shim.d.ts
// Base dashboard record (without pages) returned by some list endpoints
export interface DashboardBase {
  id: string;
  name: string;
  path: string;
  userId?: string;
  breakpoints: BreakpointItem[];
  thumbnail: string | null;
  data?: unknown;
  createdAt: string;
  updatedAt: string;
}

// Hydrated dashboard including pages (pages may be summary items without data hydrated)
export interface Dashboard extends DashboardBase {
  pages: DashboardPage[];
}

export interface DashboardPage {
  id: string;
  name: string;
  thumbnail: string | null;
  updatedAt: string;
  createdAt: string;
  path: string;
  dashboardId: string;
  data?: Data | null; // optional when not hydrated
}

export type DashboardWithPageData = Dashboard & { pages: DashboardPage[] };

export type DashboardPageWithoutData = Omit<DashboardPage, 'data'>;

// Force this .d.ts to be a module even if only types are present
export {};
