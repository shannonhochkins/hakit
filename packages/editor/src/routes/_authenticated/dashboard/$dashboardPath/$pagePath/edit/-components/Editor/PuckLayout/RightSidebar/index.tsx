import { PanelLeftIcon, PanelRightIcon } from 'lucide-react';
import styled from '@emotion/styled';
import { useEditorUIStore } from '@lib/hooks/useEditorUIStore';
import { Puck, createUsePuck } from '@measured/puck';
import { usePuckSelectedItem } from '@lib/hooks/usePuckSelectedItem';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '@lib/components/Button/IconButton';

const usePuck = createUsePuck();

const CollapsedSidebar = styled.div`
  background-color: var(--color-gray-900);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: var(--space-2) 0;
`;

const ExpandedSidebar = styled.div`
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  flex-grow: 0;
  background-color: var(--color-gray-900);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-2);
  height: var(--header-height);
  flex-grow: 0;
  flex-shrink: 0;
`;

const SidebarTitle = styled.h3`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  max-height: calc(100% - var(--header-height));
  overflow-y: auto;
`;

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
  const tabHeading = selectedItem ? `${selectedItem.type} Options` : 'Global Options';

  return (
    <>
      {isCollapsed ? (
        <CollapsedSidebar>
          <IconButton
            variant='transparent'
            onClick={() => {
              setRightSidebarCollapsed(false);
              onToggle(false);
            }}
            icon={<PanelLeftIcon size={18} />}
            aria-label='Expand properties'
          />
        </CollapsedSidebar>
      ) : (
        <ExpandedSidebar>
          <SidebarHeader>
            <IconButton
              variant='transparent'
              onClick={() => {
                setRightSidebarCollapsed(true);
                onToggle(true);
              }}
              icon={<PanelRightIcon size={16} />}
              aria-label='Collapse properties'
            />
            <SidebarTitle>
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
            </SidebarTitle>
          </SidebarHeader>
          <SidebarContent className='puck-sidebar-content'>
            <Puck.Fields />
          </SidebarContent>
        </ExpandedSidebar>
      )}
    </>
  );
}
