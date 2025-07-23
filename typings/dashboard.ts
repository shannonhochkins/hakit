import type { PuckPageData } from './puck';
import type { BreakpointItem } from './breakpoints';
import { Dashboard as DbDashboard, DashboardPage as DbDashboardPage } from './db';

export type DashboardPageWithoutData = Omit<DbDashboardPage, 'data' | 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type DashboardPageWithData = DashboardPageWithoutData & {
  data: PuckPageData;
};
interface Dashboard extends Omit<DbDashboard, 'breakpoints' | 'data' | 'createdAt' | 'updatedAt'> {
  data: PuckPageData;
  breakpoints: BreakpointItem[];
  createdAt: string;
  updatedAt: string;
}

export type DashboardWithPageData = Dashboard & {
  pages: DashboardPageWithData[];
};

export type DashboardWithoutPageData = Dashboard & {
  pages: DashboardPageWithoutData[];
};
