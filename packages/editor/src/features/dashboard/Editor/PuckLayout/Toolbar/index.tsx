import { useCallback } from 'react';
import { useEditorUIStore } from '@hooks/useEditorUIStore';
import { ExpandIcon, MinimizeIcon } from 'lucide-react';
import { IconButton } from '@components/Button/IconButton';
import { ViewportControls } from './ViewportControls';
import styles from './Toolbar.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Toolbar', styles);

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
      <div className={getClassName('Toolbar')}>
        <div className={getClassName('Toolbar-section')}>
          <ViewportControls />
        </div>

        <div className={getClassName('Toolbar-section')}>
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
        </div>
      </div>
    </>
  );
}
