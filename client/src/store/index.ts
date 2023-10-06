import { create } from 'zustand';
import { DEFAULT_PAGE_CONFIG } from './pages';
import type { Layout } from 'react-grid-layout';
import type { AvailableWidgets } from '../widgets/types';

export interface PageWidget {
  uid: string;
  name: AvailableWidgets;
  props: Record<string, any>;
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
  setMode: (mode: 'edit' | 'live') => void;
  currentPageId: string | null;
  setCurrentPageId: (id: string | null) => void;
  pages: PageConfig[];
  setPages: (pages: PageConfig[]) => void;
}

export const useHakitStore = create<Store>((set) => ({
  mode: 'edit',
  setMode: (mode) => set({ mode }),
  currentPageId: null,
  setCurrentPageId: (id: string | null) => set({ currentPageId: id }),
  pages: DEFAULT_PAGE_CONFIG,
  setPages: (pages) => set({ pages }),
}));
