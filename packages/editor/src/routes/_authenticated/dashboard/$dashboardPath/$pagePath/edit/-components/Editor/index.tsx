import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Config, Puck } from '@measured/puck';
import { createEmotionCachePlugin } from './PuckOverrides/Plugins/emotionCache';
import { createPuckOverridesPlugin } from './PuckOverrides/Plugins/overrides';
import { Spinner } from '@lib/components/Spinner';
import { PuckPageData } from '@typings/puck';
import { PuckLayout } from './PuckLayout';
import { puckToDBValue } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/pageData/puckToDBValue';
import { trimPuckDataToConfig } from '../../../-components/PreloadPuck/helpers/pageData/trimPuckDataToConfig';
import { useRef, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import deepEqual from 'deep-equal';

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

  const handlePuckChange = (newData: PuckPageData) => {
    // we've just received a new update for the entire puck page data
    // we should now take the current data, merge with the original data
    // sort out any new breakpoint values based on flags set in the store
    // and sing a happy song and hope and pray this works.
    const { hasInitializedData, setHasInitializedData } = useGlobalStore.getState();

    if (!hasInitializedData) {
      setHasInitializedData(true);
      return;
    }

    if (!userConfig) {
      return;
    }

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the expensive operations
    debounceTimeoutRef.current = setTimeout(() => {
      const { dashboard, activeBreakpoint, componentBreakpointMap, setUnsavedPuckPageData } = useGlobalStore.getState();

      if (!dashboard) {
        toast('No dashboard data available', {
          type: 'error',
        });
        return;
      }
      // find the currrent page in the dashboard
      const currentPage = dashboard.pages.find(page => page.path === pagePath);
      if (!currentPage) {
        toast(`No page found with path: ${pagePath}`, {
          type: 'error',
        });
        return;
      }

      const updated = puckToDBValue(currentPage.data, newData, activeBreakpoint, userConfig, componentBreakpointMap);
      const trimmed = trimPuckDataToConfig(updated, userConfig);

      if (trimmed && !deepEqual(currentPage.data, trimmed)) {
        console.log('Updating data for db', {
          updated: trimmed,
          originalData: currentPage.data,
        });
        setUnsavedPuckPageData(trimmed);
      }
    }, 250);
  };

  if (!userConfig) {
    return <Spinner absolute text='Loading user data' />;
  }
  if (!puckPageData) {
    return <Spinner absolute text='Loading page data' />;
  }

  console.log('puckPageData', puckPageData);

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
        plugins={[emotionCachePlugin, overridesPlugin]}
        dnd={{
          disableAutoScroll: false,
        }}
        config={userConfig as Config}
        data={puckPageData}
      >
        <PuckLayout />
      </Puck>
    </div>
  );
}
