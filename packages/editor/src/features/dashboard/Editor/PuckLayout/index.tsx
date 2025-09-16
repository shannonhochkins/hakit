import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Column, Row } from '@hakit/components';
import { Preview } from './Preview';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Toolbar } from './Toolbar';
import styled from '@emotion/styled';
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ResizeHandleIcon } from './ResizeHandle';
import { useEditorUIStore } from '@hooks/useEditorUIStore';
import { useGlobalStore } from '@hooks/useGlobalStore';

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

  const onRightSidebarToggle = useCallback((collapsed: boolean) => {
    if (rightPanelRef.current) {
      if (collapsed) {
        rightPanelRef.current.collapse();
      } else {
        rightPanelRef.current.expand();
      }
    }
  }, []);

  const onLeftSidebarToggle = useCallback((collapsed: boolean) => {
    if (leftPanelRef.current) {
      if (collapsed) {
        leftPanelRef.current.collapse();
      } else {
        leftPanelRef.current.expand();
      }
    }
  }, []);

  const onLeftSidebarCollapse = useCallback(() => {
    setLeftSidebarCollapsed(true);
  }, [setLeftSidebarCollapsed]);

  const onLeftSidebarExpand = useCallback(() => {
    setLeftSidebarCollapsed(false);
  }, [setLeftSidebarCollapsed]);

  const onRightSidebarCollapse = useCallback(() => {
    setRightSidebarCollapsed(true);
  }, [setRightSidebarCollapsed]);

  const onRightSidebarExpand = useCallback(() => {
    setRightSidebarCollapsed(false);
  }, [setRightSidebarCollapsed]);

  const leftSidebarCollapsedSize = useMemo(() => (50 / window.innerWidth) * 100, []);
  const leftSidebarMinSize = useMemo(() => (200 / window.innerWidth) * 100, []);
  const rightSidebarCollapsedSize = useMemo(() => (50 / window.innerWidth) * 100, []);
  const rightSidebarMinSize = useMemo(() => (200 / window.innerWidth) * 100, []);

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
          maxHeight: 'calc(100% - var(--header-height))',
          minWidth: 0,
          opacity: emotionCache ? 1 : 0,
        }}
      >
        <PanelGroup autoSaveId='hakit-panels' direction='horizontal' id='hakit-panels'>
          <Panel
            ref={leftPanelRef}
            id='hakit-left-panel'
            defaultSize={15}
            collapsible
            // get 50px as a percentage of the viewport width
            collapsedSize={leftSidebarCollapsedSize}
            minSize={leftSidebarMinSize}
            maxSize={40}
            onCollapse={onLeftSidebarCollapse}
            onExpand={onLeftSidebarExpand}
          >
            <LeftSidebar onToggle={onLeftSidebarToggle} />
          </Panel>
          <StyledPanelResizeHandle>
            <ResizeHandleIcon direction='horizontal' />
          </StyledPanelResizeHandle>
          <Panel minSize={60} id='hakit-preview-panel'>
            <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px'>
              <Toolbar />
              <Preview />
            </Column>
          </Panel>
          <StyledPanelResizeHandle>
            <ResizeHandleIcon direction='horizontal' id='hakit-preview-resize-handle' />
          </StyledPanelResizeHandle>
          <Panel
            ref={rightPanelRef}
            id='hakit-right-panel'
            defaultSize={25}
            collapsedSize={rightSidebarCollapsedSize}
            collapsible
            minSize={rightSidebarMinSize}
            maxSize={40}
            onCollapse={onRightSidebarCollapse}
            onExpand={onRightSidebarExpand}
          >
            <RightSidebar onToggle={onRightSidebarToggle} />
          </Panel>
        </PanelGroup>
      </Row>
    </Column>
  );
}
