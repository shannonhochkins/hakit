import { useEffect } from 'react';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';
import { usePanel } from '@editor/hooks/usePanel';
import { Puck } from '@measured/puck';
import { Column, Row } from '@hakit/components';
import { SidebarSection } from './EditorComponents/Sidebar';
import { ViewportControls } from './EditorComponents/ViewportControls';
import { Preview } from './EditorComponents/Preview';
import '@measured/puck/puck.css';
import './puck-overrides.css';


export function Editor() {

  const [panel, setPanel] = usePanel();
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const userConfig = useGlobalStore(state => state.userConfig);

  useEffect(() => {
    document.body.classList.add('edit-mode');
    return () => {
      document.body.classList.remove('edit-mode');
    };
  }, []);

  if (!userConfig) {
    return <div>Loading user config...</div>;
  }

  return (
    <div
      onClick={() => {
        if (panel === 'background') {
          setPanel('options');
        }
      }}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Puck
        onAction={action => {
          if (action.type === 'insert') {
            setPanel('options');
          }
        }}
        iframe={{
          // this was causing puck to load indefinitely
          waitForStyles: false,
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