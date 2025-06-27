import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LeftSidebarTab = 'components' | 'outline';

type EditorUIStore = {
  // Left Sidebar State
  leftSidebar: {
    isCollapsed: boolean;
    activeTab: LeftSidebarTab;
    searchQuery: string;
  };
  
  // Right Sidebar State
  rightSidebar: {
    isCollapsed: boolean;
  };
  
  // Fullscreen State
  isFullscreen: boolean;
  
  // Actions
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  setLeftSidebarTab: (tab: LeftSidebarTab) => void;
  setLeftSidebarSearchQuery: (query: string) => void;
  
  setRightSidebarCollapsed: (collapsed: boolean) => void;
  
  setFullscreen: (fullscreen: boolean) => void;
  
  // Reset methods
  resetLeftSidebar: () => void;
  resetRightSidebar: () => void;
};

const initialLeftSidebarState = {
  isCollapsed: false,
  activeTab: 'components' as LeftSidebarTab,
  searchQuery: '',
};

const initialRightSidebarState = {
  isCollapsed: false,
};

export const useEditorUIStore = create<EditorUIStore>()(
  persist(
    (set) => ({
      leftSidebar: initialLeftSidebarState,
      rightSidebar: initialRightSidebarState,
      isFullscreen: false,
      
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
      
      setLeftSidebarSearchQuery: (query: string) =>
        set((state) => ({
          leftSidebar: {
            ...state.leftSidebar,
            searchQuery: query,
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
          // Don't persist search query
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
