import { PanelLeftIcon, PanelRightIcon } from 'lucide-react';
import { useEditorUIStore } from '@hooks/useEditorUIStore';
import { Puck, createUsePuck } from '@measured/puck';
import { usePuckSelectedItem } from '@hooks/usePuckSelectedItem';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '@components/Button/IconButton';
import styles from './RightSidebar.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { useBreadcrumbs } from '@hooks/useBreadcrumbs';

const getClassName = getClassNameFactory('RightSidebar', styles);

const usePuck = createUsePuck();

export function RightSidebar({ onToggle }: { onToggle: (collapsed: boolean) => void }) {
  const { rightSidebar, setRightSidebarCollapsed } = useEditorUIStore();
  const { isCollapsed } = rightSidebar;
  const selectedItem = usePuckSelectedItem();
  const dispatch = usePuck(c => c.dispatch);
  const deselect = useCallback(() => {
    dispatch({
      type: 'setUi',
      ui: { itemSelector: null },
      recordHistory: true,
    });
  }, [dispatch]);

  const onClickExpandSidebar = useCallback(() => {
    setRightSidebarCollapsed(false);
    onToggle(false);
  }, [setRightSidebarCollapsed, onToggle]);

  const onClickCollapseSidebar = useCallback(() => {
    setRightSidebarCollapsed(true);
    onToggle(true);
  }, [setRightSidebarCollapsed, onToggle]);

  const breadcrumbs = useBreadcrumbs();

  const tabHeading = selectedItem ? `${selectedItem.type} Options` : 'Global Options';

  return (
    <>
      {isCollapsed ? (
        <div className={getClassName('collapsedSidebar')}>
          <IconButton
            variant='transparent'
            onClick={onClickExpandSidebar}
            icon={<PanelLeftIcon size={18} />}
            aria-label='Expand properties'
          />
        </div>
      ) : (
        <div className={getClassName('expandedSidebar')}>
          <div className={getClassName('sidebarHeader')}>
            {breadcrumbs.map(breadcrumb => (
              <a
                key={breadcrumb.label}
                onClick={() => dispatch({ type: 'setUi', ui: { itemSelector: breadcrumb.selector }, recordHistory: true })}
              >
                {breadcrumb.label}
              </a>
            ))}
            <IconButton
              variant='transparent'
              onClick={onClickCollapseSidebar}
              icon={<PanelRightIcon size={16} />}
              aria-label='Collapse properties'
            />
            <div className={getClassName('sidebarTitle')}>
              {tabHeading}
              {selectedItem && (
                <IconButton
                  variant='transparent'
                  onClick={deselect}
                  icon={<X size={16} />}
                  aria-label='Deselect Component'
                  tooltipProps={{
                    placement: 'left',
                  }}
                />
              )}
            </div>
          </div>
          <div className={getClassName('sidebarContent') + ' puck-sidebar-content'}>
            <Puck.Fields />
          </div>
        </div>
      )}
    </>
  );
}
