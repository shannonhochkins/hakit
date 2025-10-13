import { useGlobalStore } from '@hooks/useGlobalStore';
import { Config, Puck } from '@measured/puck';
import { createEmotionCachePlugin } from './PuckOverrides/Plugins/emotionCache';
import { createPuckOverridesPlugin } from './PuckOverrides/Plugins/overrides';
import { Spinner } from '@components/Loaders/Spinner';
import { PuckPageData } from '@typings/puck';
import { PuckLayout } from './PuckLayout';
import { useRef, useEffect, useCallback } from 'react';
import { useParams } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import deepEqual from 'deep-equal';
import { EditorShortcuts } from './EditorShortcuts';
import { sanitizePuckData } from '@helpers/editor/pageData/sanitizePuckData';

const emotionCachePlugin = createEmotionCachePlugin();
const overridesPlugin = createPuckOverridesPlugin();

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
          const sanitizedData = sanitizePuckData({
            data: newData,
            userConfig,
          });
          if (sanitizedData && !deepEqual(currentPage.data, sanitizedData)) {
            console.debug('Updating data for db', {
              // updatedOriginal: updated,
              updated: sanitizedData,
              originalData: currentPage.data,
            });
            setUnsavedPuckPageData(sanitizedData);
          }
        }
      }, 250);
    },
    [userConfig, pagePath]
  );

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
        // onAction={action => {
        // if (action.type === 'insert') {
        //   setPanel('options');
        // }
        // }}
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
      </Puck>
      <EditorShortcuts />
    </div>
  );
}
