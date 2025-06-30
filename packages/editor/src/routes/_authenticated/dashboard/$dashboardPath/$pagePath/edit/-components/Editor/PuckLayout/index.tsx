import { useEffect, useRef } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Column, Row } from '@hakit/components';
import { Preview } from './Preview';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Toolbar } from './Toolbar';
import styled from '@emotion/styled';
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ResizeHandleIcon } from './ResizeHandle';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';

const StyledPanelResizeHandle = styled(PanelResizeHandle)`
  position: relative;
`;

export function PuckLayout() {
  const emotionCache = useGlobalStore(state => state.emotionCache);
  const { setLeftSidebarCollapsed, setRightSidebarCollapsed, leftSidebar, rightSidebar } = useEditorUIStore();
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null); // Simple onChange handler - just update unsavedPuckPageData

  useEffect(() => {
    // If the left sidebar is collapsed, collapse the panel
    if (leftSidebar.isCollapsed && leftPanelRef.current && !leftPanelRef.current.isCollapsed()) {
      leftPanelRef.current.collapse();
    } else if (!leftSidebar.isCollapsed && leftPanelRef.current && leftPanelRef.current.isCollapsed()) {
      leftPanelRef.current.expand();
      // maybe we can determine the previous expanded with?
      leftPanelRef.current.resize(25); // Ensure it expands to 25% width when toggled
    }

    if (rightSidebar.isCollapsed && rightPanelRef.current && !rightPanelRef.current.isCollapsed()) {
      rightPanelRef.current.collapse();
    } else if (!rightSidebar.isCollapsed && rightPanelRef.current && rightPanelRef.current.isCollapsed()) {
      rightPanelRef.current.expand();
      // maybe we can determine the previous expanded with?
      rightPanelRef.current.resize(25); // Ensure it expands to 25% width when toggled
    }
  }, [leftSidebar.isCollapsed, rightSidebar.isCollapsed]);

  return (
    <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' className='puck-editor-wrapper'>
      <Header />
      <Row
        fullWidth
        fullHeight
        alignItems='stretch'
        justifyContent='stretch'
        wrap='nowrap'
        gap='0px'
        style={{
          flex: '1 1 0',
          minWidth: 0,
          opacity: emotionCache ? 1 : 0,
        }}
      >
        <PanelGroup autoSaveId='hakit-panels' direction='horizontal'>
          <Panel
            ref={leftPanelRef}
            defaultSize={25}
            collapsible
            // get 50px as a percentage of the viewport width
            collapsedSize={(50 / window.innerWidth) * 100}
            minSize={(200 / window.innerWidth) * 100}
            maxSize={40}
            onCollapse={() => {
              setLeftSidebarCollapsed(true);
            }}
            onExpand={() => {
              setLeftSidebarCollapsed(false);
            }}
          >
            <LeftSidebar
              onToggle={collapsed => {
                if (leftPanelRef.current) {
                  if (collapsed) {
                    leftPanelRef.current.collapse();
                  } else {
                    leftPanelRef.current.expand();
                  }
                }
              }}
            />
          </Panel>
          <StyledPanelResizeHandle>
            <ResizeHandleIcon direction='horizontal' />
          </StyledPanelResizeHandle>
          <Panel minSize={50}>
            <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px'>
              <Toolbar />
              <Preview />
            </Column>
          </Panel>
          <StyledPanelResizeHandle>
            <ResizeHandleIcon direction='horizontal' />
          </StyledPanelResizeHandle>
          <Panel
            ref={rightPanelRef}
            defaultSize={25}
            collapsedSize={(50 / window.innerWidth) * 100}
            collapsible
            minSize={(200 / window.innerWidth) * 100}
            maxSize={40}
            onCollapse={() => {
              setRightSidebarCollapsed(true);
            }}
            onExpand={() => {
              setRightSidebarCollapsed(false);
            }}
          >
            <RightSidebar
              onToggle={collapsed => {
                if (rightPanelRef.current) {
                  if (collapsed) {
                    rightPanelRef.current.collapse();
                  } else {
                    rightPanelRef.current.expand();
                  }
                }
              }}
            />
          </Panel>
        </PanelGroup>
      </Row>
    </Column>
  );
}
