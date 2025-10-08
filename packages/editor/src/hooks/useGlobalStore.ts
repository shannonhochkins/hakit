import { create } from 'zustand';
import type { CustomPuckConfig, PuckPageData } from '@typings/puck';
import type { HassServices } from 'home-assistant-js-websocket';
import type { DashboardWithPageData, Dashboard } from '@typings/hono';
import { EmotionCache } from '@emotion/react';
import { DEFAULT_BREAKPOINTS } from '@constants';
import { BreakpointItem } from '@typings/breakpoints';
import { type BreakPoint } from '@hakit/components';
import { DefaultComponentProps } from '@measured/puck';
import { toast } from 'react-toastify';
import { TEMPLATE_PREFIX } from '@helpers/editor/pageData/constants';
import type { ComponentData } from '@measured/puck';
import { setLocalStorageItem } from './useLocalStorage';

type ComponentId = string;
type FieldDotNotatedKey = string;
type IsBreakpointModeEnabled = boolean;
export type ComponentBreakpointModeMap = Record<ComponentId, Record<FieldDotNotatedKey, IsBreakpointModeEnabled>>;

type TemplateFieldMap = Record<ComponentId, string[]>;

function collectTemplatePaths(node: unknown, basePath: string[] = []): string[] {
  const results: string[] = [];
  const visited = new WeakSet<object>();
  const walk = (value: unknown, path: (string | number)[]) => {
    if (typeof value === 'string' && value.startsWith(TEMPLATE_PREFIX)) {
      // Use dot-notation for keys; do not split repository ids that may contain '/'
      const key = path.map(p => String(p)).join('.');
      results.push(key);
      return;
    }
    if (!value) return;
    if (Array.isArray(value)) {
      if (visited.has(value)) return;
      visited.add(value);
      value.forEach((item, idx) => walk(item, path.concat(idx)));
      return;
    }
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (visited.has(obj)) return;
      visited.add(obj);
      Object.keys(obj).forEach(k => walk(obj[k], path.concat(k)));
    }
  };
  walk(node, basePath);
  return results;
}

const computeTemplateFieldMap = (data: PuckPageData | null): TemplateFieldMap => {
  const map: TemplateFieldMap = {};
  if (!data) return map;
  // Root under a stable key
  const rootPaths = collectTemplatePaths(data.root?.props ?? {}, []);
  if (rootPaths.length > 0) map['root'] = rootPaths;

  // Content components by id
  const content = (data.content ?? []) as ComponentData[];
  content.forEach(item => {
    const id = item?.props?.id as string | undefined;
    if (!id) return;
    const paths = collectTemplatePaths(item?.props ?? {}, []);
    if (paths.length > 0) map[id] = paths;
  });
  return map;
};

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
  userConfig: CustomPuckConfig<DefaultComponentProps> | null;
  setUserConfig: (userConfig: CustomPuckConfig<DefaultComponentProps> | null) => void;
  services: HassServices | null;
  setServices: (services: HassServices | null) => void;
  dashboard: DashboardWithPageData | null;
  setDashboard: (dashboard: DashboardWithPageData | null) => void;
  dashboardWithoutData: Dashboard | null;
  setDashboardWithoutData: (dashboard: Dashboard | null) => void;
  hasInitializedData: boolean; // Flag to indicate if the initial data has been set
  setHasInitializedData: (hasInitializedData: boolean) => void;
  puckPageData: PuckPageData | null;
  // NOTE - Important that this is only triggered once when the dashboard is loading or changing pages
  setPuckPageData: (newPageData: PuckPageData) => void;
  unsavedPuckPageData: PuckPageData | null;
  setUnsavedPuckPageData: (unsavedPuckPageData: PuckPageData | null) => void;
  templateFieldMap: TemplateFieldMap;
  setTemplateFieldMap: (map: TemplateFieldMap) => void;
  modalStack: number[]; // track modal "depths" by ID or index
  pushModal: () => number;
  popModal: (id: number) => void;
  editorMode: boolean;
  setEditorMode: (editorMode: boolean) => void;
  componentBreakpointMap: ComponentBreakpointModeMap;
  setComponentBreakpointMap: (componentBreakpointModeMap: ComponentBreakpointModeMap) => void;
  // Actions object for centralized operations
  actions: {
    save: (pagePath?: string, callback?: () => void) => Promise<void>;
  };
};

export const useGlobalStore = create<PuckConfigurationStore>((set, get) => {
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
    // intentionally set to undefined, this value is set as the very first thing before the page loads
    // so to avoid typescript BS, we just assume everything else within the page already has the value set
    activeBreakpoint: undefined as unknown as BreakPoint,
    setActiveBreakpoint: (activeBreakpoint: BreakPoint) => {
      // sync the new value with the local storage
      setLocalStorageItem<BreakPoint>('selectedBreakpoint', activeBreakpoint);

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
    setUserConfig: (userConfig: CustomPuckConfig<DefaultComponentProps> | null) => set(state => ({ ...state, userConfig })),
    services: null,
    setServices: (services: HassServices | null) => set(state => ({ ...state, services })),
    dashboardWithoutData: null,
    setDashboardWithoutData: (dashboard: Dashboard | null) => set(state => ({ ...state, dashboardWithoutData: dashboard })),
    dashboard: null,
    setDashboard: (dashboard: DashboardWithPageData | null) => set(state => ({ ...state, dashboard })),
    hasInitializedData: false,
    setHasInitializedData: (hasInitializedData: boolean) => set(state => ({ ...state, hasInitializedData })),
    puckPageData: null,
    setPuckPageData: (puckPageData: PuckPageData) =>
      set(state => ({ ...state, puckPageData, templateFieldMap: computeTemplateFieldMap(puckPageData) })),
    unsavedPuckPageData: null,
    setUnsavedPuckPageData: (unsavedPuckPageData: PuckPageData | null) => {
      return set(state => {
        if (!state.hasInitializedData) return state;
        return { ...state, unsavedPuckPageData };
      });
    },
    templateFieldMap: {},
    setTemplateFieldMap: (map: TemplateFieldMap) => set(state => ({ ...state, templateFieldMap: map })),
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

    // Actions object for centralized operations
    actions: {
      save: async (pagePath?: string, callback?: () => void) => {
        const { updateDashboardPageForUser, updateDashboardForUser } = await import('@services/dashboard');
        const state = get();
        const { unsavedPuckPageData, setUnsavedPuckPageData, dashboard, breakpointItems } = state;
        if (!unsavedPuckPageData) return;
        if (!dashboard) {
          toast('Dashboard not found', {
            type: 'error',
            theme: 'dark',
          });
          return;
        }

        const page = dashboard.pages.find(page => page.path === pagePath);
        if (!page) {
          toast(`No page found with path ${pagePath}`, {
            type: 'error',
            theme: 'dark',
          });
          return;
        }

        // Perform the save
        await updateDashboardPageForUser(dashboard.id, {
          id: page.id,
          data: unsavedPuckPageData,
        });

        await updateDashboardForUser({
          id: dashboard.id,
          breakpoints: breakpointItems,
        });

        toast('Saved successfully', {
          type: 'success',
          theme: 'dark',
        });

        // Reset so we can determine and track unsaved changes
        setUnsavedPuckPageData(null);

        // callback after successful save
        if (callback) {
          callback();
        }
      },
    },
  };
});
