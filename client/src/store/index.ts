import { create } from 'zustand';
import { DEFAULT_CONFIG } from './config';
import type { Layout } from 'react-grid-layout';
import type { AvailableWidgets } from '../widgets/available-widgets';

export interface PageWidget {
  uid: string;
  name: AvailableWidgets;
  props: Record<string, any>;
  layout: Omit<Layout, 'i'>;
  widgets: PageWidget[];
}

export interface PageConfig {
  id: string;
  name: string;
  enabled: boolean;
  maxWidth: number;
  preventCollision: boolean;
  allowOverlap: boolean;
  compactType: 'vertical' | 'horizontal' | 'off';
  margin: [number, number],
  containerPadding: [number, number],
  icon: string;
  widgets: PageWidget[];
}

export interface Theme {
  hue?: number;
  saturation?: number;
  lightness?: number;
  tint?: number;
  contrastThreshold?: number;
  darkMode?: boolean;
}

export interface View {
  id: string;
  name: string;
  url: string;
  pages: PageConfig[];
}

export interface Config {
  theme: Theme;
  views: View[];
}

interface Store {
  mode: 'edit' | 'live';
  setMode: (mode: 'edit' | 'live') => void;
  currentPageId: string | null;
  setCurrentPageId: (id: string | null) => void;
  config: Config;
  setConfig: (config: Config) => void;
  // the current active view (dashboard)
  view: View | null;
  setView: (view: View) => void;
  setPages: (pages: PageConfig[]) => void;
}

export const useHakitStore = create<Store>((set, get) => ({
  mode: 'edit',
  setMode: (mode) => set({ mode }),
  config: DEFAULT_CONFIG,
  setConfig: (config) => set({ config }),
  currentPageId: null,
  setCurrentPageId: (id: string | null) => set({ currentPageId: id }),
  view: null,
  setView: (view) => {
    // Update the view in the store
    set({ view });

    // Update the corresponding view in config.views
    const currentConfig = get().config;
    const updatedViews = currentConfig.views.map((v) =>
      v.id === view.id ? view : v
    );
    const updatedConfig = { ...currentConfig, views: updatedViews };
    set({ config: updatedConfig });
  },
  setPages: (pages) => {
    const currentState = get();
    if (!currentState.view) {
      return;
    }

    // Update the pages in the current view
    const updatedView = {
      ...currentState.view,
      pages,
    };
    set({ view: updatedView });

    // Update the corresponding view in config.views
    const updatedViews = currentState.config.views.map((v) =>
      v.id === updatedView.id ? updatedView : v
    );
    const updatedConfig = { ...currentState.config, views: updatedViews };
    set({ config: updatedConfig });
  },
}));
