import { create } from 'zustand';
import { type PuckPageData } from '@typings/puck';
import type { HassServices } from 'home-assistant-js-websocket';

type PuckConfigurationStore = {
  services: HassServices | null;
  setServices: (services: HassServices | null) => void;
  puckPageData: PuckPageData;
  setPuckPageData: (newPageData: PuckPageData) => void;
};

export const useGlobalStore = create<PuckConfigurationStore>(set => ({
  services: null,
  setServices: (services: HassServices | null) => set(state => ({ ...state, services })),
  puckPageData: {} as PuckPageData,
  setPuckPageData: (puckPageData: PuckPageData) => set(state => ({ ...state, puckPageData })),
}));
