import { Tally2 } from 'lucide-react';
import { Row, Column } from '@hakit/components';
import { usePanel } from '../../hooks/usePanel';
import styled from '@emotion/styled';
import { DragDropProvider, useDraggable } from '@dnd-kit/react';
import { SIDEBAR_PANEL_WIDTH } from '@lib/constants';
import { Tabs } from './Tabs';
// tabs
import { Components } from './Tabs/Components';
import { Options } from './Tabs/Options';
import { Tree } from './Tabs/Tree';
// individual components
import { ActionBar } from './ActionBar';
import { useId, useRef } from 'react';
import { getSidebarWidth, setSidebarWidth } from './helpers';
import { useIsPageEditMode } from '@lib/hooks/useIsPageEditMode';

const PanelWrapper = styled(Row)`
  max-height: calc(100% - 8px);
  overflow-y: auto;
  > * {
    width: 100%;
  }
`;

const ResizeHandle = styled.div`
  flex: none;
  box-sizing: border-box;
  cursor: col-resize;
  -webkit-touch-callout: none;
  user-select: none;
  position: absolute;
  top: 0;
  left: -2px;
  width: 10px;
  height: 100%;
  z-index: 12;
  transform: translate(-50%, 0%);

  .resize-handle-wrapper {
    position: absolute;
    top: 50%;
    transform: translate(0%, -50%);
    width: 10px;
    height: 100px;
    overflow: hidden;
    border-radius: 7px;
    left: 0;
    z-index: 13;
    transition: background-color var(--transition-normal);
    &:hover,
    &:active {
      .resize-handle {
        color: var(--color-gray-400);
      }
    }
  }
  .resize-handle {
    position: absolute;
    top: 50%;
    transform: translate(0%, -50%);
    left: 0px;
    color: var(--color-gray-200);
    transition: color var(--transition-normal);
  }
`;

const Sidebar = styled.div`
  width: var(--sidebar-panel-width, ${SIDEBAR_PANEL_WIDTH}px);
  min-height: 100%;
  border-left: 3px solid var(--color-gray-400);
  position: relative;
  background-color: var(--color-gray-500);
`;

function Draggable() {
  const id = useId();
  const { ref } = useDraggable({
    id,
  });

  return (
    <>
      <ResizeHandle
        style={{
          // pointerEvents: 'none',
        }}
      >
        <Row className='resize-handle-wrapper'>
          <Tally2 className='resize-handle' size='20' />
        </Row>
      </ResizeHandle>
      <ResizeHandle
        ref={ref}
        style={{
          // visibly hide this element, we just use it to capture the position
          opacity: 0,
        }}
      />
    </>
  );
}


export const OptionsSidebar = () => {
  const width = useRef(SIDEBAR_PANEL_WIDTH);
  const [panel] = usePanel();
  const isPageEditMode = useIsPageEditMode();

  if (!isPageEditMode) {
    return <Sidebar>
      TEST
    </Sidebar>
  }


  return (
    <Sidebar>
      <DragDropProvider
        onDragStart={() => {
          const currentWidth = getSidebarWidth();
          width.current = currentWidth;
        }}
        onDragMove={({ operation }) => {
          console.log('operation', operation.position);
          // The current from the library
          const { x } = operation.position.current;
          // Add x to the original width from onDragStart, capping at the minimum width
          const newWidth = Math.max(width.current + x * -1, SIDEBAR_PANEL_WIDTH);
          setSidebarWidth(newWidth);
        }}
      >
        <Draggable />
      </DragDropProvider>
      <Column fullWidth fullHeight wrap='nowrap' alignItems='flex-start' justifyContent='flex-start'>
        <ActionBar />
        <Row wrap='nowrap' fullWidth fullHeight alignItems='flex-start' justifyContent='flex-start'>
          <PanelWrapper fullWidth fullHeight wrap='nowrap' alignItems='stretch' justifyContent='stretch' className={`panel-${panel}`}>
            {panel === 'components' && <Components />}
            {panel === 'options' && <Options />}
            {panel === 'tree' && <Tree />}
          </PanelWrapper>
          <Tabs />
        </Row>
      </Column>
    </Sidebar>
  );
};
