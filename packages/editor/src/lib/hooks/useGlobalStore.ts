import { create } from 'zustand';
import type { CustomConfig, PuckPageData } from '@typings/puck';
import type { HassServices } from 'home-assistant-js-websocket';
import type { DashboardWithoutPageData, DashboardWithPageData } from '@typings/dashboard';
import { EmotionCache } from '@emotion/react';
import { DEFAULT_BREAKPOINTS } from '@lib/constants';
import { BreakpointItem } from '@typings/breakpoints';
import { BreakPoint } from '@hakit/components';

type ComponentId = string;
type FieldDotNotatedKey = string;
type IsBreakpointModeEnabled = boolean;
export type ComponentBreakpointModeMap = Record<ComponentId, Record<FieldDotNotatedKey, IsBreakpointModeEnabled>>;

// options.deep.deepText

type PuckConfigurationStore = {
  activeBreakpoint: BreakPoint;
  setActiveBreakpoint: (activeBreakpoint: BreakPoint) => void;
  previewCanvasWidth: number; // Width of the preview canvas, controlled by the toolbar
  setPreviewCanvasWidth: (width: number) => void;
  previewZoom: number; // Zoom level for the preview (1 = 100%, 0.5 = 50%, etc.)
  setPreviewZoom: (zoom: number) => void;
  previewFitToWidth: boolean; // Whether to automatically fit content to available width
  setPreviewFitToWidth: (fitToWidth: boolean) => void;
  breakpointItems: BreakpointItem[];
  setBreakPointItems: (breakpointItems: BreakpointItem[]) => void;
  editorIframeDocument: Document | null; // Document of the iframe
  setEditorIframeDocument: (document: Document | null) => void;
  emotionCache: EmotionCache | null;
  setEmotionCache: (emotionCache: EmotionCache | null) => void;
  userConfig: CustomConfig | null;
  setUserConfig: (userConfig: CustomConfig | null) => void;
  services: HassServices | null;
  setServices: (services: HassServices | null) => void;
  dashboard: DashboardWithPageData | null;
  setDashboard: (dashboard: DashboardWithPageData | null) => void;
  dashboardWithoutData: DashboardWithoutPageData | null;
  setDashboardWithoutData: (dashboard: DashboardWithoutPageData | null) => void;
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
  componentBreakpointMap: ComponentBreakpointModeMap;
  setComponentBreakpointMap: (componentBreakpointMap: ComponentBreakpointModeMap) => void;
};

export const useGlobalStore = create<PuckConfigurationStore>(set => {
  let nextId = 0;
  return {
    previewCanvasWidth: 0,
    setPreviewCanvasWidth: (width: number) => {
      return set(state => ({ ...state, previewCanvasWidth: width }));
    },
    previewZoom: 1,
    setPreviewZoom: (zoom: number) => {
      return set(state => ({ ...state, previewZoom: zoom }));
    },
    previewFitToWidth: true,
    setPreviewFitToWidth: (fitToWidth: boolean) => {
      return set(state => ({ ...state, previewFitToWidth: fitToWidth }));
    },
    activeBreakpoint: 'sm', // Default to 'sm' to trigger smart initialization
    setActiveBreakpoint: (activeBreakpoint: BreakPoint) => {
      return set(state => ({ ...state, activeBreakpoint }));
    },
    componentBreakpointMap: {},
    setComponentBreakpointMap: (componentBreakpointMap: ComponentBreakpointModeMap) => {
      return set(state => ({ ...state, componentBreakpointMap }));
    },
    breakpointItems: DEFAULT_BREAKPOINTS,
    setBreakPointItems: (breakpointItems: BreakpointItem[]) => set(state => ({ ...state, breakpointItems })),
    editorIframeDocument: null,
    setEditorIframeDocument: (document: Document | null) => set(state => ({ ...state, editorIframeDocument: document })),
    emotionCache: null,
    setEmotionCache: (emotionCache: EmotionCache | null) => set(state => ({ ...state, emotionCache })),
    userConfig: null,
    setUserConfig: (userConfig: CustomConfig | null) => set(state => ({ ...state, userConfig })),
    services: null,
    setServices: (services: HassServices | null) => set(state => ({ ...state, services })),
    dashboardWithoutData: null,
    setDashboardWithoutData: (dashboard: DashboardWithoutPageData | null) => set(state => ({ ...state, dashboardWithoutData: dashboard })),
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
