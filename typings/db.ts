import { InferSelectModel } from 'drizzle-orm';
import {
  repositoryVersionsTable,
  dashboardTable,
  pagesTable,
  repositoriesTable,
  userRepositoriesTable,
} from '../packages/server/db/schema/db';

// Raw database types (with Date objects)
export type RepositoryVersion = InferSelectModel<typeof repositoryVersionsTable>;
export type Repository = InferSelectModel<typeof repositoriesTable>;
export type UserRepository = InferSelectModel<typeof userRepositoriesTable>;
export type Dashboard = InferSelectModel<typeof dashboardTable>;
export type DashboardPage = InferSelectModel<typeof pagesTable>;

// API response types (with serialized dates as strings)
export type RepositoryVersionAPI = Omit<RepositoryVersion, 'createdAt' | 'components'> & {
  createdAt: string;
  components?: RepositoryVersion['components'];
};

export type RepositoryAPI = Omit<Repository, 'createdAt' | 'updatedAt' | 'lastUpdated'> & {
  createdAt: string;
  updatedAt: string;
  lastUpdated: string | null;
};

export type UserRepositoryAPI = Omit<UserRepository, 'connectedAt' | 'lastUsedAt'> & {
  connectedAt: string;
  lastUsedAt: string | null;
};

export type DashboardAPI = Omit<Dashboard, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type DashboardPageAPI = Omit<DashboardPage, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

// Extended repository type for search results that includes latest version data
export type RepositoryWithLatestVersionAPI = RepositoryAPI & {
  latestVersionData: RepositoryVersionAPI | null;
};
