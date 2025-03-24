import { useEffect, useRef } from 'react';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';
import { Puck } from '@measured/puck';
import { Column, Row } from '@hakit/components';
import { SidebarSection } from './EditorComponents/Sidebar';
import { ViewportControls } from './EditorComponents/ViewportControls';
import { Preview } from './EditorComponents/Preview';
import createCache from '@emotion/cache';
import '@measured/puck/puck.css';
import './puck-overrides.css';

export function Editor() {
  const intervalRef = useRef<Timer | null>(null);
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const setUnsavedPuckPageData = useGlobalStore(state => state.setUnsavedPuckPageData);
  const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
  const userConfig = useGlobalStore(state => state.userConfig);

  useEffect(() => {
    document.body.classList.add('edit-mode');
    return () => {
      document.body.classList.remove('edit-mode');
    };
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const editorFrame = document.querySelector('iframe#preview-frame') as HTMLIFrameElement;
      if (editorFrame && editorFrame?.contentWindow?.document.head) {
        setEmotionCache(createCache({
          key: 'hakit-addons',
          container: editorFrame?.contentWindow?.document.head,
        }));
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 10);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []);

  if (!userConfig) {
    return <div>Loading user config...</div>;
  }
  if (!puckPageData) {
    return <div>Loading puck page data</div>;
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
          console.log('data', data);
          setUnsavedPuckPageData(data);
        }}
        // onAction={action => {
          // if (action.type === 'insert') {
          //   setPanel('options');
          // }
        // }}
        iframe={{
          // this was causing puck to load indefinitely
          waitForStyles: true,
        }}
        overrides={{
          actionBar: () => {
            return <></>;
          },
        }}
        config={userConfig}
        data={puckPageData}
      >
        <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' className='puck-editor-wrapper'>
          <Row fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px' data-floating-panel-restriction>
            <Column
              fullWidth
              fullHeight
              alignItems='stretch'
              justifyContent='stretch'
              wrap='nowrap'
              gap='0px'
              style={{
                flex: '1 1 0',
                minWidth: 0,
              }}
            >
              <ViewportControls />
              <Preview />
            </Column>
            <SidebarSection />
          </Row>
        </Column>
      </Puck>
    </div>
  );
}