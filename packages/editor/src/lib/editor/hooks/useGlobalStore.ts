import { create } from 'zustand';
import type { PuckPageData, UserConfig } from '@typings/puck';
import type { HassServices } from 'home-assistant-js-websocket';
import type { Dashboard } from "@typings/dashboard";


type PuckConfigurationStore = {
  userConfig: UserConfig | null;
  setUserConfig: (userConfig: UserConfig | null) => void;
  services: HassServices | null;
  setServices: (services: HassServices | null) => void;
  dashboard: Dashboard | null;
  setDashboard: (dashboard: Dashboard | null) => void;
  puckPageData: PuckPageData;
  // NOTE - Important that this is only triggered once when the dashboard is loading or changing pages
  setPuckPageData: (newPageData: PuckPageData) => void;
};

export const useGlobalStore = create<PuckConfigurationStore>(set => ({
  userConfig: null,
  setUserConfig: (userConfig: UserConfig | null) => set(state => ({ ...state, userConfig })),
  services: null,
  setServices: (services: HassServices | null) => set(state => ({ ...state, services })),
  dashboard: null,
  setDashboard: (dashboard: Dashboard | null) => set(state => ({ ...state, dashboard })),
  puckPageData: {} as PuckPageData,
  setPuckPageData: (puckPageData: PuckPageData) => set(state => ({ ...state, puckPageData })),
}));
