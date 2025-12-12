import { Dashboard } from '@typings/hono';
import { create } from 'zustand';

export type HakitStore = {
  /** Currently selected component - Only available in editor mode */
  selectedComponent: null | {
    type: string;
    itemSelector: {
      index: number;
      zone?: string;
    };
  };
  setSelectedComponent: (selectedComponent: null | { type: string; itemSelector: { index: number; zone?: string } }) => void;
  /** HAKIT dashboard context containing additional information passed to each component render */
  dashboard: Dashboard | null;
  setDashboard: (dashboard: Dashboard | null) => void;
  /** Mapped component names to use for slots for allow/disallow */
  componentNames: string[];
  setComponentNames: (componentNames: string[]) => void;
  /** Editor-related references, only available when rendering inside the editor */
  editor?: {
    /** Document reference for the editor iframe */
    document: Document | null;
    /** Window reference for the editor iframe */
    window: Window | null;
    /** HTML iframe element reference for the editor */
    iframe: HTMLIFrameElement | null;
  };
  setEditor: (editor: { document: Document | null; window: Window | null; iframe: HTMLIFrameElement | null }) => void;
};
/** NOTE - This hook is exposed via the addon and we need to ensure we don't expose information that the user can potentially cause herm with
 * @description This hook is used to expose certain information about the current dashboard, and other useul information such as component names, selected items etc, editor references, etc.
 */
export const useHakit = create<HakitStore>(set => {
  return {
    selectedComponent: null,
    setSelectedComponent: (selectedComponent: null | { type: string; itemSelector: { index: number; zone?: string } }) =>
      set(state => ({ ...state, selectedComponent })),
    dashboard: null,
    setDashboard: (dashboard: Dashboard | null) => set(state => ({ ...state, dashboard })),
    componentNames: [],
    setComponentNames: (componentNames: string[]) => set(state => ({ ...state, componentNames })),
    editor: undefined,
    setEditor: (editor: { document: Document | null; window: Window | null; iframe: HTMLIFrameElement | null }) =>
      set(state => ({ ...state, editor })),
  };
});
