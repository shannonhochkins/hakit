import { useEffect, useRef } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Config, Puck } from '@measured/puck';
import { Column, Row } from '@hakit/components';
import { Preview } from './Preview';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { createEmotionCachePlugin } from './PuckOverrides/Plugins/emotionCache';
import { createPuckOverridesPlugin } from './PuckOverrides/Plugins/overrides';
import { Toolbar } from './Toolbar';
import styled from '@emotion/styled';
import { Spinner } from '@lib/components/Spinner';
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ResizeHandleIcon } from './ResizeHandle';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';

const emotionCachePlugin = createEmotionCachePlugin();
const overridesPlugin = createPuckOverridesPlugin();

const StyledPanelResizeHandle = styled(PanelResizeHandle)`
  position: relative;
`;

export function Editor() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const setUnsavedPuckPageData = useGlobalStore(state => state.setUnsavedPuckPageData);
  // const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
  const userConfig = useGlobalStore(state => state.userConfig);
  const setEditorMode = useGlobalStore(state => state.setEditorMode);
  // const observerRef = useRef<MutationObserver | null>(null);
  const emotionCache = useGlobalStore(state => state.emotionCache);
  const { setLeftSidebarCollapsed, setRightSidebarCollapsed, leftSidebar, rightSidebar } = useEditorUIStore();
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    setEditorMode(true);
  }, [setEditorMode]);

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

  if (!userConfig) {
    return <Spinner absolute text='Loading user data' />;
  }
  if (!puckPageData) {
    return <Spinner absolute text='Loading page data' />;
  }
  console.log('rendering editor', puckPageData);

  // TODO - Move all panel stuff outside of this so Puck doesn't re-render on sidebar changes

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
      </Puck>
    </div>
  );
}
