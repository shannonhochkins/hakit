import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Config, Puck } from '@measured/puck';
import { createEmotionCachePlugin } from './PuckOverrides/Plugins/emotionCache';
import { createPuckOverridesPlugin } from './PuckOverrides/Plugins/overrides';
import { Spinner } from '@lib/components/Spinner';
import { PuckPageData } from '@typings/puck';
import { PuckLayout } from './PuckLayout';
import { puckToDBValue } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/pageData/puckToDBValue';

const emotionCachePlugin = createEmotionCachePlugin();
const overridesPlugin = createPuckOverridesPlugin();

export function Editor() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const userConfig = useGlobalStore(state => state.userConfig);
  const handlePuckChange = (newData: PuckPageData) => {
    // we've just received a new update for the entire puck page data
    // we should now take the current data, merge with the original data
    // sort out any new breakpoint values based on flags set in the store
    // and sing a happy song and hope and pray this works.
    const { puckPageData, hasInitializedData, activeBreakpoint, componentBreakpointMap, setHasInitializedData, setUnsavedPuckPageData } =
      useGlobalStore.getState();
    if (!hasInitializedData) {
      setHasInitializedData(true);
    } else if (userConfig) {
      const newDataWithBp = puckToDBValue(puckPageData, newData, activeBreakpoint, userConfig, componentBreakpointMap);
      console.log('Updating data for db', newDataWithBp);
      setUnsavedPuckPageData(newDataWithBp);
    }
  };

  if (!userConfig) {
    return <Spinner absolute text='Loading user data' />;
  }
  if (!puckPageData) {
    return <Spinner absolute text='Loading page data' />;
  }

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
        data={{}}
      >
        <PuckLayout />
      </Puck>
    </div>
  );
}
