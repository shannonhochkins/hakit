import { useEffect } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Config, Puck } from '@measured/puck';
import { Column, Row } from '@hakit/components';
import { Preview } from './Preview';
import { Spinner } from '../../../components/Spinner';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { createEmotionCachePlugin } from './PuckOverrides/Plugins/emotionCache';
import { createPuckOverridesPlugin } from './PuckOverrides/Plugins/overrides';
import { Toolbar } from './Preview/Toolbar';


const emotionCachePlugin = createEmotionCachePlugin();
const overridesPlugin = createPuckOverridesPlugin();

export function Editor() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const setUnsavedPuckPageData = useGlobalStore(state => state.setUnsavedPuckPageData);
  // const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
  const userConfig = useGlobalStore(state => state.userConfig);
  const setEditorMode = useGlobalStore(state => state.setEditorMode);
  // const observerRef = useRef<MutationObserver | null>(null);
  const emotionCache = useGlobalStore(state => state.emotionCache);
  
  useEffect(() => {
    setEditorMode(true);
  }, [setEditorMode]);

  if (!userConfig) {
    return <Spinner absolute text="Loading user data" />;
  }
  if (!puckPageData) {
    return <Spinner absolute text="Loading page data" />;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Puck
        onChange={data => {
          setUnsavedPuckPageData(data);
        }}
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
        <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' className='puck-editor-wrapper'>
          <Header />
          <Row fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px' style={{
            flex: '1 1 0',
            minWidth: 0,
            opacity: emotionCache ? 1 : 0,
          }}>
            <LeftSidebar />
            <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px'>
              <Toolbar />
              <Preview />
            </Column>
            <RightSidebar />
          </Row>
        </Column>
      </Puck>
    </div>
  );
}
