import { create } from 'zustand';
import type { PuckPageData, UserConfig } from '@typings/puck';
import type { HassServices } from 'home-assistant-js-websocket';
import type { DashboardWithoutPageData } from "@typings/dashboard";
import { EmotionCache } from '@emotion/react';


type PuckConfigurationStore = {
  emotionCache: EmotionCache | null;
  setEmotionCache: (emotionCache: EmotionCache | null) => void;
  userConfig: UserConfig | null;
  setUserConfig: (userConfig: UserConfig | null) => void;
  services: HassServices | null;
  setServices: (services: HassServices | null) => void;
  dashboard: DashboardWithoutPageData | null;
  setDashboard: (dashboard: DashboardWithoutPageData | null) => void;
  puckPageData: PuckPageData | null;
  // NOTE - Important that this is only triggered once when the dashboard is loading or changing pages
  setPuckPageData: (newPageData: PuckPageData) => void;
  unsavedPuckPageData: PuckPageData;
  setUnsavedPuckPageData: (unsavedPuckPageData: PuckPageData) => void;
};

export const useGlobalStore = create<PuckConfigurationStore>(set => ({
  emotionCache: null,
  setEmotionCache: (emotionCache: EmotionCache | null) => set(state => ({ ...state, emotionCache })),
  userConfig: null,
  setUserConfig: (userConfig: UserConfig | null) => set(state => ({ ...state, userConfig })),
  services: null,
  setServices: (services: HassServices | null) => set(state => ({ ...state, services })),
  dashboard: null,
  setDashboard: (dashboard: DashboardWithoutPageData | null) => set(state => ({ ...state, dashboard })),
  puckPageData: null,
  setPuckPageData: (puckPageData: PuckPageData) => set(state => ({ ...state, puckPageData })),
  unsavedPuckPageData: {} as PuckPageData,
  setUnsavedPuckPageData: (unsavedPuckPageData: PuckPageData) => set(state => ({ ...state, unsavedPuckPageData })),
}));
