import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Config, Puck } from '@measured/puck';
import { createEmotionCachePlugin } from './PuckOverrides/Plugins/emotionCache';
import { createPuckOverridesPlugin } from './PuckOverrides/Plugins/overrides';
import { Spinner } from '@lib/components/Spinner';
import { PuckPageData } from '@typings/puck';
import { PuckLayout } from './PuckLayout';

const emotionCachePlugin = createEmotionCachePlugin();
const overridesPlugin = createPuckOverridesPlugin();

export function Editor() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const userConfig = useGlobalStore(state => state.userConfig);
  const handlePuckChange = (newData: PuckPageData) => {
    const { hasInitializedData, setHasInitializedData, setUnsavedPuckPageData } = useGlobalStore.getState();
    if (!hasInitializedData) {
      setHasInitializedData(true);
    } else {
      setUnsavedPuckPageData(newData);
    }
  };

  if (!userConfig) {
    return <Spinner absolute text='Loading user data' />;
  }
  if (!puckPageData) {
    return <Spinner absolute text='Loading page data' />;
  }
  console.log('rendering editor', puckPageData);

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
