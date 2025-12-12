import { useGlobalStore } from '@hooks/useGlobalStore';
import { Config, Puck, OnAction, useGetPuck, UiState, createUsePuck } from '@measured/puck';
import { createEmotionCachePlugin } from './PuckOverrides/Plugins/emotionCache';
import { createPuckOverridesPlugin } from './PuckOverrides/Plugins/overrides';
import { Spinner } from '@components/Loaders/Spinner';
import { PuckPageData } from '@typings/puck';
import { PuckLayout } from './PuckLayout';
import { useRef, useEffect, useCallback } from 'react';
import { useParams } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import isDeepEqual from '@guanghechen/fast-deep-equal';
import { EditorShortcuts } from './EditorShortcuts';
import { usePopupStore } from '@hooks/usePopupStore';
import { usePuckMiddleware } from '@hooks/usePuckMiddleware';
import { COMPONENT_TYPE_DELIMITER } from '@helpers/editor/pageData/constants';
import { useHakit } from '@hooks/useHakit';
import { usePuckIframeElements } from '@hooks/usePuckIframeElements';

const emotionCachePlugin = createEmotionCachePlugin();
const overridesPlugin = createPuckOverridesPlugin();

const usePuck = createUsePuck();

function SyncUnsavedAndPuckData() {
  const getPuck = useGetPuck();
  // const unsavedPuckPageData = useGlobalStore(state => state.unsavedPuckPageData);
  usePuckMiddleware.getState().onAction((action, appState) => {
    const { getItemBySelector } = getPuck();
    if (action.type === 'remove' || action.type === 'insert') {
      // When removing/inserting, we need to re-initialize the popup store to ensure removed/inserted popups are cleared out or initialized
      const data = appState.data;
      usePopupStore.getState().initializePopups(data);
    }
    // middleware to open popup when a popup component is selected from the outline or canvas
    if (action.type === 'setUi') {
      const itemSelector = (action.ui as Partial<UiState>)?.itemSelector;
      if (itemSelector) {
        const item = getItemBySelector(itemSelector);
        if (item?.type?.startsWith(`Popup${COMPONENT_TYPE_DELIMITER}@hakit`)) {
          const popupId = item.props.id;
          usePopupStore.getState().closeAllPopups();
          usePopupStore.getState().openPopup(popupId);
        }
      }
    }
  });
  // TODO - Assess if this is needed, or if puck onChange is sufficient
  // I cannot find a valid reason to keep this so for now we'll comment it out until issues arise, recovering unsaved changes should be handled via the useUnsavedChanges hook
  // Sync unsaved data to puck
  // useEffect(() => {
  //   if (unsavedPuckPageData) {
  //     // unsavedPuckPageData has a sanitization layer which will perform trimming on things
  //     // and ensure validity on other values, for example after removing a popup component, any components
  //     // that referenced that popup should have had their popupId field cleared out.
  //     const { dispatch, appState } = getPuck();
  //     const data = appState.data;
  //     if (!deepEqual(data, unsavedPuckPageData)) {
  //       dispatch({
  //         type: 'setData', // TODO - Avoid using this, as it's expensive
  //         data: unsavedPuckPageData,
  //       });
  //     }
  //   }
  // }, [unsavedPuckPageData, getPuck]);

  return null;
}

export function Editor() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const userConfig = useGlobalStore(state => state.userConfig);
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit/',
  });
  const { pagePath } = params;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handlePuckChange = useCallback(
    (newData: PuckPageData) => {
      // we've just received a new update for the entire puck page data
      // we should now take the current data, merge with the original data
      // sort out any new breakpoint values based on flags set in the store
      // and sing a happy song and hope and pray this works.

      if (!userConfig) {
        return;
      }

      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the expensive operations
      debounceTimeoutRef.current = setTimeout(() => {
        const { dashboard, setUnsavedPuckPageData } = useGlobalStore.getState();

        if (!dashboard) {
          toast('No dashboard data available', {
            type: 'error',
            theme: 'dark',
          });
          return;
        }
        // find the currrent page in the dashboard
        const currentPage = dashboard.pages.find(page => page.path === pagePath);
        if (!currentPage) {
          toast(`No page found with path: ${pagePath}`, {
            type: 'error',
            theme: 'dark',
          });
          return;
        }
        if (newData) {
          // We currently run the sanitization on page load, which should be sufficient enough to ensure
          // the data matches the users configuration and removes any invalid references etc.
          // if we run into issues we can consider running this on every change, but it may lead to performance issues
          // const sanitizedData = sanitizePuckData({
          //   data: newData,
          //   userConfig,
          // });
          const sanitizedData = newData;
          if (sanitizedData && !isDeepEqual(currentPage.data, sanitizedData)) {
            console.debug('Updating data for db', {
              // updatedOriginal: updated,
              updated: sanitizedData,
              originalData: currentPage.data,
            });
            usePopupStore.getState().initializePopups(sanitizedData);
            setUnsavedPuckPageData(sanitizedData);
          }
        }
      }, 250);
    },
    [userConfig, pagePath]
  );

  const onAction = useCallback((action: Parameters<OnAction>[0], appState: Parameters<OnAction>[1]) => {
    usePuckMiddleware.getState().emitAction(action, appState, appState);
  }, []);

  if (!userConfig) {
    return <Spinner absolute text='Loading user data' />;
  }
  if (!puckPageData) {
    return <Spinner absolute text='Loading page data' />;
  }
  console.debug('puckPageData', { userConfig, puckPageData });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Puck
        onChange={handlePuckChange}
        onAction={onAction}
        iframe={{
          // this was causing puck to load indefinitely
          waitForStyles: false,
        }}
        plugins={[overridesPlugin, emotionCachePlugin]}
        dnd={{
          disableAutoScroll: false,
        }}
        config={userConfig as Config}
        data={puckPageData}
      >
        <PuckLayout />
        <SyncUnsavedAndPuckData />
        <ExposePuckData />
      </Puck>
      <EditorShortcuts />
    </div>
  );
}
// exposing the currently selected component to the global store
function ExposePuckData() {
  const selectedItem = usePuck(state => state.selectedItem);
  const itemSelector = usePuck(state => state.appState.ui.itemSelector);
  const userConfig = useGlobalStore(state => state.userConfig);
  const dashboard = useGlobalStore(state => state.dashboardWithoutData);
  const editorElements = usePuckIframeElements();

  useEffect(() => {
    const setDashboard = useHakit.getState().setDashboard;
    setDashboard(dashboard);
  }, [dashboard]);

  useEffect(() => {
    const setEditor = useHakit.getState().setEditor;
    setEditor({
      document: editorElements.document,
      window: editorElements.window,
      iframe: editorElements.iframe,
    });
  }, [editorElements]);

  useEffect(() => {
    const setComponentNames = useHakit.getState().setComponentNames;
    if (!userConfig) {
      return;
    }
    setComponentNames(Object.keys(userConfig.components ?? {}));
  }, [userConfig]);

  useEffect(() => {
    const setSelectedComponent = useHakit.getState().setSelectedComponent;
    if (!selectedItem || !itemSelector) {
      setSelectedComponent(null);
      return;
    }
    setSelectedComponent({
      type: selectedItem.type,
      itemSelector,
    });
  }, [selectedItem, itemSelector]);

  return null;
}
