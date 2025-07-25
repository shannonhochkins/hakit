import { useCallback } from 'react';
import styled from '@emotion/styled';
import { useEditorUIStore } from '@hooks/useEditorUIStore';
import { ExpandIcon, MinimizeIcon } from 'lucide-react';
import { IconButton } from '@components/Button/IconButton';
import { ViewportControls } from './ViewportControls';

// Styled Components
const StyledToolbar = styled.div`
  height: var(--header-height);
  background-color: var(--color-gray-900);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  gap: var(--space-3);
  flex-grow: 0;
  flex-shrink: 0;
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

export function Toolbar() {
  // UI state
  const { setLeftSidebarCollapsed, setRightSidebarCollapsed, isFullscreen, setFullscreen } = useEditorUIStore();

  const handleFullscreenToggle = useCallback(() => {
    const newFullscreenState = !isFullscreen;
    setFullscreen(newFullscreenState);

    // Hide/show sidebars based on fullscreen state
    setLeftSidebarCollapsed(newFullscreenState);
    setRightSidebarCollapsed(newFullscreenState);
  }, [isFullscreen, setFullscreen, setLeftSidebarCollapsed, setRightSidebarCollapsed]);

  return (
    <>
      <StyledToolbar>
        <ToolbarSection>
          <ViewportControls />
        </ToolbarSection>

        <ToolbarSection>
          <IconButton
            variant='transparent'
            active={isFullscreen}
            onClick={handleFullscreenToggle}
            icon={isFullscreen ? <MinimizeIcon size={16} /> : <ExpandIcon size={16} />}
            aria-label={isFullscreen ? 'Exit Preview' : 'Fullscreen Preview'}
            tooltipProps={{
              placement: 'left',
            }}
          />
        </ToolbarSection>
      </StyledToolbar>
    </>
  );
}
