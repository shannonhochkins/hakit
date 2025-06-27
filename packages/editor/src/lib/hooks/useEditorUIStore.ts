import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LeftSidebarTab = 'components' | 'outline';

interface CanvasPreview {
  width: number;
  height: number;
  isResponsive: boolean;
}

type EditorUIStore = {
  // Left Sidebar State
  leftSidebar: {
    isCollapsed: boolean;
    activeTab: LeftSidebarTab;
  };
  
  // Right Sidebar State
  rightSidebar: {
    isCollapsed: boolean;
  };
  
  // Fullscreen State
  isFullscreen: boolean;
  
  // Canvas Preview State
  canvasPreview: CanvasPreview;
  
  // Actions
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  setLeftSidebarTab: (tab: LeftSidebarTab) => void;
  
  setRightSidebarCollapsed: (collapsed: boolean) => void;
  
  setFullscreen: (fullscreen: boolean) => void;
  
  setCanvasPreview: (preview: Partial<CanvasPreview>) => void;
  
  // Reset methods
  resetLeftSidebar: () => void;
  resetRightSidebar: () => void;
};

const initialLeftSidebarState = {
  isCollapsed: false,
  activeTab: 'components' as LeftSidebarTab,
};

const initialRightSidebarState = {
  isCollapsed: false,
};

const initialCanvasPreviewState: CanvasPreview = {
  width: 0,
  height: 0,
  isResponsive: true,
};

export const useEditorUIStore = create<EditorUIStore>()(
  persist(
    (set) => ({
      leftSidebar: initialLeftSidebarState,
      rightSidebar: initialRightSidebarState,
      isFullscreen: false,
      canvasPreview: initialCanvasPreviewState,
      
      setLeftSidebarCollapsed: (collapsed: boolean) =>
        set((state) => ({
          leftSidebar: {
            ...state.leftSidebar,
            isCollapsed: collapsed,
          },
        })),
      
      setLeftSidebarTab: (tab: LeftSidebarTab) =>
        set((state) => ({
          leftSidebar: {
            ...state.leftSidebar,
            activeTab: tab,
            // Auto-expand when switching tabs
            isCollapsed: false,
          },
        })),
      
      setRightSidebarCollapsed: (collapsed: boolean) =>
        set((state) => ({
          rightSidebar: {
            ...state.rightSidebar,
            isCollapsed: collapsed,
          },
        })),
      
      setFullscreen: (fullscreen: boolean) =>
        set(() => ({
          isFullscreen: fullscreen,
        })),
      
      setCanvasPreview: (preview: Partial<CanvasPreview>) =>
        set((state) => ({
          canvasPreview: {
            ...state.canvasPreview,
            ...preview,
          },
        })),
      
      resetLeftSidebar: () =>
        set(() => ({
          leftSidebar: initialLeftSidebarState,
        })),
      
      resetRightSidebar: () =>
        set(() => ({
          rightSidebar: initialRightSidebarState,
        })),
    }),
    {
      name: 'hakit-editor-ui-store',
      partialize: (state) => ({
        leftSidebar: {
          isCollapsed: state.leftSidebar.isCollapsed,
          activeTab: state.leftSidebar.activeTab,
        },
        rightSidebar: {
          isCollapsed: state.rightSidebar.isCollapsed,
        },
        // Don't persist fullscreen state - should reset on page load
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<EditorUIStore>),
        leftSidebar: {
          ...initialLeftSidebarState,
          ...(persistedState as Partial<EditorUIStore>)?.leftSidebar,
        },
        rightSidebar: {
          ...initialRightSidebarState,
          ...(persistedState as Partial<EditorUIStore>)?.rightSidebar,
        },
        // Always reset fullscreen to false on load
        isFullscreen: false,
      }),
    }
  )
);
