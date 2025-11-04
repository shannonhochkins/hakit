// src/types/shims/hono-shim.d.ts
export type Dashboard = {
  path: string;
  id: string;
  name: string;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  dashboardId: string;
};

// Force this .d.ts to be a module even if only types are present
export {};
