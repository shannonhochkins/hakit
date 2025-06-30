import { create } from 'zustand';
import type { PuckPageData, UserConfig } from '@typings/puck';
import type { HassServices } from 'home-assistant-js-websocket';
import type { DashboardWithPageData } from '@typings/dashboard';
import { EmotionCache } from '@emotion/react';
import { DEFAULT_BREAKPOINTS } from '@lib/constants';
import { BreakpointItem } from '@typings/breakpoints';

type PuckConfigurationStore = {
  breakpointItems: BreakpointItem[];
  setBreakPointItems: (breakpointItems: BreakpointItem[]) => void;
  emotionCache: EmotionCache | null;
  setEmotionCache: (emotionCache: EmotionCache | null) => void;
  userConfig: UserConfig | null;
  setUserConfig: (userConfig: UserConfig | null) => void;
  services: HassServices | null;
  setServices: (services: HassServices | null) => void;
  dashboard: DashboardWithPageData | null;
  setDashboard: (dashboard: DashboardWithPageData | null) => void;
  hasInitializedData: boolean; // Flag to indicate if the initial data has been set
  setHasInitializedData: (hasInitializedData: boolean) => void;
  puckPageData: PuckPageData | null;
  // NOTE - Important that this is only triggered once when the dashboard is loading or changing pages
  setPuckPageData: (newPageData: PuckPageData) => void;
  unsavedPuckPageData: PuckPageData | null;
  setUnsavedPuckPageData: (unsavedPuckPageData: PuckPageData | null) => void;
  modalStack: number[]; // track modal "depths" by ID or index
  pushModal: () => number;
  popModal: (id: number) => void;
  editorMode: boolean;
  setEditorMode: (editorMode: boolean) => void;
};

export const useGlobalStore = create<PuckConfigurationStore>(set => {
  let nextId = 0;
  return {
    breakpointItems: DEFAULT_BREAKPOINTS,
    setBreakPointItems: (breakpointItems: BreakpointItem[]) => set(state => ({ ...state, breakpointItems })),
    emotionCache: null,
    setEmotionCache: (emotionCache: EmotionCache | null) => set(state => ({ ...state, emotionCache })),
    userConfig: null,
    setUserConfig: (userConfig: UserConfig | null) => set(state => ({ ...state, userConfig })),
    services: null,
    setServices: (services: HassServices | null) => set(state => ({ ...state, services })),
    dashboard: null,
    setDashboard: (dashboard: DashboardWithPageData | null) => set(state => ({ ...state, dashboard })),
    hasInitializedData: false,
    setHasInitializedData: (hasInitializedData: boolean) => set(state => ({ ...state, hasInitializedData })),
    puckPageData: null,
    setPuckPageData: (puckPageData: PuckPageData) => set(state => ({ ...state, puckPageData })),
    unsavedPuckPageData: null,
    setUnsavedPuckPageData: (unsavedPuckPageData: PuckPageData | null) => {
      return set(state => {
        if (!state.hasInitializedData) return state;
        if (JSON.stringify(state.unsavedPuckPageData) === JSON.stringify(state.puckPageData)) return state;
        console.log('setting puck page data unsaved', unsavedPuckPageData);
        return { ...state, unsavedPuckPageData };
      });
    },
    modalStack: [],
    pushModal: () => {
      const id = nextId++;
      set(state => ({
        modalStack: [...state.modalStack, id],
      }));
      return id;
    },
    popModal: (id: number) => {
      set(state => ({
        modalStack: state.modalStack.filter(mid => mid !== id),
      }));
    },
    setEditorMode: (editorMode: boolean) => set(state => ({ ...state, editorMode })),
    editorMode: false,
  };
});
