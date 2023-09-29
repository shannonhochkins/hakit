import { create } from 'zustand';
import { DEFAULT_PAGE_CONFIG } from './pages';
import type { Layout } from 'react-grid-layout';
import type { AvailableWidgets } from '@client/widgets/types';

export interface PageWidget {
  id: string;
  name: AvailableWidgets;
  props: object;
  layout: Omit<Layout, 'i'>;
}

export interface PageConfig {
  id: string;
  name: string;
  enabled: boolean;
  maxWidth: number;
  margin: [number, number],
  containerPadding: [number, number],
  icon: string;
  widgets: PageWidget[];
}

interface Store {
  mode: 'edit' | 'live';
  currentPageId: string | null;
  setCurrentPageId: (id: string | null) => void;
  pages: PageConfig[];
  setPages: (pages: PageConfig[]) => void;
}

export const useHakitStore = create<Store>((set) => ({
  mode: 'edit',
  currentPageId: null,
  setCurrentPageId: (id: string | null) => set({ currentPageId: id }),
  pages: DEFAULT_PAGE_CONFIG,
  setPages: (pages) => set({ pages }),
}));
