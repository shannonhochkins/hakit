import { useCallback, useEffect, useRef, useState } from 'react';
import { Column, Row } from '@components/Layout';
import { Preview } from './Preview';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Toolbar } from './Toolbar';
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ResizeHandleIcon } from './ResizeHandle';
import { useEditorUIStore } from '@hooks/useEditorUIStore';
import styles from './PuckLayout.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('PuckLayout', styles);

// === Layout Constants ===
const LAYOUT = {
  LEFT_SIDEBAR_MIN_PX: 300,
  LEFT_SIDEBAR_MAX_PX: 500,
  LEFT_SIDEBAR_DEFAULT_PX: 300,
  RIGHT_SIDEBAR_MIN_PX: 300,
  RIGHT_SIDEBAR_DEFAULT_PX: 400,
  SIDEBAR_COLLAPSED_PX: 50,
  PREVIEW_MIN_PERCENT: 20,
  MOBILE_BREAKPOINT: 600, // px
  MOBILE_PREVIEW_MIN_PERCENT: 40,
};

function pxToPercent(px: number, width: number) {
  return width ? (px / width) * 100 : 0;
}

export function PuckLayout() {
  const { setLeftSidebarCollapsed, setRightSidebarCollapsed, leftSidebar, rightSidebar } = useEditorUIStore();
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  // Responsive sidebar sizing helpers
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1920));
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Collapsed size always in px, converted to percent
  const leftSidebarCollapsedSize = pxToPercent(LAYOUT.SIDEBAR_COLLAPSED_PX, viewportWidth);
  const rightSidebarCollapsedSize = pxToPercent(LAYOUT.SIDEBAR_COLLAPSED_PX, viewportWidth);

  // Min/max/default sizes in percent (of viewport width)
  const leftSidebarMinSize = pxToPercent(LAYOUT.LEFT_SIDEBAR_MIN_PX, viewportWidth);
  const leftSidebarMaxSize = pxToPercent(LAYOUT.LEFT_SIDEBAR_MAX_PX, viewportWidth);
  const rightSidebarMinSize = pxToPercent(LAYOUT.RIGHT_SIDEBAR_MIN_PX, viewportWidth);
  const leftSidebarDefaultSize = pxToPercent(LAYOUT.LEFT_SIDEBAR_DEFAULT_PX, viewportWidth);
  const rightSidebarDefaultSize = pxToPercent(LAYOUT.RIGHT_SIDEBAR_DEFAULT_PX, viewportWidth);

  // Mobile overrides: sidebars full width, preview min 40%
  const previewMinSize = LAYOUT.PREVIEW_MIN_PERCENT;

  useEffect(() => {
    if (leftSidebar.isCollapsed && leftPanelRef.current && !leftPanelRef.current.isCollapsed()) {
      leftPanelRef.current.collapse();
    } else if (!leftSidebar.isCollapsed && leftPanelRef.current && leftPanelRef.current.isCollapsed()) {
      leftPanelRef.current.expand();
      leftPanelRef.current.resize(leftSidebarDefaultSize);
    }

    if (rightSidebar.isCollapsed && rightPanelRef.current && !rightPanelRef.current.isCollapsed()) {
      rightPanelRef.current.collapse();
    } else if (!rightSidebar.isCollapsed && rightPanelRef.current && rightPanelRef.current.isCollapsed()) {
      rightPanelRef.current.expand();
      rightPanelRef.current.resize(rightSidebarDefaultSize);
    }
  }, [leftSidebar.isCollapsed, rightSidebar.isCollapsed, leftSidebarDefaultSize, rightSidebarDefaultSize]);

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
        }}
      >
        <PanelGroup autoSaveId='hakit-panels' direction='horizontal' id='hakit-panels'>
          <Panel
            ref={leftPanelRef}
            id='hakit-left-panel'
            defaultSize={leftSidebarDefaultSize}
            collapsible
            collapsedSize={leftSidebarCollapsedSize}
            minSize={leftSidebarMinSize}
            maxSize={leftSidebarMaxSize}
            onCollapse={onLeftSidebarCollapse}
            onExpand={onLeftSidebarExpand}
          >
            <LeftSidebar onToggle={onLeftSidebarToggle} />
          </Panel>
          <PanelResizeHandle className={getClassName('resizeHandle')}>
            <ResizeHandleIcon direction='horizontal' />
          </PanelResizeHandle>
          <Panel id='hakit-preview-panel' minSize={previewMinSize}>
            <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px'>
              <Toolbar />
              <Preview />
            </Column>
          </Panel>
          <PanelResizeHandle className={getClassName('resizeHandle')}>
            <ResizeHandleIcon direction='horizontal' id='hakit-preview-resize-handle' />
          </PanelResizeHandle>
          <Panel
            ref={rightPanelRef}
            id='hakit-right-panel'
            defaultSize={rightSidebarDefaultSize}
            collapsedSize={rightSidebarCollapsedSize}
            collapsible
            minSize={rightSidebarMinSize}
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
