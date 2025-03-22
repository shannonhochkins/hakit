import { Puck } from '@measured/puck';
import { EditorAndRendererProps } from './Page';
import { Column, Row } from '@hakit/components';
import '@measured/puck/puck.css';
import './puck-overrides.css';
import { SidebarSection } from './EditorComponents/Sidebar';
import { ViewportControls } from './EditorComponents/ViewportControls';
import { Preview } from './EditorComponents/Preview';
import { usePanel } from '@editor/hooks/usePanel';

// Render Puck editor
export function Editor({ data, onChange, config }: EditorAndRendererProps) {
  const [, setPanel] = usePanel();
  return (
    <Puck
      onChange={onChange}
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
      config={config}
      data={data}
    >
      <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' className='puck-editor-wrapper'>
        {/* <NavBar /> */}

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
  );
}
